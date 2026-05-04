#!/usr/bin/env python3
"""Write OpenAPI schema to packages/shared/openapi.json. Run from repo root."""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
API_ROOT = REPO / "apps" / "api"
sys.path.insert(0, str(API_ROOT))

from app.main import app  # noqa: E402

OUT = REPO / "packages" / "shared" / "openapi.json"
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(app.openapi(), indent=2), encoding="utf-8")
print("Wrote", OUT)
