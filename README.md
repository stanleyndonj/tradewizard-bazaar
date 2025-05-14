
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

## Technical Implementation Guide

This section provides detailed information on how the TradeWizard platform is implemented, which would be helpful for anyone looking to recreate a similar project.

### System Architecture Overview

TradeWizard uses a modern web application architecture with separate frontend and backend components:

1. **Frontend (React + TypeScript)**
   - Built with React and TypeScript
   - Styled with Tailwind CSS and shadcn/ui components
   - State management using React Context API
   - Client-side routing with React Router

2. **Backend (FastAPI + SQLAlchemy)**
   - RESTful API built with Python's FastAPI framework
   - SQLAlchemy ORM for database operations
   - JWT authentication for secure user sessions
   - Pydantic schemas for request/response validation

3. **Database (PostgreSQL/SQLite)**
   - PostgreSQL for production environments
   - SQLite for development and testing
   - Alembic for database migrations

### Data Models and Relationships

The system uses the following core data models:

1. **User Model**
   - Stores user information (name, email, password hash)
   - Tracks user roles and permissions
   - Linked to purchases, robot requests, and notifications

2. **Robot Model**
   - Contains robot details (name, description, price)
   - Stores robot type, category, and features
   - Includes download link for purchased robots

3. **Robot Request Model**
   - Captures user requirements for custom robots
   - Tracks request status through development lifecycle
   - Links to communication threads between users and developers

4. **Purchase Model**
   - Records robot purchases and payment information
   - Links users to their purchased robots
   - Stores payment method and transaction details

5. **Subscription Model & Plans**
   - Manages user subscription status and history
   - Defines different subscription tiers and pricing
   - Controls access to premium features

6. **Chat/Messaging Model**
   - Implements conversations and message threads
   - Tracks read/unread status of messages
   - Enables communication between users and support/admin

7. **Notification Model**
   - Delivers system alerts to users
   - Tracks notification status (read/unread)
   - Categorizes notification types

### Authentication Flow

1. **Registration Process**
   - User submits name, email, and password
   - Password is hashed securely using bcrypt
   - New user record created in database
   - Welcome email/notification sent to user

2. **Login Process**
   - User submits email and password
   - System verifies password against stored hash
   - JWT token generated with user ID and role
   - Token returned to client and stored in localStorage

3. **Session Management**
   - JWT token included in Authorization header for API requests
   - Backend validates token for protected routes
   - User role checked for admin-only functions
   - Token expiration handled with refresh mechanism

### API Endpoints Structure

The backend API is organized into logical groupings:

1. **Auth Routes** (`/api/auth/*`)
   - Registration, login, logout functionality
   - Password reset and email verification
   - Current user profile retrieval

2. **User Routes** (`/api/users/*`)
   - User profile management
   - User-specific data retrieval
   - Admin-only user management functions

3. **Robot Routes** (`/api/robots/*`)
   - Robot listing and filtering
   - Robot detail retrieval
   - Robot creation and management (admin)

4. **Robot Request Routes** (`/api/robot-requests/*`)
   - Request submission and tracking
   - Request update and status changes
   - Communication about request progress

5. **Payment Routes** (`/api/payments/*`)
   - Payment processing (M-PESA and credit card)
   - Payment verification and confirmation
   - Transaction history retrieval

6. **Subscription Routes** (`/api/subscription-*`)
   - Subscription plan listing
   - Subscription creation and management
   - Subscription status checking

7. **Chat Routes** (`/api/chat/*`)
   - Conversation creation and retrieval
   - Message sending and receiving
   - Read/unread status management

8. **Notification Routes** (`/api/notifications/*`)
   - Notification listing and filtering
   - Notification status updating
   - System-wide announcement creation (admin)

### Payment Integration

The platform supports multiple payment methods:

1. **M-PESA Integration**
   - Implements STK Push for mobile payment
   - Handles callback for payment confirmation
   - Stores transaction IDs for verification

2. **Credit/Debit Card Processing**
   - Secure card payment processing
   - Payment verification system
   - Receipt generation for successful payments

### Admin Dashboard Implementation

The admin interface provides comprehensive management capabilities:

1. **User Management Panel**
   - Tabular view of all registered users
   - User detail editing and role assignment
   - Account status toggling (active/inactive)

2. **Robot Request Management**
   - Request queue with status filtering
   - Detailed view of requirements
   - Status update and communication tools

3. **Robot Marketplace Management**
   - Robot creation and editing interface
   - Image and download file upload capability
   - Pricing and category management

4. **Financial Dashboard**
   - Transaction history and revenue reports
   - Payment status monitoring
   - Refund processing capability

### Real-time Features

The platform implements real-time functionality through:

1. **Socket.IO Integration**
   - Live chat between users and support
   - Real-time notifications delivery
   - Trading signal updates

2. **Push Notifications**
   - Browser notifications for critical events
   - Email notifications for important updates
   - In-app notification center

### Security Implementation

1. **Authentication Security**
   - Password hashing with bcrypt
   - JWT with proper expiration handling
   - CORS protection and HTTPS enforcement

2. **Database Security**
   - Parameterized queries to prevent SQL injection
   - Data validation before storage
   - Field-level encryption for sensitive data

3. **API Security**
   - Input validation with Pydantic schemas
   - Rate limiting for sensitive endpoints
   - Role-based access control

### Development and Deployment Workflow

1. **Local Development**
   - Frontend and backend run independently
   - SQLite database for development simplicity
   - Hot reloading for rapid iteration

2. **Testing Strategy**
   - Unit tests for backend API endpoints
   - Integration tests for critical flows
   - Frontend component testing

3. **Deployment Options**
   - Container-based deployment with Docker
   - Database migration handling in deployment
   - Environment-specific configuration

### Extending the Platform

1. **Adding New Robot Types**
   - Extend robot model with new type definitions
   - Create appropriate request form fields
   - Implement specialized processing logic

2. **New Payment Methods**
   - Implement new payment service integration
   - Add appropriate validation and verification
   - Update UI to offer new payment options

3. **Enhanced Analytics**
   - Implement tracking of user behavior
   - Build reporting dashboards
   - Create data visualization components

This comprehensive guide provides the blueprint for recreating the TradeWizard platform, covering all aspects from architecture to implementation details and future expansion opportunities.
