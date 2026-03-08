import hashlib
from difflib import SequenceMatcher
from typing import Optional, Tuple, List

def sha256_bytes(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

def text_similarity(current_text: str, previous_texts: List[Tuple[str, str]]) -> Tuple[Optional[str], float]:
    best_cid = None
    best_score = 0.0

    for cid, text in previous_texts:
        score = SequenceMatcher(None, current_text[:5000], text[:5000]).ratio()
        if score > best_score:
            best_score = score
            best_cid = cid

    return best_cid, round(best_score, 4)