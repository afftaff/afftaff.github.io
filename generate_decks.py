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
from typing import Any, Dict, List, Set, Tuple

ROOT = Path(__file__).parent
TSV_PATH = ROOT / "phrases.tsv"
DECKS_DIR = ROOT / "decks"
MANIFEST_PATH = DECKS_DIR / "manifest.json"
DEFAULT_PRESETS_PATH = DECKS_DIR / "default-presets.json"


def slugify(text: str) -> str:
    """Create a filesystem-safe slug from the provided text."""
    normalized = text.strip().lower()
    # Replace ampersands with a readable alternative.
    normalized = normalized.replace("&", " and ")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


USEFULNESS_BUCKETS: Tuple[Tuple[str, int, int], ...] = (
    ("1-5", 1, 5),
    ("5-10", 5, 10),
)

DEFAULT_PRESETS_SPEC: List[Dict[str, Any]] = [
    {"name": "Politeness & Gratitude", "categories": ["Apologies", "Polite Expressions", "Gratitude", "Farewells", "Common Phrases"]},
    {"name": "Greetings & Introductions", "categories": ["Greetings", "Introductions", "Social", "Feelings", "Small Talk"]},
    {"name": "Nightlife Connections", "categories": ["Entertainment", "Social", "Requests", "Preferences"]},
    {"name": "Communication Lifelines", "categories": ["Communication Help", "Language Help", "Information"]},
    {"name": "Questions & Responses", "categories": ["Questions", "Common Responses"]},
    {"name": "Requests & Preferences", "categories": ["Requests", "Preferences", "Polite Expressions"]},
    {"name": "Navigation Basics", "categories": ["Directions", "Asking for Directions", "Travel", "Location"]},
    {"name": "Transit Logistics", "categories": ["Transportation", "Business Hours"]},
    {"name": "Counting & Comparisons", "categories": ["Counting", "Comparisons"]},
    {"name": "Time & Schedules", "categories": ["Telling Time", "Making Plans"]},
    {"name": "Hotel & Concierge", "categories": ["At the Hotel", "Renting", "Information", "Lost & Found"]},
    {"name": "Postal & Practicalities", "categories": ["Postal Service", "Money Exchange", "Money", "Business Hours"]},
    {"name": "Shopping Essentials", "categories": ["Shopping", "Shopping & Money", "Clothing"]},
    {"name": "Market Interactions", "categories": ["Shopping & Restaurants", "Money", "Money Exchange"]},
    {"name": "Dining Out", "categories": ["At a Restaurant", "Shopping & Restaurants"]},
    {"name": "Dietary Support", "categories": ["Dietary Needs", "Health (Allergies)"]},
    {"name": "Food Adventures", "categories": ["Food"]},
    {"name": "Health Essentials", "categories": ["Health", "Health (Pharmacy)"]},
    {"name": "Body Focus", "categories": ["Health (Body Parts)"]},
    {"name": "Emergency Response", "categories": ["Emergency", "Rules", "Health (Pharmacy)"]},
    {"name": "Connected Traveler", "categories": ["Internet & Technology", "Communication Help", "Travel"]},
    {"name": "Service Errands", "categories": ["Postal Service", "Lost & Found", "Information"]},
    {"name": "Customer Care", "categories": ["Shopping & Restaurants", "Polite Expressions", "Requests"]},
    {"name": "Vocabulary: Food Staples", "decks": ["vocabulary-food-u5-10"]},
    {"name": "Vocabulary: Places & Routes", "decks": ["vocabulary-places-and-things-u5-10"]},
    {
        "name": "Vocabulary: Concepts & Expressions",
        "decks": [
            "vocabulary-concepts-u5-10",
            "vocabulary-exclamations-u5-10",
            "vocabulary-animals-u5-10",
            "nature-plants-u5-10",
            "weather-temperature-u5-10",
        ],
    },
    {"name": "Vocabulary: Action Verbs", "decks": ["vocabulary-verbs-u5-10"]},
    {
        "name": "Vocabulary: Descriptive Language",
        "categories": ["Descriptions"],
        "decks": ["vocabulary-adjectives-u5-10"],
    },
    {"name": "Vocabulary: Everyday Items", "decks": ["vocabulary-other-u5-10"]},
    {
        "name": "Vocabulary: People Skills",
        "categories": ["Introductions", "Social"],
        "decks": ["vocabulary-people-u5-10"],
    },
    {
        "name": "Vocabulary: Number Sense",
        "decks": ["counting-people-u5-10", "counting-food-and-drink-u5-10", "counting-objects-u5-10"],
    },
    {"name": "Travel Paperwork", "categories": ["Travel", "Postal Service", "Money Exchange", "Business Hours"]},
    {
        "name": "Hospital Visit Prep",
        "categories": ["Health", "Health (Pharmacy)", "Health (Allergies)"],
    },
    {
        "name": "Medical Emergencies",
        "categories": ["Emergency", "Health (Pharmacy)", "Communication Help"],
    },
    {"name": "Safety Briefings", "categories": ["Emergency", "Communication Help"]},
    {"name": "Transit Tickets", "categories": ["Transportation", "Money Exchange"]},
    {
        "name": "Dining Requests",
        "decks": [
            "at-a-restaurant-ordering-u5-10",
            "at-a-restaurant-stating-preferences-u5-10",
            "dietary-needs-requests-u5-10",
            "preferences-likes-u5-10",
            "preferences-dislikes-u5-10",
        ],
    },
    {"name": "Guided Tours", "categories": ["Directions", "Information"]},
    {"name": "Local Services", "categories": ["Postal Service", "Renting", "Money Exchange", "Information"]},
]


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


