import os
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from app.auth import sessions
from app.main import app


class AuthenticationTests(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        self.database_path = Path(self.temp_directory.name) / "kanban.db"
        self.previous_database_path = os.environ.get("KANBAN_DB_PATH")
        os.environ["KANBAN_DB_PATH"] = str(self.database_path)
        sessions.clear()
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        sessions.clear()
        if self.previous_database_path is None:
            os.environ.pop("KANBAN_DB_PATH", None)
        else:
            os.environ["KANBAN_DB_PATH"] = self.previous_database_path
        self.temp_directory.cleanup()

    def test_login_returns_token_for_valid_credentials(self):
        response = self.client.post(
            "/api/auth/login",
            json={"username": " user ", "password": "password"},
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["token"].startswith("token-user-"))
        self.assertEqual(body["user"], {"username": "user"})

        me = self.client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {body['token']}"},
        )
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json(), {"username": "user"})

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post(
            "/api/auth/login",
            json={"username": "user", "password": "wrong"},
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "invalid_credentials")

    def test_protected_route_rejects_missing_or_unknown_token(self):
        missing = self.client.get("/api/auth/me")
        unknown = self.client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer token-user-unknown"},
        )

        self.assertEqual(missing.status_code, 401)
        self.assertEqual(unknown.status_code, 401)


if __name__ == "__main__":
    unittest.main()
