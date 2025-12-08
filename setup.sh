#!/bin/bash

echo "=========================================="
echo "🚀 Campus Helper - Production Setup"
echo "=========================================="
echo ""

# Check if in correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backend setup
echo "1️⃣  Setting up Backend..."
echo ""

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "   Activating virtual environment..."
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

# Install dependencies
echo "   Installing Python dependencies..."
pip install -r requirements.txt -q

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
    
    # Generate JWT secret
    JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    
    # Update .env with generated secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your_jwt_secret_key_here_change_in_production/$JWT_SECRET/" .env
    else
        sed -i "s/your_jwt_secret_key_here_change_in_production/$JWT_SECRET/" .env
    fi
    
    echo "   ⚠️  Please add your GEMINI_API_KEY to backend/.env"
fi

echo "   ✅ Backend setup complete!"
echo ""

cd ..

# Frontend setup
echo "2️⃣  Setting up Frontend..."
echo ""

cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing Node dependencies..."
    npm install
    echo "   ✅ Frontend setup complete!"
else
    echo "   ✅ Dependencies already installed!"
fi

echo ""

cd ..

echo "=========================================="
echo "✨ Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Add your Gemini API key to backend/.env:"
echo "   GEMINI_API_KEY=your_key_here"
echo ""
echo "2. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "   python app.py"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open browser: http://localhost:5173"
echo ""
echo "5. Login credentials:"
echo "   Admin: admin@fccu.edu / admin123"
echo "   Or register a new account!"
echo ""
echo "=========================================="
echo "📖 See README.md for more details"
echo "=========================================="
