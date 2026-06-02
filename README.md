# Campus Helper

<<<<<<< HEAD
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
=======
A full-stack web platform for managing campus service requests.
>>>>>>> 20256285acda92e8163b3d47ef2193d9020f84c5

## Project Structure

```
<<<<<<< HEAD
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
=======
campus-helper/
├── backend/          # Flask backend
│   ├── app.py       # Main Flask application
│   └── requirements.txt
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
>>>>>>> 20256285acda92e8163b3d47ef2193d9020f84c5
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

<<<<<<< HEAD
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
=======
## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```

   The backend will run on `http://127.0.0.1:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Features

- **Home Page**: Submit service requests with category and description
- **Dashboard**: View all service requests in a table format
- **Map**: Placeholder for future map feature
- **AI Chat**: Chat interface with dummy AI responses (ready for real AI integration)

## API Endpoints

- `POST /api/requests` - Submit a new service request
- `GET /api/requests` - Get all service requests
- `POST /api/chat` - Send a message to the AI chat (dummy response for now)

## Database

The SQLite database (`database.db`) will be automatically created in the backend directory when you first run the Flask application.

>>>>>>> 20256285acda92e8163b3d47ef2193d9020f84c5
