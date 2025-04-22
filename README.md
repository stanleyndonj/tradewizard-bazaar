
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
```
