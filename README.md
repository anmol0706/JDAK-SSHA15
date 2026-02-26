<h1 align="center">
  <br>
  🎯 JDAK-SSHA15: Adaptive AI Interviewer Platform
  <br>
</h1>

<h4 align="center">Cognitive & Behavioral Analysis for Interview Preparation Powered By Gemini AI</h4>

<p align="center">
  <a href="#-about-the-project">About</a> •
  <a href="#-the-problem">The Problem</a> •
  <a href="#-the-solution">The Solution</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-local-setup">Local Setup</a>
</p>

---

## 🚀 About the Project

**Adaptive AI Interviewer** is a production-ready SaaS platform that uses **Google Gemini 2.0 AI** to conduct intelligent mock interviews. Wait, this isn't just another QA chatbot! Our platform dynamically adjusts question difficulty based on your performance in real-time, analyzes your voice (hesitations, pauses, filler words), and delivers comprehensive analytics to help you land your dream job.

**Built for Hackathons**: Showcasing the power of Gemini 2.0, WebSockets for real-time interaction, Speech-to-Text processing, and an elegant, premium, lightweight UI design.

---

## 🧠 The Problem

1. **High Interview Anxiety:** Candidates often struggle with nerves under pressure, and practicing with friends doesn't replicate the stress of a real interview.
2. **Lack of Constructive Feedback:** You either pass or fail an interview, but rarely get a detailed breakdown of *why*. Was it your logic? Your communication clarity?
3. **Static Practice Tools:** Existing mock interview apps give the same standard array of questions without adapting to the candidate's skill level. Real interviews probe deeper when you do well—static apps do not.

---

## 💡 The Solution

An **AI-driven Interviewer** that acts like a real human!
- It **listens** to you and analyzes your speech flow.
- It **thinks** about your responses using Gemini 2.0 to evaluate correct logical reasoning.
- It **adapts** by asking context-aware follow-up questions tailored to probe your weaknesses and highlight your strengths.
- It provides a detailed **post-interview report** outlining your specific strengths, weaknesses, Confidence Score, and Communication Clarity Score.

---

## ✨ Key Features

### 🎙 Real-time Voice Analysis
- **Hesitation & Filler Detection:** Identifies uncertainty ("um", "uh", "like") to help you speak with more authority.
- **Pacing Metrics:** Measures response time and pause durations.
- **Confidence Scoring:** Analyzes your speech patterns to deliver a measurable confidence rating.

### 🤖 Adaptive AI using Gemini 2.0
- **Dynamic Difficulty:** Questions get harder as you answer correctly, just like in a FAANG interview.
- **Follow-up Generation:** Intelligent probing based directly on what you just said.
- **Contextual Awareness:** Remembers previous answers to challenge inconsistencies in your reasoning.

### 📊 Comprehensive Analytics Dashboard
- Actionable post-interview breakdown.
- Visual metrics for **Reasoning Score**, **Communication Clarity**, and **Confidence**.
- A personalized **AI Improvement Plan** to guide your future preparation.

### 🎭 Multi-style Interviewer Personas
- **🔥 Strict Mode:** Rigorous questioning (think Tier-1 Tech companies).
- **😊 Friendly Mode:** Supportive and encouraging behavior for beginners.
- **🏢 Professional Mode:** Standard corporate style.

---

## 🛠 Tech Stack

### Frontend
- **React.js 18** - UI Architecture
- **Tailwind CSS** - Clean, modern, light-theme styling
- **Framer Motion** - Fluid, premium layout animations
- **Socket.io Client** - WebSockets for real-time UI updates
- **React Camera/Media Devices** - Candidate Face Tracking and capture

### Backend
- **Node.js & Express.js** - Blazing-fast API design
- **JSON File Database** - Lightweight, file-based persistence (Migrated from MongoDB for faster local setup during hackathons)
- **Socket.io** - WebSocket server for bidirectional audio/data streams
- **Google Gemini 2.0** - Core LLM engine driving the interview logic
- **Google Speech-to-Text** - Low-latency audio transcription

---

## 🏁 Local Setup

Want to run this locally? Follow these steps:

### Prerequisites
- Node.js 18+
- Google Gemini API Key
- Google Cloud Service Account (for Speech-to-Text)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/AI-Interviewer-main.git
cd AI-Interviewer-main
```

**2. Backend Setup**
```bash
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY and other credentials

# Start the backend server (runs on port 5000)
npm run dev
```

**3. Frontend Setup**
```bash
# Open a new terminal instance
cd client
npm install

# Start the frontend server
npm run dev
```

The app will instantly launch at `http://localhost:5173`. Dive in and start your first mock interview!

---

## 🚀 Future Roadmap

- **Video Processing:** Add real-time posture, eye-contact, and micro-expression analysis.
- **Code Editor Integration:** Support for live coding sessions synchronized with the AI.
- **Community Leaderboards:** Compare your interview scores against global users.

---

## 👨‍💻 Team

- **Anmol (or insert your team name)** - Full Stack Developer & AI Engineer

> **Winner / Participant at [Hackathon Name Here]** 🏆
> Built with ❤️ to revolutionize interview prep.
