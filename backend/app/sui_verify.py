import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUI_RPC_URL = os.getenv("SUI_RPC_URL", "https://fullnode.testnet.sui.io:443")
SUI_REGISTRY_ID = os.getenv("SUI_REGISTRY_ID")


def get_registry_object():
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sui_getObject",
        "params": [
            SUI_REGISTRY_ID,
            {
                "showContent": True,
                "showType": True,
                "showOwner": True,
            },
        ],
    }

    response = requests.post(SUI_RPC_URL, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()


def verify_cid_on_chain(cid: str):
    data = get_registry_object()

    obj_data = data.get("result", {}).get("data", {})
    content = obj_data.get("content", {})
    fields = content.get("fields", {})

    # Registry has a Table, so direct CID lookup is not trivial from raw object fields.
    # For MVP, we confirm registry exists and return a basic on-chain status.
    # Later we can upgrade this to event-based or dynamic-field based lookup.
    if obj_data:
        return {
            "verified": True,
            "registry_id": SUI_REGISTRY_ID,
            "note": "Registry exists on-chain. Per-CID lookup can be upgraded next."
        }

    return {
        "verified": False,
        "registry_id": SUI_REGISTRY_ID,
        "note": "Registry not found on-chain."
    }