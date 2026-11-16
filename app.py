
import sqlite3
import os
import re
from pathlib import Path

from flask import (
    Flask, render_template, request, jsonify, session
)
from dotenv import load_dotenv
from groq import Groq
from werkzeug.security import generate_password_hash, check_password_hash


# =====================================
# CONFIGURATION
# =====================================

BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"

load_dotenv(dotenv_path=env_path, override=True)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing. Check your .env file.")

client = Groq(api_key=api_key)

app = Flask(__name__)

app.secret_key = os.getenv("FLASK_SECRET_KEY") or os.urandom(32)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)

DB_PATH = BASE_DIR / "curely.db"


# =====================================
# DATABASE INITIALIZATION
# =====================================

def init_db():
    conn = sqlite3.connect(DB_PATH)

    # Registered users
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Chat history
    conn.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Add user_id to an existing chat_history table if needed
    columns = [
        row[1] for row in conn.execute(
            "PRAGMA table_info(chat_history)"
        ).fetchall()
    ]

    if "user_id" not in columns:
        conn.execute("""
            ALTER TABLE chat_history
            ADD COLUMN user_id INTEGER REFERENCES users(id)
        """)

    conn.commit()
    conn.close()


init_db()


# =====================================
# HOME PAGE
# =====================================

@app.route("/")
def home():
    return render_template("index.html")


# =====================================
# AUTHENTICATION STATUS
# =====================================

@app.route("/auth/status", methods=["GET"])
def auth_status():
    if "user_id" in session:
        return jsonify({
            "logged_in": True,
            "name": session.get("user_name")
        })

    return jsonify({
        "logged_in": False,
        "name": None
    })


# =====================================
# USER REGISTRATION
# =====================================

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Please fill in all fields."
        }), 400

    if len(name) > 80:
        return jsonify({
            "success": False,
            "message": "Name must be 80 characters or fewer."
        }), 400

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    if len(email) > 254:
        return jsonify({
            "success": False,
            "message": "Email address is too long."
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters."
        }), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = sqlite3.connect(DB_PATH)

        cursor = conn.execute("""
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        """, (name, email, hashed_password))

        user_id = cursor.lastrowid

        conn.commit()
        conn.close()

        session.clear()
        session["user_id"] = user_id
        session["user_name"] = name

        return jsonify({
            "success": True,
            "message": "Account created successfully.",
            "name": name
        })

    except sqlite3.IntegrityError:
        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    except Exception as e:
        print("Registration error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to create your account right now."
        }), 500


# =====================================
# USER LOGIN
# =====================================

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Please enter your email and password."
        }), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row

        user = conn.execute("""
            SELECT id, name, email, password
            FROM users
            WHERE email = ?
        """, (email,)).fetchone()

        conn.close()

        if not user or not check_password_hash(
            user["password"], password
        ):
            return jsonify({
                "success": False,
                "message": "Invalid email or password."
            }), 401

        session.clear()
        session["user_id"] = user["id"]
        session["user_name"] = user["name"]

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "name": user["name"]
        })

    except Exception as e:
        print("Login error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to log in right now."
        }), 500


# =====================================
# USER LOGOUT
# =====================================

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "You have logged out successfully."
    })


# =====================================
# RETRIEVE CHAT HISTORY
# =====================================

@app.route("/history", methods=["GET"])
def get_history():

    # Guests do not have saved database history
    if "user_id" not in session:
        return jsonify([])

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row

        rows = conn.execute("""
            SELECT role, message, timestamp
            FROM chat_history
            WHERE user_id = ?
            ORDER BY id ASC
        """, (session["user_id"],)).fetchall()

        conn.close()

        history = [
            {
                "role": row["role"],
                "message": row["message"],
                "timestamp": row["timestamp"]
            }
            for row in rows
        ]

        return jsonify(history)

    except Exception as e:
        print("History error:", e)

        return jsonify({
            "error": "Unable to load chat history."
        }), 500


# =====================================
# CHATBOT API
# =====================================

