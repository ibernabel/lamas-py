"""
Seed script — creates sample loan applications for existing customers.
"""

import sys
import os
import httpx
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = os.getenv("SEED_API_URL", "http://localhost:8001/api/v1")
LOGIN_EMAIL = os.getenv("SEED_EMAIL", "test@example.com")
LOGIN_PASSWORD = os.getenv("SEED_PASSWORD", "testpass")

def get_token(client: httpx.Client) -> str:
    resp = client.post(
        f"{BASE_URL}/auth/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

def seed_loans():
    with httpx.Client(timeout=30) as client:
        print(f"🔑  Authenticating as {LOGIN_EMAIL}...")
        try:
            token = get_token(client)
        except Exception as e:
            print(f"❌  Authentication failed: {e}")
            sys.exit(1)

        headers = {"Authorization": f"Bearer {token}"}
        
        # 1. Fetch customers
        print("🔍  Fetching customers...")
        resp = client.get(f"{BASE_URL}/customers/", headers=headers, params={"per_page": 5})
        resp.raise_for_status()
        customers = resp.json().get("items", [])
        
        if not customers:
            print("⚠️  No customers found. Run seed_customers.py first.")
            return

        purposes = [
            "Home renovation and repairs",
            "Medical expenses for family member",
            "Education fees for master's degree",
            "Business expansion for small retail shop",
            "Debt consolidation",
            "Used car purchase"
        ]
        
        created = 0
        for customer in customers:
            customer_id = customer["id"]
            num_loans = random.randint(1, 2)
            
            for i in range(num_loans):
                amount = random.randint(50000, 500000)
                term = random.choice([12, 18, 24, 36, 48])
                rate = random.uniform(12.5, 28.0)
                quota = (amount * (1 + rate/100)) / term # Rough estimate
                
                payload = {
                    "customer_id": customer_id,
                    "detail": {
                        "amount": amount,
                        "term": term,
                        "rate": round(rate, 2),
                        "quota": round(quota, 2),
                        "frequency": "monthly",
                        "purpose": random.choice(purposes),
                        "customer_comment": f"Auto-seeded application {i+1} for testing."
                    }
                }
                
                resp = client.post(f"{BASE_URL}/loan-applications/", json=payload, headers=headers)
                if resp.status_code == 201:
                    data = resp.json()
                    print(f"✅  Created Loan #{data['id']} for Customer #{customer_id}")
                    created += 1
                    
                    # Optionally transition some to 'verified' or 'analyzed'
                    if random.random() > 0.5:
                        loan_id = data["id"]
                        client.patch(
                            f"{BASE_URL}/loan-applications/{loan_id}/status",
                            json={"status": "verified", "note": "Automatic verification for seeding."},
                            headers=headers
                        )
                else:
                    print(f"❌  Failed for Customer #{customer_id}: {resp.text}")

        print(f"\nDone. ✅ {created} loan applications created.")

if __name__ == "__main__":
    seed_loans()
