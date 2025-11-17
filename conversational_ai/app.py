"""
Mental Health Chatbot Flask API - Qwen 2.5 1.5B
Runs completely locally with no authentication required
Model loads at startup and stays in memory
"""

from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from threading import Lock
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

model = None
tokenizer = None
model_lock = Lock()

# Set which GPU to use (0, 1, 2, etc.) or None for CPU
CUDA_DEVICE = 1

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


def load_model():
    """Load Qwen 2.5 1.5B Instruct model into memory at startup"""
    global model, tokenizer

    logger.info("=" * 60)
    logger.info("Loading Qwen 2.5 1.5B Instruct model locally...")
    logger.info("=" * 60)

    model_name = "Qwen/Qwen2.5-1.5B-Instruct"

    logger.info(f"Model: {model_name}")
    logger.info("This may take a few minutes on first run (~3GB download)...")

    if torch.cuda.is_available() and CUDA_DEVICE is not None:
        device = f"cuda:{CUDA_DEVICE}"
        logger.info(f"✓ CUDA available - Using GPU: {CUDA_DEVICE}")
        logger.info(f"GPU Name: {torch.cuda.get_device_name(CUDA_DEVICE)}")

        os.environ['CUDA_VISIBLE_DEVICES'] = str(CUDA_DEVICE)
        torch.cuda.set_device(CUDA_DEVICE)
    else:
        device = "cpu"
        if CUDA_DEVICE is not None:
            logger.warning(f"⚠ CUDA not available, falling back to CPU")
        else:
            logger.info(f"Using CPU (CUDA_DEVICE set to None)")

    logger.info("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True
    )

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    logger.info("✓ Tokenizer loaded")

    logger.info("Loading model into memory...")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if device != "cpu" else torch.float32,
        device_map={"": CUDA_DEVICE} if device != "cpu" else None,
        low_cpu_mem_usage=True,
        trust_remote_code=True
    )

    if device == "cpu":
        model = model.to(device)

    # evaluation mode
    model.eval()

    logger.info("=" * 60)
    logger.info("✓ MODEL LOADED SUCCESSFULLY AND READY FOR INFERENCE!")
    logger.info(f"✓ Device: {device}")
    logger.info(f"✓ Model parameters: ~1.5 billion")
    logger.info(f"✓ Model is now in memory and ready to serve requests")
    logger.info("=" * 60)


def generate_response(user_message, conversation_history=None, max_tokens=512, temperature=0.7):
    """
    Generate a response from the model

    Args:
        user_message: The user's current message
        conversation_history: List of previous messages [{"role": "user/assistant", "content": "..."}]
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature (0.0-1.0)

    Returns:
        Generated response text
    """
    with model_lock:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if conversation_history:
            messages.extend(conversation_history)

        messages.append({"role": "user", "content": user_message})

        input_text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        inputs = tokenizer(input_text, return_tensors="pt", padding=True).to(model.device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                top_p=0.9,
                top_k=50,
                repetition_penalty=1.1,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id
            )

        # Decode only the new tokens
        generated_text = tokenizer.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )

        return generated_text.strip()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    device_info = "Not loaded"
    if model is not None:
        device_info = str(model.device)

    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model": "Qwen 2.5 1.5B Instruct",
        "device": device_info,
        "cuda_device": CUDA_DEVICE
    })


@app.route('/chat', methods=['POST'])
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
        "max_tokens": 512,  # Optional, default 512
        "temperature": 0.7  # Optional, default 0.7
    }
    """
    # check if model is loaded
    if model is None:
        return jsonify({
            "error": "Model not loaded yet. Please wait for startup to complete."
        }), 503

    try:
        data = request.json

        if not data or 'message' not in data:
            return jsonify({
                "error": "Missing 'message' in request body"
            }), 400

        user_message = data['message']
        conversation_history = data.get('conversation_history', None)
        max_tokens = data.get('max_tokens', 512)
        temperature = data.get('temperature', 0.7)

        if not isinstance(user_message, str) or len(user_message.strip()) == 0:
            return jsonify({
                "error": "Message must be a non-empty string"
            }), 400

        if max_tokens < 1 or max_tokens > 2048:
            return jsonify({
                "error": "max_tokens must be between 1 and 2048"
            }), 400

        if temperature < 0.0 or temperature > 2.0:
            return jsonify({
                "error": "temperature must be between 0.0 and 2.0"
            }), 400

        logger.info(f"Generating response for message: {user_message[:50]}...")
        response = generate_response(
            user_message,
            conversation_history,
            max_tokens,
            temperature
        )

        return jsonify({
            "response": response,
            "status": "success"
        })

    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


@app.route('/reset', methods=['POST'])
def reset():
    """Reset conversation (client-side management, this just acknowledges)"""
    return jsonify({
        "status": "success",
        "message": "Conversation reset. Start a new conversation."
    })


logger.info("Starting Mental Health Chatbot API...")
logger.info(f"Configuration: CUDA_DEVICE = {CUDA_DEVICE}")
load_model()

if __name__ == '__main__':
    logger.info("\nStarting Flask server...")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,  # Set to False in production
        threaded=True
    )