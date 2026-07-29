# Guía de Ejecución de Servicios en Desarrollo (LAMaS)

Documento de referencia rápida para el inicio y gestión del entorno local de desarrollo de **LAMaS** (*Loan Applications Management System*).

---

## ⚡ Método 1: Un solo Comando (Recomendado)

Se ha creado un script unificado que arranca la **Base de Datos (Docker)**, el **Backend (FastAPI)** y el **Frontend (Next.js)** en una sola terminal.

```bash
# Start all development services with a single command
cd /home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py && make dev
```

> **Nota:** Al presionar `Ctrl + C` en la terminal, el script detendrá automáticamente el backend y frontend en segundo plano.

---

## 🛠️ Método 2: Ejecución en 3 Pestañas de Terminal

Si prefieres supervisar los logs de cada servicio de manera independiente en 3 pestañas:

### Terminal 1 — Base de Datos (PostgreSQL)
```bash
# Start PostgreSQL database container on port 5433
cd /home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py && make db
```

### Terminal 2 — Backend (FastAPI API)
```bash
# Start FastAPI backend server with hot reload on port 8001
cd /home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py && make backend
```

### Terminal 3 — Frontend (Next.js)
```bash
# Start Next.js frontend development server on port 3000
cd /home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py && make frontend
```

---

## 🌱 Poblado de Datos de Prueba (Seed)

Para poblar la base de datos con clientes y solicitudes de crédito iniciales:

```bash
# Seed database with sample Dominican customers and loan applications
cd /home/ibernabel/develop/consultor/technology/projects/aisa/lamas-py && make seed
```

---

## 🔑 Credenciales y URLs de Acceso

| Servicio | URL / Puerto | Credenciales por Defecto |
|---|---|---|
| **Frontend (Next.js)** | `http://localhost:3000` | Usuario: `test@example.com`<br>Password: `testpass` |
| **Backend API (Swagger Docs)** | `http://localhost:8001/api/v1/docs` | Autenticación JWT Bearer Token |
| **PostgreSQL Database** | `localhost:5433` | Host: `localhost`<br>DB: `lamas`<br>User: `lamas`<br>Pass: `lamas` |
