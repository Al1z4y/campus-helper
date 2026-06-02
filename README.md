# Campus Helper

A full-stack web platform for FCCU students and admins to manage campus service requests, browse announcements, navigate the campus map, and get instant answers from an AI campus assistant.

---

## Screenshots

### Student View
![User Panel](user%20panel.png)

### Admin Dashboard
![Admin Panel](admin%20panel.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Flask, SQLAlchemy, SQLite |
| AI Chat | Google Gemini (keyword-based fallback included) |
| Auth | Role-based via localStorage (student / admin) |

---

## Features

### Student
- **Announcements Feed** — Browse campus news, events, and alerts with filter buttons
- **Service Requests** — 2-step modal to submit a request (category → description + optional photo)
- **Campus Map** — Interactive map for navigating campus buildings
- **AI Chat Assistant** — Ask about campus timings, rules, and building locations
- **Floating Chat Widget** — Quick access chat available on every page

### Admin
- **Dashboard** — Stats overview (total, pending, resolved requests)
- **Request Management** — View all submissions in a table; update status (Pending / In Progress / Resolved / Completed) or delete
- **Image Viewer** — Preview uploaded photos directly in the dashboard
- Admin is automatically redirected to the dashboard on login

---

## Project Structure

```
campus-helperr/
├── backend/
│   ├── app.py              # Flask app, API routes, Gemini config
│   ├── requirements.txt
│   ├── .env                # GEMINI_API_KEY goes here
│   └── uploads/            # Uploaded images (auto-created)
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, ServiceRequestModal, ChatWidget
    │   ├── context/        # AuthContext (login/logout/role)
    │   ├── data/           # Mock announcements
    │   ├── pages/          # Login, Home, Dashboard, MapPage, AIChat
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
GEMINI_API_KEY=your_api_key_here
```

Start the server:

```bash
python app.py
```

The API will be available at `http://127.0.0.1:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/requests` | Get all service requests |
| `POST` | `/api/requests` | Submit a new service request (multipart/form-data) |
| `PUT` | `/api/requests/:id` | Update request status |
| `DELETE` | `/api/requests/:id` | Delete a request |
| `POST` | `/api/chat` | Send a message to the campus AI assistant |
| `GET` | `/uploads/:filename` | Serve uploaded images |

---

## Login

| Username | Role | Access |
|---|---|---|
| `admin` | Admin | Dashboard, request management |
| anything else | Student | Announcements, service requests, map, AI chat |

No password required — this is a demo/internal tool.

---

## Database

SQLite database (`database.db`) is auto-created in `backend/` on first run. No manual setup needed.
