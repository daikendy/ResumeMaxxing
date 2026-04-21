import bleach
from typing import Any, Dict, List, Union

def sanitize_text(text: str) -> str:
    """
    Strips all HTML tags and attributes from a string.
    Ideal for: Job Titles, Company Names, Usernames.
    """
    if not text:
        return text
    # No tags allowed, no attributes allowed
    return bleach.clean(text, tags=[], attributes={}, strip=True)

def sanitize_data(data: Any) -> Any:
    """
    Recursively sanitizes a piece of data (Dict, List, or String).
    Ideal for: Master Resume JSON, AI-generated content.
    """
    if isinstance(data, str):
        return sanitize_text(data)
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    elif isinstance(data, dict):
        return {k: sanitize_data(v) for k, v in data.items()}
    return data
