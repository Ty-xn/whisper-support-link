
-- roles
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data->>'display_name',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- directory
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT ALL ON public.service_categories TO service_role;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.service_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.service_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.support_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_slug text NOT NULL REFERENCES public.service_categories(slug) ON UPDATE CASCADE,
  description text NOT NULL DEFAULT '',
  location text,
  phone text,
  email text,
  website text,
  hours text,
  verification_status text NOT NULL DEFAULT 'unverified',
  last_verified_at date,
  is_sample boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.support_services TO anon, authenticated;
GRANT ALL ON public.support_services TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.support_services TO authenticated;
ALTER TABLE public.support_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.support_services FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "services admin write" ON public.support_services FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER services_updated BEFORE UPDATE ON public.support_services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- journal
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  incident_date date,
  incident_time text,
  location text,
  description text NOT NULL DEFAULT '',
  people_involved text,
  witnesses text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journal" ON public.journal_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER journal_updated BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.journal_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_attachments TO authenticated;
GRANT ALL ON public.journal_attachments TO service_role;
ALTER TABLE public.journal_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attachments" ON public.journal_attachments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- emergency
CREATE TABLE public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contacts" ON public.emergency_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.emergency_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  prewritten_message text,
  safe_location text,
  emergency_numbers jsonb NOT NULL DEFAULT '[]'::jsonb,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_plans TO authenticated;
GRANT ALL ON public.emergency_plans TO service_role;
ALTER TABLE public.emergency_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plan" ON public.emergency_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER plans_updated BEFORE UPDATE ON public.emergency_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- content
CREATE TABLE public.referral_pathways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  need_slug text NOT NULL,
  need_label text NOT NULL,
  step_title text NOT NULL,
  step_description text NOT NULL DEFAULT '',
  category_slug text,
  sort_order int NOT NULL DEFAULT 0,
  is_sample boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_pathways TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.referral_pathways TO authenticated;
GRANT ALL ON public.referral_pathways TO service_role;
ALTER TABLE public.referral_pathways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pathways public read" ON public.referral_pathways FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pathways admin write" ON public.referral_pathways FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  topic text NOT NULL,
  summary text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  reading_minutes int NOT NULL DEFAULT 3,
  scenario jsonb,
  is_sample boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.educational_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.educational_content TO authenticated;
GRANT ALL ON public.educational_content TO service_role;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content public read" ON public.educational_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content admin write" ON public.educational_content FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER content_updated BEFORE UPDATE ON public.educational_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- seed categories
INSERT INTO public.service_categories (slug, name, description, sort_order) VALUES
 ('emergency','Emergency Services','Immediate response and crisis lines',1),
 ('counselling','Counselling and Mental Health Support','Talking support and trauma-informed therapy',2),
 ('legal','Legal Assistance','Advice on rights, protection orders and cases',3),
 ('medical','Medical Support','Clinics and health services',4),
 ('accommodation','Safe Accommodation','Shelters and temporary safe housing',5),
 ('domestic-violence','Domestic Violence Support','Specialist support for abuse at home',6),
 ('workplace','Workplace Harassment Support','Grievance guidance and workplace advocacy',7),
 ('child-protection','Child Protection','Support for children and young people',8),
 ('community','Community Organisations','Local groups and peer support',9);

-- seed sample services (clearly labelled demonstration data)
INSERT INTO public.support_services (name, category_slug, description, location, phone, website, hours, verification_status, last_verified_at, is_sample) VALUES
 ('SAMPLE — Harbourline 24/7 Crisis Line','emergency','Demonstration entry. Round-the-clock confidential phone support with referral to local services.','Nationwide','0800 000 000','https://example.org/harbourline','24 hours, every day','sample',DATE '2026-03-12',true),
 ('SAMPLE — Stillwater Counselling Collective','counselling','Demonstration entry. Trauma-informed one-to-one counselling in person or by video, including evenings.','Riverside district','0800 000 001','https://example.org/stillwater','Mon–Sat, 08:00–20:00','sample',DATE '2026-02-02',true),
 ('SAMPLE — Fairstep Legal Advice Clinic','legal','Demonstration entry. Free first-appointment advice on protection orders, tenancy and workplace rights.','City centre','0800 000 002','https://example.org/fairstep','Tue and Thu, 09:00–16:00','sample',DATE '2026-01-20',true),
 ('SAMPLE — Northgate Community Clinic','medical','Demonstration entry. Confidential medical care, documentation of injuries and onward referral.','Northgate','0800 000 003','https://example.org/northgate','Mon–Fri, 07:30–17:00','sample',DATE '2026-02-18',true),
 ('SAMPLE — Willow House Safe Stay','accommodation','Demonstration entry. Short-term safe accommodation with intake by phone at any hour.','Address shared on contact','0800 000 004','https://example.org/willow','24 hours, every day','sample',DATE '2026-03-01',true),
 ('SAMPLE — Beacon Domestic Abuse Network','domestic-violence','Demonstration entry. Advocacy, safety planning and accompaniment for people at risk at home.','Metro East','0800 000 005','https://example.org/beacon','Mon–Sun, 06:00–22:00','sample',DATE '2026-03-05',true),
 ('SAMPLE — Worklight Harassment Support','workplace','Demonstration entry. Guidance on grievance procedures, documentation and workplace mediation.','Remote and in person','0800 000 006','https://example.org/worklight','Mon–Fri, 09:00–17:00','sample',DATE '2026-02-25',true),
 ('SAMPLE — Kite Child Protection Line','child-protection','Demonstration entry. Advice for children, young people and adults worried about a child.','Nationwide','0800 000 007','https://example.org/kite','24 hours, every day','sample',DATE '2026-03-08',true),
 ('SAMPLE — Rivergate Community Circle','community','Demonstration entry. Peer support groups, practical help and a quiet drop-in space.','Rivergate','0800 000 008','https://example.org/rivergate','Wed and Sat, 10:00–15:00','sample',DATE '2026-01-30',true);

