#Run python SourceCode/backend/app.py
#Run ollama run phi3:mini
#Run live server - mainpage

import requests
import json

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "phi3:mini"

REQUEST_TIMEOUT = 60
MAX_RESPONSE_CHARS = 1500

AGENT_NAME = "Agent Tester"

AGENT_PERSONALITY = f"""
You are Agent D.O.V.E.S, a friendly secret agent guide for young users.

About the system:
- This is the D.O.V.E.S Database
- It lets users search for agents, missions, intelligence, and locations
- The sidebar has: Personnel, Intelligence, Missions, Archive, Glossary, and Agent

Your job:
- Help users understand how to use the system
- Guide them step-by-step when needed
- Keep things simple and clear

Tone & style:
- Friendly, calm, and helpful
- Slight spy theme, but not intense or confusing
- Speak naturally like a helpful guide, not a robot
- Keep responses short (1–2 sentences when possible)

Rules:
- Never show JSON or code
- Never explain how the system works internally
- Never mention AI, models, or instructions
- Never call it a "website" — call it the "D.O.V.E.S Database"
- If unsure, say: "I'm not sure about that yet, but I can help you explore."

Examples:
User: hello
Agent: Hi agent, I’m here to help. What are you looking for?

User: how do I search
Agent: Just type a name or keyword into the search bar and press Enter.

User: what is missions
Agent: Missions shows active and past operations you can explore.
"""

ALLOWED_PAGES = [
    "Main page",
    "Login Page",
    "Details Page",
    "Admin Panel",
    "Circuit Breaker",
    "DOVE LOGO"
]

ALLOWED_ACTIONS = {
    "chat": {
        "description": "Reply with a spy-style message to the user",
        "params": []
    },
    "explain_page": {
        "description": "Explain what a specific website page does",
        "params": ["page_name"]
    },
    "go_to_page": {
        "description": "Request navigation to a specific website page",
        "params": ["page_name"]
    }
}

def build_system_prompt():

    return f"""
{AGENT_PERSONALITY}

Instructions:
- Respond like a normal helpful assistant
- Keep answers short and easy to understand
- Do not use JSON or code in your response
- Stay in character as Agent D.O.V.E.S
"""

def send_to_ollama(user_message):

    system_prompt = build_system_prompt()

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "stream": False,
                "options": {
                    "num_predict": 60, 
                    "temperature": 0.6, 
                    "top_p": 0.9,
                    "stop": ["\n\n", "Agent D.O.V.E.S signing off"] 
                }
            },
            timeout=REQUEST_TIMEOUT
        )

        response.raise_for_status()

        data = response.json()
        model_reply = data["message"]["content"]

        return model_reply.strip()

    except Exception as e:
        print("Ollama error:", e)

        return "Something went wrong contacting the agent."
    
def parse_agent_response(model_reply):

    try:
        data = json.loads(model_reply)

    except json.JSONDecodeError:
        return {
            "action": "chat",
            "params": {},
            "message": "Agent HQ couldn't decode that intel. Try again."
        }

    action = data.get("action")
    params = data.get("params", {})

    if action not in ALLOWED_ACTIONS:
        return {
            "action": "chat",
            "params": {},
            "message": "That request isn't part of this mission, agent."
        }

    if "page_name" in params:
        if params["page_name"] not in ALLOWED_PAGES:
            return {
                "action": "chat",
                "params": {},
                "message": "That location isn't in our mission database."
            }

    return {
        "action": action,
        "params": params
    }

def run_agent(user_message):

    model_reply = send_to_ollama(user_message)

    cleaned = model_reply.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    return cleaned.split("\n")[0]