from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token  # jwt_required, get_jwt_identity removed for demo
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
from marshmallow import Schema, fields, ValidationError, validates
from datetime import datetime, timedelta
import os
import google.generativeai as genai
from dotenv import load_dotenv
from campus_knowledge import get_campus_context
import re

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configuration
basedir = os.path.abspath(os.path.dirname(__file__))

# Database configuration - supports both SQLite and PostgreSQL
database_url = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "database.db")}')
# Fix for postgres:// vs postgresql:// (Heroku compatibility)
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# Configure upload folder
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("JWT Error: Token has expired")
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"JWT Error: Invalid token - {error}")
    return jsonify({'error': 'Invalid token'}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"JWT Error: Missing token - {error}")
    return jsonify({'error': 'Authorization token is missing'}), 401

# CORS configuration - restrict to frontend URL
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
CORS(app, origins=[frontend_url, "http://localhost:5173"], 
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True)

# Configure Google Gemini
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    print("✓ Google Gemini API configured successfully!")
else:
    print("⚠ Warning: GEMINI_API_KEY not found in environment variables")
    print("  AI chat will not work until you set up the API key.")


# ==================== MODELS ====================

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student')  # 'student' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ServiceRequest(db.Model):
    """Service request model"""
    __tablename__ = 'service_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable for backward compatibility
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(50), default='Pending')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = db.relationship('User', backref='requests')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'Anonymous',
            'category': self.category,
            'description': self.description,
            'image_url': self.image_url,
            'status': self.status,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


# ==================== VALIDATION SCHEMAS ====================

class RegisterSchema(Schema):
    """Validation schema for user registration"""
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)
    
    @validates('username')
    def validate_username(self, value):
        if len(value) < 3:
            raise ValidationError('Username must be at least 3 characters long')
        if len(value) > 50:
            raise ValidationError('Username must not exceed 50 characters')
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise ValidationError('Username can only contain letters, numbers, and underscores')
    
    @validates('password')
    def validate_password(self, value):
        if len(value) < 6:
            raise ValidationError('Password must be at least 6 characters long')
        if len(value) > 128:
            raise ValidationError('Password must not exceed 128 characters')


class LoginSchema(Schema):
    """Validation schema for login"""
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class ServiceRequestSchema(Schema):
    """Validation schema for service requests"""
    category = fields.Str(required=True)
    description = fields.Str(required=True)
    
    @validates('category')
    def validate_category(self, value):
        allowed_categories = ['Maintenance', 'IT Support', 'Academic', 'Lost & Found']
        if value not in allowed_categories:
            raise ValidationError(f'Category must be one of: {", ".join(allowed_categories)}')
    
    @validates('description')
    def validate_description(self, value):
        if len(value) < 10:
            raise ValidationError('Description must be at least 10 characters long')
        if len(value) > 1000:
            raise ValidationError('Description must not exceed 1000 characters')


# ==================== AUTH ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        # Validate input
        schema = RegisterSchema()
        data = schema.load(request.json)
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            role='student'  # Default role
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        # Validate input
        schema = LoginSchema()
        data = schema.load(request.json)
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500


@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Get current logged-in user - AUTH DISABLED FOR DEMO"""
    try:
        # Demo mode: return default admin user
        user = User.query.filter_by(role='admin').first()
        if not user:
            user = User.query.first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({'error': 'Failed to get user'}), 500


@app.route('/api/profile', methods=['GET'])
def get_user_profile():
    """Get user profile with statistics - AUTH DISABLED FOR DEMO"""
    try:
        # Demo mode: use default admin user
        user = User.query.filter_by(role='admin').first()
        if not user:
            user = User.query.first()
        current_user_id = user.id if user else 1
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's request statistics
        total_requests = ServiceRequest.query.filter_by(user_id=current_user_id).count()
        pending_requests = ServiceRequest.query.filter_by(
            user_id=current_user_id, 
            status='Pending'
        ).count()
        resolved_requests = ServiceRequest.query.filter(
            ServiceRequest.user_id == current_user_id,
            ServiceRequest.status.in_(['Resolved', 'Completed'])
        ).count()
        
        # Get recent requests
        recent_requests = ServiceRequest.query.filter_by(
            user_id=current_user_id
        ).order_by(ServiceRequest.timestamp.desc()).limit(5).all()
        
        return jsonify({
            'user': user.to_dict(),
            'stats': {
                'total_requests': total_requests,
                'pending_requests': pending_requests,
                'resolved_requests': resolved_requests,
                'in_progress_requests': total_requests - pending_requests - resolved_requests
            },
            'recent_requests': [req.to_dict() for req in recent_requests]
        }), 200
    except Exception as e:
        print(f"Get profile error: {str(e)}")
        return jsonify({'error': 'Failed to fetch profile'}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics - AUTH DISABLED FOR DEMO"""
    try:
        # Demo mode: use admin user for full stats
        user = User.query.filter_by(role='admin').first()
        if not user:
            user = User.query.first()
        current_user_id = user.id if user else 1
        
        if user.role == 'admin':
            # Admin sees all stats
            total = ServiceRequest.query.count()
            pending = ServiceRequest.query.filter_by(status='Pending').count()
            in_progress = ServiceRequest.query.filter_by(status='In Progress').count()
            resolved = ServiceRequest.query.filter(
                ServiceRequest.status.in_(['Resolved', 'Completed'])
            ).count()
        else:
            # Students see their own stats
            total = ServiceRequest.query.filter_by(user_id=current_user_id).count()
            pending = ServiceRequest.query.filter_by(
                user_id=current_user_id,
                status='Pending'
            ).count()
            in_progress = ServiceRequest.query.filter_by(
                user_id=current_user_id,
                status='In Progress'
            ).count()
            resolved = ServiceRequest.query.filter(
                ServiceRequest.user_id == current_user_id,
                ServiceRequest.status.in_(['Resolved', 'Completed'])
            ).count()
        
        return jsonify({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved
        }), 200
    except Exception as e:
        print(f"Get stats error: {str(e)}")
        return jsonify({'error': 'Failed to fetch stats'}), 500


