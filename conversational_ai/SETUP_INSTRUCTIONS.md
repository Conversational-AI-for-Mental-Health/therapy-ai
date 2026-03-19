# Mental Health Chatbot - Qwen 2.5 1.5B Setup Guide

## 🎯 Quick Overview

This setup runs **Qwen 2.5 1.5B Instruct** completely locally.

**Model Stats:**
- Size: ~3GB download
- RAM needed: 6-8GB
- Speed: Fast on CPU, very fast on GPU
- No authentication required!

---

## 📋 Prerequisites

- **Python 3.10+**
- **Mamba or Conda** installed ([Get Miniforge](https://github.com/conda-forge/miniforge))
- **At least 8GB RAM** (16GB recommended)
- **10GB free disk space**
- **GPU optional** (CUDA-compatible) - works fine on CPU!

---

## 🚀 Installation Steps

### Step 1: Clone or Download Files

Make sure you have these files in your project folder:
```
mental-health-bot/
├── app.py
├── requirements.txt
├── environment.yml
├── test_client.py
└── SETUP_INSTRUCTIONS.md (this file)
```

### Step 2: Create Mamba Environment

Open terminal in your project folder:

```bash
# Create the environment
mamba env create -f environment.yml

# Activate it
mamba activate mental-health-bot
```

**Alternative (manual install):**
```bash
mamba create -n mental-health-bot python=3.10
mamba activate mental-health-bot
pip install -r requirements.txt
```

### Step 3: Install PyTorch

#### For GPU (NVIDIA CUDA):
```bash
mamba install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia
```
Note: Change the cuda version according to your GPU!

#### For CPU only:
```bash
mamba install pytorch torchvision torchaudio cpuonly -c pytorch
```

**Check your installation:**
```bash
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"
```

### Step 4: Run the Server

```bash
python app.py
```

**What happens:**
1. First run: Downloads Qwen 2.5 1.5B model (~3GB, takes 5-10 minutes)
2. Loads model into memory
3. Starts Flask server on `http://localhost:5000`
4. Ready to accept requests!

**Expected output:**
```
INFO:__main__:Loading Qwen 2.5 1.5B Instruct model locally...
INFO:__main__:Downloading and loading model: Qwen/Qwen2.5-1.5B-Instruct
INFO:__main__:This may take a few minutes on first run (~3GB download)...
INFO:__main__:Using device: cpu
INFO:__main__:✓ Model loaded successfully and ready for inference!
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

---

## 🧪 Testing the API

### Option 1: Quick Test Script

In a **new terminal** (keep server running):

```bash
# Activate environment
mamba activate mental-health-bot

# Run tests
python test_client.py
```

### Option 2: Interactive Chat

```bash
python test_client.py interactive
```

Type your messages and chat with the bot! Type `quit` to exit.

### Option 3: Using curl

```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have been feeling really anxious lately",
    "max_tokens": 300,
    "temperature": 0.7
  }'
```

### Option 4: Using Python requests

```python
import requests

response = requests.post('http://localhost:5000/chat', json={
    "message": "I've been feeling stressed at work",
    "conversation_history": [],
    "max_tokens": 300,
    "temperature": 0.7
})

print(response.json()['response'])
```

---

## 📡 API Documentation

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model": "Qwen 2.5 1.5B Instruct"
}
```

### Chat Endpoint
```http
POST /chat
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Your message here",
  "conversation_history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ],
  "max_tokens": 512,
  "temperature": 0.7
}
```

**Parameters:**
- `message` (required): User's message as string
- `conversation_history` (optional): Array of previous messages for context
- `max_tokens` (optional): Max response length (1-2048, default: 512)
- `temperature` (optional): Response creativity (0.0-2.0, default: 0.7)
  - Lower (0.3-1.5): More focused and conservative
  - Higher (0.8-1.0): More creative and varied

**Response:**
```json
{
  "response": "Generated response text",
  "status": "success"
}
```

### Reset Conversation
```http
POST /reset
```

---

## 🔧 Troubleshooting

### Problem: Model download is slow
**Solution:**
- This is normal on first run (~3GB download)
- Subsequent runs are instant (model is cached)
- Check internet connection
- Try again if interrupted - it will resume

### Problem: Out of memory
**Solutions:**
1. Close other applications
2. Reduce `max_tokens` in requests (try 256 or 128)
3. Restart your computer to free RAM
4. The model needs ~4-6GB RAM loaded

### Problem: "CUDA out of memory"
**Solutions:**
1. Add this before loading model in app.py:
```python
torch.cuda.empty_cache()
```
2. Use CPU instead (remove GPU installation)

### Problem: Slow responses on CPU
**This is normal!**
- First response: 10-30 seconds
- Later responses: 5-15 seconds
- Consider using GPU for faster inference

### Problem: Import errors
**Solutions:**
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Or reinstall transformers specifically
pip install --upgrade transformers
```

### Problem: Model not found
**Solutions:**
- Check internet connection
- Verify you can access: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Delete cache and retry: `rm -rf ~/.cache/huggingface/`

---

## ⚡ Performance Tips

### For Faster Inference:

1. **Use GPU** if available (10-20x faster)

2. **Reduce max_tokens** for shorter responses:
```python
"max_tokens": 256  # Instead of 512
```

3. **Lower temperature** for more consistent responses:
```python
"temperature": 1.5  # Instead of 0.7
```

4. **Quantization** (Advanced - saves memory, slight quality loss):
```python
# In app.py, modify model loading:
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(load_in_8bit=True)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=quantization_config,
    device_map="auto"
)
```

---

## 🚀 Production Deployment

For production use, run with Gunicorn:

```bash
gunicorn -w 1 -b 0.0.0.0:5000 --timeout 300 app:app
```

**Important Notes:**
- Use `-w 1` (1 worker) - model is in memory
- Add authentication and rate limiting
- Use HTTPS in production
- Monitor for harmful content
- Log conversations for safety review

---

## 💻 Hardware Recommendations

### Minimum Setup (Works but slow):
- CPU: 4 cores, 2.5GHz+
- RAM: 8GB
- Storage: 10GB free
- Speed: ~15-30 seconds per response

### Recommended Setup:
- CPU: 6+ cores, 3GHz+ OR
- GPU: GTX 1660 / RTX 3050 or better
- RAM: 16GB
- Storage: 20GB free
- Speed: ~2-5 seconds per response

### Optimal Setup:
- GPU: RTX 3060 / 4060 or better
- RAM: 16GB+
- Storage: 50GB+ free
- Speed: ~1-2 seconds per response

---

## 🔒 Safety & Ethics

**⚠️ CRITICAL REMINDERS:**

1. **This is NOT therapy** - Always include disclaimers
2. **Crisis detection** - Monitor for self-harm mentions
3. **Professional referral** - Encourage seeking real help
4. **Data privacy** - Handle conversations securely
5. **Regular auditing** - Review outputs for safety
6. **Age verification** - Ensure appropriate for users

**Include these resources:**
- National Suicide Prevention: 988
- Crisis Text Line: Text HOME to 741741
- SAMHSA Helpline: 1-800-662-4357

---

## 📚 Example Integration

### Full conversation example:

```python
import requests

BASE_URL = "http://localhost:5000"

# Start conversation
conversation = []

def chat(message):
    response = requests.post(f"{BASE_URL}/chat", json={
        "message": message,
        "conversation_history": conversation,
        "max_tokens": 300,
        "temperature": 0.7
    })

    bot_response = response.json()['response']

    # Update history
    conversation.append({"role": "user", "content": message})
    conversation.append({"role": "assistant", "content": bot_response})

    return bot_response

# Use it
print(chat("I've been feeling really anxious lately"))
print(chat("It's mostly about work deadlines"))
print(chat("What can I do to manage this better?"))
```
## 📄 License

- **Code:** MIT License
- **Qwen 2.5 Model:** Apache 2.0 License (commercial use OK)
- **Disclaimer:** Not for medical advice. Educational/research purposes only.

---