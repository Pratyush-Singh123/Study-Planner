# 🎯 GapFill — Intelligent Study Planner & Knowledge Gap Engine

> **"GapFill is the only tool that knows your syllabus, remembers your mistakes, tracks your gaps, and tells you exactly what to study today — not what some generic student should study."**

Built for the **Axion Hackathon**.

---

## 🌐 Live Website & Demo

- **Live Public Website:** [https://pratyush-singh123.github.io/Study-Planner/](https://pratyush-singh123.github.io/Study-Planner/)
- **GitHub Repository:** [https://github.com/Pratyush-Singh123/Study-Planner](https://github.com/Pratyush-Singh123/Study-Planner)

---

## 📌 Problem Statement

Students know they need to study, but they don't know:
1. **What to study** (no data on exam frequency or past questions)
2. **How to study it** (paralysis over endless resources)
3. **Whether they've actually learned it** (flawed self-assessment)

### The 4 Broken Links
- **Link 1 — No Access to Relevant Past Questions (PYQs):** Exam papers circulate informally or are unavailable; students study everything equally with no priority.
- **Link 2 — No Guidance on the Right Resource:** Students waste 30–45 minutes searching for explanations instead of studying.
- **Link 3 — No Objective Knowledge Gap Tracking:** Students assume they understand a concept until the exam proves otherwise.
- **Link 4 — Practice Without Understanding:** Platforms reveal correct answers without diagnosing the student's *underlying conceptual flaws*.

---

## 🚀 Key Features

- **Relational Cloud Database & Isolated User Persistence:** Powered by SQLAlchemy, supporting SQLite by default (`gapfill.db`) or PostgreSQL (`DATABASE_URL`). Each student has their own secure, partitioned study state (subjects, topics, gap scores, recurring mistake logs, notes, mock exam results).
- **Email Registration & 6-Digit OTP Verification:** Secure signup flow with password hashing (`scrypt`), 10-minute expiring email OTP codes, and JWT Bearer session tokens (`pyjwt`). Supports real SMTP delivery (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) or instant development mode fallback.
- **Deeply Personalized AI LLM Engine:** When students interact with the AI Coach (`/api/chat`) or take diagnostic quizzes (`/api/quiz/evaluate`), the backend automatically loads the authenticated student's unique knowledge gaps and mistake history from the database, delivering razor-sharp, student-specific feedback.
- **Universal Multi-Provider LLM Engine:** Seamlessly connect Anthropic Claude, OpenAI GPT, Google Gemini, Local Ollama, or use zero-config Demo Mode for instant evaluation.
- **AI Syllabus Extractor & Topic Architecture:** Ingests raw syllabus text or PDFs and extracts structured topic trees, difficulty levels, prerequisites, and estimated hours.
- **PYQ Engine & Topic Frequency Mapping:** Maps university past exam questions to topics, ranking exam weightage.
- **Community Campus Archive:** Crowdsourced past university exam paper bank with filters for IIITDM, IIT Madras, NIT Trichy, and Anna University, with 1-click import into personal study plans.
- **Adaptive Quiz & Conceptual Mistake Log:** Evaluates answers not just for correctness, but specifically isolates the underlying conceptual misunderstanding and saves it to persistent memory.
- **4-Quadrant Knowledge Risk Matrix:** Categorizes syllabus topics across Risk, Secured Mastery, Low-Yield Gaps, and Deprioritized zones.
- **Dynamic Priority Study Queue:** Dynamically ranks topics using:
  $$\text{Priority Score} = \text{Gap Score} \times \text{PYQ Frequency} \times \frac{1}{\text{Days Until Exam}}$$
- **Active Recall Flashcards Drill:** 3D interactive flippable cards featuring automated "Mistake Trap" generation directly from past quiz errors, with spaced repetition rating.
- **Curated Resource Vault & Visualizers:** Hand-curated interactive simulators (Visualgo, NeetCode), video lectures, and cheatsheets explaining *why* they work for common exam pitfalls.
- **Day-by-Day Countdown Sprint Planner:** Allocates study sessions per remaining day with **1-Click Export to Google/Apple Calendar (.ics)** and Markdown Roadmap export.
- **Context-Aware AI Study Coach:** Chatbot injected with the student's real-time academic profile, mistake log, and exam timeline.

---

## 🏗️ Architecture

```
gapfill/
├── frontend/             # React 19 (Vite) + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/   # UI components, AuthModal, Navbar, KnowledgeMatrix, Heatmap
│   │   ├── pages/        # Dashboard, Subjects, Syllabus, Quiz, Chatbot, Resources, MockExam
│   │   ├── lib/          # api.js, auth.js (JWT/Sync), llm.js
│   │   └── store/        # Reactive global useStore with debounced cloud DB sync
│   └── public/
├── backend/              # Flask / Python API + SQLAlchemy ORM
│   ├── app.py            # API entry point & blueprint registration
│   ├── database.py       # Engine & session management (SQLite / PostgreSQL)
│   ├── models.py         # User, EmailOTP, UserStudyState models
│   ├── routes/           # Auth (Register/Login/OTP), User Data Sync, Syllabus, PYQ, Quiz, Chat
│   ├── prompts/          # Structured system prompts & dynamic prompt builders
│   └── utils/
│       ├── auth_utils.py # Password hashing, JWT token issuer, Email OTP engine
│       ├── llm_caller.py # Multi-provider proxy & personalized prompt injector
│       └── pdf_parser.py # PDF extraction engine
└── README.md
```

---

## 🚢 Deployment Options

### Option 1: GitHub Pages (Live)
The production bundle is hosted on the `gh-pages` branch:
👉 **[https://pratyush-singh123.github.io/Study-Planner/](https://pratyush-singh123.github.io/Study-Planner/)**

To enable in GitHub:
1. Go to repository **Settings** $\rightarrow$ **Pages**
2. Under **Build and deployment**, select **Deploy from a branch**
3. Choose branch **`gh-pages`** and folder **`/ (root)`** $\rightarrow$ **Save**

To redeploy after changes:
```bash
npm run deploy
```

### Option 2: Vercel (1-Click Deployment)
Click to deploy on Vercel:
👉 [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/Pratyush-Singh123/Study-Planner)

### Option 3: Local Development
```bash
# Run Frontend
npm run dev

# Run Backend
backend/venv/bin/python backend/app.py
```
