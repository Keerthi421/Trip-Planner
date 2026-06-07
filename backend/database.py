import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "tripcraft.db")


def init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS trips (
            id                  TEXT PRIMARY KEY,
            user_name           TEXT,
            destination         TEXT,
            origin              TEXT,
            departure_date      TEXT,
            return_date         TEXT,
            duration_days       INTEGER,
            adults              INTEGER,
            children            INTEGER,
            budget_per_person   TEXT,
            currency            TEXT,
            accommodation_type  TEXT,
            trip_vibes          TEXT,
            pace                TEXT,
            hotels              TEXT,
            flights             TEXT,
            itinerary           TEXT,
            destination_overview TEXT,
            budget_summary      TEXT,
            created_at          TEXT
        )
    """)
    conn.commit()
    conn.close()


def _deserialize(row: dict) -> dict:
    for key in ("trip_vibes", "hotels", "flights", "itinerary"):
        row[key] = json.loads(row[key])
    return row


def save_trip(trip: dict) -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """INSERT INTO trips VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            trip["id"],
            trip["user_name"],
            trip["destination"],
            trip["origin"],
            trip["departure_date"],
            trip["return_date"],
            trip["duration_days"],
            trip["adults"],
            trip["children"],
            trip["budget_per_person"],
            trip["currency"],
            trip["accommodation_type"],
            json.dumps(trip["trip_vibes"]),
            trip["pace"],
            json.dumps(trip["hotels"]),
            json.dumps(trip["flights"]),
            json.dumps(trip["itinerary"]),
            trip["destination_overview"],
            trip["budget_summary"],
            trip["created_at"],
        ),
    )
    conn.commit()
    conn.close()


def get_all_trips() -> list:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM trips ORDER BY created_at DESC").fetchall()
    conn.close()
    return [_deserialize(dict(r)) for r in rows]


def get_trip(trip_id: str) -> dict | None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM trips WHERE id=?", (trip_id,)).fetchone()
    conn.close()
    return _deserialize(dict(row)) if row else None


def delete_trip(trip_id: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("DELETE FROM trips WHERE id=?", (trip_id,))
    conn.commit()
    conn.close()
