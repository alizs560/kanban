from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATABASE_PATH = BACKEND_DIR / "data" / "kanban.db"
PASSWORD_ITERATIONS = 310_000


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    label_en TEXT NOT NULL,
    label_fa TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (board_id, key),
    UNIQUE (board_id, sort_order),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    name_en TEXT NOT NULL,
    name_fa TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (board_id, sort_order),
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    column_id INTEGER NOT NULL,
    phase_id INTEGER,
    title_en TEXT NOT NULL,
    title_fa TEXT NOT NULL,
    details_en TEXT NOT NULL DEFAULT '',
    details_fa TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'P3' CHECK (priority IN ('P1', 'P2', 'P3')),
    sort_order INTEGER NOT NULL,
    start_date TEXT,
    due_date TEXT,
    cover_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (column_id, sort_order),
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
    FOREIGN KEY (phase_id) REFERENCES phases(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    board_snapshot TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username ON users(username);
CREATE INDEX IF NOT EXISTS ix_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS ix_phases_board_id ON phases(board_id);
CREATE INDEX IF NOT EXISTS ix_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS ix_cards_column_id ON cards(column_id);
CREATE INDEX IF NOT EXISTS ix_cards_phase_id ON cards(phase_id);
CREATE INDEX IF NOT EXISTS ix_chat_messages_board_created_at
    ON chat_messages(board_id, created_at);
CREATE INDEX IF NOT EXISTS ix_chat_messages_user_id ON chat_messages(user_id);
"""


PHASES = (
    ("brand", "Brand & Identity", "هویت بصری"),
    ("uiux", "UI/UX & Prototype", "طراحی تجربه و رابط کاربری"),
    ("frontend", "Frontend & Motion", "توسعه فرانت‌اند"),
    ("backend", "Backend & Architecture", "توسعه بک‌اند"),
    ("launch", "QA & Launch", "انتشار و سئو"),
)

COLUMNS = (
    ("To Do", "لیست کارها"),
    ("In Progress", "در حال انجام"),
    ("Done", "تکمیل شده"),
)

COLUMN_KEYS = {
    "To Do": "todo",
    "In Progress": "in-progress",
    "Done": "done",
}

CARDS = (
    ("done", "brand", "Define Visual Identity & Brand DNA", "روایت برند و هویت بصری شاخص",
     "Craft the design language with deep navy, vibrant blue, and golden accents.",
     "تعریف زبان طراحی با پالت اختصاصی سرمه‌ای، آبی درخشان و خطوط تأکیدی طلایی.", "P2"),
    ("todo", "brand", "Curate Typography & Modular Grid", "تایپوگرافی دوزبانه و شبکه ماژولار",
     "Pair local Peyda font with a modern Latin sans across a responsive grid.",
     "ترکیب قلم پیدا با تایپوگرافی مدرن لاتین و تنظیم ریتم عمودی و گرید.", "P2"),
    ("todo", "uiux", "Map User Journey & Interactive Prototype", "معماری جریان کاربر و پروتوتایپ تعاملی",
     "Design a frictionless showcase exploration and filtering experience.",
     "طراحی مسیر روان بازدید نمونه‌کارها و سناریوهای تعامل.", "P2"),
    ("todo", "uiux", "Atomic Design System & Glass Surfaces", "کتابخانه اجزا و سطوح شیشه‌ای مات",
     "Document button states, frosted glass cards, and motion tokens.",
     "مستندسازی کامپوننت‌های اتمیک، کارت‌های شیشه‌ای و الگوهای حرکتی.", "P3"),
    ("in-progress", "frontend", "Build Dynamic Portfolio Showcase", "پیاده‌سازی گالری سه‌بعدی و کارت‌ها",
     "Build responsive Next.js components with drag-and-drop feedback.",
     "توسعه کامپوننت‌های نکست با درگ‌اند‌دراپ تعاملی.", "P1"),
    ("todo", "frontend", "Refine Parallax & Tactile Hover Physics", "پرداخت انیمیشن‌های پارالاکس و لمسی",
     "Add magnetic cursors, tilt physics, and smooth scrolling.",
     "افزودن نشانگر مگنتی، فیزیک چرخش نرم کارت‌ها و پیمایش روان.", "P3"),
    ("todo", "backend", "FastAPI Endpoints & Database Engine", "معماری API پرسرعت و پایگاه داده",
     "Design FastAPI routes and the multi-user SQLite data model.",
     "طراحی روت‌های FastAPI و شمای ارتباطی چندکاربره.", "P1"),
    ("todo", "backend", "OpenRouter AI Intelligence Assistant", "اتصال دستیار هوش مصنوعی OpenRouter",
     "Wire the gpt-oss-120b assistant to structured board actions.",
     "پیاده‌سازی دستیار هوشمند برای دستکاری ساختاریافته تخته.", "P1"),
    ("todo", "launch", "Multi-Stage Docker & uv Container", "بسته‌بندی کانتینر داکر با ابزار uv",
     "Package the static frontend and FastAPI server in one container.",
     "تولید ایمیج داکر حاوی بیلد استاتیک و سرور FastAPI.", "P2"),
    ("todo", "launch", "Lighthouse 100/100 Benchmark & Launch", "کسب امتیاز ۱۰۰ لایت‌هاوس و انتشار عمومی",
     "Optimize technical SEO, loading performance, and offline fonts.",
     "بهینه‌سازی سئو، سرعت بارگذاری و فونت‌های محلی.", "P2"),
)


def _database_path(database_path: str | Path | None = None) -> Path:
    configured_path = database_path or os.getenv("KANBAN_DB_PATH")
    return Path(configured_path) if configured_path else DEFAULT_DATABASE_PATH


def connect(database_path: str | Path | None = None) -> sqlite3.Connection:
    path = _database_path(database_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA journal_mode = WAL")
    return connection


@contextmanager
def transaction(database_path: str | Path | None = None) -> Iterator[sqlite3.Connection]:
    connection = connect(database_path)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, encoded_hash: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = encoded_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
        return hmac.compare_digest(candidate.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def initialize_database(database_path: str | Path | None = None) -> Path:
    path = _database_path(database_path)
    with transaction(path) as connection:
        connection.executescript(SCHEMA_SQL)
        connection.execute(
            "INSERT OR IGNORE INTO schema_migrations(version) VALUES (?)", (1,)
        )
        user_count = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if user_count == 0:
            _seed_default_board(connection)
    return path


def _seed_default_board(connection: sqlite3.Connection) -> None:
    cursor = connection.execute(
        "INSERT INTO users(username, password_hash) VALUES (?, ?)",
        ("user", hash_password("password")),
    )
    user_id = cursor.lastrowid
    cursor = connection.execute(
        "INSERT INTO boards(user_id, title) VALUES (?, ?)",
        (user_id, "Portfolio Website"),
    )
    board_id = cursor.lastrowid

    phase_ids: dict[str, int] = {}
    for sort_order, (key, label_en, label_fa) in enumerate(PHASES):
        cursor = connection.execute(
            """
            INSERT INTO phases(board_id, key, label_en, label_fa, sort_order)
            VALUES (?, ?, ?, ?, ?)
            """,
            (board_id, key, label_en, label_fa, sort_order),
        )
        phase_ids[key] = cursor.lastrowid

    column_ids: dict[str, int] = {}
    for sort_order, (name_en, name_fa) in enumerate(COLUMNS):
        cursor = connection.execute(
            """
            INSERT INTO columns(board_id, name_en, name_fa, sort_order)
            VALUES (?, ?, ?, ?)
            """,
            (board_id, name_en, name_fa, sort_order),
        )
        column_ids[COLUMN_KEYS[name_en]] = cursor.lastrowid

    column_card_orders: dict[int, int] = {}
    for card in CARDS:
        column_key, phase_key, title_en, title_fa, details_en, details_fa, priority = card
        column_id = column_ids[column_key]
        sort_order = column_card_orders.get(column_id, 0)
        connection.execute(
            """
            INSERT INTO cards(
                column_id, phase_id, title_en, title_fa, details_en, details_fa,
                priority, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                column_id,
                phase_ids[phase_key],
                title_en,
                title_fa,
                details_en,
                details_fa,
                priority,
                sort_order,
            ),
        )
        column_card_orders[column_id] = sort_order + 1
