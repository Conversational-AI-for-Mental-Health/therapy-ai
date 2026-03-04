# 🧠 Mental Health Chatbot: Local Development Guide

## Overview

This is a full-stack **monorepo** managed with **Yarn Workspaces**.

| Service     | Technology                   | Local Port | Role                               |
| :---------- | :--------------------------- | :--------- | :--------------------------------- |
| `backend/`  | Node.js, Express, TypeScript | **3000**   | API Server & Socket.IO             |
| `frontend/` | React, TypeScript, Webpack   | **8080**   | UI (served by Webpack Dev Server)  |
| `mobile/`   | Expo, React Native, TypeScript | Expo DevTools | Mobile client                      |
| `conversational_ai/` | Python, Flask, Transformers | **5000** | Local LLM Model Server (Qwen 2.5) |

---

## Initial Setup

### Prerequisites

You need the following installed on your system:

- **Git**
- **Node.js (LTS)**  
  - Corepack (included by default with Node 16.9+, 18+, 20+)
- **Docker Desktop** (for MongoDB container)
- **Python 3.10+**
- **Yarn 4 (via Corepack — do NOT install Yarn v1 globally)**

Enable Corepack (use these two commands if yarn 4 is not installed):

```bash
corepack enable
corepack prepare yarn@4.10.3 --activate
```
- **check version using**
   - yarn -v
  

### Setup Steps

1.  **Clone the Repo:**

    ```bash
    git clone https://github.com/Conversational-AI-for-Mental-Health/therapy-ai
    cd therapy-ai
    ```

2.  **Install Dependencies:** (json file has setup for concurrent installation so yarn install should work after  yarn installation in a device)
   This installs dependencies for:

- **backend**
- **frontend**
- **root workspace**

No separate installation inside folders is required.
    ```bash
    yarn install
    ```

---

## 💻 Running Locally

This uses the Webpack Dev Server to proxy API calls from **`8080`** to the Node backend at **`3000`**.

### Start Services

Run this command from the project root:

```bash
yarn dev
```

For mobile:

```bash
yarn dev:mobile
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` (see `mobile/.env.example`) when testing on a simulator or real device.

You can also run this command in the frontend or backend to test them separately
No seperate yarn installation is required

## 🔑 Environment Variables
backend/.env

```bash
MONGO_URI=<your mongodb atlas connection string or local docker url>
PORT=3000
CORS_ORIGIN=http://localhost:8080
```

## 🐳 Docker 
Run MongoDB with Docker:
```bash
docker-compose up -d mongodb mongo-express
```
View Database
```bash
http://localhost:8081
username: admin
password: admin123
```

Run full app stack (backend + frontend + mobile + mongodb):
```bash
docker compose up --build -d
```

Mobile Expo service is exposed on ports `8082` (mapped to container `8081`), `19000`, `19001`, `19002`, and `19006`.
Set `EXPO_PUBLIC_API_URL` in compose if you need a different backend URL for your device/simulator setup.
## 📘 Documentation Links
1. Project Charter https://www.overleaf.com/project/68d58effa5d65c5eaa9b1018
2. SRS https://www.overleaf.com/project/68eec9d6dc78d607a23ee0a8
3. ADS  https://www.overleaf.com/project/690d7a0d18e5aa3efccd83ff

## Repo Structure
```bash
therapy-ai/
│
├── .github/                 # GitHub workflows, CI/CD
├── backend/                 # Node.js backend (API + Socket.IO + MongoDB)
├── conversational_ai/       # Python LLM service (Flask + Qwen2.5)
├── docs/                    # SRS, ADS, diagrams
├── frontend/                # TypeScript frontend
├── mobile/                  # Expo React Native app
├── packages/shared/         # Shared API contracts and types
├── models/                  # Shared models (placeholder)
├── scripts/                 # Utility scripts (placeholder)
│
├── .dockerignore
├── .eslintrc.js
├── .gitignore
├── .prettierignore
├── .prettierrc.js
├── README.md
├── docker-compose.yml       # Starts MongoDB & Dev services
├── jest.config.js
├── package.json             # Monorepo config (Yarn workspaces)
└── yarn.lock

```


