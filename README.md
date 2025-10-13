# 🧠 Mental Health Chatbot: Local Development Guide

The basic project folder structure has been created.
All the folder are currently empty.
Each folder has a .gitkeep folder which i kept temporarily to setup this
Each team can edit their folder and remove .gitkeep file when they can

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
    git clone <your-project-repository-url>
    cd therapy-ai
    ```

2.  **Install Dependencies:**
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
