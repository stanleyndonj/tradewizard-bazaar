import { Robot, RobotRequest } from "./backend";

// Mock data for robots
export const ROBOTS: Robot[] = [
  {
    id: "1",
    name: "MT5 Pro Scalper",
    description: "Advanced scalping strategy for MetaTrader 5",
    type: "MT5",
    price: 199,
    features: [
      "Advanced scalping algorithm",
      "Multiple timeframe analysis",
      "Risk management features",
      "24/7 support",
    ],
    currency: "USD",
    category: "paid",
    image_url: "/placeholder.svg",
    imageUrl: "/placeholder.svg", // Added this property
    created_at: "2023-01-10T12:00:00Z",
  },
  {
    id: "2",
    name: "Binary Options Master",
    description: "Expert binary options robot with high win rate",
    type: "Binary",
    price: 149,
    features: [
      "60-second to 5-minute expiries",
      "Multi-indicator strategy",
      "Market trend analysis",
      "Win rate up to 85%",
    ],
    currency: "USD",
    category: "paid",
    image_url: "/placeholder.svg",
    imageUrl: "/placeholder.svg", // Added this property
    created_at: "2023-01-15T12:00:00Z",
  },
  {
    id: "3",
    name: "Free MT5 Trend Follower",
    description: "Simple trend following robot for beginners",
    type: "MT5",
    price: 0,
    features: [
      "Simple setup",
      "Trend detection",
      "Beginner friendly",
      "Works with major pairs",
    ],
    currency: "USD",
    category: "free",
    image_url: "/placeholder.svg",
    imageUrl: "/placeholder.svg", // Added this property
    created_at: "2023-01-20T12:00:00Z",
  },
];

// Mock data for robot requests
export const ROBOT_REQUESTS: RobotRequest[] = [
  {
    id: "1",
    user_id: "user1",
    user_name: "John Doe",
    user_email: "john@example.com",
    status: "pending",
    type: "MT5",
    created_at: "2023-01-25T12:00:00Z",
    progress: 20,
    trading_pairs: "EURUSD",
    timeframe: "H1",
    risk_level: "Medium",
    currency: "USD" // Added currency property
  },
  {
    id: "2",
    user_id: "user2",
    user_name: "Jane Smith",
    user_email: "jane@example.com",
    status: "in_progress", // Changed from "approved" to match allowed status values
    type: "Binary",
    created_at: "2023-01-26T12:00:00Z",
    progress: 50,
    market: "Forex",
    trading_strategy: "RSI + MACD",
    stake_amount: "100", // Changed from number to string
    currency: "USD" // Added currency property
  },
];

// Mock data for users
export const USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    is_admin: true,
    role: "admin",
    has_requested_robot: false,
    robots_delivered: true,
    created_at: "2023-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    is_admin: false,
    role: "user",
    has_requested_robot: true,
    robots_delivered: true,
    created_at: "2023-01-02T00:00:00.000Z",
  },
];
