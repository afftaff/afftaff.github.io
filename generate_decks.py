#!/usr/bin/env python3
"""Generate flashcard deck JSON files from phrases.tsv.

This script groups phrases by category, subcategory, and traveler usefulness
and produces a JSON deck for each grouping. It also creates an updated
manifest so the front-end can enumerate all decks.
"""

from __future__ import annotations

import csv
import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).parent
TSV_PATH = ROOT / "phrases.tsv"
DECKS_DIR = ROOT / "decks"
MANIFEST_PATH = DECKS_DIR / "manifest.json"


def slugify(text: str) -> str:
    """Create a filesystem-safe slug from the provided text."""
    normalized = text.strip().lower()
    # Replace ampersands with a readable alternative.
    normalized = normalized.replace("&", " and ")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def load_phrases() -> Dict[Tuple[str, str, int], List[Dict[str, str]]]:
    """Read the TSV file and group rows by category/subcategory/usefulness."""
    groupings: Dict[Tuple[str, str, int], List[Dict[str, str]]] = defaultdict(list)
    with TSV_PATH.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            category = row["Category"].strip()
            subcategory = row["Subcategory"].strip()
            usefulness_raw = row["Traveler Usefulness (1-10)"].strip()
            english = row["English"].strip()
            romaji = row["Romanji"].strip()
            japanese = row["Japanese"].strip()

            if not category or not subcategory or not usefulness_raw:
                # Skip malformed entries while keeping generation robust.
                continue

            try:
                usefulness = int(usefulness_raw)
            except ValueError:
                # Ignore rows with a non-numeric usefulness rating.
                continue

            key = (category, subcategory, usefulness)
            groupings[key].append({
                "english": english,
                "romaji": romaji,
                "japanese": japanese,
            })
    return groupings


def write_deck(deck_id: str, title: str, description: str, cards: List[Dict[str, str]]) -> None:
    deck_path = DECKS_DIR / f"{deck_id}.json"
    deck_data = {
        "id": deck_id,
        "title": title,
        "description": description,
        "cards": cards,
    }
    deck_path.write_text(json.dumps(deck_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")



def main() -> None:
    groupings = load_phrases()

    if not groupings:
        raise SystemExit("No phrases were loaded from the TSV file.")

    DECKS_DIR.mkdir(exist_ok=True)

    # Remove existing deck files (except for the manifest, which we'll replace).
    for path in DECKS_DIR.glob("*.json"):
        if path == MANIFEST_PATH:
            continue
        path.unlink()

    manifest_entries = []

    for category, subcategory, usefulness in sorted(
        groupings,
        key=lambda item: (item[0].lower(), item[1].lower(), -item[2]),
    ):
        cards = groupings[(category, subcategory, usefulness)]
        deck_slug = f"{slugify(category)}-{slugify(subcategory)}-u{usefulness}"
        title = f"{category}: {subcategory} (Usefulness {usefulness})"
        description = (
            f"Traveler usefulness {usefulness}/10 phrases for the {subcategory} subcategory"
            f" within {category}. Includes {len(cards)} card(s)."
        )

        write_deck(deck_slug, title, description, cards)

        manifest_entries.append({
            "id": deck_slug,
            "title": title,
            "description": description,
            "file": f"{deck_slug}.json",
        })

    MANIFEST_PATH.write_text(json.dumps(manifest_entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
