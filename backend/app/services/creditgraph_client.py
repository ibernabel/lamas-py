"""
Client for CreditGraph AI API.
"""
from typing import Optional

import httpx

from app.core.config import settings


class CreditGraphClient:
    """Client for CreditGraph AI API."""

    def __init__(self):
        self.base_url = settings.CREDITGRAPH_API_URL
        self.api_key = settings.CREDITGRAPH_API_KEY
        self.timeout = settings.CREDITGRAPH_TIMEOUT

    def analyze_loan_application(
        self,
        applicant: dict,
        loan: dict,
        documents: list[dict],
        config: Optional[dict] = None,
    ) -> dict:
        """
        Send loan application to CreditGraph for analysis (Sync).
        """
        payload = {
            "applicant": applicant,
            "loan": loan,
            "documents": documents,
            "config": config or {"narrative_language": "es"},
        }

        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                f"{self.base_url}/api/v1/analyze",
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            return response.json()

    def health_check(self) -> bool:
        """Check if CreditGraph API is healthy (Sync)."""
        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False
