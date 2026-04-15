# FieldSafe — Lightweight Safety & Compliance Logger
## Product Spec v0.1 (Pre-Intel Draft)

**Purpose:** A mobile-first PWA that helps a safety coordinator at a field service company log incidents, track compliance, and generate audit-ready reports — replacing spreadsheets, paper forms, and manual tracking.

**Target user:** Cameron (safety coordinator), but designed generically enough to demo to Isabella (HR) and Ethan (modernization lead) as a proof of concept for internal tooling.

**Strategic framing:** "I built this as a portfolio project for field service companies. You're the only safety coordinator I know — want to try it and tell me if it's useful?"

---

## What We Know Without Insider Intel

From public safety coordinator job descriptions and Alexander's public context:

**A safety coordinator at a field service company typically handles:**
1. Incident/accident reporting and investigation
2. Near-miss tracking (close calls that didn't result in injury)
3. Safety observation logging (hazards spotted in the field)
4. Training/certification tracking (who completed what, when it expires)
5. Vehicle/equipment condition reporting
6. OSHA compliance documentation
7. Generating reports for management (weekly/monthly safety summaries)
8. New hire safety orientations

**What we know about Alexander's field operations specifically (public):**
- Workers use ruggedized Android devices in the field
- Workers walk 10-15 miles/day reading meters in all weather
- Company vehicles are used (and reviews mention poor vehicle condition)
- Workers access residential properties (dogs, locked gates, hazards)
- Operations span multiple states/regions with regional managers
- High employee turnover means constant onboarding of new workers
- Safety non-compliance is a known issue (from Christian's family intel)

**What Cameron probably deals with daily (extrapolated):**
- Paper or spreadsheet-based incident logs that are hard to search/report on
- Chasing field workers and managers for missing safety documentation
- Difficulty proving compliance during audits or legal proceedings
- No systematic way to track near-misses (they just don't get reported)
- Manual tracking of who has completed safety training
- No easy way to generate reports for Isabella or Jim

---

## Core Features (MVP — one weekend build)

### 1. Quick Incident Report (the "big red button")

**What:** A simple form optimized for speed. Cameron (or a field manager) can log an incident in under 60 seconds from a phone.

**Fields:**
- Date/time (auto-filled, editable)
- Location (free text — route number, address, or city)
- Reporter name (dropdown of known workers, or free text)
- Incident type (dropdown):
  - Injury (on the job)
  - Vehicle incident
  - Near miss / close call
  - Property damage
  - Equipment failure
  - Dog/animal encounter
  - Slip/trip/fall
  - Weather-related
  - Customer confrontation
  - Other
- Severity (tap to select):
  - 🟢 Minor (first aid, no lost time)
  - 🟡 Moderate (medical attention, possible lost time)
  - 🔴 Serious (hospitalization, OSHA recordable)
- Description (free text, 2-3 sentences)
- Photo upload (optional — camera or gallery)
- Immediate action taken (free text)
- Follow-up needed? (toggle yes/no)

**Key UX decisions:**
- Form should be completable with one thumb on a phone
- Dropdowns over free text wherever possible
- Auto-save drafts (field workers have spotty signal)
- Offline capable — saves locally, syncs when connected
- After submission: "Logged ✓" confirmation with option to add another

### 2. Safety Observation Log (the "I saw something" tool)

**What:** A lightweight way for anyone — Cameron, managers, or workers — to log a hazard or safety observation without it being a full incident report.

**Fields:**
- Date/time (auto-filled)
- Location
- Observer name
- Observation type:
  - Unsafe condition (broken equipment, missing PPE, etc.)
  - Unsafe behavior (worker not following protocol)
  - Positive observation (worker doing something right — reinforcement)
  - Hazard identified (new hazard at a meter location)
- Description
- Photo (optional)
- Corrective action recommended

**Why this matters:** Near-miss and observation data is what prevents incidents from escalating. If Cameron can show Isabella a report that says "we logged 47 safety observations this month, up from 0 last month because we had no system," that's immediate, visible value.

### 3. Dashboard (Cameron's morning view)

**What:** A simple dashboard showing:
- Incidents this month vs. last month (bar chart)
- Open follow-ups (incidents marked "follow-up needed" that aren't resolved)
- Recent activity feed (last 10 entries — incidents + observations)
- Severity breakdown (donut chart: green/yellow/red)
- Top incident types (what's happening most)

**Key design:** This needs to look professional enough that Cameron could pull it up on her screen when Isabella walks by and it looks like a real business tool, not a side project.

### 4. Export / Report Generation

**What:** One-tap export of:
- All incidents for a date range (CSV)
- Monthly summary report (formatted text or PDF)
- Individual incident detail (for investigation follow-up)

**Why:** Audits, lawsuits, and management reviews all require documentation. If Cameron can generate a clean report in 10 seconds instead of spending an hour assembling a spreadsheet, she'll never go back.

---

## Features to Add After Feedback (Phase 2)

These are held back intentionally — build them only after Cameron tells you what she actually needs:

- **Worker profiles:** Track individual workers' incident history, training status, certifications
- **Training tracker:** Log who completed safety orientation, when certifications expire
- **Vehicle inspection checklist:** Pre-trip inspection log for company vehicles
- **Automated alerts:** Email/push when a follow-up is overdue or a pattern is detected
- **AI summary:** Claude integration to analyze incident data and generate narrative reports ("Slip/trip incidents increased 40% in October, correlating with wet weather. Recommend issuing traction boot covers.")
- **Manager view:** Let regional managers see their area's safety data
- **Integration with PeggyAI:** If Ethan's platform handles workforce management, FieldSafe's safety data could feed into it

---

## Tech Stack

Keep it identical to your PocketWatch+ stack so you're not learning new tools:

- **Next.js 15** (App Router)
- **Supabase** (PostgreSQL + auth + storage for photos)
- **Tailwind CSS v4**
- **Serwist** (PWA + offline support)
- **Vercel** (hosting)
- **Chart.js or Recharts** (dashboard charts)

No Plaid, no Claude API for MVP. Keep it simple and snappy.

---

## Database Schema (Supabase)

```sql
-- Incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_at TIMESTAMPTZ DEFAULT now(),
  incident_date DATE NOT NULL,
  incident_time TIME,
  location TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'serious')),
  description TEXT NOT NULL,
  photo_url TEXT,
  immediate_action TEXT,
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_completed BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Safety Observations
CREATE TABLE safety_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observed_at TIMESTAMPTZ DEFAULT now(),
  location TEXT NOT NULL,
  observer_name TEXT NOT NULL,
  observation_type TEXT NOT NULL CHECK (
    observation_type IN ('unsafe_condition', 'unsafe_behavior', 'positive', 'hazard')
  ),
  description TEXT NOT NULL,
  photo_url TEXT,
  corrective_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workers (simple directory for dropdowns)
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT DEFAULT 'meter_reader',
  region TEXT,
  hire_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Useful views
CREATE OR REPLACE VIEW monthly_summary AS
SELECT
  date_trunc('month', incident_date)::date AS month,
  COUNT(*) AS total_incidents,
  COUNT(*) FILTER (WHERE severity = 'minor') AS minor,
  COUNT(*) FILTER (WHERE severity = 'moderate') AS moderate,
  COUNT(*) FILTER (WHERE severity = 'serious') AS serious,
  COUNT(*) FILTER (WHERE follow_up_needed AND NOT follow_up_completed) AS open_followups,
  COUNT(DISTINCT reporter_name) AS unique_reporters
FROM incidents
GROUP BY date_trunc('month', incident_date);
```

---

## Design Direction

**Tone:** Professional utility software, not a consumer app. Think "internal tool that a serious company uses," not "fun startup vibes." This needs to look like it belongs in an office next to Excel and Outlook.

**Color palette:**
- Primary: Deep navy (#1e293b) — authority, trust
- Accent: Safety orange (#f97316) — industry standard safety color
- Success: Green (#22c55e)
- Warning: Amber (#f59e0b)
- Danger: Red (#ef4444)
- Background: Clean white/light gray (#f8fafc)

**Typography:** Clean, highly readable. Nothing fancy. This is a tool, not a portfolio piece for a designer.

**Mobile-first:** Cameron may log from her desk, but the real value is if a field manager can log from the field. Every screen should work on a phone held in one hand.

---

## What Cameron Might Say (and how to respond)

**"We already track this in Excel."**
→ "Cool — does it take photos? Can you pull a report by incident type in 10 seconds? Can your field managers log from their phones? Keep using Excel if it works, but try this for a week and see if it's faster."

**"I'd need to ask Isabella/Jim before using something like this."**
→ "Totally understand. It's just a prototype I built to learn — no company data required. If you find it useful, that conversation is up to you."

**"This is close but we actually need ___."**
→ This is the best possible response. Whatever she says goes straight into v2. Write it down verbatim.

**"Our workers would never use this."**
→ "That's fine — this is for YOU, not for them. You log what they report to you, and you get clean data out the other end."

**"This is actually really useful."**
→ Don't pitch. Just say "Glad it helps. Let me know if anything needs changing." Let her bring it to Isabella organically.

---

## Build Timeline

**Tuesday evening (90 min):** Scaffold Next.js project, run Supabase migration, build incident report form
**Thursday evening (90 min):** Build safety observation form, worker dropdown, basic data display
**Saturday (2.5 hrs):** Dashboard with charts, export functionality, PWA configuration, polish
**Sunday dinner:** Hand it to Cameron casually

Total: ~6 hours across one week
