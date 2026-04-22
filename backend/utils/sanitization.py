import bleach
import re
from typing import Any, Optional
from urllib.parse import urlparse

def sanitize_text(text: str) -> str:
    """
    Strips all HTML tags and attributes from a string.
    Ideal for: Job Titles, Company Names, Usernames.
    """
    if not text:
        return text
    # No tags allowed, no attributes allowed
    return bleach.clean(text, tags=[], attributes={}, strip=True)

def sanitize_url(url: Optional[str]) -> Optional[str]:
    """
    Validates and sanitizes a URL. Only allows http/https schemes.
    Blocks javascript:, data:, file:, and internal IP addresses.
    Returns None if the URL is invalid or potentially malicious.
    """
    if not url or not url.strip():
        return None
    
    url = url.strip()
    
    # Must start with http:// or https://
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return None
    
    # Block internal/private IPs (SSRF prevention)
    hostname = parsed.hostname or ""
    internal_patterns = [
        r"^127\.", r"^10\.", r"^172\.(1[6-9]|2\d|3[01])\.",
        r"^192\.168\.", r"^0\.", r"^localhost$", r"^169\.254\.",
        r"^\[?::1\]?$", r"^\[?fe80:",
    ]
    for pattern in internal_patterns:
        if re.match(pattern, hostname, re.IGNORECASE):
            return None
    
    # Basic length guard
    if len(url) > 2000:
        return None
    
    return bleach.clean(url, tags=[], attributes={}, strip=True)

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
