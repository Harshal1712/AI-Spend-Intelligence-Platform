# AI Spend Intelligence Platform — Setup Guide

## Quick Start (No Database Required)

The platform works in full **demo mode** without any database — all data is served from in-memory fallback. Just run:

```powershell
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and log in with:

| Role | Email | Password |
|------|-------|----------|
| CEO | ceo@demo.com | password |
| Admin | admin@demo.com | password |
| Manager | maya@demo.com | password |
| Employee | aarav@demo.com | password |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```powershell
copy .env.example .env.local
```

### Required for live database
```
DATABASE_URL=postgresql://user:password@host:5432/ai_spend_intelligence
NEXTAUTH_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
NEXTAUTH_URL=http://localhost:3000
```

### Optional — AI-powered prompt analysis (any one is sufficient)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
```
Without these keys, rule-based prompt analysis is used automatically.

### Optional — Alert webhooks
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
MICROSOFT_TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
```

### Optional — GitHub OAuth login
```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## Database Setup (PostgreSQL)

You can use any PostgreSQL host:
- **Local PostgreSQL**: Install from https://postgresql.org
- **Free cloud options**: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app)

Once you have a PostgreSQL connection string, set it as `DATABASE_URL` in `.env.local`, then run:

```powershell
npm run db:migrate   # Creates all tables
npm run db:seed      # Inserts demo users and data
```

### Database tables
`users`, `departments`, `ai_usage_logs`, `prompts`, `security_events`, `reports`, `integrations`, `notifications`, `audit_logs`, `model_benchmarks`

---

## Roles & Access

| Role | Access |
|------|--------|
| **CEO** | Company-wide analytics, ROI reports, forecasting, executive summaries |
| **Admin** | Full access to all features |
| **Manager** | Department-scoped analytics, team employee data |
| **Employee** | Personal usage analytics only |

---

## Features

- ✅ Real-time AI spend dashboard (cost, tokens, ROI, productivity)
- ✅ Employee usage tracking with risk scoring
- ✅ AI-powered prompt analysis (OpenAI/Anthropic/Gemini → rule-based fallback)
- ✅ Security incident detection and alerting
- ✅ Slack & Microsoft Teams webhook alerts
- ✅ Budget threshold monitoring with automatic alerts
- ✅ PDF executive report download
- ✅ CSV employee export
- ✅ Model benchmarking comparison
- ✅ Audit log tracking
- ✅ Role-based access control
- ✅ Multi-provider AI integration management

---

## Operational Notes

- API rate limiting is active on mutation routes
- Audit logs are written for employee creation, signup, and usage creation
- PDF report: `/api/reports/executive/pdf`
- CSV export: `/api/employees/export`
- Benchmarks API: `/api/benchmarks`
- Notifications API: `/api/notifications`
