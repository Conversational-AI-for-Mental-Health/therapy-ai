# 🧠 Mental Health Chatbot: Local Development Guide


## Overview

This is a full-stack **monorepo** managed with **Yarn Workspaces**.

| Service     | Technology                   | Local Port | Role                               |
| :---------- | :--------------------------- | :--------- | :--------------------------------- |
| `backend/`  | Node.js, Express, TypeScript | **3000**   | API Server & Socket.IO.            |
| `frontend/` | React, TypeScript, Webpack   | **8080**   | UI (served by Webpack Dev Server). |

---

## 🚀 Initial Setup

### Prerequisites

You need **Git**, **Node.js** (LTS), **Docker Destop** and **Yarn Classic (v1)** installed.

### Setup Steps

1.  **Clone the Repo:**

    ```bash
    git clone https://github.com/Conversational-AI-for-Mental-Health/therapy-ai
    cd therapy-ai
    ```

2.  **Install Dependencies:** (json file has setup for concurrent installation so yarn install should work after golabl yarn installation in a device)
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

You can also run this command in the frontend or backend to test them separately
No seperate yarn installation is required
