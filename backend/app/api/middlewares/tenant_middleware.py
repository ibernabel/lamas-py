from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from sqlmodel import Session, select
from app.core.database import engine
from app.models.system_config import SystemConfig

DEFAULT_TENANT_CONFIG = {
    "tenant_name": "Solufime Financiera",
    "tenant_type": "FINANCIERA",
    "enable_savings_module": False,
    "enable_b2b_payroll_agreements": True,
    "core_integration_mode": "MANUAL_TASK_QUEUE",
    "allowed_customer_types": ["EMPLOYEE_DIRECT", "MICRO_ENTERPRISE", "VEHICLE_LOAN"],
}


class TenantMiddleware(BaseHTTPMiddleware):
    """Middleware to inject tenant configuration into request state."""

    async def dispatch(self, request: Request, call_next):
        tenant_id = request.headers.get("X-Tenant-ID")

        tenant_config = DEFAULT_TENANT_CONFIG.copy()

        if tenant_id:
            try:
                with Session(engine) as session:
                    db_config = session.exec(
                        select(SystemConfig).where(SystemConfig.tenant_name == tenant_id)
                    ).first()
                    if db_config:
                        tenant_config = {
                            "tenant_name": db_config.tenant_name,
                            "tenant_type": db_config.tenant_type,
                            **db_config.config,
                        }
            except Exception:
                pass

        request.state.tenant_config = tenant_config
        response = await call_next(request)
        return response
