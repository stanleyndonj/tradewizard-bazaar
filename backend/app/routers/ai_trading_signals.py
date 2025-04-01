
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import random
from datetime import datetime, timedelta

from ..database import get_db
from ..models.user import User
from ..utils.auth import get_user_from_token
from ..config import settings

router = APIRouter(prefix="/ai-trading-signals", tags=["ai-trading-signals"])

# Mock data for trading signals
def generate_mock_signals(market: str, timeframe: str, count: int = 10):
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
            "direction": random.choice(directions),
            "strength": random.choice(strengths),
            "confidence": round(random.uniform(65, 95), 1),
            "entry_price": round(random.uniform(100, 5000), 2),
            "stop_loss": round(random.uniform(95, 99), 2),
            "take_profit": round(random.uniform(101, 105), 2),
            "timeframe": timeframe,
            "timestamp": timestamp.isoformat(),
            "market": market,
            "analysis": "AI analysis indicates a potential " + 
                      random.choice(directions).lower() + " opportunity based on " +
                      random.choice(["trend analysis", "momentum indicators", "support/resistance levels", "volume analysis"])
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
    
    # Admin users can access without subscription check
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Global override check
    if settings.DISABLE_SUBSCRIPTION_CHECK:
        signals = generate_mock_signals(market, timeframe, count)
        return signals
        
    # Check if user is admin by email or is_admin flag
    is_admin = user.is_admin or (user.email in settings.ADMIN_EMAILS)
    
    # Admin bypass for subscription
    if not is_admin and not user.robots_delivered:
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
    
    # Global override check
    if settings.DISABLE_SUBSCRIPTION_CHECK:
        # Continue with analysis
        pass
    else:
        # Check if user is admin by email or is_admin flag
        is_admin = user.is_admin or (user.email in settings.ADMIN_EMAILS)
        
        # Check if user has subscription (using robots_delivered as a placeholder) or is admin
        if not is_admin and not user.robots_delivered:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Subscription required to access AI market analysis"
            )
    
    # Generate a random direction and confidence
    direction = random.choice(["BUY", "SELL"])
    confidence = round(random.uniform(65, 95), 1)
    
    # Generate analysis result
    analysis = {
        "symbol": symbol,
        "timeframe": timeframe,
        "timestamp": datetime.now().isoformat(),
        "direction": direction,
        "confidence": confidence,
        "entry_price": round(random.uniform(100, 5000), 2),
        "stop_loss": round(random.uniform(95, 99), 2),
        "take_profit": round(random.uniform(101, 105), 2),
        "analysis_summary": f"AI analysis suggests a {direction.lower()} signal for {symbol} with {confidence}% confidence based on current market conditions.",
        "technical_indicators": {
            "rsi": round(random.uniform(30, 70), 2),
            "macd": round(random.uniform(-2, 2), 2),
            "bollinger_bands": {
                "upper": round(random.uniform(105, 110), 2),
                "middle": 100,
                "lower": round(random.uniform(90, 95), 2)
            },
            "moving_averages": {
                "sma_50": round(random.uniform(95, 105), 2),
                "sma_200": round(random.uniform(90, 110), 2),
                "ema_12": round(random.uniform(95, 105), 2),
                "ema_26": round(random.uniform(95, 105), 2)
            }
        },
        "market_sentiment": random.choice(["Bullish", "Bearish", "Neutral"]),
        "volume_analysis": {
            "volume": round(random.uniform(100000, 1000000), 0),
            "volume_change": f"{round(random.uniform(-10, 10), 2)}%"
        },
        "support_resistance": {
            "support_levels": [
                round(random.uniform(90, 95), 2),
                round(random.uniform(85, 90), 2)
            ],
            "resistance_levels": [
                round(random.uniform(105, 110), 2),
                round(random.uniform(110, 115), 2)
            ]
        }
    }
    
    return analysis
