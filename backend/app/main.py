
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import socketio
from starlette.middleware.sessions import SessionMiddleware
from .routers import auth, user, robot, robot_request, purchase, mpesa, ai_trading_signals, chat

# Initialize Socket.io
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=["*"],  # Allow all origins for development
)

# Create FastAPI app
app = FastAPI(
    title="Trading Robot API",
    description="API for Trading Robot platform",
    version="1.0.0"
)

# Mount Socket.io to FastAPI app
socket_app = socketio.ASGIApp(sio, app)

# Configure CORS with production and development frontend URLs
origins = [
    "http://localhost:5173",  # Development frontend
    "http://localhost:3000",  # Alternative dev port
    "http://localhost:8080",  # Vite default port
    "*"  # Allow all origins for development
]

# Add CORS middleware first so it applies to all routes (including errors)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add session middleware with a secret key
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("JWT_SECRET_KEY", "default-secret-key")
)

# Include routers - making sure all routes start with /api
app.include_router(auth.router)
app.include_router(user.router, prefix="/api")
app.include_router(robot.router, prefix="/api")
app.include_router(robot_request.router, prefix="/api")
app.include_router(purchase.router, prefix="/api")
app.include_router(mpesa.router, prefix="/api")
app.include_router(ai_trading_signals.router)  # Already has /api prefix
app.include_router(chat.router, prefix="/api")

# Socket.io event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    await sio.emit('welcome', {'message': 'Welcome to TradeWizard chat!'}, room=sid)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_chat(sid, data):
    user_id = data.get('userId')
    if user_id:
        await sio.enter_room(sid, f"user_{user_id}")
        print(f"User {user_id} joined chat room")
        await sio.emit('chat_joined', {'status': 'success'}, room=sid)

@sio.event
async def leave_chat(sid, data):
    user_id = data.get('userId')
    if user_id:
        await sio.leave_room(sid, f"user_{user_id}")
        print(f"User {user_id} left chat room")

@sio.event
async def join_admin_chat(sid, data):
    admin_id = data.get('adminId')
    if admin_id:
        await sio.enter_room(sid, "admin_room")
        print(f"Admin {admin_id} joined admin chat room")
        await sio.emit('admin_chat_joined', {'status': 'success'}, room=sid)

@sio.event
async def leave_admin_chat(sid, data):
    admin_id = data.get('adminId')
    if admin_id:
        await sio.leave_room(sid, "admin_room")
        print(f"Admin {admin_id} left admin chat room")

@sio.event
async def send_message(sid, data):
    print(f"Message received: {data}")
    conversation_id = data.get('conversationId')
    sender_id = data.get('senderId')
    
    # Store message in database
    from .models.chat import ChatMessage, Conversation
    from .database import get_db
    from sqlalchemy.orm import Session
    from fastapi import Depends
    
    db = next(get_db())
    
    # Create a new message
    new_message = ChatMessage(
        conversation_id=conversation_id,
        sender=data.get('sender', 'user'),
        sender_id=sender_id,
        text=data.get('text', ''),
        read=False
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # Update conversation's last message
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation:
        conversation.last_message = data.get('text', '')
        conversation.last_message_time = new_message.timestamp
        db.commit()
    
    # Broadcast message to user room
    if conversation_id and 'userRoom' in data:
        user_room = f"user_{data['userRoom']}"
        await sio.emit('new_message', {
            'id': str(new_message.id),
            'conversationId': conversation_id,
            'sender': data.get('sender'),
            'senderId': sender_id,
            'text': data.get('text'),
            'timestamp': new_message.timestamp.isoformat(),
            'read': False
        }, room=user_room)
    
    # Broadcast message to admin room
    await sio.emit('new_message', {
        'id': str(new_message.id),
        'conversationId': conversation_id,
        'sender': data.get('sender'),
        'senderId': sender_id,
        'text': data.get('text'),
        'timestamp': new_message.timestamp.isoformat(),
        'read': False
    }, room="admin_room")
    
    # Echo back to sender
    return {"status": "success", "message": "Message sent successfully"}

# Global exception handler to catch unhandled exceptions and return JSON responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global exception: {exc}")
    # Log the error if needed, e.g. using logging.error(...)
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred: {str(exc)}"}
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to Trading Robot API"}

@app.get("/api")
def api_root():
    return {"message": "Welcome to Trading Robot API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
