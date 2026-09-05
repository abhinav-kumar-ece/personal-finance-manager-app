# Personal Finance Manager

An AI-powered personal finance dashboard that automates bank account syncing, 
expense categorization, and budget tracking — with a multi-turn Gemini 
chatbot grounded in your real-time financial data.

Built for Gen AI Academy APAC Edition (Hack2Skill x Google Cloud).

## Live Demo
[Try the live prototype](https://ais-pre-svgef5e4nhp4snqirwjsv5-915877150099.asia-southeast1.run.app)

## Features

### Bank Sync & Expense Tracking
- Multi-institution account linking (checking, savings, credit cards)
- Real-time balance sync and CSV/statement import
- AI-powered transaction categorization using Gemini
- Automated recurring subscription detection with renewal alerts

### Analytics & Budgeting
- Monthly spending breakdown by category
- Interactive spending trend charts (Recharts)
- Configurable budget limits with progress tracking
- Cash flow overview: income, outflows, net savings, savings rate

### Gemini Financial Assistant
- Multi-turn conversational AI grounded in your live account data
- Smart model auto-routing: automatically picks the right Gemini model 
based on query complexity (gemini-3.1-pro-preview for complex modeling, 
gemini-3.5-flash for general queries, gemini-3.1-flash-lite for instant 
lookups)
- Multiple assistant personas: Daily Budget Coach, Wealth Strategist, 
Rapid Auditor, or a custom role
- Markdown-formatted responses with conversation history

### AI Financial Audit
- On-demand, CFP-style financial health report
- Detects spending anomalies and suggests concrete cost-saving actions

## Tech Stack
- Frontend: React, TypeScript, Vite
- Backend: Express (Node.js)
- Database: Cloud Firestore (per-user data isolation)
- Auth: Firebase Authentication (Email/Password, Google Sign-In)
- AI: Google Gemini API (multi-model routing)
- Charts: Recharts
- Deployment target: Docker + Google Cloud Run

## Security
This project was built with a dedicated security hardening pass:
- Server-side-only API key handling — the Gemini API key is never exposed 
to the frontend
- Verified authentication — every protected route validates the Firebase 
ID token server-side; user ID is never trusted from client input
- Per-user Firestore isolation — security rules deny all access by 
default, only allow a user to read/write their own data
- Rate limiting on chat endpoints per authenticated user
- Prompt injection defenses on custom AI instructions
- Locked-down CORS with no wildcard origins

## Architecture Notes
- server.ts — Express backend: auth middleware, rate limiting, Gemini 
proxy endpoints
- firestore.rules — Firestore security rules
- src/components/ — React UI components
- src/lib/ — Firebase client config and Firestore service layer
- Dockerfile / deploy-cloudrun.sh — containerization and Cloud Run 
deployment configuration

## Deployment Status
Built and tested end-to-end in Google AI Studio, with Firebase 
Authentication and Cloud Firestore fully configured and live. A 
Dockerfile and deploy-cloudrun.sh script are included and ready for 
Cloud Run + Secret Manager deployment.

## Getting Started (Local Development)
```bash
npm install
cp .env.example .env
npm run dev
```

Built by Abhinav Kumar for Gen AI Academy APAC Edition.
