#  Therapy AI: Mobile Client (Expo)

## Overview
The mobile client is a high-performance React Native application built with **Expo **. It serves as the primary mobile interface for the Therapy AI ecosystem, providing a smooth, chat-centric user experience for mental health support integrated directly into the `therapy-ai` monorepo.

| Feature | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | Expo / React Native | Cross-platform UI & Native Modules |
| **Navigation** | React Navigation 7 | Type-safe stack & tab navigation |
| **State/Auth** | React Context API | Global Auth state & Session management |
| **Animations** | Reanimated 4 | 60fps UI transitions & interactions |
| **Language** | TypeScript | Type safety across the mobile stack |

---

## 🛠 Prerequisites

Ensure the following are installed before starting development:

* **Node.js (LTS)** & **Yarn 4** (managed via Corepack)
* **Expo Go** app (for quick physical device testing)
* **Xcode 15+** (for iOS Simulator — macOS only)
* **Android Studio** (for Android Emulator)
---

## 🚀 Initial Setup

### 1. Install Dependencies
Run this from the **monorepo root** to ensure all workspace links, including `@therapy-ai/shared`, are established:

```bash
yarn install
```

### 2. Configure Environment
Create a `.env` file in the `mobile/` directory:

```bash
cp mobile/.env.example mobile/.env
```
---

## 💻 Running Locally

### Start Expo Dev Server
```bash
yarn start
```
press i to launch Xcode Simulator or press a to launch Andriod Studio emulator
### Launch on Platforms
| Platform | Command | Notes |
| :--- | :--- | :--- |
| **iOS** | `yarn ios` | Launches Xcode Simulator automatically |
| **Android** | `yarn android` | Requires an emulator to be running first |


---

## 🏗 Project Structure
The mobile directory is organized into a modular, feature-based architecture:
```bash
mobile/
├── src/
│   ├── components/       # ChatPanel, JournalPanel, Sidebar
│   ├── context/          # AuthContext 
│   ├── navigation/       # AppNavigator 
│   ├── screens/          # Login, Signup, Dashboard
│   ├── services/         # SecureStore, ApiClient, AuthApi
│   └── theme/            # Design tokens & global constants
├── assets/               # Splash screens & icons
├── App.tsx               # Application Entry Point
└── app.json              # Expo Configuration & Plugins
```