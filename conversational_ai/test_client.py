"""
Test client for the Mental Health Chatbot API
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_single_message():
    """Test single message"""
    print("Testing single message...")

    data = {
        "message": "I've been feeling really anxious lately and I don't know what to do.",
        "max_tokens": 300,
        "temperature": 0.7
    }

    response = requests.post(f"{BASE_URL}/chat", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()


def test_conversation():
    """Test multi-turn conversation"""
    print("Testing conversation with history...")

    # Simulate a conversation
    conversation_history = [
        {"role": "user", "content": "I've been feeling really stressed at work."},
        {"role": "assistant", "content": "I hear that work has been really stressful for you. That can be really challenging. Can you tell me more about what's been happening at work that's causing you stress?"}
    ]

    data = {
        "message": "My boss keeps giving me impossible deadlines and I feel like I'm drowning.",
        "conversation_history": conversation_history,
        "max_tokens": 300,
        "temperature": 0.7
    }

    response = requests.post(f"{BASE_URL}/chat", json=data)
    print(f"Status: {response.status_code}")
    result = response.json()


def interactive_chat():
    """Interactive chat session"""
    print("=== Interactive Chat Mode ===")
    print("Type 'quit' to exit\n")

    conversation_history = []

    while True:
        user_input = input("You: ").strip()

        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break

        if not user_input:
            continue

        data = {
            "message": user_input,
            "conversation_history": conversation_history,
            "max_tokens": 300,
            "temperature": 0.7
        }

        try:
            response = requests.post(f"{BASE_URL}/chat", json=data)

            if response.status_code == 200:
                result = response.json()
                bot_response = result['response']
                print(f"\nBot: {bot_response}\n")

                # Update conversation history
                conversation_history.append({"role": "user", "content": user_input})
                conversation_history.append({"role": "assistant", "content": bot_response})

            else:
                print(f"Error: {response.status_code}")
                print(response.json())

        except requests.exceptions.ConnectionError:
            print("Error: Could not connect to the server. Make sure it's running.")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        interactive_chat()
    else:
        # Run automated tests
        test_health()
        test_single_message()
        test_conversation()

        print("\n=== All tests completed ===")
        print("To run interactive mode: python test_client.py interactive")