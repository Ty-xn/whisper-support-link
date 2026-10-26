# Safe Haven Hub

Build a modern, privacy-first web application called "SafePath".

Tagline: "Find help. Stay safe. Speak when you're ready."

SafePath is a digital support and prevention platform designed for people experiencing unsafe situations such as domestic abuse, workplace harassment, bullying, sexual harassment, stalking, gender-based violence, and online abuse.

The app must be trauma-informed, calm, discreet, accessible, and non-judgmental.

IMPORTANT DESIGN PRINCIPLE: The application must never force users to report an incident or reveal their identity before accessing information and support.

The platform should focus on safety, privacy, user choice, trusted support, and prevention.

TECHNOLOGY:

React frontend.

Supabase backend.

PostgreSQL database.

Supabase Authentication should be optional.

Support anonymous browsing where possible.

Use Row Level Security for all sensitive user data.

Responsive PWA design optimized for mobile phones.

Use plain CSS or a clean modern design system.

Do not use excessive animations.

The interface must work well on low-end smartphones and slower internet connections.

BRANDING: Use a calm, professional, trustworthy visual identity. Avoid alarming imagery or aggressive red emergency branding throughout the entire app. Use accessible typography and clear spacing. The application should look discreet and neutral.

MAIN NAVIGATION:

Home

Find Support

Private Journal

Emergency Plan

Referral Pathways

Learn & Prevent

HOME PAGE:

Create a welcoming page with the heading:

"How can we help you today?"

Display six large accessible options:

I need immediate help

Find trusted support

Document something privately

I want legal or workplace guidance

I want to support someone else

Learn about prevention

Include a short privacy message:

"You are in control of what you share. You can explore support without creating an account."

Add a discreet quick-exit option that returns to a neutral screen. Do not claim that this guarantees safety.

SUPPORT DIRECTORY:

Create a searchable support directory.

Categories:

Emergency Services

Counselling and Mental Health Support

Legal Assistance

Medical Support

Safe Accommodation

Domestic Violence Support

Workplace Harassment Support

Child Protection

Community Organisations

Each service card should include:

Organisation name

Service category

Short description

Location

Contact options

Website or phone number fields

Verification status

Last verified date

Create an admin-friendly structure for adding and updating verified organisations.

For the MVP, populate the directory with clearly labelled sample data only and include a disclaimer that real services must be verified before public launch.

PRIVATE INCIDENT JOURNAL:

Allow users to create a private journal entry.

Fields:

Incident title

Date

Approximate time (optional)

Location (optional)

Description

People involved (optional)

Witnesses (optional)

Attachment upload (optional)

Features:

Save entry

View entries

Edit entry

Delete entry

Export entry

Clearly explain:

"Documenting an incident does not automatically report it."

Sensitive journal data must only be accessible to the authenticated user or temporary session owner.

Do not display journal entries publicly. Do not automatically share information with organisations or authorities.

EMERGENCY PLAN:

Create a personal emergency preparedness section.

Features:

Add trusted contacts

Add emergency numbers

Create a pre-written emergency message

Safety checklist

Safe meeting location (optional)

Include a prominent emergency warning:

"If you are in immediate danger, contact local emergency services when it is safe to do so."

Do not implement fake emergency response functionality. Do not claim that the app can dispatch police or emergency services unless an actual integration exists.

REFERRAL PATHWAYS:

Create a recommendation page based on user-selected needs.

Examples:

If the user selects immediate danger:

Emergency services

Trusted contact

Nearby verified support

If the user selects emotional support:

Counselling

Support groups

Helplines

If the user selects workplace harassment:

Workplace grievance information

Legal support

Counselling

Documentation guidance

Display recommendations as optional next steps.

Use language such as: "Here are some options you may consider."

Avoid making legal or medical diagnoses.

LEARN & PREVENT:

Create an educational hub with short articles and scenario-based learning.

Topics:

Understanding harassment

Consent and boundaries

Digital safety

Supporting a friend

Bystander intervention

Workplace safety

Child safety

Emergency preparedness

Recognising unhealthy behaviour

Include interactive scenarios where users select an answer and receive educational feedback.

AI ASSISTANT:

Add a simple AI support navigation assistant.

The assistant should help users understand available resources and organise their next steps.

Example questions:

"What options do I have if I experience harassment at work?"

"How can I support a friend who is being abused?"

"What information should I document?"

The AI must:

Provide general educational information.

Encourage professional support where appropriate.

Recommend relevant app sections.

Avoid diagnosing abuse.

Avoid making legal conclusions.

Never automatically report incidents.

Never pressure users to disclose personal information.

PRIVACY FEATURES:

Implement:

Minimal data collection.

Anonymous browsing where possible.

Clear consent before collecting sensitive information.

User-controlled deletion.

No public profiles by default.

No advertising based on sensitive activity.

No unnecessary location tracking.

Clear privacy notice.

Create a Privacy & Safety page explaining these principles in simple language.

ADMIN STRUCTURE:

Create a basic admin dashboard concept for managing:

Verified support organisations.

Service categories.

Educational content.

Referral pathways.

Verification dates.

Do not expose survivor journal data to administrators.

DESIGN REQUIREMENTS:

Mobile-first.

Accessible contrast.

Large buttons.

Simple navigation.

Calm and respectful language.

Low-data friendly.

Fast loading.

Avoid unnecessary images and heavy media.

Include empty states and error handling.

Include loading indicators.

Ensure all forms have validation.

DATABASE TABLES:

Create appropriate Supabase tables for:

profiles (minimal information only)

support_services

service_categories

journal_entries

journal_attachments

emergency_contacts

emergency_plans

referral_pathways

educational_content

admin_users

Use Row Level Security policies so users can only access their own private records.

IMPORTANT: This is a prototype for a hackathon. Clearly label sample organisations and sample content as demonstration data until verified for production use.

The final result should feel like a real, trustworthy social impact technology product rather than a generic reporting form. The app should be hidden that abuser can not tell or find it . If victim is forced to open can enter a distress pin that will open the app as something else or

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://whisper-support-link.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ad868323-b257-4fe0-adea-cfd5d3fa2c3b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
