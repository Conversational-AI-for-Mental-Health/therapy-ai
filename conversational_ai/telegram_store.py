import json
import os
import sqlite3
import time
from typing import Dict, List

DB_PATH = os.environ.get("APP_SQLITE_PATH", "app.sqlite3")

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS telegram_conversations (
  chat_id INTEGER PRIMARY KEY,
  history_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
"""

def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def init_db() -> None:
    conn = _connect()
    try:
        conn.execute(SCHEMA_SQL)
        conn.commit()
    finally:
        conn.close()

def load_history(chat_id: int) -> List[Dict[str, str]]:
    assert isinstance(chat_id, int)
    conn = _connect()
    try:
        cur = conn.execute(
            "SELECT history_json FROM telegram_conversations WHERE chat_id = ?",
            (chat_id,),
        )
        row = cur.fetchone()
        if row is None:
            return []
        history = json.loads(row[0])
        assert isinstance(history, list)
        for m in history:
            assert isinstance(m, dict)
            assert isinstance(m.get("role"), str)
            assert isinstance(m.get("content"), str)
        return history
    finally:
        conn.close()

def save_history(chat_id: int, history: List[Dict[str, str]]) -> None:
    assert isinstance(chat_id, int)
    assert isinstance(history, list)
    for m in history:
        assert isinstance(m, dict)
        assert isinstance(m.get("role"), str)
        assert isinstance(m.get("content"), str)

    conn = _connect()
    try:
        conn.execute(
            """
            INSERT INTO telegram_conversations(chat_id, history_json, updated_at)
            VALUES(?, ?, ?)
            ON CONFLICT(chat_id) DO UPDATE SET
              history_json = excluded.history_json,
              updated_at = excluded.updated_at
            """,
            (chat_id, json.dumps(history, ensure_ascii=False), int(time.time())),
        )
        conn.commit()
    finally:
        conn.close()

def truncate_history(history: List[Dict[str, str]], max_turns: int) -> List[Dict[str, str]]:
    assert isinstance(max_turns, int) and max_turns >= 1
    max_msgs = max_turns * 2
    if len(history) <= max_msgs:
        return history
    return history[-max_msgs:]
