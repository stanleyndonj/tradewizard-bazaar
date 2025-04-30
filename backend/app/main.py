
import time
import json
import logging
import os
import socketio

from fastapi import FastAPI, Request
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

# Create Socket.IO instance before importing routers
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio)

# Then import routers
from .routers import auth, user, robot, robot_request, purchase, ai_trading_signals, subscription, mpesa, card_payment, chat, notification

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO app
app.mount('/socket.io', socket_app)

# Define Socket.IO events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(robot.router)
app.include_router(robot_request.router)
app.include_router(purchase.router)
app.include_router(ai_trading_signals.router)
app.include_router(subscription.router)
app.include_router(mpesa.router)
app.include_router(card_payment.router)
app.include_router(chat.router)
app.include_router(notification.router)

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
