# 🎯 GapFill — Intelligent Study Planner & Knowledge Gap Engine

> **"GapFill is the only tool that knows your syllabus, remembers your mistakes, tracks your gaps, and tells you exactly what to study today — not what some generic student should study."**

Built for the **Axion Hackathon**.

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

- **Universal LLM Abstraction Layer:** Seamlessly connect Anthropic Claude, OpenAI GPT, Google Gemini, or Local Ollama.
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
│   ├── routes/           # Syllabus, PYQ, Quiz, Chat routes
│   ├── prompts/          # Structured system prompts
│   └── utils/
│       └── pdf_parser.py # PDF extraction engine
└── README.md
```

---

## ⏱️ Execution Roadmap

- [x] **Phase 0:** Setup, Git repo, and project structure
- [ ] **Phase 1:** LLM Abstraction Layer (`llm.js` / API)
- [ ] **Phase 2:** Onboarding Flow (4 linear setup screens)
- [ ] **Phase 3:** Syllabus Parser & Interactive Topic Review
- [ ] **Phase 4:** PYQ Engine & Exam Weightage Mapper
- [ ] **Phase 5:** Quiz Flow, Gap Tracker & Mistake Log
- [ ] **Phase 6:** Priority Queue Dashboard & Progress Rings
- [ ] **Phase 7:** Context-Aware Study Coach (Chatbot)
- [ ] **Phase 8:** "I'm Stuck" Resource Recommender
- [ ] **Phase 9:** Polish, Demo Mode & Pitch Rehearsal
