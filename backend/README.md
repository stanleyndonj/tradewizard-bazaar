
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
