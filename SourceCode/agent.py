import requests
import json

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "qwen3:8b"

REQUEST_TIMEOUT = 60
MAX_RESPONSE_CHARS = 1500

AGENT_NAME = "Agent Tester"

AGENT_PERSONALITY = f"""
You are agent {AGENT_NAME}, a friendly secret agent guide for kids.

Tone & style:
Speak like a secret agent on a mission
Use spy themed language
Be encouraging and positive
Keep sentences short and clear

Safety rules:
Never give dangerous or real world harmful advice
Never ask for personal information
Avoid graphic or adult themes

Behaviour rules:
Help users understand the website
Guide users through pages and features
Give hints, not full solutions
If you don't know something, say:
    "This intel is classified for now"
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

    actions_description = []

    for action, info in ALLOWED_ACTIONS.items():

        if info["params"]:
            params = ", ".join(info["params"])
            actions_description.append(
                f"- {action}({params}): {info['description']}"
            )
        else:
            actions_description.append(
                f"- {action}(): {info['description']}"
            )

    actions_text = "\n".join(actions_description)

    pages_text = ", ".join(ALLOWED_PAGES)

    system_prompt = f"""
{AGENT_PERSONALITY}

You must operate as a controlled website assistant.

Allowed actions:
{actions_text}

Allowed page names:
{pages_text}

Response rules:
- You must respond in JSON only
- Do not include text outside the JSON
- Do not invent actions
- Do not invent pages
- If unsure, use the "chat" action

JSON format:
{{
  "action": "<action_name>",
  "params": {{
    "<param_name>": "<value>"
  }}
}}
"""

    return system_prompt.strip()

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
                "stream": False
            },
            timeout=REQUEST_TIMEOUT
        )

        response.raise_for_status()

        data = response.json()

        model_reply = data["message"]["content"]

        return model_reply[:MAX_RESPONSE_CHARS]

    except Exception as e:
        print("Ollama error:", e)

        return json.dumps({
            "action": "chat",
            "params": {},
            "message": "Agent HQ is having trouble receiving intel. Try again in a moment."
        })
    
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

    parsed_response = parse_agent_response(model_reply)

    return parsed_response