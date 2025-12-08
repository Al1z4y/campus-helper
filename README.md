# Campus Helper

A full-stack web platform for managing campus service requests.

## Project Structure

```
campus-helper/
├── backend/          # Flask backend
│   ├── app.py       # Main Flask application
│   └── requirements.txt
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

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

