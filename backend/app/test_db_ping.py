from sqlalchemy import text
from backend.app.db import engine


with engine.connect() as conn:
    print("DB OK:", conn.execute(text("SELECT 1")).scalar())
