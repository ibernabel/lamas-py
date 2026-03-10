import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.models.document import CustomerDocument
from io import BytesIO


def test_upload_customer_document(client: TestClient, auth_headers: dict, test_customer):
    """Test uploading a document for a customer."""
    file_content = b"test file content"
    file = BytesIO(file_content)

    response = client.post(
        f"/api/v1/documents/customers/{test_customer.id}/upload",
        params={"document_type": "nid"},
        files={"file": ("test_nid.pdf", file, "application/pdf")},
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["file_name"] == "test_nid.pdf"
    assert data["document_type"] == "nid"
    assert "download_url" in data

    assert "download_url" in data

    # Verify via list API
    list_response = client.get(
        f"/api/v1/documents/customers/{test_customer.id}",
        headers=auth_headers
    )
    assert list_response.status_code == 200
    docs = list_response.json()
    assert len(docs) == 1
    assert docs[0]["file_name"] == "test_nid.pdf"
    assert docs[0]["is_latest"] is True


def test_document_versioning(client: TestClient, auth_headers: dict, test_customer):
    """Test that uploading a new version marks the old one as not latest."""
    # 1. Upload first version
    client.post(
        f"/api/v1/documents/customers/{test_customer.id}/upload",
        params={"document_type": "labor_letter"},
        files={"file": ("v1.pdf", BytesIO(b"v1"), "application/pdf")},
        headers=auth_headers
    )

    # 2. Upload second version
    client.post(
        f"/api/v1/documents/customers/{test_customer.id}/upload",
        params={"document_type": "labor_letter"},
        files={"file": ("v2.pdf", BytesIO(b"v2"), "application/pdf")},
        headers=auth_headers
    )

    # 3. List inclusive of history
    list_response = client.get(
        f"/api/v1/documents/customers/{test_customer.id}?include_history=true",
        headers=auth_headers
    )
    docs = list_response.json()
    assert len(docs) == 2

    # Sort by uploaded_at desc (frontend expected)
    # The one with v2 should be latest
    v2_doc = next(d for d in docs if d["file_name"] == "v2.pdf")
    v1_doc = next(d for d in docs if d["file_name"] == "v1.pdf")

    assert v2_doc["is_latest"] is True
    assert v1_doc["is_latest"] is False


def test_upload_loan_document(client: TestClient, auth_headers: dict, test_loan):
    """Test uploading a document for a loan application."""
    response = client.post(
        f"/api/v1/documents/loans/{test_loan.id}/upload",
        params={"document_type": "bank_statement", "bank_name": "popular"},
        files={"file": ("statement.pdf", BytesIO(
            b"statement"), "application/pdf")},
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["document_type"] == "bank_statement"

    # Verify it appears in customer list too
    list_response = client.get(
        f"/api/v1/documents/customers/{test_loan.customer_id}",
        headers=auth_headers
    )
    docs = list_response.json()
    assert any(d["id"] == data["id"] for d in docs)


def test_delete_document(client: TestClient, auth_headers: dict, test_customer):
    """Test deleting a document."""
    # 1. Upload
    res = client.post(
        f"/api/v1/documents/customers/{test_customer.id}/upload",
        params={"document_type": "nid"},
        files={"file": ("to_delete.pdf", BytesIO(
            b"delete me"), "application/pdf")},
        headers=auth_headers
    )
    doc_id = res.json()["id"]

    # 2. Delete
    delete_res = client.delete(
        f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert delete_res.status_code == 204

    # 3. Verify gone
    list_res = client.get(
        f"/api/v1/documents/customers/{test_customer.id}", headers=auth_headers)
    assert not any(d["id"] == doc_id for d in list_res.json())