-- seed pathways
INSERT INTO public.referral_pathways (need_slug, need_label, step_title, step_description, category_slug, sort_order) VALUES
 ('immediate','I may be in immediate danger','Contact local emergency services','If it is safe to do so, call the emergency number for your country. SafePath cannot contact them for you.',NULL,1),
 ('immediate','I may be in immediate danger','Reach a trusted contact','Someone who can be with you, collect you, or simply stay on the phone.',NULL,2),
 ('immediate','I may be in immediate danger','Nearby verified support','Crisis lines and safe accommodation listed in the directory.','emergency',3),
 ('emotional','I would like emotional support','Counselling','Trauma-informed counsellors who will not rush you.','counselling',1),
 ('emotional','I would like emotional support','Support groups','Peer groups where people share similar experiences.','community',2),
 ('emotional','I would like emotional support','Helplines','Talk anonymously, without giving your name.','emergency',3),
 ('workplace','Something is happening at work','Workplace grievance information','Understand internal reporting steps before you decide anything.','workplace',1),
 ('workplace','Something is happening at work','Legal support','Advice on your rights and what evidence may matter.','legal',2),
 ('workplace','Something is happening at work','Counselling','Support for the toll this takes, separate from any process.','counselling',3),
 ('workplace','Something is happening at work','Documentation guidance','Keep a private record of dates, words used and who was present.',NULL,4),
 ('legal','I want legal guidance','Legal assistance','Free or low-cost clinics listed in the directory.','legal',1),
 ('legal','I want legal guidance','Documentation guidance','A clear record helps whoever supports you later.',NULL,2),
 ('someone-else','I want to help someone else','Learn how to listen','Believing someone and staying steady matters more than advice.',NULL,1),
 ('someone-else','I want to help someone else','Share options, not instructions','Choice is often what has been taken away.',NULL,2),
 ('someone-else','I want to help someone else','Community organisations','Groups that support friends and family too.','community',3),
 ('housing','I need somewhere safe to stay','Safe accommodation','Shelters and temporary safe housing.','accommodation',1),
 ('housing','I need somewhere safe to stay','Domestic violence support','Advocates who can help plan a safe departure.','domestic-violence',2);

