import os
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from app.auth import sessions
from app.main import app


class BoardApiTests(unittest.TestCase):
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

    def test_board_can_be_loaded_and_card_move_is_persisted(self):
        first = self.client.get("/api/board", headers=self.headers)
        self.assertEqual(first.status_code, 200)
        board = first.json()
        card = next(item for item in board["cards"] if item["columnId"] != board["columns"][-1]["id"])
        target_column_id = board["columns"][-1]["id"]
        card["columnId"] = target_column_id

        saved = self.client.put(
            "/api/board", headers=self.headers, json=board
        )
        self.assertEqual(saved.status_code, 200)

        reloaded = self.client.get("/api/board", headers=self.headers).json()
        persisted_card = next(item for item in reloaded["cards"] if item["id"] == card["id"])
        self.assertEqual(persisted_card["columnId"], target_column_id)

