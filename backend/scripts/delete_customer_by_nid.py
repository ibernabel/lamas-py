"""
Script to safely delete a customer and all associated loan applications and child records by NID using raw SQL text queries.

Usage:
    uv run python scripts/delete_customer_by_nid.py --nid 00118536531 [--dry-run]
"""
import sys
import os
import argparse
from typing import List, Dict

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlmodel import Session
from app.core.database import engine


def delete_customer_by_nid(nid: str, dry_run: bool = False) -> None:
    """Finds customer by NID and deletes all associated records safely."""
    print(f"🔍 Searching for customer with NID: '{nid}'...")

    with Session(engine) as session:
        # Find customer ID
        cust_row = session.execute(
            text('SELECT id, "NID" FROM customers WHERE "NID" = :nid'),
            {"nid": nid}
        ).mappings().first()

        if not cust_row:
            print(f"❌ No customer found with NID: '{nid}'")
            return

        customer_id = cust_row["id"]
        print(f"✅ Found Customer ID: {customer_id} (NID: {cust_row['NID']})")

        # Fetch associated loan application IDs
        app_rows = session.execute(
            text("SELECT id FROM loan_applications WHERE customer_id = :customer_id"),
            {"customer_id": customer_id}
        ).mappings().all()
        app_ids = [row["id"] for row in app_rows]
        print(f"📋 Found {len(app_ids)} Loan Application(s): {app_ids}")

        deletion_summary: Dict[str, int] = {}

        def check_table_count(table_name: str, where_clause: str, params: dict):
            try:
                count_res = session.execute(
                    text(f"SELECT COUNT(*) as cnt FROM {table_name} WHERE {where_clause}"),
                    params
                ).scalar()
                if count_res and count_res > 0:
                    deletion_summary[table_name] = count_res
            except Exception as e:
                # Table might not exist or schema differs slightly
                pass

        # 1. Check loan application sub-tables
        if app_ids:
            app_params = {"app_ids": tuple(app_ids)}
            check_table_count("loan_application_details", "loan_application_id IN :app_ids", app_params)
            check_table_count("loan_application_notes", "loan_application_id IN :app_ids", app_params)
            check_table_count("creditgraph_analyses", "loan_application_id IN :app_ids", app_params)

        # 2. Check customer sub-tables
        cust_params = {"customer_id": customer_id}
        check_table_count("customer_details", "customer_id = :customer_id", cust_params)
        check_table_count("customer_financial_info", "customer_id = :customer_id", cust_params)
        check_table_count("customer_job_info", "customer_id = :customer_id", cust_params)
        check_table_count("customer_references", "customer_id = :customer_id", cust_params)
        check_table_count("customer_vehicles", "customer_id = :customer_id", cust_params)
        check_table_count("customers_accounts", "customer_id = :customer_id", cust_params)
        check_table_count("companies", "customer_id = :customer_id", cust_params)
        check_table_count("conversational_logs", "customer_id = :customer_id", cust_params)
        check_table_count("cooperative_profiles", "customer_id = :customer_id", cust_params)
        check_table_count("core_task_queue", "customer_id = :customer_id", cust_params)
        check_table_count("customer_shadow_risks", "customer_id = :customer_id", cust_params)
        check_table_count("customer_documents", "customer_id = :customer_id", cust_params)
        check_table_count("legal_consents", "customer_id = :customer_id", cust_params)
        check_table_count("system_integration_maps", "customer_id = :customer_id", cust_params)

        poly_params = {
            "customer_id": customer_id,
            "types": ("Customer", "App\\Models\\Customer", "app.models.customer.Customer")
        }
        check_table_count("phones", "phoneable_id = :customer_id AND phoneable_type IN :types", poly_params)
        check_table_count("addressables", "addressable_id = :customer_id AND addressable_type IN :types", poly_params)

        if app_ids:
            deletion_summary["loan_applications"] = len(app_ids)
        deletion_summary["customers"] = 1

        print("\n📊 Summary of records to be deleted:")
        for entity, count in deletion_summary.items():
            print(f"  - {entity}: {count}")

        if dry_run:
            print("\n⚠️  [DRY-RUN MODE] No changes were committed to the database.")
            return

        print("\n🚀 Executing deletion in atomic transaction...")

        # Helper to execute delete statement
        def run_delete(table_name: str, where_clause: str, params: dict):
            try:
                res = session.execute(
                    text(f"DELETE FROM {table_name} WHERE {where_clause}"),
                    params
                )
                print(f"  Deleted from {table_name}: {res.rowcount} row(s)")
            except Exception as e:
                print(f"  Skipped {table_name}: {e}")

        # Delete in proper foreign key order
        if app_ids:
            app_params = {"app_ids": tuple(app_ids)}
            run_delete("loan_application_details", "loan_application_id IN :app_ids", app_params)
            run_delete("loan_application_notes", "loan_application_id IN :app_ids", app_params)
            run_delete("creditgraph_analyses", "loan_application_id IN :app_ids", app_params)

        run_delete("customer_details", "customer_id = :customer_id", cust_params)
        run_delete("customer_financial_info", "customer_id = :customer_id", cust_params)
        run_delete("customer_job_info", "customer_id = :customer_id", cust_params)
        run_delete("customer_references", "customer_id = :customer_id", cust_params)
        run_delete("customer_vehicles", "customer_id = :customer_id", cust_params)
        run_delete("customers_accounts", "customer_id = :customer_id", cust_params)
        run_delete("companies", "customer_id = :customer_id", cust_params)
        run_delete("conversational_logs", "customer_id = :customer_id", cust_params)
        run_delete("cooperative_profiles", "customer_id = :customer_id", cust_params)
        run_delete("core_task_queue", "customer_id = :customer_id", cust_params)
        run_delete("customer_shadow_risks", "customer_id = :customer_id", cust_params)
        run_delete("customer_documents", "customer_id = :customer_id", cust_params)
        run_delete("legal_consents", "customer_id = :customer_id", cust_params)
        run_delete("system_integration_maps", "customer_id = :customer_id", cust_params)

        poly_params = {
            "customer_id": customer_id,
            "types": ("Customer", "App\\Models\\Customer", "app.models.customer.Customer")
        }
        run_delete("phones", "phoneable_id = :customer_id AND phoneable_type IN :types", poly_params)
        run_delete("addressables", "addressable_id = :customer_id AND addressable_type IN :types", poly_params)

        run_delete("loan_applications", "customer_id = :customer_id", cust_params)
        run_delete("customers", "id = :customer_id", cust_params)

        session.commit()
        print("\n✨ Deletion completed successfully and transaction committed!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Delete customer and related records by NID using SQL text"
    )
    parser.add_argument(
        "--nid",
        type=str,
        required=True,
        help="Customer NID (cedula)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate deletion without committing changes",
    )
    args = parser.parse_args()

    delete_customer_by_nid(nid=args.nid, dry_run=args.dry_run)
