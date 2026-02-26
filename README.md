# 🎯 JDAK-SSHA15: Adaptive AI Interviewer Platform

<p align="center">
  <img src="https://img.shields.io/badge/Gemini%202.0-AI-blue?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Gemini 2.0" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Hackathon-Submission-orange?style=for-the-badge" alt="Hackathon" />
</p>

---

## 🚀 Overview

**JDAK-SSHA15** is an advanced, production-grade SaaS platform designed to revolutionize interview preparation. Unlike standard mock interview tools, our platform leverages **Google Gemini 2.0 AI** to provide a truly dynamic and adaptive experience that mirrors real-world high-stakes interviews.

> **"It's not just a chatbot—it's your personalized career coach."**

---

## 🧠 The Problem & Our Solution

### ❌ The Challenges
- **Interview Anxiety:** Practicing alone or with friends lacks the pressure of a real technical round.
- **Vague Feedback:** "You did okay" doesn't help. Candidates need data-driven insights.
- **Static Learning:** Generic question banks don't adapt to your unique skill level.

### ✅ Our Innovation
- **Adaptive Questioning:** The AI senses your level. If you're crushing it, the questions get harder—just like in a real FAANG interview.
- **Voice Intelligence:** We analyze your **pacing, hesitations, and filler words** to score your communication clarity.
- **Actionable Analytics:** Get a personalized **AI Improvement Plan** after every session.

---

## ✨ Key Features

### 🎙️ Advanced Vocal Analysis
- **Emotional & Confidence Scoring:** Uses speech patterns to detect nerves vs. authority.
- **Filler Word Detection:** Tracks "ums", "uhs", and "likes" in real-time.
- **Pacing Metrics:** Measures response time and pause durations for better flow.

### 🤖 Gemini 2.0 Powered Brain
- **Contextual Follow-ups:** Probes deeper into your previous answers to test depth of knowledge.
- **Reasoning Evaluation:** Validates the logic behind your answers, not just keywords.
- **Multi-Persona:** Toggle between **Strict**, **Friendly**, and **Professional** interviewer styles.

### 📊 Performance Dashboard
- **Comprehensive Scorecard:** Reasoning, Confidence, and Clarity scores.
- **Strengths & Weaknesses:** Automated SWOT analysis based on your transcript.
- **Practice Recommendations:** Curated questions to improve your specific weak spots.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Framer Motion, Socket.io Client |
| **Backend** | Node.js, Express, Lowdb (JSON persistence), WebSockets |
| **AI Engine** | Google Gemini 2.0 (Vertex AI / Generative AI) |
| **Voice Processing** | Google Cloud Speech-to-Text |
| **Deployment** | Docker, Google Cloud Run |

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/)
- Google Cloud Service Account (for Speech-to-Text)

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/anmol0706/JDAK-SSHA15.git
   cd JDAK-SSHA15
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the `server` directory:
   ```env
   GEMINI_API_KEY=your_key_here
   PORT=5000
   ```

3. **Run the Application**
   ```bash
   # Start Backend (from root)
   cd server && npm run dev

   # Start Frontend (new terminal)
   cd client && npm run dev
   ```

---

## 🚀 Roadmap
- [ ] **Visual Feedback:** Real-time eye-contact and posture analysis via webcam.
- [ ] **Live Coding:** Integrated sandbox for technical whiteboard sessions.
- [ ] **ATS Scoring:** Resume-to-Interview alignment scoring.

---

## 👨‍💻 Team: JDAK-SSHA15

Built with ❤️ for the community.  
**Winner / Participant at Hackathon 2026** 🏆

---
*Developed by Anmol and the JDAK-SSHA15 Team.*
