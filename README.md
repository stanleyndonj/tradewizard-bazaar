
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/18b5dbcf-6b1c-440f-8bc0-2a3133291e8b

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.9+ (for backend)
- Node.js 18+ 
- pip (Python package manager)
- npm 

## Backend Setup

### 1. Set Up Virtual Environment (Optional but Recommended)
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 2. Install Backend Dependencies
```bash
# With virtual environment activated
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost/tradewizard
JWT_SECRET_KEY=your_secure_random_secret_key
M_PESA_API_URL=https://sandbox.safaricom.co.ke  # Update with actual Mpesa API
M_PESA_CONSUMER_KEY=your_consumer_key
M_PESA_CONSUMER_SECRET=your_consumer_secret
M_PESA_SHORTCODE=your_shortcode
M_PESA_LIPA_NA_MPESA_SHORTCODE=your_lipa_shortcode
M_PESA_LIPA_NA_MPESA_SHORTCODE_LIPA=your_lipa_shortcode
M_PESA_LIPA_NA_MPESA_PASSKEY=your_passkey
```

### 4. Set Up Database
```bash
# Run database migrations
alembic revision --autogenerate -m "your message here"
alembic upgrade head
```

### 5. Start Backend Server
```bash
# Run the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Frontend Setup

### 1. Install Frontend Dependencies
```bash
# From project root
npm install
# Or if using bun
bun install
```

### 2. Set Frontend Environment Variables
Create a `.env` file in the project root:
```
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Frontend Development Server
```bash
# From project root
npm run dev
# Or with bun
bun dev
```

The frontend will be available at `http://localhost:8080`

## Development Workflow

1. Start backend server in one terminal
2. Start frontend server in another terminal
3. Open `http://localhost:8080` in your browser

## Additional Commands

### Backend
- Run tests: `pytest`
- Create migration: `alembic revision --autogenerate -m "Description"`

### Frontend
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Troubleshooting

- Ensure all environment variables are correctly set
- Check that all dependencies are installed
- Verify database connection
- Restart servers if encountering unexpected issues

## Deployment

For deployment instructions, visit: [Lovable Deployment Docs](https://docs.lovable.dev/deployment)

## TradeWizard Platform Features and Functionality

### Core Features

#### 1. Trading Robot Marketplace
- Browse and purchase pre-built trading robots
- Filter robots by strategy type, market, success rate, and price
- Detailed robot specifications and performance metrics
- Secure checkout with multiple payment options

#### 2. Custom Robot Requests
- Submit detailed requirements for custom-built trading robots
- Consultation with robot developers
- Track request progress through development stages
- Receive and test final robot implementation

#### 3. AI Trading Signals
- Real-time market analysis and trading recommendations
- Subscription-based access to premium signals
- Historical performance data for signal accuracy
- Market trend visualizations and predictions

#### 4. Interactive Dashboard
- Personalized user dashboard with performance metrics
- Robot management interface
- Subscription status and management
- Market data widgets and news feed

#### 5. Communication System
- In-app messaging with support team and robot developers
- Notification center for important updates
- Real-time chat with AI trading assistant
- Email alerts for critical events

### Payment Systems

- M-PESA integration for mobile payments
- Credit/debit card processing
- Subscription management and recurring billing
- Payment history and invoice generation

### User Roles and Permissions

#### Regular User Capabilities
- Purchase trading robots and signals
- Request custom robots
- Access personal dashboard
- Manage subscriptions
- Communicate with support

#### Admin Privileges
1. **User Management**
   - View and manage all user accounts
   - Edit user information and permissions
   - Monitor user activity and engagement
   - Disable or ban accounts if necessary

2. **Robot Request Processing**
   - Review incoming custom robot requests
   - Assign requests to developers
   - Update request status
   - Communicate with clients about requirements

3. **Robot Marketplace Management**
   - Add, edit, or remove robots from the marketplace
   - Update robot pricing and specifications
   - Monitor sales performance
   - Feature specific robots on the homepage

4. **AI Trading Signals Administration**
   - Manage signal generation parameters
   - Create and edit subscription plans
   - Control signal distribution
   - Monitor signal performance metrics

5. **Financial Administration**
   - View all transactions across the platform
   - Process refunds when necessary
   - Generate financial reports
   - Configure payment gateway settings

6. **System Configuration**
   - Access to backend settings
   - Configure email notifications
   - Manage site-wide announcements
   - System maintenance tools

### Technical Architecture

- **Frontend**: React with TypeScript, Tailwind CSS for responsive design
- **Backend**: Python FastAPI with SQLAlchemy ORM
- **Database**: PostgreSQL for production (SQLite for development)
- **Real-time Communication**: Socket.IO for live updates and chat
- **Authentication**: JWT-based secure authentication system
- **API Integrations**: Payment gateways, trading data providers

### Subscription Tiers

1. **Free Tier**
   - Limited access to market data
   - Basic robot marketplace browsing
   - Ability to submit custom robot requests

2. **Standard Subscription**
   - Access to basic trading signals
   - Discounted robot purchases
   - Priority support

3. **Premium Subscription**
   - Full access to all trading signals
   - AI trading assistant
   - Advanced market analysis tools
   - VIP support and consultations
