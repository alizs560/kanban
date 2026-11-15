from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from .auth import get_current_user_id
from .database import transaction


router = APIRouter(prefix="/api/board", tags=["board"])


class LocalizedText(BaseModel):
    en: str
    fa: str


class Phase(BaseModel):
    id: str
    label: LocalizedText
    badgeClass: str = ""


class Column(BaseModel):
    id: str
    name: LocalizedText


class Card(BaseModel):
    id: str
    columnId: str
    title: LocalizedText
    details: LocalizedText
    phase: str | None = None


class BoardState(BaseModel):
    columns: list[Column] = Field(default_factory=list)
    cards: list[Card] = Field(default_factory=list)
    phases: list[Phase] = Field(default_factory=list)


def _board_id_for_user(connection, user_id: int) -> int:
    row = connection.execute(
        "SELECT id FROM boards WHERE user_id = ?", (user_id,)
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="board_not_found",
        )
    return row["id"]


def load_board(user_id: int) -> BoardState:
    with transaction() as connection:
        board_id = _board_id_for_user(connection, user_id)
        phases = [
            Phase(
                id=str(row["id"]),
                label={"en": row["label_en"], "fa": row["label_fa"]},
                badgeClass=f"phase-badge-{row['key']}",
            )
            for row in connection.execute(
                """
                SELECT id, key, label_en, label_fa
                FROM phases
                WHERE board_id = ?
                ORDER BY sort_order, id
                """,
                (board_id,),
            )
        ]
        columns = [
            Column(
                id=str(row["id"]),
                name={"en": row["name_en"], "fa": row["name_fa"]},
            )
            for row in connection.execute(
                """
                SELECT id, name_en, name_fa
                FROM columns
                WHERE board_id = ?
                ORDER BY sort_order, id
                """,
                (board_id,),
            )
        ]
        cards = [
            Card(
                id=str(row["id"]),
                columnId=str(row["column_id"]),
                title={"en": row["title_en"], "fa": row["title_fa"]},
                details={"en": row["details_en"], "fa": row["details_fa"]},
                phase=str(row["phase_id"]) if row["phase_id"] is not None else None,
            )
            for row in connection.execute(
                """
                SELECT id, column_id, phase_id, title_en, title_fa, details_en, details_fa
                FROM cards
                WHERE column_id IN (SELECT id FROM columns WHERE board_id = ?)
                ORDER BY column_id, sort_order, id
                """,
                (board_id,),
            )
        ]
    return BoardState(columns=columns, cards=cards, phases=phases)


def _existing_id(value: str, valid_ids: set[int]) -> int | None:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None
    return parsed if parsed in valid_ids else None


