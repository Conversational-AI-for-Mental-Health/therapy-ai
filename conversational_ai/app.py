"""
Mental Health Chatbot Flask API - Qwen 2.5 1.5B
Runs completely locally with no authentication required
Model loads at startup and stays in memory

Telegram support:
- Webhook endpoint: POST /telegram/webhook (requires public HTTPS URL + setWebhook)
- Polling mode: no public domain needed (your server pulls updates from Telegram)
- Persistent conversation context by chat_id using SQLite
- Telegram HTML formatting for responses
"""

import os
import time
import logging
from threading import Lock, Thread
from typing import Dict, List, Optional, Any

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import requests

from telegram_store import init_db, load_history, save_history, truncate_history
from telegram_format import llm_text_to_telegram_html



load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Telegram config
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_WEBHOOK_SECRET = os.environ.get("TELEGRAM_WEBHOOK_SECRET")
TELEGRAM_MAX_TURNS = int(os.environ.get("TELEGRAM_MAX_TURNS", "12"))

# "polling" works with no public domain. "webhook" requires public HTTPS + setWebhook.
TELEGRAM_MODE = os.environ.get("TELEGRAM_MODE", "polling")  # "polling" or "webhook"
TELEGRAM_POLL_SECONDS = float(os.environ.get("TELEGRAM_POLL_SECONDS", "1.0"))
TELEGRAM_POLL_TIMEOUT = int(os.environ.get("TELEGRAM_POLL_TIMEOUT", "30"))  # long poll timeout seconds

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
init_db()


def _tg_api_url(method: str) -> str:
    assert isinstance(method, str) and method
    assert TELEGRAM_BOT_TOKEN is not None and isinstance(TELEGRAM_BOT_TOKEN, str)
    assert len(TELEGRAM_BOT_TOKEN) > 10
    return f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/{method}"


