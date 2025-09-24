#!/usr/bin/env python3
"""Generate flashcard deck JSON files from the phrases directory."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set, Tuple

ROOT = Path(__file__).parent
PHRASES_DIR = ROOT / "phrases"
DECKS_DIR = ROOT / "decks"
MANIFEST_PATH = DECKS_DIR / "manifest.json"
DEFAULT_PRESETS_PATH = DECKS_DIR / "default-presets.json"
GENERATED_DECK_ID = "travel-phrases"

# Supported input formats for phrase files. The key is the file extension,
# the value is the delimiter used when parsing the file with ``csv``.
PHRASE_FORMATS: Dict[str, str] = {
    ".tsv": "\t",
    ".csv": ",",
}

DEFAULT_PRESETS: Sequence[Dict[str, Any]] = (
    {"name": "All Travel Phrases", "deckIds": [GENERATED_DECK_ID]},
)


def discover_phrase_files() -> List[Path]:
    """Return all CSV/TSV phrase files within the phrases directory."""

    if not PHRASES_DIR.exists():
        return []

    files: List[Path] = []
    for path in PHRASES_DIR.iterdir():
        if not path.is_file():
            continue
        if path.suffix.lower() in PHRASE_FORMATS:
            files.append(path)
    return sorted(files)


def parse_tags(raw: str) -> List[str]:
    """Normalize the tag column into a list of unique tags."""

    tags: List[str] = []
    seen: Set[str] = set()
    for piece in re.split(r"[;,]", raw or ""):
        tag = piece.strip()
        if not tag:
            continue
        normalized = tag.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        tags.append(tag)
    return tags


def load_phrases() -> List[Dict[str, Any]]:
    """Read every phrase file and return a combined list of cards."""

    cards: List[Dict[str, Any]] = []
    files = discover_phrase_files()
    for path in files:
        delimiter = PHRASE_FORMATS[path.suffix.lower()]
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle, delimiter=delimiter)
            fieldnames = reader.fieldnames or []
            missing: Set[str] = {
                column
                for column in (
                    "Tags",
                    "Traveler Usefulness (1-10)",
                    "English",
                    "Romanji",
                    "Japanese",
                )
                if column not in fieldnames
            }
            if missing:
                raise SystemExit(
                    f"{path.name} is missing required column(s): {', '.join(sorted(missing))}"
                )
            for row in reader:
                usefulness_raw = (row.get("Traveler Usefulness (1-10)") or "").strip()
                if not usefulness_raw:
                    continue

                try:
                    usefulness = int(usefulness_raw)
                except ValueError:
                    continue

                card = {
                    "english": (row.get("English") or "").strip(),
                    "romaji": (row.get("Romanji") or "").strip(),
                    "japanese": (row.get("Japanese") or "").strip(),
                    "tags": parse_tags(row.get("Tags", "")),
                    "usefulness": usefulness,
                }

                if not card["english"] and not card["japanese"] and not card["romaji"]:
                    continue

                cards.append(card)

    return cards


def normalize_card_key(card: Dict[str, Any]) -> Tuple[str, ...]:
    """Build a normalization key so duplicate phrases can be removed."""

    def normalize_latin(text: str) -> str:
        return re.sub(r"[^a-z0-9]+", "", text.lower())

    english = normalize_latin(card.get("english", ""))
    if english:
        return ("en", english)

    japanese = card.get("japanese", "").strip()
    if japanese:
        cleaned = re.sub(r"[\s\u3000。．\.?!！？、,，]+", "", japanese)
        if cleaned:
            return ("ja", cleaned)

    romaji = normalize_latin(card.get("romaji", ""))
    if romaji:
        return ("ro", romaji)

    fallback = (
        card.get("english", ""),
        card.get("romaji", ""),
        card.get("japanese", ""),
    )
    return ("fallback",) + fallback


def merge_tags(existing: Iterable[str], additional: Iterable[str]) -> List[str]:
    """Return a stable list of tags with duplicates removed."""

    combined: List[str] = []
    seen: Set[str] = set()
    for source in (existing, additional):
        for tag in source:
            normalized = tag.lower()
            if normalized in seen:
                continue
            seen.add(normalized)
            combined.append(tag)
    return combined


def deduplicate_cards(cards: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove duplicate cards while merging metadata and preserving order."""

    seen: Dict[Tuple[str, ...], Dict[str, Any]] = {}
    unique_cards: List[Dict[str, Any]] = []
    for card in cards:
        key = normalize_card_key(card)
        existing = seen.get(key)
        if existing:
            existing_tags = existing.get("tags", []) or []
            new_tags = card.get("tags", []) or []
            existing["tags"] = merge_tags(existing_tags, new_tags)

            existing_usefulness = existing.get("usefulness")
            new_usefulness = card.get("usefulness")
            if isinstance(new_usefulness, int):
                if not isinstance(existing_usefulness, int) or new_usefulness > existing_usefulness:
                    existing["usefulness"] = new_usefulness
            continue

        normalized_card = {
            "english": card.get("english", ""),
            "romaji": card.get("romaji", ""),
            "japanese": card.get("japanese", ""),
            "tags": list(card.get("tags", []) or []),
            "usefulness": card.get("usefulness"),
        }
        seen[key] = normalized_card
        unique_cards.append(normalized_card)
    return unique_cards


