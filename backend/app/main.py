
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from starlette.middleware.sessions import SessionMiddleware
from .routers import auth, user, robot, robot_request, purchase, mpesa

app = FastAPI(
    title="Trading Robot API",
    description="API for Trading Robot platform",
    version="1.0.0"
)

# Configure CORS with production frontend URL
origins = [
    "http://localhost:5173",  # Development frontend
    "http://localhost:3000",  # Alternative dev port
    "http://localhost:8080",  # Vite default port
    "https://your-production-frontend-url.com"  # Replace with your actual production frontend URL
]

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
app.include_router(robot_request.router, prefix="/robot-requests")
app.include_router(purchase.router)
app.include_router(mpesa.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Trading Robot API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
