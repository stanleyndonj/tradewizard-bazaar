
"""create subscription tables

Revision ID: create_subscription_tables
Create Date: 2024-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

def upgrade():
    op.create_table(
        'subscription_plans',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('price', sa.Float, nullable=False),
        sa.Column('currency', sa.String(3), nullable=False),
        sa.Column('interval', sa.String(20), nullable=False),
        sa.Column('features', JSONB),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()'))
    )

def downgrade():
    op.drop_table('subscription_plans')
