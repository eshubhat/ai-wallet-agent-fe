# AutoFi - Frontend

This is the frontend component of AutoFi, a React + Vite Single Page Application (SPA). It provides the user interface for interacting with the AI agent, viewing wallet balances, managing scheduled tasks, and signing transactions locally.

## ✨ Features

- **Chat Interface:** Chat with your AI agent to execute Solana transactions via natural language.
- **Self-Custody Design:** The UI integrates `@solana/wallet-adapter-react` to let you sign transactions locally. Your private keys never touch the backend.
- **Dashboard & Panels:** Real-time views of your wallet's active Stake Accounts, recent transactions, and Pending Scheduled Tasks.
- **Live SSE Notifications:** Immediate toast banners when scheduled tasks (time, price, or idle-based) are triggered by the backend, prompting you to "Execute Now".
- **Responsive Design:** Clean, modern UI built with custom CSS and Lucide React icons.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.x or newer)
- [pnpm](https://pnpm.io/)
- A Solana Wallet Extension (e.g., [Phantom](https://phantom.app/)), set to **Devnet**.

### Installation

1. Install all dependencies:
```bash
pnpm install
```

2. Environment Configuration:
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure your `.env` has the following variables set:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_BACKEND_URL=http://localhost:3000
```
*(Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/)).*

### Running the App

Start the Vite development server:
```bash
pnpm run dev
```

Open your browser to [http://localhost:5173](http://localhost:5173) to view the application.

## 📁 Key Directories

- `src/components/chat`: Contains the ChatInterface, MessageBubbles, and ChatInput.
- `src/components/scheduler`: Contains the live NotificationBanner and ScheduledTasksPanel.
- `src/hooks`: Custom React hooks, notably `useAgent.ts` which handles the NLP orchestration and `useSSE.ts` for live backend events.
- `src/services`: API wrappers to communicate with the backend (`ai.service.ts`, `scheduler.service.ts`) and Solana RPCs (`solana.service.ts`, `jupiter.service.ts`).