def save_board(user_id: int, board: BoardState) -> BoardState:
    with transaction() as connection:
        board_id = _board_id_for_user(connection, user_id)
        existing_columns = {
            row["id"]
            for row in connection.execute(
                "SELECT id FROM columns WHERE board_id = ?", (board_id,)
            )
        }
        existing_phases = {
            row["id"]
            for row in connection.execute(
                "SELECT id FROM phases WHERE board_id = ?", (board_id,)
            )
        }
        existing_cards = {
            row["id"]
            for row in connection.execute(
                """
                SELECT cards.id
                FROM cards
                JOIN columns ON columns.id = cards.column_id
                WHERE columns.board_id = ?
                """,
                (board_id,),
            )
        }

        column_map: dict[str, int] = {}
        for sort_order, column in enumerate(board.columns):
            column_id = _existing_id(column.id, existing_columns)
            if column_id is None:
                cursor = connection.execute(
                    """
                    INSERT INTO columns(board_id, name_en, name_fa, sort_order)
                    VALUES (?, ?, ?, ?)
                    """,
                    (board_id, column.name.en, column.name.fa, sort_order),
                )
                column_id = cursor.lastrowid
            else:
                connection.execute(
                    """
                    UPDATE columns
                    SET name_en = ?, name_fa = ?
                    WHERE id = ? AND board_id = ?
                    """,
                    (column.name.en, column.name.fa, column_id, board_id),
                )
            column_map[column.id] = column_id

        phase_map: dict[str, int] = {}
        for sort_order, phase in enumerate(board.phases):
            phase_id = _existing_id(phase.id, existing_phases)
            if phase_id is None:
                cursor = connection.execute(
                    """
                    INSERT INTO phases(board_id, key, label_en, label_fa, sort_order)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        board_id,
                        phase.id,
                        phase.label.en,
                        phase.label.fa,
                        sort_order,
                    ),
                )
                phase_id = cursor.lastrowid
            else:
                connection.execute(
                    """
                    UPDATE phases
                    SET label_en = ?, label_fa = ?
                    WHERE id = ? AND board_id = ?
                    """,
                    (phase.label.en, phase.label.fa, phase_id, board_id),
                )
            phase_map[phase.id] = phase_id

        connection.execute(
            """
            UPDATE columns
            SET sort_order = -id
            WHERE board_id = ?
            """,
            (board_id,),
        )
        for sort_order, column in enumerate(board.columns):
            connection.execute(
                "UPDATE columns SET sort_order = ? WHERE id = ?",
                (sort_order, column_map[column.id]),
            )

        connection.execute(
            """
            UPDATE phases
            SET sort_order = -id
            WHERE board_id = ?
            """,
            (board_id,),
        )
        for sort_order, phase in enumerate(board.phases):
            connection.execute(
                "UPDATE phases SET sort_order = ? WHERE id = ?",
                (sort_order, phase_map[phase.id]),
            )

        connection.execute(
            """
            UPDATE cards
            SET sort_order = -id
            WHERE column_id IN (SELECT id FROM columns WHERE board_id = ?)
            """,
            (board_id,),
        )

        card_map: dict[str, int] = {}
        for sort_order, card in enumerate(board.cards):
            column_id = column_map.get(card.columnId)
            if column_id is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="card_column_not_found",
                )
            phase_id = phase_map.get(card.phase) if card.phase is not None else None
            card_id = _existing_id(card.id, existing_cards)
            if card_id is None:
                cursor = connection.execute(
                    """
                    INSERT INTO cards(
                        column_id, phase_id, title_en, title_fa, details_en, details_fa,
                        sort_order, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    """,
                    (
                        column_id,
                        phase_id,
                        card.title.en,
                        card.title.fa,
                        card.details.en,
                        card.details.fa,
                        sort_order,
                    ),
                )
                card_id = cursor.lastrowid
            else:
                connection.execute(
                    """
                    UPDATE cards
                    SET column_id = ?, phase_id = ?, title_en = ?, title_fa = ?,
                        details_en = ?, details_fa = ?, sort_order = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    """,
                    (
                        column_id,
                        phase_id,
                        card.title.en,
                        card.title.fa,
                        card.details.en,
                        card.details.fa,
                        sort_order,
                        card_id,
                    ),
                )
            card_map[card.id] = card_id

        if existing_cards:
            kept_cards = set(card_map.values())
            delete_ids = [card_id for card_id in existing_cards if card_id not in kept_cards]
            if delete_ids:
                connection.execute(
                    f"DELETE FROM cards WHERE id IN ({','.join('?' for _ in delete_ids)})",
                    delete_ids,
                )

        kept_columns = set(column_map.values())
        omitted_columns = existing_columns - kept_columns
        if omitted_columns:
            connection.execute(
                f"DELETE FROM columns WHERE id IN ({','.join('?' for _ in omitted_columns)})",
                list(omitted_columns),
            )

        kept_phases = set(phase_map.values())
        omitted_phases = existing_phases - kept_phases
        if omitted_phases:
            connection.execute(
                f"DELETE FROM phases WHERE id IN ({','.join('?' for _ in omitted_phases)})",
                list(omitted_phases),
            )

        connection.execute(
            "UPDATE boards SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (board_id,),
        )

    return load_board(user_id)


@router.get("", response_model=BoardState)
async def get_board(
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> BoardState:
    return load_board(user_id)


@router.put("", response_model=BoardState)
async def put_board(
    board: BoardState,
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> BoardState:
    return save_board(user_id, board)
