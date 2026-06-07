# ✈️ TripCraft AI

**Your journey, perfectly crafted with intelligence.**

A full-stack AI travel planner with 6 specialized Agno agents powered by Google Gemini.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLite |
| AI | Agno (agent coordination), Gemini 2.0 Flash (LLM), DuckDuckGo (search) |

## AI Agents

1. 🏛️ **Destination Explorer** – attractions, landmarks, visa & safety info
2. 🏨 **Hotel Search Agent** – accommodations by budget & style
3. 🍽️ **Dining Agent** – restaurants & culinary experiences
4. 💰 **Budget Agent** – cost breakdown & money-saving tips
5. ✈️ **Flight Search Agent** – flight options & price estimates
6. 🗓️ **Itinerary Specialist** – day-by-day schedule with morning/afternoon/evening

## Quick Start

### 1. Get a Gemini API key (free)

Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and create a key.

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000), click **Get Started**, fill in the 7-step wizard, enter your Gemini API key on the last step, and click **Generate My Trip Plan**.

The 6 agents will run (takes ~60–90 seconds) and you'll be redirected to your complete travel plan.

## Project Structure

```
TripPlanner/
├── backend/
│   ├── main.py          # FastAPI app & endpoints
│   ├── agents.py        # 6 Agno agents
│   ├── models.py        # Pydantic request/response models
│   ├── database.py      # SQLite storage
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── page.tsx          # Landing page
    │   ├── plan/page.tsx     # 7-step wizard
    │   └── trips/
    │       ├── page.tsx      # Trips dashboard
    │       └── [id]/page.tsx # Trip detail
    ├── components/Navbar.tsx
    └── lib/api.ts
```