def telegram_send_message(chat_id: int, html_text: str) -> None:
    assert isinstance(chat_id, int)
    assert isinstance(html_text, str) and html_text.strip()

    payload = {
        "chat_id": chat_id,
        "text": html_text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    r = requests.post(_tg_api_url("sendMessage"), json=payload, timeout=15)
    assert r.status_code == 200, f"Telegram sendMessage failed: {r.status_code} {r.text}"


def _handle_telegram_text(chat_id: int, user_text: str) -> None:
    """
    Shared handler for webhook + polling to:
    - load history
    - generate response
    - persist history
    - send formatted message to Telegram
    """
    assert isinstance(chat_id, int)
    assert isinstance(user_text, str) and user_text.strip()

    if model is None or tokenizer is None:
        # Avoid crashing Telegram update handling if model isn't ready
        try:
            telegram_send_message(chat_id, "Model not loaded yet.")
        except Exception as e:
            logger.error(f"Telegram send failed while model not loaded: {e}")
        return

    history = load_history(chat_id)
    history = truncate_history(history, TELEGRAM_MAX_TURNS)

    assistant_text = generate_response(
        user_message=user_text.strip(),
        conversation_history=history,
        max_tokens=512,
        temperature=0.7,
    )
    assert isinstance(assistant_text, str)

    # Persist in correct [user, assistant] order
    new_history = list(history)
    new_history.append({"role": "user", "content": user_text.strip()})
    new_history.append({"role": "assistant", "content": assistant_text.strip()})
    new_history = truncate_history(new_history, TELEGRAM_MAX_TURNS)
    save_history(chat_id, new_history)

    html_out = llm_text_to_telegram_html(assistant_text)

    # Do not crash the webhook/poller on transient Telegram failures
    try:
        telegram_send_message(chat_id, html_out)
    except Exception as e:
        logger.error(f"Telegram send failed: {e}")


@app.route("/telegram/webhook", methods=["POST"])
def telegram_webhook():
    # Telegram secret header validation
    if TELEGRAM_WEBHOOK_SECRET:
        got = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
        assert isinstance(got, str)
        if got != TELEGRAM_WEBHOOK_SECRET:
            return jsonify({"ok": False, "error": "bad secret"}), 403

    upd = request.get_json(silent=True) or {}
    assert isinstance(upd, dict)

    msg = upd.get("message") or upd.get("edited_message")
    if not msg:
        return jsonify({"ok": True})

    chat = msg.get("chat") or {}
    chat_id = chat.get("id")
    text = msg.get("text") or ""

    if not isinstance(chat_id, int):
        return jsonify({"ok": True})
    if not isinstance(text, str) or not text.strip():
        return jsonify({"ok": True})

    _handle_telegram_text(chat_id, text.strip())
    return jsonify({"ok": True})


def telegram_polling_loop() -> None:
    """
    Polling mode: works without public HTTPS domain.
    Your process calls getUpdates repeatedly.
    """
    assert TELEGRAM_BOT_TOKEN is not None and len(TELEGRAM_BOT_TOKEN) > 10

    offset: Optional[int] = None
    logger.info("Telegram polling loop started")

    while True:
        try:
            params: Dict[str, Any] = {"timeout": TELEGRAM_POLL_TIMEOUT}
            if offset is not None:
                params["offset"] = offset

            r = requests.get(_tg_api_url("getUpdates"), params=params, timeout=TELEGRAM_POLL_TIMEOUT + 15)
            assert r.status_code == 200, f"getUpdates failed: {r.status_code} {r.text}"

            data = r.json()
            assert isinstance(data, dict)
            assert data.get("ok") is True, f"getUpdates not ok: {data}"

            updates = data.get("result", [])
            assert isinstance(updates, list)

            for upd in updates:
                assert isinstance(upd, dict)
                update_id = upd.get("update_id")
                if isinstance(update_id, int):
                    offset = update_id + 1

                msg = upd.get("message")
                if not msg:
                    continue

                chat = msg.get("chat") or {}
                chat_id = chat.get("id")
                text = msg.get("text") or ""

                if not isinstance(chat_id, int):
                    continue
                if not isinstance(text, str) or not text.strip():
                    continue

                _handle_telegram_text(chat_id, text.strip())

        except Exception as e:
            logger.error(f"Telegram polling loop error: {e}")

        time.sleep(TELEGRAM_POLL_SECONDS)


model: Optional[AutoModelForCausalLM] = None
tokenizer: Optional[AutoTokenizer] = None
model_lock = Lock()

# Set which GPU to use (0, 1, 2, etc.) or None for CPU
CUDA_DEVICE = 0

SYSTEM_PROMPT = """You are a compassionate mental health support chatbot. Your role is to:
- Listen empathetically and validate feelings
- Ask clarifying questions to understand the user's situation better
- Provide supportive responses and evidence-based coping strategies
- Encourage professional help when appropriate
- Be warm, non-judgmental, and supportive

- **You MUST use Markdown for formatting (e.g., lists, bold text) to make responses clearer. Try to make the response concise.**

IMPORTANT SAFETY GUIDELINES:
- You are NOT a replacement for professional therapy or medical advice
- If someone mentions self-harm, suicide, or immediate danger, provide crisis resources immediately
- Do not diagnose mental health conditions
- Encourage seeking professional help for serious or ongoing concerns
- Maintain appropriate boundaries

Crisis Resources (US):
- National Suicide Prevention Lifeline: 988 (call or text)
- Crisis Text Line: Text HOME to 741741
- Emergency: 911

Remember to be supportive, validating, and encouraging while maintaining safety."""


def load_model() -> None:
    """Load Qwen 2.5 1.5B Instruct model into memory at startup"""
    global model, tokenizer

    logger.info("=" * 60)
    logger.info("Loading Qwen 2.5 0.5B Instruct model locally...")
    logger.info("=" * 60)

    model_name = "Qwen/Qwen2.5-1.5B-Instruct"
    logger.info(f"Model: {model_name}")
    logger.info("This may take a few minutes on first run (~1GB download)...")

    if torch.cuda.is_available() and CUDA_DEVICE is not None:
        device = f"cuda:{CUDA_DEVICE}"
        logger.info(f"✓ CUDA available - Using GPU index: {CUDA_DEVICE}")
        logger.info(f"GPU Name: {torch.cuda.get_device_name(CUDA_DEVICE)}")
        torch.cuda.set_device(CUDA_DEVICE)
    else:
        device = "cpu"
        if CUDA_DEVICE is not None:
            logger.warning("⚠ CUDA not available, falling back to CPU")
        else:
            logger.info("Using CPU (CUDA_DEVICE set to None)")

    logger.info("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    logger.info("✓ Tokenizer loaded")

    logger.info("Loading model into memory...")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if device != "cpu" else torch.float32,
        low_cpu_mem_usage=True,
        trust_remote_code=True,
    )
    model = model.to(device)
    model.eval()

    logger.info("=" * 60)
    logger.info("✓ MODEL LOADED SUCCESSFULLY AND READY FOR INFERENCE!")
    logger.info(f"✓ Device: {device}")
    logger.info("✓ Model parameters: ~1.5 billion")
    logger.info("=" * 60)


def generate_response(
    user_message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    max_tokens: int = 512,
    temperature: float = 0.7,
) -> str:
    assert isinstance(user_message, str) and user_message.strip()
    assert isinstance(max_tokens, int) and 1 <= max_tokens <= 2048
    assert isinstance(temperature, (float, int)) and 0.0 <= float(temperature) <= 2.0
    assert model is not None
    assert tokenizer is not None

    with model_lock:
        messages: List[Dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]

        if conversation_history:
            assert isinstance(conversation_history, list)
            for m in conversation_history:
                assert isinstance(m, dict)
                assert isinstance(m.get("role"), str)
                assert isinstance(m.get("content"), str)
            messages.extend(conversation_history)

        messages.append({"role": "user", "content": user_message.strip()})

        input_text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = tokenizer(input_text, return_tensors="pt", padding=True).to(model.device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=float(temperature),
                do_sample=True,
                top_p=0.9,
                top_k=50,
                repetition_penalty=1.1,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id,
            )

        generated_text = tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[1] :],
            skip_special_tokens=True,
        )
        return generated_text.strip()


