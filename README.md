# AI Companies Intelligence — Frontend

Next.js frontend for the AI Companies Intelligence platform. Supports Bulgarian (default) and English with a language toggle in the header.

> The backend API is available in a separate repository:
> https://github.com/EmilyStoyanova/ai-first-companies-intelligence-api

---

## Live Demo

**Frontend**

https://ai-first-companies-intelligence-fe.onrender.com

**Backend API**

https://ai-first-companies-intelligence-api.onrender.com

**API Documentation (Swagger)**

https://ai-first-companies-intelligence-api.onrender.com/docs

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Plain CSS (CSS variables, no UI library) |
| i18n | Custom context — Bulgarian (default) / English |
| State | React Hooks (`useState`, `useEffect`, `useRef`) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the backend

The frontend communicates with the backend using the `NEXT_PUBLIC_API_URL` environment variable.

Start the backend first:

```bash
# In the backend repository
npm run dev
```

The backend will run at:

```
http://localhost:3001
```

### 4. Run the frontend

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:3000
```

---

## Features

- JWT authentication (register, email confirmation and login)
- Drag-and-drop CSV/XLSX upload
- Batch processing with live progress updates
- Paginated company profiles
- Company team members with contact information
- CSV/XLSX export
- Batch deletion
- Bulgarian / English interface
- Responsive dashboard
- Automatic polling while enrichment is running

---

## Project Structure

```
app/
  layout.tsx          # Root layout with LangProvider
  globals.css         # Global styles and design system
  page.tsx            # Login / Register page

  dashboard/
    page.tsx          # Main dashboard

components/
  AuthForm.tsx
  Header.tsx
  UploadCard.tsx
  BatchTable.tsx
  BatchRow.tsx
  CompaniesModal.tsx
  Dashboard.tsx

contexts/
  LangContext.tsx

lib/
  api.ts              # Typed API client using NEXT_PUBLIC_API_URL
  types.ts            # Shared TypeScript types
```

---

## Progress Animation

The progress bar smoothly animates from **0%** to the actual completion percentage instead of jumping directly.

Each `BatchRow` keeps its own animation timer using `useRef`. The displayed percentage increases gradually until it reaches the latest value received from the backend polling.

---

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run start     # Start production server
```

---

## Production

Frontend:

https://ai-first-companies-intelligence-fe.onrender.com

Backend:

https://ai-first-companies-intelligence-api.onrender.com

Swagger:

https://ai-first-companies-intelligence-api.onrender.com/docs