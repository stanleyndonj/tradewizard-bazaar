
"""new tables

Revision ID: dd5eeef7917f
Revises: deadc07e9e52
Create Date: 2025-04-05 17:16:30.403598

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'dd5eeef7917f'
down_revision = 'deadc07e9e52'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create purchases table
    op.create_table(
        'purchases',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('robot_id', sa.String(36), nullable=False),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('currency', sa.String(3), nullable=False),
        sa.Column('payment_method', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, nullable=True, onupdate=datetime.utcnow)
    )
    
    # Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('plan_id', sa.String(36), nullable=False),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('currency', sa.String(3), nullable=False),
        sa.Column('payment_method', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('start_date', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('end_date', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, nullable=True, onupdate=datetime.utcnow),
        sa.Column('is_active', sa.Boolean, nullable=False, default=True)
    )
    
    # Create subscription_plans table for admin management
    op.create_table(
        'subscription_plans',
        sa.Column('id', sa.String(36), primary_key=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('price', sa.Float, nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, default='USD'),
        sa.Column('interval', sa.String(20), nullable=False),
        sa.Column('features', sa.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime, nullable=True, onupdate=datetime.utcnow)
    )


def downgrade() -> None:
    op.drop_table('subscriptions')
    op.drop_table('subscription_plans')
    op.drop_table('purchases')
