from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from starlette.middleware.sessions import SessionMiddleware
from .routers import auth, user, robot, robot_request, purchase, mpesa

app = FastAPI(
    title="Trading Robot API",
    description="API for Trading Robot platform",
    version="1.0.0"
)

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
app.include_router(robot_request.router, prefix="/robot-requests")
app.include_router(purchase.router)
app.include_router(mpesa.router)

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