def write_deck(deck_id: str, title: str, description: str, cards: List[Dict[str, Any]]) -> None:
    deck_path = DECKS_DIR / f"{deck_id}.json"
    deck_data = {
        "id": deck_id,
        "title": title,
        "description": description,
        "cards": cards,
    }
    deck_path.write_text(json.dumps(deck_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_default_presets(available_decks: Set[str]) -> None:
    presets: List[Dict[str, Any]] = []
    for preset in DEFAULT_PRESETS:
        deck_ids = [deck_id for deck_id in preset.get("deckIds", []) if deck_id in available_decks]
        if not deck_ids:
            continue
        presets.append({"name": preset["name"], "deckIds": deck_ids})

    DEFAULT_PRESETS_PATH.write_text(
        json.dumps(presets, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def summarize_tags(cards: Sequence[Dict[str, Any]]) -> Tuple[int, List[str]]:
    """Return the number of unique tags and the sorted tag list."""

    tags: Set[str] = set()
    for card in cards:
        for tag in card.get("tags", []) or []:
            tags.add(tag)
    sorted_tags = sorted(tags, key=lambda value: value.lower())
    return len(tags), sorted_tags


def load_deck_metadata(deck_path: Path) -> Optional[Dict[str, str]]:
    """Read the deck JSON and return manifest metadata."""

    try:
        data = json.loads(deck_path.read_text(encoding="utf-8"))
    except Exception as error:  # pragma: no cover - defensive logging
        raise SystemExit(f"Unable to read deck file {deck_path.name}: {error}")

    deck_id = data.get("id") or deck_path.stem
    title = data.get("title") or deck_path.stem.replace("-", " ").title()
    description = data.get("description") or ""
    return {
        "id": deck_id,
        "title": title,
        "description": description,
        "file": deck_path.name,
    }


def main() -> None:
    phrases = load_phrases()

    if not phrases:
        raise SystemExit("No phrases were loaded from the phrases directory.")

    DECKS_DIR.mkdir(exist_ok=True)

    deduped_cards = deduplicate_cards(phrases)
    total_tags, _ = summarize_tags(deduped_cards)

    deck_title = "Travel Phrase Collection"
    deck_description = (
        f"Comprehensive travel phrases with {len(deduped_cards)} card(s)"
        f" and {total_tags} tag{'s' if total_tags != 1 else ''} for filtering."
    )

    write_deck(GENERATED_DECK_ID, deck_title, deck_description, deduped_cards)

    manifest_entries: List[Dict[str, str]] = []
    available_decks: Set[str] = set()

    for path in sorted(DECKS_DIR.glob("*.json")):
        if path.name in {MANIFEST_PATH.name, DEFAULT_PRESETS_PATH.name}:
            continue
        metadata = load_deck_metadata(path)
        if not metadata:
            continue
        manifest_entries.append(metadata)
        available_decks.add(metadata["id"])

    manifest_entries.sort(key=lambda entry: entry["title"].lower())

    MANIFEST_PATH.write_text(json.dumps(manifest_entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_default_presets(available_decks)


if __name__ == "__main__":
    main()
