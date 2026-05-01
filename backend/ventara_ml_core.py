import os, json, datetime
from collections import Counter
from groq import Groq
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

GROQ_API_KEY      = os.environ.get("GROQ_API_KEY", "")
MODEL             = "llama-3.3-70b-versatile"
SUPABASE_URL      = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY      = os.environ.get("SUPABASE_SERVICE_KEY", "")   # service role key

SYSTEM_PROMPT = """
You are Ventara, a compassionate AI mental wellness companion.
Your role is to:
1. Listen without judgment to users sharing their thoughts, feelings, and traumas.
2. Respond with empathy, warmth, and therapeutic insight.
3. At the END of every reply, output a special JSON block with the emotion analysis:

[EMOTION_DATA]
{
  "primary_emotion": "<one of: happy|sad|angry|anxious|fearful|disgusted|surprised|neutral|hopeful|exhausted>",
  "intensity": <1-10 integer>,
  "secondary_emotions": ["<emotion1>", "<emotion2>"],
  "mood_score": <-5 to +5 float, negative=distressed, positive=wellbeing>,
  "risk_flag": <true if crisis indicators detected, else false>,
  "keywords": ["<word1>", "<word2>", "<word3>"]
}
[/EMOTION_DATA]

Rules:
- Never mention the JSON block in your spoken reply.
- Keep your spoken reply warm, human, and concise (3-5 sentences).
- If risk_flag is true, gently mention crisis resources (iCall India: 9152987821).
- Always validate the user's feelings before offering any perspective.
"""


def supa_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def supa_insert(table: str, data: dict):
    r = httpx.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={**supa_headers(), "Prefer": "return=representation"},
        json=data
    )
    return r.json()

def supa_select(table: str, filters: str, limit: int = 30):
    r = httpx.get(
        f"{SUPABASE_URL}/rest/v1/{table}?{filters}&order=timestamp.desc&limit={limit}",
        headers=supa_headers()
    )
    return r.json()


def parse_emotion_block(raw: str):
    emotion_data, clean = {}, raw
    try:
        s = raw.index("[EMOTION_DATA]") + len("[EMOTION_DATA]")
        e = raw.index("[/EMOTION_DATA]")
        emotion_data = json.loads(raw[s:e].strip())
        clean = raw[:raw.index("[EMOTION_DATA]")].strip()
    except (ValueError, json.JSONDecodeError):
        pass
    return clean, emotion_data

def compute_analytics(sessions: list) -> dict:
    if not sessions:
        return {"message": "No data yet."}
    scores    = [s["mood_score"] for s in sessions if s.get("mood_score") is not None]
    emotions  = [s["emotion"] for s in sessions if s.get("emotion")]
    keywords  = []
    for s in sessions:
        keywords.extend(json.loads(s.get("keywords", "[]") or "[]"))
    avg_mood    = round(sum(scores)/len(scores), 2) if scores else 0
    swing       = round(max(scores)-min(scores), 2) if len(scores) > 1 else 0
    risk_count  = sum(1 for s in sessions if s.get("risk_flag"))
    top_emotions = Counter(emotions).most_common(3)
    top_keywords = Counter(keywords).most_common(5)
    recent = sorted(sessions[-10:], key=lambda x: x.get("timestamp",""))
    timeline = [
        {"time": r["timestamp"][11:16], "score": r["mood_score"], "emotion": r["emotion"]}
        for r in recent if r.get("timestamp")
    ]
    return {
        "average_mood_score": avg_mood,
        "mood_swing_index":   swing,
        "dominant_emotions":  [e[0] for e in top_emotions],
        "risk_sessions":      risk_count,
        "top_keywords":       [k[0] for k in top_keywords],
        "session_count":      len(sessions),
        "timeline":           timeline
    }

def do_chat(user_id: str, user_message: str, conversation_history: list) -> dict:
    client = Groq(api_key=GROQ_API_KEY)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += conversation_history
    messages.append({"role": "user", "content": user_message})
    response = client.chat.completions.create(
        model=MODEL, messages=messages, temperature=0.7, max_tokens=800
    )
    raw = response.choices[0].message.content
    clean_reply, emotion_data = parse_emotion_block(raw)

    # Save to Supabase
    supa_insert("sessions", {
        "user_id":   user_id,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "user_msg":  user_message,
        "bot_reply": clean_reply,
        "emotion":   emotion_data.get("primary_emotion", "neutral"),
        "intensity": emotion_data.get("intensity", 5),
        "mood_score": emotion_data.get("mood_score", 0.0),
        "risk_flag": emotion_data.get("risk_flag", False),
        "keywords":  json.dumps(emotion_data.get("keywords", []))
    })

    sessions = supa_select("sessions", f"user_id=eq.{user_id}", 30)
    if isinstance(sessions, list):
        analytics = compute_analytics(sessions)
    else:
        analytics = {}

    return {"reply": clean_reply, "emotion_data": emotion_data, "analytics": analytics}


def create_api():
    api = FastAPI(title="Ventara API v2", version="2.0.0")
    api.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class ChatRequest(BaseModel):
        user_id:  str
        message:  str
        history:  list = []

    @api.post("/chat")
    def chat_endpoint(req: ChatRequest):
        try:
            return do_chat(req.user_id, req.message, req.history)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @api.get("/analytics/{user_id}")
    def analytics_endpoint(user_id: str):
        sessions = supa_select("sessions", f"user_id=eq.{user_id}", 30)
        if not isinstance(sessions, list):
            return {"message": "No data yet."}
        return compute_analytics(sessions)

    @api.get("/history/{user_id}")
    def history_endpoint(user_id: str, limit: int = 20):
        sessions = supa_select("sessions", f"user_id=eq.{user_id}", limit)
        if not isinstance(sessions, list):
            return []
        return [
            {
                "timestamp": s.get("timestamp"),
                "user_msg":  s.get("user_msg"),
                "bot_reply": s.get("bot_reply"),
                "emotion":   s.get("emotion"),
                "intensity": s.get("intensity"),
                "mood_score": s.get("mood_score"),
                "risk_flag": s.get("risk_flag"),
                "keywords":  json.loads(s.get("keywords", "[]") or "[]")
            }
            for s in sessions
        ]

    @api.get("/health")
    def health():
        return {"status": "ok", "model": MODEL}

    return api

app = create_api()
