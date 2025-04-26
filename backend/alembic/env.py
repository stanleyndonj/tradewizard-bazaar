import os
import sys
from logging.config import fileConfig

# debug printing to verify we're editing the right env.py
print(
    ">>> Alembic env.py loaded from:",
    os.path.abspath(__file__)
)

from sqlalchemy import create_engine, pool
from alembic import context
from dotenv import load_dotenv

# 1️⃣ Load .env from project root
dotenv_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '.env')
)
load_dotenv(dotenv_path)

# 2️⃣ Add project root so our app imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 3️⃣ Import metadata
from app.database import Base
import app.models  # noqa: F401 to load all model modules

# Alembic Config object
config = context.config

# 4️⃣ Override URL and print for debug
db_url = os.getenv("DATABASE_URL")
print(
    ">>> DATABASE_URL from environment:",
    db_url
)
if not db_url:
    raise RuntimeError("DATABASE_URL not set in .env file")
config.set_main_option("sqlalchemy.url", db_url)

# 5️⃣ Logging setup
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# target metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    print(
        ">>> Running migrations online with URL:",
        db_url
    )
    # use create_engine directly to honor the overridden URL
    connectable = create_engine(
        db_url,
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()