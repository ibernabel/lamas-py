# LAMaS Development Makefile

.PHONY: help db backend frontend dev stop clean seed

help:
	@echo "Available commands:"
	@echo "  make db       - Start the PostgreSQL database (Docker)"
	@echo "  make backend  - Start the FastAPI backend"
	@echo "  make frontend - Start the Next.js frontend"
	@echo "  make stop     - Stop the database"
	@echo "  make seed     - Seed the database with sample data"
	@echo "  make clean    - Stop database and remove volumes"

db:
	@echo "🚀 Starting Database..."
	docker compose up -d db
	@echo "✅ Database is running on port 5433"

backend:
	@echo "🚀 Starting Backend..."
	cd backend && uv run uvicorn app.main:app --port 8001 --reload

frontend:
	@echo "🚀 Starting Frontend..."
	cd frontend && pnpm run dev

stop:
	@echo "🛑 Stopping Database..."
	docker compose stop db

clean:
	@echo "🧹 Cleaning up infrastructure..."
	docker compose down -v

seed:
	@echo "🌱 Seeding database..."
	cd backend && .venv/bin/python scripts/setup_db.py
	cd backend && .venv/bin/python scripts/seed_customers.py
	cd backend && .venv/bin/python scripts/seed_loans.py
	@echo "✅ Seeding complete!"
