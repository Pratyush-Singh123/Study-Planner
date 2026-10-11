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

- **Universal LLM Abstraction Layer:** Seamlessly connect Anthropic Claude, OpenAI GPT, Google Gemini, Local Ollama, or use zero-config Demo Mode.
- **AI Syllabus Extractor:** Ingests raw syllabus text or PDFs and extracts structured topic trees, difficulty levels, prerequisites, and estimated hours.
- **PYQ Engine & Topic Frequency Mapping:** Maps university past exam questions to topics, ranking exam weightage.
- **Adaptive Quiz & Conceptual Mistake Log:** Evaluates answers not just for correctness, but specifically isolates the conceptual misunderstanding.
- **Priority Queue Dashboard:** Dynamically ranks topics using:
  $$\text{Priority Score} = \text{Gap Score} \times \text{PYQ Frequency} \times \frac{1}{\text{Days Until Exam}}$$
- **Context-Aware AI Study Coach:** Chatbot injected with the student's real-time academic profile, mistake log, and exam timeline.
- **"I'm Stuck" Micro-Recommender:** Provides hyper-targeted resources based on specific conceptual sticking points.

---

## 🏗️ Architecture

```
gapfill/
├── frontend/             # React (Vite) + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/   # UI components, layout, cards, progress rings
│   │   ├── pages/        # Onboarding, Dashboard, Quiz, Chatbot, Resources
│   │   ├── lib/
│   │   │   └── llm.js    # Unified multi-provider LLM abstraction
│   │   └── store/        # Local storage state & demo dataset
│   └── public/
├── backend/              # Flask / Python API
│   ├── app.py            # API entry point
│   ├── routes/           # Syllabus, PYQ, Quiz, Chat, Resource routes
│   ├── prompts/          # Structured system prompts
│   └── utils/
│       ├── llm_caller.py # Multi-provider proxy
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
