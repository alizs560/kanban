from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from .auth import get_current_user_id
from .board import BoardState, load_board, save_board
from .database import connect, transaction


load_dotenv(Path(__file__).resolve().parents[2] / ".env")

router = APIRouter(prefix="/api/chat", tags=["chat"])
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    reply: str
    board: BoardState
    changed: bool


def _board_id(user_id: int) -> int:
    connection = connect()
    try:
        row = connection.execute(
            "SELECT id FROM boards WHERE user_id = ?", (user_id,)
        ).fetchone()
    finally:
        connection.close()
    if row is None:
        raise HTTPException(status_code=404, detail="board_not_found")
    return row["id"]


def _history(user_id: int, board_id: int) -> list[dict[str, str]]:
    connection = connect()
    try:
        rows = connection.execute(
            """
            SELECT role, content
            FROM chat_messages
            WHERE user_id = ? AND board_id = ?
            ORDER BY created_at DESC, id DESC
            LIMIT 20
            """,
            (user_id, board_id),
        ).fetchall()
    finally:
        connection.close()
    return [{"role": row["role"], "content": row["content"]} for row in reversed(rows)]


def _call_openrouter(messages: list[dict[str, str]]) -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="openrouter_api_key_missing",
        )

    payload = {
        "model": os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-120b"),
        "messages": messages,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }
    request = Request(
        OPENROUTER_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://127.0.0.1:8000",
            "X-Title": "LOOM Kanban",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"openrouter_request_failed: {detail[:500]}",
        ) from error
    except (URLError, TimeoutError) as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="openrouter_unreachable",
        ) from error
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="openrouter_invalid_response",
        ) from error


def _parse_ai_response(response: dict) -> tuple[str, BoardState | None]:
    try:
        content = response["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        reply = parsed["reply"]
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="openrouter_invalid_structured_response",
        ) from error

    if not isinstance(reply, str) or not reply.strip():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="openrouter_empty_reply",
        )
    updated_board = parsed.get("updated_board")
    return reply.strip(), BoardState.model_validate(updated_board) if updated_board else None


def _system_prompt(board: BoardState) -> str:
    serialized_board = json.dumps(
        board.model_dump(by_alias=True), ensure_ascii=False
    )
    return f"""
You are the LOOM Kanban assistant.
Respond only as a JSON object with this shape:
{{"reply": "Persian or English response", "updated_board": null or a complete board object}}

The board object must contain columns, cards, and phases. Preserve existing IDs.
Only set updated_board when the user asks to create, edit, delete, or move cards,
columns, or phases. Keep all unaffected data unchanged.
Card columnId must reference a column id. Card phase must reference a phase id or null.
Current board:
{serialized_board}
""".strip()


def _store_message(user_id: int, board_id: int, role: str, content: str, snapshot: str | None = None) -> None:
    with transaction() as connection:
        connection.execute(
            """
            INSERT INTO chat_messages(board_id, user_id, role, content, board_snapshot)
            VALUES (?, ?, ?, ?, ?)
            """,
            (board_id, user_id, role, content, snapshot),
        )


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    user_id: int = Depends(get_current_user_id),
) -> ChatResponse:
    current_board = load_board(user_id)
    board_id = _board_id(user_id)
    snapshot = json.dumps(current_board.model_dump(by_alias=True), ensure_ascii=False)
    messages = [
        {"role": "system", "content": _system_prompt(current_board)},
        *_history(user_id, board_id),
        {"role": "user", "content": payload.message.strip()},
    ]
    response = _call_openrouter(messages)
    reply, updated_board = _parse_ai_response(response)

    result_board = current_board
    if updated_board is not None:
        result_board = save_board(user_id, updated_board)
    _store_message(user_id, board_id, "user", payload.message.strip(), snapshot)
    _store_message(user_id, board_id, "assistant", reply)
    return ChatResponse(
        reply=reply,
        board=result_board,
        changed=updated_board is not None,
    )
