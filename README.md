# 🌐 Zono Web (Frontend)

Modern **React + Vite** frontend for **Zono** — smart workforce & shift management  
(shifts, employees, attendance, notifications).  
Connects to the Zono API.

---

## 🚀 Tech Stack

- **React** + **Vite**
- **React Router**
- **(Optional) Tailwind CSS**
- Fetch/Axios for API calls
- ESLint + Prettier

---

## 🧩 Project Structure (example)

zono-web/
├─ src/
│ ├─ pages/ # Login, Shifts, MyShifts, Reports, …
│ ├─ services/ # api.ts/api.js, interceptors, auth helpers
│ ├─ utils/ # formatters, constants
│ ├─ App.jsx
│ └─ main.jsx
├─ public/
├─ .env.example # frontend env (public)
├─ index.html
├─ package.json
└─ README.md

yaml
Copy code

---

## ⚙️ Local Development

### Prerequisites

- Node.js **v20+**
- A running backend API (local or deployed)

### Quick Start

```bash
# 1️⃣ Create your local env file
cp .env.example .env.local

# 2️⃣ Install dependencies
npm ci   # or: npm install

# 3️⃣ Run the dev server
npm run dev
Then open 👉 http://localhost:5173

🔐 Environment Variables (Vite)
All variables used in the browser must start with VITE_.

.env.example
env
Copy code
VITE_API_BASE_URL="http://localhost:4000"
VITE_APP_NAME="Zono"
Create your own local copy:

bash
Copy code
cp .env.example .env.local
In code:

ts
Copy code
// src/services/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL;
❗ Never commit real .env* for the frontend.
Only .env.example should stay in Git.

🧠 Minimal API Helper (drop-in)
ts
Copy code
// src/services/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    credentials: "include", // if you use cookies/sessions; remove if not needed
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (p: string) => request(p),
  post: (p: string, body?: unknown) =>
    request(p, { method: "POST", body: JSON.stringify(body) }),
  put: (p: string, body?: unknown) =>
    request(p, { method: "PUT", body: JSON.stringify(body) }),
  del: (p: string) => request(p, { method: "DELETE" }),
};
Usage:

ts
Copy code
import { api } from "@/services/api";
const data = await api.get("/api/shifts");
📜 NPM Scripts
json
Copy code
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview -p 5173",
  "lint": "eslint ."
}
Build locally:

bash
Copy code
npm run build       # outputs to /dist
npm run preview     # serve the build locally
☁️ Deployment (Vercel)
Create a new Vercel project from this repo.

Framework Preset: Vite

Build Command: npm run build

Output Directory: dist

Environment Variables (Vercel → Project → Settings → Env Vars):

VITE_API_BASE_URL = https://<your-render-api-domain>

VITE_APP_NAME = Zono

Deploy.

After the backend deploys to Render, update VITE_API_BASE_URL on Vercel and redeploy.

✅ .gitignore (important)
Make sure your repo ignores local env and build artifacts:

bash
Copy code
node_modules
.env
.env.*
!.env.example
dist
build
.DS_Store
🧪 Smoke Test Checklist
 npm run dev shows UI on http://localhost:5173

 API calls use VITE_API_BASE_URL

 Switching VITE_API_BASE_URL to production works after redeploy

 No .env or dist/ committed

🛟 Troubleshooting
Blank page after deploy
Ensure VITE_API_BASE_URL is set in Vercel → Environment Variables.

Confirm your routes are relative to API_BASE.

CORS errors
Add your Vercel domain to backend CORS (APP_ORIGIN / CORS_ORIGINS).

404 on refresh (client routes)
Vercel handles SPA routing automatically for Vite preset.
If self-hosting, configure fallback to index.html.
```
