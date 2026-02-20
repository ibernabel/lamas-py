"""
Seed script — creates 5 realistic fake customers via the backend API.
Uses the /api/v1/customers/simple endpoint which handles all nested data.

Usage (from project root):
    docker-compose exec backend python scripts/seed_customers.py

Requirements (inside container):
    httpx is available (FastAPI dependency)
"""

import sys
import os
import httpx
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = os.getenv("SEED_API_URL", "http://localhost:8001/api/v1")
LOGIN_EMAIL = os.getenv("SEED_EMAIL", "test@example.com")
LOGIN_PASSWORD = os.getenv("SEED_PASSWORD", "testpass")

# ---------------------------------------------------------------------------
# 5 realistic Dominican Republic seed customers
# ---------------------------------------------------------------------------

CUSTOMERS = [
    {
        "NID": "00112345678",
        "lead_channel": "referral",
        "is_referred": True,
        "referred_by": "00198765432",
        "detail": {
            "first_name": "Carlos",
            "last_name": "Ramírez",
            "email": "carlos.ramirez@gmail.com",
            "birthday": "1985-03-12",
            "gender": "M",
            "marital_status": "married",
        },
        "phones": [
            {"number": "8096781234", "type": "mobile"},
            {"number": "8094561234", "type": "home"},
        ],
        "addresses": [
            {
                "street": "Calle Duarte #45",
                "city": "Santo Domingo",
                "province": "Distrito Nacional",
                "country": "Dominican Republic",
                "postal_code": "10101",
            }
        ],
    },
    {
        "NID": "00223456789",
        "lead_channel": "facebook",
        "is_referred": False,
        "detail": {
            "first_name": "María",
            "last_name": "González",
            "email": "maria.gonzalez@hotmail.com",
            "birthday": "1992-07-25",
            "gender": "F",
            "marital_status": "single",
        },
        "phones": [
            {"number": "8293456789", "type": "mobile"},
        ],
        "addresses": [
            {
                "street": "Av. Winston Churchill #120, Apto 3B",
                "city": "Santo Domingo",
                "province": "Distrito Nacional",
                "country": "Dominican Republic",
                "postal_code": "10148",
            }
        ],
    },
    {
        "NID": "00334567890",
        "lead_channel": "walk-in",
        "is_referred": False,
        "detail": {
            "first_name": "José",
            "last_name": "Hernández",
            "email": "jose.hernandez@yahoo.com",
            "birthday": "1978-11-03",
            "gender": "M",
            "marital_status": "divorced",
        },
        "phones": [
            {"number": "8494567890", "type": "mobile"},
            {"number": "8096782345", "type": "work"},
        ],
        "addresses": [
            {
                "street": "C/ El Conde #8",
                "city": "Santiago",
                "province": "Santiago",
                "country": "Dominican Republic",
                "postal_code": "51000",
            },
            {
                "street": "Calle Restauración #12",
                "city": "La Vega",
                "province": "La Vega",
                "country": "Dominican Republic",
            },
        ],
    },
    {
        "NID": "00445678901",
        "lead_channel": "instagram",
        "is_referred": True,
        "referred_by": "00223456789",
        "detail": {
            "first_name": "Ana",
            "last_name": "Martínez",
            "email": "ana.martinez@outlook.com",
            "birthday": "2000-01-18",
            "gender": "F",
            "marital_status": "single",
        },
        "phones": [
            {"number": "8495678901", "type": "mobile"},
        ],
        "addresses": [],
    },
    {
        "NID": "00556789012",
        "lead_channel": "website",
        "is_referred": False,
        "detail": {
            "first_name": "Pedro",
            "last_name": "Díaz",
            "email": "pedro.diaz@gmail.com",
            "birthday": "1969-09-30",
            "gender": "M",
            "marital_status": "widowed",
        },
        "phones": [
            {"number": "8096789012", "type": "mobile"},
            {"number": "8096001234", "type": "home"},
        ],
        "addresses": [
            {
                "street": "Av. Independencia #500",
                "city": "San Pedro de Macorís",
                "province": "San Pedro de Macorís",
                "country": "Dominican Republic",
                "postal_code": "21000",
            }
        ],
    },
]


def get_token(client: httpx.Client) -> str:
    """Authenticate and return a Bearer token."""
    resp = client.post(
        f"{BASE_URL}/auth/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def seed_customers():
    with httpx.Client(timeout=30) as client:
        # Authenticate
        print(f"🔑  Authenticating as {LOGIN_EMAIL}...")
        try:
            token = get_token(client)
        except Exception as e:
            print(f"❌  Authentication failed: {e}")
            print("    Is the backend running? docker-compose up -d backend")
            sys.exit(1)

        headers = {"Authorization": f"Bearer {token}"}
        created = 0
        skipped = 0
        errors = 0

        for customer in CUSTOMERS:
            nid = customer["NID"]
            full_name = f"{customer['detail']['first_name']} {customer['detail']['last_name']}"

            # Check NID uniqueness before posting
            check = client.get(
                f"{BASE_URL}/customers/validate-nid",
                params={"nid": nid},
            )
            if check.status_code == 200:
                result = check.json()
                if not result.get("is_unique", True):
                    print(
                        f"⚠️   {nid} ({full_name}) already exists — skipping.")
                    skipped += 1
                    continue

            # Create via simple endpoint
            resp = client.post(
                f"{BASE_URL}/customers/simple",
                json=customer,
                headers=headers,
            )

            if resp.status_code == 201:
                data = resp.json()
                print(f"✅  Created: {nid} — {full_name} (id={data.get('id')})")
                created += 1
            elif resp.status_code == 409:
                print(f"⚠️   {nid} ({full_name}) already exists — skipping.")
                skipped += 1
            else:
                print(
                    f"❌  Failed {nid} ({full_name}): {resp.status_code} — {resp.text[:200]}")
                errors += 1

        print(
            f"\nDone. ✅ {created} created  ⚠️ {skipped} skipped  ❌ {errors} errors")


if __name__ == "__main__":
    seed_customers()
