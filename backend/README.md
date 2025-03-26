
# Trading Robot API Backend

This is the backend API for the Trading Robot platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
Make sure you have a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=your_postgres_connection_string
JWT_SECRET_KEY=your_jwt_secret
M_PESA_API_URL=mpesa_api_url
M_PESA_CONSUMER_KEY=your_consumer_key
M_PESA_CONSUMER_SECRET=your_consumer_secret
M_PESA_SHORTCODE=your_shortcode
M_PESA_LIPA_NA_MPESA_SHORTCODE=your_shortcode
M_PESA_LIPA_NA_MPESA_SHORTCODE_LIPA=your_shortcode_lipa
M_PESA_LIPA_NA_MPESA_PASSKEY=your_passkey
```

3. Run database migrations:
```bash
alembic upgrade head
```

4. Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

When the server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Creating a migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Applying migrations
```bash
alembic upgrade head
```

### Running tests
```bash
pytest
```