# ==================== SERVICE REQUEST ROUTES ====================

@app.route('/api/requests', methods=['POST'])
def create_request():
    """Create a new service request - AUTH DISABLED FOR DEMO"""
    print(f"=== CREATE REQUEST ENDPOINT CALLED ===")
    print(f"Content-Type: {request.content_type}")
    print(f"Form data: {dict(request.form)}")
    print(f"Files: {list(request.files.keys())}")
    
    try:
        # Demo mode: use default admin user
        user = User.query.filter_by(role='admin').first()
        current_user_id = user.id if user else 1
        print(f"User ID: {current_user_id}")
        
        # Handle form data (multipart/form-data)
        category = request.form.get('category')
        description = request.form.get('description')
        
        print(f"Create request - Category: {category}, Description: {description}, Content-Type: {request.content_type}")
        
        # Manual validation for FormData
        if not category:
            print("Error: Category is missing")
            return jsonify({'error': 'Category is required'}), 422
        if not description:
            print("Error: Description is missing")
            return jsonify({'error': 'Description is required'}), 422
            
        allowed_categories = ['Maintenance', 'IT Support', 'Academic', 'Lost & Found']
        if category not in allowed_categories:
            print(f"Error: Invalid category '{category}'")
            return jsonify({'error': f'Category must be one of: {", ".join(allowed_categories)}'}), 422
            
        if len(description) < 10:
            print(f"Error: Description too short ({len(description)} chars)")
            return jsonify({'error': 'Description must be at least 10 characters long'}), 422
        if len(description) > 1000:
            return jsonify({'error': 'Description must not exceed 1000 characters'}), 422
        
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
        
        # Create request
        new_request = ServiceRequest(
            user_id=current_user_id,
            category=category,
            description=description,
            image_url=image_url
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify(new_request.to_dict()), 201
        
    except ValidationError as err:
        return jsonify({'error': err.messages}), 422
    except Exception as e:
        print(f"Error in create_request: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Failed to create request'}), 500


@app.route('/api/requests', methods=['GET'])
def get_requests():
    """Get service requests with pagination, search, and filtering"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str)
        category = request.args.get('category', '', type=str)
        status = request.args.get('status', '', type=str)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        # Build query
        query = ServiceRequest.query
        
        # Apply search filter (description or category)
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                db.or_(
                    ServiceRequest.description.ilike(search_filter),
                    ServiceRequest.category.ilike(search_filter)
                )
            )
        
        # Apply category filter
        if category:
            query = query.filter(ServiceRequest.category == category)
        
        # Apply status filter
        if status:
            query = query.filter(ServiceRequest.status == status)
        
        # Order by timestamp
        query = query.order_by(ServiceRequest.timestamp.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'requests': [req.to_dict() for req in pagination.items],
            'total': pagination.total,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }), 200
    except Exception as e:
        print(f"Error in get_requests: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch requests'}), 500


@app.route('/api/requests/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    """Update service request status - AUTH DISABLED FOR DEMO"""
    try:
        # Demo mode: allow all updates
        
        request_obj = ServiceRequest.query.get_or_404(request_id)
        data = request.get_json()
        
        if 'status' in data:
            allowed_statuses = ['Pending', 'In Progress', 'Resolved', 'Completed']
            if data['status'] not in allowed_statuses:
                return jsonify({'error': f'Status must be one of: {", ".join(allowed_statuses)}'}), 400
            request_obj.status = data['status']
        
        db.session.commit()
        
        return jsonify(request_obj.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating request: {str(e)}")
        return jsonify({'error': 'Failed to update request'}), 500


@app.route('/api/requests/<int:request_id>', methods=['DELETE'])
def delete_request(request_id):
    """Delete a service request - AUTH DISABLED FOR DEMO"""
    try:
        # Demo mode: allow all deletes
        
        request_obj = ServiceRequest.query.get_or_404(request_id)
        db.session.delete(request_obj)
        db.session.commit()
        
        return jsonify({'message': 'Request deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting request: {str(e)}")
        return jsonify({'error': 'Failed to delete request'}), 500


@app.route('/uploads/<filename>', methods=['GET'])
def serve_image(filename):
    """Serve uploaded images"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'Image not found'}), 404


# ==================== UTILITY ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server is running"""
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200


# ==================== AI CHAT ROUTE ====================

@app.route('/api/chat', methods=['POST'])
def chat():
    """AI chat endpoint - AUTH DISABLED FOR DEMO"""
    print(f"=== CHAT ENDPOINT CALLED ===")
    print(f"Content-Type: {request.content_type}")
    print(f"Raw data: {request.get_data(as_text=True)[:200]}")
    
    try:
        data = request.get_json()
        print(f"Parsed JSON: {data}")
        
        if not data:
            print(f"Chat error: No JSON data received. Content-Type: {request.content_type}")
            return jsonify({"error": "Invalid request. Please send JSON data."}), 422
        
        user_msg = data.get('message', '').strip()
        
        if not user_msg:
            print(f"Chat error: Empty message. Data received: {data}")
            return jsonify({"error": "Message is required"}), 422
        
        if len(user_msg) > 500:
            return jsonify({"error": "Message too long. Please keep it under 500 characters"}), 422
        
        # Check if Gemini API is configured
        if not gemini_api_key:
            return jsonify({
                "reply": "⚠️ <strong>AI Service Unavailable</strong><br>Please configure GEMINI_API_KEY to use the AI assistant."
            }), 200
        
        # Use Gemini AI for responses
        try:
            # Use gemini-2.5-flash for free tier (faster and available on free API)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Get campus knowledge base
            campus_context = get_campus_context()
            
            # System prompt for campus-only assistant with knowledge base
            system_prompt = f"""You are the FCCU (Forman Christian College University) Campus Assistant chatbot. 
Your role is to help students with campus-related information ONLY using the knowledge base provided.

=== CAMPUS KNOWLEDGE BASE ===
{campus_context}

=== YOUR INSTRUCTIONS ===
1. Answer questions ONLY about FCCU campus using the information above
2. Be helpful, friendly, and concise
3. If information is in the knowledge base, use it accurately
4. If information is NOT in the knowledge base, say: "I don't have that specific information. Please contact the administration office or check the student portal."
5. Format responses with HTML tags: <strong>, <br>, <em> for better readability
6. Keep responses under 150 words unless more detail is needed

You MUST REFUSE to answer:
- Personal questions about individuals
- General knowledge questions (weather, movies, songs, jokes, news)
- Questions unrelated to FCCU campus
- Requests for personal data or sensitive information

When refusing, say: "❌ I can only help with FCCU Campus-related questions. Please ask about campus facilities, timings, locations, rules, or services."
"""

            # Generate response
            full_prompt = f"{system_prompt}\n\nStudent Question: {user_msg}\n\nYour Response:"
            response = model.generate_content(full_prompt)
            reply = response.text
            
            return jsonify({"reply": reply})
            
        except Exception as ai_error:
            print(f"Gemini API Error: {str(ai_error)}")
            return jsonify({
                "reply": "❌ <strong>AI Error</strong><br>Sorry, I encountered an error. Please try again or contact support."
            }), 200

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return jsonify({"error": "Error processing request."}), 500


# ==================== INITIALIZATION ====================

# Initialize database
with app.app_context():
    db.create_all()
    
    # Create default admin user if doesn't exist
    admin = User.query.filter_by(email='admin@fccu.edu').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@fccu.edu',
            role='admin'
        )
        admin.set_password('admin123')  # Change this in production!
        db.session.add(admin)
        db.session.commit()
        print("✓ Default admin user created (admin@fccu.edu / admin123)")
    
    print("✓ Database initialized successfully!")

if __name__ == '__main__':
    print("="*60)
    print("🚀 Starting Campus Helper Backend Server")
    print("="*60)
    print(f"📊 Database: {app.config['SQLALCHEMY_DATABASE_URI'][:30]}...")
    print(f"🔐 JWT Configured: {'✓' if app.config['JWT_SECRET_KEY'] else '✗'}")
    print(f"🤖 Gemini AI: {'✓' if gemini_api_key else '✗'}")
    print(f"🌐 CORS: {frontend_url}")
    print("="*60)
    app.run(debug=True, port=5001, host='127.0.0.1')
