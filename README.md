
# 🩺 CURELY — AI Healthcare Assistant

<p align="center">
  ![CURELY](https://img.shields.io/badge/CURELY-AI%20HEALTHCARE%20CHATBOT-16A085?style=for-the-badge)
  ![Python](https://img.shields.io/badge/PYTHON-3.13+-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Flask](https://img.shields.io/badge/FLASK-WEB%20FRAMEWORK-black?style=for-the-badge&logo=flask)
  ![SQLite](https://img.shields.io/badge/SQLITE-DATABASE-003B57?style=for-the-badge&logo=sqlite)
  ![Groq](https://img.shields.io/badge/GROQ-AI%20API-F55036?style=for-the-badge)
  ![AI](https://img.shields.io/badge/AI-GPT--OSS%20120B-8A2BE2?style=for-the-badge)
</p>

**An AI-powered healthcare chatbot built using Python, Flask, SQLite and Groq API.**

*Your intelligent companion for general health questions, symptom guidance, and everyday wellness.*

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## 🌟 Overview

**CURELY** is a full-stack AI healthcare assistant designed to make general health information more accessible through an interactive chatbot.

Powered by a large language model through the **Groq API**, CURELY provides conversational health assistance through a simple and user-friendly web interface.

CURELY is designed to:

- Help users understand common symptoms and general health concerns.
- Provide AI-generated responses to everyday healthcare questions.
- Offer helpful wellness tips for healthier daily habits.
- Provide a dedicated symptom checker for basic symptom guidance.
- Display emergency help information.
- Support user registration and login.
- Maintain registered users' chat history using SQLite.

> ⚠️ **Medical Disclaimer:** CURELY is an informational assistant and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns. In an emergency, contact local emergency services.

---

## ✨ Features

### 🤖 AI-Powered Healthcare Chatbot

- Powered by Groq API using the `openai/gpt-oss-120b` model.
- Answers general health-related questions through natural-language conversations.
- Supports multi-turn conversations using recent chat context.
- Provides easy-to-understand health information.
- Includes a clean, interactive chat interface.

### 🩺 Symptom Checker

- Dedicated symptom assessment interface.
- Supports common symptoms such as:
  - Headache
  - Fever
  - Dizziness
  - Cough
  - Fatigue
  - Nausea
- Collects symptom duration and severity.
- Uses AI to provide general health information and guidance.
- Does not provide a medical diagnosis.

### 🌿 Health & Wellness Tips

- Dedicated Health Tips section.
- Provides general wellness information.
- Helps users explore healthy lifestyle habits.
- Includes an organized interface for browsing health tips.

### 🚨 Emergency Help

- Dedicated Emergency Help section.
- Provides emergency-related information and guidance.
- Designed to make important emergency information easier to access.
- Encourages users to contact emergency services when immediate medical assistance is required.

### 🔐 User Authentication

- User registration and login functionality.
- Secure password hashing using Werkzeug.
- Session-based authentication with Flask.
- Logout functionality.
- Guest access to the chatbot.
- Registered users' chat history is stored separately in SQLite.

### 💬 Chat History Management

- Stores registered users' conversations in an SQLite database.
- Retrieves saved conversations through the backend.
- Maintains conversation context for AI responses.
- Guest conversation history is maintained temporarily in the browser session.

### 🎨 Interactive User Interface

- Clean and user-friendly dashboard layout.
- Sidebar navigation for different healthcare sections.
- Interactive suggestion cards.
- Responsive styling for different screen sizes.
- Organized chat and symptom-checking interfaces.

---

## 🛠️ Tech Stack

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| Python              | Backend programming             |
| Flask               | Web application framework       |
| Groq API            | AI model integration            |
| OpenAI GPT-OSS 120B | Language model                  |
| SQLite              | Database management             |
| HTML5               | Web page structure              |
| CSS3                | Styling and responsive design   |
| JavaScript          | Frontend interactions           |
| Werkzeug            | Password hashing                |
| python-dotenv       | Environment variable management |

---

## 📁 Project Structure

```text
CURELY/
│
├── app.py
├── curely.db
├── .env
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── script.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Dip6ss21/CURELY-AI-HEALTHCARE-CHATBOT.git
```

### 2. Navigate to the Project Directory

```bash
cd CURELY-AI-HEALTHCARE-CHATBOT
```

### 3. Install Dependencies

```bash
py -m pip install flask groq python-dotenv
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

Add your API credentials:

```env
GROQ_API_KEY=your_groq_api_key
FLASK_SECRET_KEY=your_random_secret_key
```

Get your Groq API key from:

[https://console.groq.com/](https://console.groq.com/)

**Important:** Never upload your `.env` file or expose your API credentials publicly.

### 5. Run the Application

```bash
py app.py
```

### 6. Open in Your Browser

```text
http://127.0.0.1:5000
```

---

## 🔑 Application Modules

| Module          | Description                          |
| --------------- | ------------------------------------ |
| AI Chat         | Conversational healthcare assistance |
| Authentication  | User registration and login          |
| Symptom Checker | Basic symptom guidance               |
| Health Tips     | General wellness information         |
| Emergency Help  | Emergency information section        |
| Chat History    | SQLite-based conversation storage    |

---

## 🔮 Future Improvements

- Expand the symptom checker with more symptom categories.
- Add a searchable medicine information database.
- Introduce voice input and text-to-speech.
- Improve emergency keyword detection.
- Add a personalized health dashboard.
- Enhance the UI with additional animations and themes.
- Add more advanced user profile and history management.

---

## 🎯 Project Objective

The main objective of CURELY is to explore how Artificial Intelligence and web technologies can be combined to make general healthcare information more accessible and user-friendly.

This project demonstrates the practical integration of:

- AI-powered natural language processing.
- Backend development using Flask.
- Database management using SQLite.
- User authentication and session management.
- Frontend development using HTML, CSS, and JavaScript.

---

## 👩‍💻 Author

**Dip6ss21**

AI Healthcare Assistant Project — CURELY

---

\<p align="center">   \<b>Built with ❤️ using Python, Flask, SQLite, and Groq AI.\</b> \</p>
