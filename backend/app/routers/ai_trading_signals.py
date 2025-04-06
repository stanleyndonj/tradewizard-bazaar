
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import random
from datetime import datetime, timedelta

from ..database import get_db
from ..models.user import User
from ..utils.auth import get_user_from_token
from ..config import settings

# Updated router path to match frontend requests
router = APIRouter(prefix="/api/ai-trading-signals", tags=["ai-trading-signals"])

# Mock data for trading signals
def generate_mock_signals(market: str, timeframe: str, count: int = 10):
    # ... keep existing code (generate_mock_signals function)
    signals = []
    
    # Define possible directions and strengths
    directions = ["BUY", "SELL"]
    strengths = ["Strong", "Moderate", "Weak"]
    
    # Define possible currency pairs based on market
    if market == "forex":
        pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "USD/CAD", "AUD/USD"]
    elif market == "crypto":
        pairs = ["BTC/USD", "ETH/USD", "XRP/USD", "LTC/USD", "ADA/USD", "DOT/USD"]
    elif market == "stocks":
        pairs = ["AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA"]
    else:
        pairs = ["EUR/USD", "BTC/USD", "AAPL"]
    
    # Generate random signals
    for i in range(count):
        timestamp = datetime.now() - timedelta(hours=i*2)
        signal = {
            "id": str(i+1),
            "symbol": random.choice(pairs),
            "direction": random.choice(directions).lower(),  # Make lowercase to match frontend
            "strength": random.choice(strengths),
            "confidence": round(random.uniform(0.65, 0.95), 2),  # As decimal for frontend
            "entry_price": round(random.uniform(100, 5000), 2),
            "stop_loss": round(random.uniform(95, 99), 2),
            "take_profit": round(random.uniform(101, 105), 2),
            "timeframe": timeframe,
            "timestamp": timestamp.isoformat(),
            "market": market,
            "analysis": "AI analysis indicates a potential " + 
                      random.choice(directions).lower() + " opportunity based on " +
                      random.choice(["trend analysis", "momentum indicators", "support/resistance levels", "volume analysis"]),
            "created_at": timestamp.isoformat(),
            "status": random.choice(["active", "completed", "pending"])
        }
        signals.append(signal)
    
    return signals

@router.get("")
async def get_trading_signals(
    market: str = "forex",
    timeframe: str = "1h",
    count: int = 10,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Get AI trading signals with admin bypass"""
    user = db.query(User).filter(User.id == current_user_id).first()
    
    # User authentication check
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Global override check or admin check
    if settings.DISABLE_SUBSCRIPTION_CHECK or user.is_admin or (user.email in settings.ADMIN_EMAILS):
        signals = generate_mock_signals(market, timeframe, count)
        return signals
        
    # Regular user subscription check
    if not user.robots_delivered:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subscription required to access AI trading signals"
        )
    
    signals = generate_mock_signals(market, timeframe, count)
    return signals

@router.get("/analyze")
async def analyze_market(
    symbol: str,
    timeframe: str = "1h",
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_user_from_token)
):
    """Analyze a specific market symbol"""
    # ... keep existing code (analyze_market function)
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Fetch the user
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Global override check or admin check - admins always have access
    if settings.DISABLE_SUBSCRIPTION_CHECK or user.is_admin or (user.email in settings.ADMIN_EMAILS):
        # Continue with analysis - no subscription check for admins
        pass
    else:
        # Regular user subscription check
        if not user.robots_delivered:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Subscription required to access AI market analysis"
            )
    
    # Generate a random direction and confidence
    direction = random.choice(["bullish", "bearish", "neutral"])
    confidence = round(random.uniform(65, 95), 1)
    
    # Generate analysis result
    analysis = {
        "symbol": symbol,
        "timeframe": timeframe,
        "timestamp": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "trend": direction,
        "strength": round(random.uniform(0.6, 0.9), 2),
        "support_levels": [
            round(random.uniform(90, 95), 2),
            round(random.uniform(85, 90), 2)
        ],
        "resistance_levels": [
            round(random.uniform(105, 110), 2),
            round(random.uniform(110, 115), 2)
        ],
        "next_price_target": round(random.uniform(100, 5000), 2),
        "stop_loss_suggestion": round(random.uniform(90, 95), 2),
        "summary": f"The {symbol} is showing a {direction} trend on the {timeframe} timeframe. Technical indicators suggest potential continuation of the current momentum.",
        "indicators": {
            "rsi": round(random.uniform(30, 70), 2),
            "macd": {
                "value": round(random.uniform(-2, 2), 2),
                "signal": round(random.uniform(-1, 1), 2),
                "histogram": round(random.uniform(-1, 1), 2)
            },
            "moving_averages": {
                "ma20": round(random.uniform(95, 105), 2),
                "ma50": round(random.uniform(90, 110), 2),
                "ma200": round(random.uniform(85, 115), 2)
            }
        },
        "recommendation": random.choice([
            "Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"
        ]),
        "next_potential_move": f"Price might {'rise towards' if direction == 'bullish' else 'fall towards'} the next {'resistance' if direction == 'bullish' else 'support'} level.",
        "risk_reward_ratio": round(random.uniform(1.5, 3.5), 2)
    }
    
    return analysis