@app.route("/chat", methods=["POST"])
def chat():

    try:
        data = request.get_json(silent=True) or {}

        user_message = data.get("message", "")

        if not isinstance(user_message, str):
            return jsonify({
                "reply": "Invalid message."
            }), 400

        user_message = user_message.strip()

        if not user_message:
            return jsonify({
                "reply": "Please enter a message."
            }), 400

        if len(user_message) > 5000:
            return jsonify({
                "reply": "Your message is too long. Please shorten it."
            }), 400

        user_id = session.get("user_id")

        # Registered users: retrieve their own saved history
        if user_id:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row

            rows = conn.execute("""
                SELECT role, message
                FROM chat_history
                WHERE user_id = ?
                ORDER BY id DESC
                LIMIT 10
            """, (user_id,)).fetchall()

            conn.close()

            chat_history = [
                {
                    "role": row["role"],
                    "content": row["message"]
                }
                for row in reversed(rows)
            ]

        # Guests: use temporary history sent by the browser
        else:
            supplied_history = data.get("history", [])

            chat_history = []

            if isinstance(supplied_history, list):
                for item in supplied_history[-10:]:
                    if not isinstance(item, dict):
                        continue

                    role = item.get("role")
                    content = item.get("content")

                    if (
                        role in ("user", "assistant")
                        and isinstance(content, str)
                    ):
                        chat_history.append({
                            "role": role,
                            "content": content[:5000]
                        })

        # Generate AI response
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are CURELY, a helpful healthcare "
                        "information assistant. "
                        "Provide clear, general health and wellness "
                        "information. Do not diagnose diseases or "
                        "prescribe medicines. Encourage users to "
                        "consult qualified healthcare professionals. "
                        "For potentially life-threatening symptoms, "
                        "advise users to seek emergency medical help "
                        "immediately."
                    )
                },
                *chat_history,
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.5,
            max_completion_tokens=500
        )

        bot_reply = response.choices[0].message.content

        # Save messages only for registered users
        if user_id:
            conn = sqlite3.connect(DB_PATH)

            conn.executemany("""
                INSERT INTO chat_history (user_id, role, message)
                VALUES (?, ?, ?)
            """, [
                (user_id, "user", user_message),
                (user_id, "assistant", bot_reply)
            ])

            conn.commit()
            conn.close()

        return jsonify({
            "reply": bot_reply
        })

    except Exception as e:
        print("Chat error:", e)

        return jsonify({
            "reply": (
                "Sorry, I couldn't process your question "
                "right now. Please try again."
            )
        }), 500


# =====================================
# CURELY SYMPTOM CHECKER API
# =====================================

@app.route("/symptom-check", methods=["POST"])
def symptom_check():

    try:
        data = request.get_json(silent=True) or {}

        symptoms = data.get("symptoms", [])
        duration = data.get("duration", "")
        severity = data.get("severity", "")

        allowed_symptoms = {
            "Headache", "Fever", "Dizziness",
            "Cough", "Fatigue", "Nausea"
        }

        if not isinstance(symptoms, list) or not symptoms:
            return jsonify({
                "reply": "Please select at least one symptom."
            }), 400

        if not all(
            isinstance(item, str) and item in allowed_symptoms
            for item in symptoms
        ):
            return jsonify({
                "reply": "Please select valid symptoms."
            }), 400

        allowed_durations = {
            "Less than a day", "1-3 days",
            "4-7 days", "More than a week"
        }

        allowed_severities = {
            "Mild", "Moderate", "Severe"
        }

        if duration not in allowed_durations:
            return jsonify({
                "reply": "Please select a valid duration."
            }), 400

        if severity not in allowed_severities:
            return jsonify({
                "reply": "Please select a valid severity."
            }), 400

        prompt = f"""
        A user has reported these symptoms: {", ".join(symptoms)}.
        Duration: {duration}.
        Reported severity: {severity}.

        Provide general health information only.
        Explain that symptoms can have different causes.
        Suggest sensible general self-care where appropriate.
        Explain when the user should consult a healthcare professional.

        Do not diagnose diseases or prescribe medicines.
        Do not claim that you can determine the cause of symptoms.

        If symptoms are severe, advise prompt medical assessment.
        If the user may be experiencing a medical emergency,
        advise immediate emergency medical help.

        Keep the response clear, calm and easy to understand.
        """

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are CURELY, a responsible healthcare "
                        "information assistant. You do not diagnose "
                        "conditions or prescribe medicines."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_completion_tokens=500
        )

        bot_reply = response.choices[0].message.content

        return jsonify({
            "reply": bot_reply
        })

    except Exception as e:
        print("Symptom checker error:", e)

        return jsonify({
            "reply": (
                "Sorry, we couldn't process your symptoms "
                "right now. Please try again."
            )
        }), 500


# =====================================
# RUN APPLICATION
# =====================================

if __name__ == "__main__":
    app.run(debug=True)
