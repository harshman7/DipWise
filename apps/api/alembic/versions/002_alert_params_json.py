"""Add params_json to alerts for SMA cross configuration

Revision ID: 002
Revises: 001
Create Date: 2026-05-03
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("alerts", sa.Column("params_json", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("alerts", "params_json")
