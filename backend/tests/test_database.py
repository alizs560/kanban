import sqlite3
import tempfile
import unittest
from pathlib import Path

from app.database import initialize_database, verify_password


class DatabaseInitializationTests(unittest.TestCase):
    def test_initialization_creates_schema_and_seed_data(self):
        with tempfile.TemporaryDirectory() as directory:
            database_path = Path(directory) / "kanban.db"

            initialize_database(database_path)

            connection = sqlite3.connect(database_path)
            try:
                tables = {
                    row[0]
                    for row in connection.execute(
                        "SELECT name FROM sqlite_master WHERE type = 'table'"
                    )
                }
                self.assertTrue(
                    {"users", "boards", "phases", "columns", "cards", "chat_messages"}
                    <= tables
                )
                user = connection.execute(
                    "SELECT username, password_hash FROM users"
                ).fetchone()
                self.assertEqual(user[0], "user")
                self.assertTrue(verify_password("password", user[1]))
                self.assertFalse(verify_password("wrong", user[1]))
                self.assertEqual(
                    connection.execute("SELECT COUNT(*) FROM boards").fetchone()[0], 1
                )
                self.assertEqual(
                    connection.execute("SELECT COUNT(*) FROM cards").fetchone()[0], 10
                )
            finally:
                connection.close()

    def test_initialization_is_idempotent(self):
        with tempfile.TemporaryDirectory() as directory:
            database_path = Path(directory) / "kanban.db"

            initialize_database(database_path)
            initialize_database(database_path)

            connection = sqlite3.connect(database_path)
            try:
                self.assertEqual(
                    connection.execute("SELECT COUNT(*) FROM users").fetchone()[0], 1
                )
                self.assertEqual(
                    connection.execute("SELECT COUNT(*) FROM cards").fetchone()[0], 10
                )
            finally:
                connection.close()


if __name__ == "__main__":
    unittest.main()
