import time
import json
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import socketio
from starlette.middleware.sessions import SessionMiddleware
from .routers import auth, user, robot, robot_request, purchase, mpesa, ai_trading_signals, chat, subscription, card_payment

# Initialize Socket.io
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=["*"],  # Allow all origins for development
    async_handlers=True,
    logger=True,
    engineio_logger=True
)

# Create FastAPI app
app = FastAPI(
    title="Trading Robot API",
    description="API for Trading Robot platform",
    version="1.0.0"
)

# Mount Socket.io to FastAPI app
socket_app = socketio.ASGIApp(sio, app)

# Define allowed origins
origins = [
    "http://0.0.0.0:8080",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://0.0.0.0:3000",
    "http://localhost:3000",
    "http://localhost",
    "https://localhost",
    "http://0.0.0.0",
    "https://0.0.0.0",
]

# Configure CORS to allow specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("JWT_SECRET_KEY", "default-secret-key"),
    same_site="lax",
    https_only=False
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
app.include_router(ai_trading_signals.router, prefix="/api")  # Fixed: add prefix
app.include_router(chat.router, prefix="/api")
app.include_router(subscription.router, prefix="/api")  # Fixed: changed from /api/subscription to /api
app.include_router(card_payment.router, prefix="/api")

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

# Add logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request path and method
    logger = logging.getLogger(__name__)
    logger.info(f"Request: {request.method} {request.url.path}")

    # Log request body for specific endpoints (like registration)
    if request.url.path == "/api/auth/register" or request.url.path == "/api/auth/login":
        try:
            body_bytes = await request.body()
            if body_bytes:
                # Create a copy of the request with the same body
                request._body = body_bytes
                body_str = body_bytes.decode()
                # Mask passwords in logs for security
                if "password" in body_str:
                    body_json = json.loads(body_str)
                    if "password" in body_json:
                        body_json["password"] = "******"
                    body_str = json.dumps(body_json)
                logger.info(f"Request body: {body_str}")
        except Exception as e:
            logger.error(f"Error logging request body: {str(e)}")

    response = await call_next(request)
    process_time = time.time() - start_time

    # Log response status and time
    logger.info(f"{request.client.host}:{request.client.port} - \"{request.method} {request.url.path} HTTP/{request.scope['http_version']}\" {response.status_code} (took {process_time:.4f}s)")

    return response