def normalize_card_key(card: Dict[str, str]) -> Tuple[str, ...]:
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


def deduplicate_cards(cards: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """Remove duplicate cards while preserving the original order."""

    seen = set()
    unique_cards: List[Dict[str, str]] = []
    for card in cards:
        key = normalize_card_key(card)
        if key in seen:
            continue
        seen.add(key)
        unique_cards.append(card)
    return unique_cards


def write_deck(deck_id: str, title: str, description: str, cards: List[Dict[str, str]]) -> None:
    deck_path = DECKS_DIR / f"{deck_id}.json"
    deck_data = {
        "id": deck_id,
        "title": title,
        "description": description,
        "cards": cards,
    }
    deck_path.write_text(json.dumps(deck_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")



def write_default_presets(
    category_map: Dict[str, List[str]],
    available_decks: Set[str]
) -> None:
    resolved: List[Dict[str, Any]] = []
    for spec in DEFAULT_PRESETS_SPEC:
        name = spec.get("name")
        if not name:
            continue

        deck_ids: List[str] = []
        for category in spec.get("categories", []):
            deck_ids.extend(category_map.get(category, []))
        deck_ids.extend(spec.get("decks", []))

        unique: List[str] = []
        seen: Set[str] = set()
        for deck_id in deck_ids:
            if deck_id in seen or deck_id not in available_decks:
                continue
            seen.add(deck_id)
            unique.append(deck_id)

        if not unique:
            continue

        resolved.append({"name": name, "deckIds": unique})

    DEFAULT_PRESETS_PATH.write_text(
        json.dumps(resolved, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


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
    category_map: Dict[str, List[str]] = defaultdict(list)
    available_decks: Set[str] = set()

    bucket_lookup = {label: (lower, upper) for label, lower, upper in USEFULNESS_BUCKETS}
    bucket_order = {label: index for index, (label, *_rest) in enumerate(USEFULNESS_BUCKETS)}

    combined: Dict[Tuple[str, str, str], List[Dict[str, str]]] = defaultdict(list)

    for category, subcategory, usefulness in sorted(
        groupings,
        key=lambda item: (item[0].lower(), item[1].lower(), -item[2]),
    ):
        cards = groupings[(category, subcategory, usefulness)]
        for label, lower, upper in USEFULNESS_BUCKETS:
            if lower <= usefulness <= upper:
                combined[(category, subcategory, label)].extend(cards)

    for category, subcategory, label in sorted(
        combined,
        key=lambda item: (
            item[0].lower(),
            item[1].lower(),
            bucket_order.get(item[2], len(USEFULNESS_BUCKETS)),
        ),
    ):
        cards = deduplicate_cards(combined[(category, subcategory, label)])
        if not cards:
            continue

        lower, upper = bucket_lookup[label]
        deck_slug = f"{slugify(category)}-{slugify(subcategory)}-u{label}"
        title = f"{category}: {subcategory} (Usefulness {label})"
        description = (
            f"Traveler usefulness {lower}-{upper}/10 phrases for the {subcategory} subcategory"
            f" within {category}. Includes {len(cards)} card(s)."
        )

        write_deck(deck_slug, title, description, cards)
        available_decks.add(deck_slug)
        if label == "5-10":
            category_map[category].append(deck_slug)

        manifest_entries.append({
            "id": deck_slug,
            "title": title,
            "description": description,
            "file": f"{deck_slug}.json",
        })

    MANIFEST_PATH.write_text(json.dumps(manifest_entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_default_presets(category_map, available_decks)


if __name__ == "__main__":
    main()
