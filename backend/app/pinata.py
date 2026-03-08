import os
import requests
from dotenv import load_dotenv

load_dotenv()

PINATA_JWT = os.getenv("PINATA_JWT")
PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"

print("PINATA_JWT loaded:", bool(PINATA_JWT))
print("PINATA_JWT prefix:", PINATA_JWT[:20] if PINATA_JWT else "None")

def upload_to_pinata(file_obj, filename: str, content_type: str):
    if not PINATA_JWT:
        raise ValueError("PINATA_JWT is missing from environment variables")

    headers = {
        "Authorization": f"Bearer {PINATA_JWT.strip()}"
    }

    files = {
        "file": (filename, file_obj, content_type)
    }

    response = requests.post(PINATA_URL, headers=headers, files=files, timeout=60)

    if response.status_code == 401:
        raise ValueError(f"Pinata unauthorized: {response.text}")

    response.raise_for_status()
    data = response.json()

    return {
        "cid": data["IpfsHash"],
        "timestamp": data.get("Timestamp"),
        "pin_size": data.get("PinSize")
    }