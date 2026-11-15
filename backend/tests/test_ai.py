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

    def test_chat_creates_multiple_cards(self):
        board_res = self.client.get("/api/board", headers=self.headers)
        current_board = board_res.json()
        target_col = current_board["columns"][0]["id"]

        import copy, json
        new_board = copy.deepcopy(current_board)
        new_board["cards"].append({
            "id": "card-ai-1",
            "columnId": target_col,
            "title": {"en": "AI Test Card 1", "fa": "کارت تستی هوش مصنوعی ۱"},
            "details": {"en": "Created via AI", "fa": "ایجاد شده توسط هوش مصنوعی"},
            "phase": None,
        })
        new_board["cards"].append({
            "id": "card-ai-2",
            "columnId": target_col,
            "title": {"en": "AI Test Card 2", "fa": "کارت تستی هوش مصنوعی ۲"},
            "details": {"en": "Created via AI 2", "fa": "ایجاد شده توسط هوش مصنوعی ۲"},
            "phase": None,
        })

        ai_payload = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps({
                            "reply": "دو کارت جدید به ستون اول افزوده شد.",
                            "updated_board": new_board,
                        })
                    }
                }
            ]
        }

        with patch("app.ai._call_openrouter", return_value=ai_payload):
            response = self.client.post(
                "/api/chat",
                headers=self.headers,
                json={"message": "دو تا تسک تستی اضافه کن"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["changed"])
        self.assertEqual(len(response.json()["board"]["cards"]), 12)

    def test_chat_moves_card_between_columns(self):
        board_res = self.client.get("/api/board", headers=self.headers)
        current_board = board_res.json()
        first_card = current_board["cards"][0]
        done_col = current_board["columns"][-1]["id"]

        import copy, json
        new_board = copy.deepcopy(current_board)
        new_board["cards"][0]["columnId"] = done_col

        ai_payload = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps({
                            "reply": "کارت به ستون تکمیل شده منتقل گردید.",
                            "updated_board": new_board,
                        })
                    }
                }
            ]
        }

        with patch("app.ai._call_openrouter", return_value=ai_payload):
            response = self.client.post(
                "/api/chat",
                headers=self.headers,
                json={"message": "کارت اول را به ستون تکمیل شده ببر"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["changed"])
        card_in_res = next(c for c in response.json()["board"]["cards"] if c["title"]["en"] == first_card["title"]["en"])
        self.assertEqual(card_in_res["columnId"], done_col)

    def test_chat_history_and_undo(self):
        # 1. Ask a question that changes the board
        board_res = self.client.get("/api/board", headers=self.headers)
        initial_board = board_res.json()
        initial_count = len(initial_board["cards"])

        import copy, json
        new_board = copy.deepcopy(initial_board)
        new_board["cards"].append({
            "id": "card-undo-test",
            "columnId": initial_board["columns"][0]["id"],
            "title": {"en": "Temporary Card", "fa": "کارت موقت"},
            "details": {"en": "Details", "fa": "توضیحات"},
            "phase": None,
        })

        ai_payload = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps({
                            "reply": "یک کارت جدید اضافه شد.",
                            "updated_board": new_board,
                        })
                    }
                }
            ]
        }

        with patch("app.ai._call_openrouter", return_value=ai_payload):
            self.client.post(
                "/api/chat",
                headers=self.headers,
                json={"message": "کارت موقت بساز"},
            )

        # Check history
        history_res = self.client.get("/api/chat/history", headers=self.headers)
        self.assertEqual(history_res.status_code, 200)
        history_data = history_res.json()
        self.assertTrue(history_data["canUndo"])
        self.assertGreaterEqual(len(history_data["messages"]), 2)

        # 2. Call Undo
        undo_res = self.client.post("/api/chat/undo", headers=self.headers)
        self.assertEqual(undo_res.status_code, 200)
        undo_data = undo_res.json()
        self.assertTrue(undo_data["restored"])
        self.assertEqual(len(undo_data["board"]["cards"]), initial_count)

        # Verify board reloaded from DB
        reloaded = self.client.get("/api/board", headers=self.headers).json()
        self.assertEqual(len(reloaded["cards"]), initial_count)

