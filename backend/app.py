from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import google.generativeai as genai

app = Flask(__name__)
# Use absolute path for database to ensure it's created in the backend directory
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure upload folder
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

db = SQLAlchemy(app)
# Allow all origins for development - more permissive CORS
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Configure Google Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    print("Google Gemini API configured successfully!")
else:
    print("Warning: GEMINI_API_KEY not found in environment variables")


class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(50), default='Pending')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'description': self.description,
            'image_url': self.image_url,
            'status': self.status,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


@app.route('/api/requests', methods=['POST'])
def create_request():
    try:
        # Handle form data (multipart/form-data)
        category = request.form.get('category')
        description = request.form.get('description')
        image_url = ''
        
        # Handle file upload
        if 'attachment' in request.files:
            file = request.files['attachment']
            if file and file.filename != '' and allowed_file(file.filename):
                # Generate secure filename
                filename = secure_filename(file.filename)
                # Add timestamp to make filename unique
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                filename = timestamp + filename
                
                # Save file
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                # Store relative path for database
                image_url = f'uploads/{filename}'
        
        if not category or not description:
            return jsonify({'error': 'Category and description are required'}), 400
        
        new_request = ServiceRequest(
            category=category,
            description=description,
            image_url=image_url
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify(new_request.to_dict()), 201
    except Exception as e:
        print(f"Error in create_request: {str(e)}")  # Debug logging
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/requests', methods=['GET'])
def get_requests():
    try:
        requests = ServiceRequest.query.order_by(ServiceRequest.timestamp.desc()).all()
        return jsonify([req.to_dict() for req in requests]), 200
    except Exception as e:
        print(f"Error in get_requests: {str(e)}")  # Debug logging
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        return jsonify({'error': str(e)}), 500


@app.route('/api/requests/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    try:
        request_obj = ServiceRequest.query.get_or_404(request_id)
        data = request.get_json()
        
        if 'status' in data:
            request_obj.status = data['status']
        
        db.session.commit()
        
        return jsonify(request_obj.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/requests/<int:request_id>', methods=['DELETE'])
def delete_request(request_id):
    try:
        request_obj = ServiceRequest.query.get_or_404(request_id)
        db.session.delete(request_obj)
        db.session.commit()
        
        return jsonify({'message': 'Request deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/uploads/<filename>', methods=['GET'])
def serve_image(filename):
    """Serve uploaded images"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'Image not found'}), 404


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server is running"""
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_msg = data.get('message', '').lower()
        import time
        time.sleep(0.5) 

        # 1. SPECIFIC BUILDINGS (Expanded)
        if 'n block' in user_msg:
            reply = "📍 <strong>N-Block (Arts & Humanities):</strong><br>Located next to the Cafeteria.<br>It houses the English, Urdu, and History departments."

        elif 's block' in user_msg:
            reply = "📍 <strong>S-Block (Armacost Science Building):</strong><br>Located near the East Gate.<br>Labs are on the ground and 1st floor."

        elif 'e block' in user_msg:
            reply = "📍 <strong>E-Block:</strong><br>Located near the main entrance.<br>Admission Office is on the ground floor."
        
        # 2. GENERAL LOCATIONS
        elif any(word in user_msg for word in ['where', 'location', 'map', 'find']):
            reply = "📍 <strong>Campus Navigation:</strong><br>Use the <strong>Map Tab</strong> for directions to:<br>- Library<br>- Lucas Center<br>- Hostels<br>- Cafeteria"

        # 3. TIMINGS
        elif any(word in user_msg for word in ['time', 'open', 'close']):
            reply = "🕒 <strong>Campus Hours:</strong><br>• <strong>Library:</strong> 8 AM - 9 PM<br>• <strong>Cafeteria:</strong> 8:30 AM - 5:30 PM<br>• <strong>Sports:</strong> 11 AM - 7 PM"

        # 4. RULES
        elif any(word in user_msg for word in ['rule', 'id', 'card', 'attend']):
            reply = "📋 <strong>Key Rules:</strong><br>1. Display ID Card at entry.<br>2. 75% Attendance required.<br>3. Proper dress code must be followed."

        # 5. REFUSAL (Safety)
        elif any(word in user_msg for word in ['personal', 'joke', 'love', 'weather', 'movie', 'song']):
            reply = "❌ <strong>Out of Scope</strong><br>I can only answer questions about FCCU Campus services, timings, and rules."

        # 6. GREETING / DEFAULT
        else:
            reply = "👋 <strong>Hi! I am the Campus Assistant.</strong><br>Try asking about:<br>- <em>'Where is N Block?'</em><br>- <em>'Library timings'</em><br>- <em>'Campus rules'</em>"

        return jsonify({"reply": reply})

    except Exception as e:
        return jsonify({"reply": "Error processing request."})


# Initialize database
with app.app_context():
    db.create_all()
    print("Database initialized successfully!")

if __name__ == '__main__':
    print("Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True, port=5000, host='127.0.0.1')

