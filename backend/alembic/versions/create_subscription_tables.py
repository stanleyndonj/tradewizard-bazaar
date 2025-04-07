
"""create subscription tables

Revision ID: create_subscription_tables
Create Date: 2024-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

def upgrade():
    # Create subscription_plans table
    op.create_table(
        'subscription_plans',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('price', sa.Float, nullable=False),
        sa.Column('currency', sa.String(3), nullable=False),
        sa.Column('interval', sa.String(20), nullable=False),
        sa.Column('features', JSONB),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()'), nullable=True)
    )

    # Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('plan_id', sa.String(36), nullable=False),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('currency', sa.String(3), nullable=False),
        sa.Column('payment_method', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('start_date', sa.DateTime, nullable=False),
        sa.Column('end_date', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()'), nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, default=True)
    )

def downgrade():
    op.drop_table('subscriptions')
    op.drop_table('subscription_plans')