-- seed educational content
INSERT INTO public.educational_content (slug, title, topic, summary, body, reading_minutes, scenario, sort_order) VALUES
 ('understanding-harassment','Understanding harassment','Understanding harassment','What harassment can look like, and why it is never the fault of the person receiving it.','Harassment is unwanted behaviour that makes someone feel humiliated, intimidated or unsafe. It can be spoken, written, physical or online, and it can come from a stranger, a colleague, a manager or someone close.\n\nIt is often repeated, but a single serious incident can also be harassment. What matters is the effect on you, not whether the other person says they meant it.\n\nYou do not need to be certain, or to have proof, to look for support.',3,'{"question":"A colleague repeatedly comments on your appearance. You have asked them to stop. Is this harassment?","options":[{"label":"No, they are only being friendly","feedback":"Intent is not the test. Behaviour that continues after you have asked it to stop, and that makes you uncomfortable, can be harassment."},{"label":"Possibly — the behaviour continued after you asked it to stop","correct":true,"feedback":"Yes. Repeated unwanted comments after a clear request to stop are commonly treated as harassment in workplace policies."},{"label":"Only if there were witnesses","feedback":"Witnesses can help, but harassment does not stop being harassment when no one else sees it."}]}'::jsonb,1),
 ('consent-and-boundaries','Consent and boundaries','Consent and boundaries','Consent is freely given, specific and can be withdrawn at any time.','Consent means agreement that is freely given, informed, specific and reversible. It cannot be assumed from silence, from a previous occasion, or from a relationship.\n\nPressure, threats, or someone being asleep, intoxicated or afraid all mean consent is not present.\n\nBoundaries are simply the limits you set. You do not owe anyone an explanation for them.',3,'{"question":"Someone agreed to something last week. Does that cover today?","options":[{"label":"Yes, agreement carries over","feedback":"Consent is specific to the moment. Previous agreement does not carry forward."},{"label":"No, consent is specific and can be withdrawn","correct":true,"feedback":"Correct. Consent applies to a particular time and can be withdrawn at any point."}]}'::jsonb,2),
 ('digital-safety','Digital safety','Digital safety','Small steps that make devices and accounts harder for someone else to watch.','Consider whether anyone else has access to your accounts, knows your passwords, or has installed anything on your phone. Shared family plans and cloud backups can reveal more than expected.\n\nUse a passcode only you know. Check which devices are signed in to your email. Turn off location sharing you did not choose. Be aware that clearing history can itself be noticed by someone monitoring you — plan around what is normal for your situation.\n\nIf you think a device is monitored, using a different device, such as one at a library or a trusted friend''s, is often safer than changing settings.',4,'{"question":"You think your phone may be monitored. What is often the safer first step?","options":[{"label":"Change every setting immediately","feedback":"Sudden changes can be noticed. In some situations that increases risk."},{"label":"Use a different device to seek support","correct":true,"feedback":"Yes. Reaching support from a device the other person cannot see is usually safer than changing settings on a monitored one."}]}'::jsonb,3),
 ('supporting-a-friend','Supporting a friend','Supporting a friend','Believe them, stay steady, and leave the choices with them.','The most useful thing is usually the simplest: believe them, and say so. Avoid asking why they stayed, or telling them what you would do.\n\nOffer specific, practical help — a place to talk, a lift, sitting with them while they make a call. Share options rather than instructions, and keep showing up even if nothing changes quickly.\n\nLook after yourself too. Supporting someone over a long period is heavy.',3,'{"question":"A friend tells you about abuse but does not want to report it. What helps most?","options":[{"label":"Report it on their behalf","feedback":"Acting without consent can remove their control and put them at greater risk. Exceptions exist where a child is at risk."},{"label":"Believe them and stay available","correct":true,"feedback":"Yes. Being believed and not pressured is consistently what people say helped most."}]}'::jsonb,4),
 ('bystander-intervention','Bystander intervention','Bystander intervention','Safe ways to intervene without escalating a situation.','You do not have to confront anyone to help. The common approaches are: distract (interrupt with something unrelated), delegate (ask someone else, such as staff or security), delay (check in afterwards), document (record only if safe, and give the recording to the person affected, not to social media), and direct (speak up, only when it is safe).\n\nYour own safety comes first. A quiet check-in afterwards is a real intervention.',3,'{"question":"You see someone being harassed on a busy train. What is often safest?","options":[{"label":"Confront the person directly","feedback":"Direct confrontation can escalate quickly and is only one option, best used when safe."},{"label":"Distract, or sit nearby and check in","correct":true,"feedback":"Yes. Distraction and quiet presence lower the temperature and are usually safer for everyone."}]}'::jsonb,5),
 ('workplace-safety','Workplace safety','Workplace safety','Understanding grievance routes, records and your options at work.','Most workplaces have a grievance or dignity-at-work procedure. Reading it early, before deciding anything, tells you what to expect and what timeframes apply.\n\nKeep your own private record: dates, what was said, who was present, and how it affected your work. Keep it somewhere the workplace cannot access.\n\nYou can ask about options confidentially — through a union representative, an employee assistance programme, or an external adviser — before making any formal move.',4,NULL,6),
 ('child-safety','Child safety','Child safety','Signs a child may need help, and who to speak to.','Changes in behaviour, withdrawal, unexplained injuries, fear of a particular person, or knowledge that seems beyond their age can all be signs that a child needs support. None of them proves anything on its own.\n\nIf a child tells you something, listen without pressing for detail, do not promise secrecy, and write down what they said in their words as soon as you can.\n\nConcerns about a child''s immediate safety should go to local child protection or emergency services.',3,NULL,7),
 ('emergency-preparedness','Emergency preparedness','Emergency preparedness','Quiet preparation you can do in advance, at your own pace.','Preparation is not a decision to leave. It is simply having options ready.\n\nThink about: a bag with documents and medication kept somewhere safe, a small amount of cash, copies of identity documents, a spare phone or charger, and a code word agreed with someone you trust.\n\nKnow one place you could go, and one person you could call. Keeping these in your mind rather than written down is sometimes the safer choice.',3,NULL,8),
 ('recognising-unhealthy-behaviour','Recognising unhealthy behaviour','Recognising unhealthy behaviour','Patterns of control often appear long before physical harm.','Control often builds quietly: checking your phone, deciding who you see, managing your money, constant criticism dressed as concern, or making you doubt your own memory.\n\nAffection and control can exist together, which is part of what makes it hard to name.\n\nIf you find yourself managing your own behaviour to avoid someone''s reaction, that is worth paying attention to.',3,'{"question":"A partner checks your messages daily and decides who you may see. How would you describe this?","options":[{"label":"A sign of caring","feedback":"Monitoring and restricting contact are recognised patterns of coercive control, whatever the stated reason."},{"label":"A pattern of controlling behaviour","correct":true,"feedback":"Yes. Monitoring and isolating someone are widely recognised forms of control, even without physical harm."}]}'::jsonb,9);
