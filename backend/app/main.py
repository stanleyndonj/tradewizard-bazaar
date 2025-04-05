
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import socketio
from starlette.middleware.sessions import SessionMiddleware
from .routers import auth, user, robot, robot_request, purchase, mpesa

# Initialize Socket.io
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "https://your-production-frontend-url.com"
    ]
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
    "https://your-production-frontend-url.com"  # Replace with your actual production frontend URL
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

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(robot.router)
app.include_router(robot_request.router)  # No prefix here, it's already in the router
app.include_router(purchase.router)
app.include_router(mpesa.router)

# Socket.io event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_chat(sid, data):
    user_id = data.get('userId')
    if user_id:
        await sio.enter_room(sid, f"user_{user_id}")
        print(f"User {user_id} joined chat room")

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
    
    # Broadcast message to user room
    if conversation_id and 'userRoom' in data:
        user_room = f"user_{data['userRoom']}"
        await sio.emit('new_message', data, room=user_room)
    
    # Broadcast message to admin room
    await sio.emit('new_message', data, room="admin_room")
    
    # Echo back to sender
    return {"status": "success", "message": "Message sent successfully"}

# Global exception handler to catch unhandled exceptions and return JSON responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the error if needed, e.g. using logging.error(...)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred."}
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to Trading Robot API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
