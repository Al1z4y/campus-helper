# Campus Helper

> **Forman Code Fest 2025** - Campus services platform for FCCU

## Features

- **Service Requests** - Submit maintenance, IT support, academic, and lost & found requests with optional photo attachments
- **Admin Dashboard** - Manage all requests, update statuses, view statistics
- **Campus Map** - Interactive map with key campus locations and Google Maps directions
- **AI Assistant** - Google Gemini-powered chatbot for campus-related questions
- **Announcements** - Campus news, events, and alerts feed

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 18 + Vite | Flask 3.0 |
| Tailwind CSS | SQLAlchemy + SQLite |
| React Router | Google Gemini AI |
| Leaflet Maps | Flask-CORS |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Add your GEMINI_API_KEY
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Access

- Frontend: http://localhost:5173
- Backend: http://127.0.0.1:5001
- **Admin login**: admin@fccu.edu / admin123

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests` | Create service request |
| GET | `/api/requests` | List all requests |
| PUT | `/api/requests/:id` | Update request status |
| DELETE | `/api/requests/:id` | Delete request |
| POST | `/api/chat` | AI assistant |
| GET | `/api/health` | Health check |

## Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API Key
3. Add to `backend/.env`

---

**Forman Code Fest 2025** - FCCU
