CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "categories admin write" ON public.service_categories;
CREATE POLICY "categories admin write" ON public.service_categories FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
DROP POLICY "services admin write" ON public.support_services;
CREATE POLICY "services admin write" ON public.support_services FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
DROP POLICY "pathways admin write" ON public.referral_pathways;
CREATE POLICY "pathways admin write" ON public.referral_pathways FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
DROP POLICY "content admin write" ON public.educational_content;
CREATE POLICY "content admin write" ON public.educational_content FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP FUNCTION public.has_role(uuid, public.app_role);
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;