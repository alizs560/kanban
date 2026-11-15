import os
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.auth import sessions
from app.main import app


class ChatApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_directory.name) / "kanban.db"
        self.previous_database_path = os.environ.get("KANBAN_DB_PATH")
        os.environ["KANBAN_DB_PATH"] = str(self.database_path)
        sessions.clear()
        self.client = TestClient(app)
        self.client.__enter__()
        login = self.client.post(
            "/api/auth/login",
            json={"username": "user", "password": "password"},
        )
        self.headers = {"Authorization": f"Bearer {login.json()['token']}"}

    def tearDown(self):
        self.client.__exit__(None, None, None)
        sessions.clear()
        if self.previous_database_path is None:
            os.environ.pop("KANBAN_DB_PATH", None)
        else:
            os.environ["KANBAN_DB_PATH"] = self.previous_database_path
        self.temp_directory.cleanup()

    @patch(
        "app.ai._call_openrouter",
        return_value={
            "choices": [
                {
                    "message": {
                        "content": '{"reply":"وضعیت برد بررسی شد.","updated_board":null}'
                    }
                }
            ]
        },
    )
    def test_chat_returns_reply_and_persists_history(self, _mock_call):
        response = self.client.post(
            "/api/chat",
            headers=self.headers,
            json={"message": "وضعیت برد چیست؟"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["reply"], "وضعیت برد بررسی شد.")
        self.assertFalse(response.json()["changed"])
        self.assertEqual(len(response.json()["board"]["cards"]), 10)

        connection = sqlite3.connect(self.database_path)
        try:
            self.assertEqual(
                connection.execute("SELECT COUNT(*) FROM chat_messages").fetchone()[0],
                2,
            )
        finally:
            connection.close()