@app.route("/health", methods=["GET"])
def health_check():
    device_info = "Not loaded"
    if model is not None:
        device_info = str(model.device)

    return jsonify(
        {
            "status": "healthy",
            "model_loaded": model is not None,
            "model": "Qwen 2.5 1.5B Instruct",
            "device": device_info,
            "cuda_device": CUDA_DEVICE,
        }
    )


@app.route("/chat", methods=["POST"])
def chat():
    """
    Main chat endpoint

    Expected JSON body:
    {
        "message": "User's message",
        "conversation_history": [  # Optional
            {"role": "user", "content": "Previous message"},
            {"role": "assistant", "content": "Previous response"}
        ],
        "max_tokens": 300,  # Optional, default 512
        "temperature": 0.7  # Optional, default 0.7
    }
    """
    if model is None or tokenizer is None:
        return jsonify({"error": "Model not loaded yet. Please wait for startup to complete."}), 503

    try:
        data = request.json
        if not data or "message" not in data:
            return jsonify({"error": "Missing 'message' in request body"}), 400

        user_message = data["message"]
        conversation_history = data.get("conversation_history", None)
        max_tokens = data.get("max_tokens", 512)
        temperature = data.get("temperature", 0.7)

        if not isinstance(user_message, str) or len(user_message.strip()) == 0:
            return jsonify({"error": "Message must be a non-empty string"}), 400

        if not isinstance(max_tokens, int) or max_tokens < 1 or max_tokens > 2048:
            return jsonify({"error": "max_tokens must be between 1 and 2048"}), 400

        if not isinstance(temperature, (float, int)) or float(temperature) < 0.0 or float(temperature) > 2.0:
            return jsonify({"error": "temperature must be between 0.0 and 2.0"}), 400

        logger.info(f"Generating response for message: {user_message[:50]}...")
        response = generate_response(
            user_message=user_message,
            conversation_history=conversation_history,
            max_tokens=max_tokens,
            temperature=float(temperature),
        )

        return jsonify({"response": response, "status": "success"})

    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/reset", methods=["POST"])
def reset():
    return jsonify({"status": "success", "message": "Conversation reset. Start a new conversation."})


logger.info("Starting Mental Health Chatbot API...")
logger.info(f"Configuration: CUDA_DEVICE = {CUDA_DEVICE}")


try:
    load_model()
except Exception as e:
    logger.critical(f"Model failed to load: {e}")
    # model stays None, endpoints return 503 where appropriate

# Start Telegram polling loop if configured
if TELEGRAM_MODE == "polling":
    if TELEGRAM_BOT_TOKEN and isinstance(TELEGRAM_BOT_TOKEN, str) and len(TELEGRAM_BOT_TOKEN) > 10:
        t = Thread(target=telegram_polling_loop, daemon=True)
        t.start()
        logger.info("Telegram mode: polling (no public domain required)")
        logger.info("If you previously set a webhook, clear it with: setWebhook url=''")
    else:
        logger.warning("TELEGRAM_MODE=polling but TELEGRAM_BOT_TOKEN is missing/invalid; polling will not start.")
else:
    logger.info("Telegram mode: webhook (requires public HTTPS + setWebhook)")


if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
