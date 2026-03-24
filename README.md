# भूमि शिकायत प्रबंधन प्रणाली — Full Stack

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express.js
- **Notifications**: Python + FastAPI
- **Database**: PostgreSQL
- **Auth**: JWT Tokens
- **Deploy**: Railway (backend) + Vercel (frontend)

## Project Structure
```
bhumi-system/
├── backend/          → Node.js Express API
├── frontend/         → React App
├── notification-service/ → Python FastAPI
└── docs/             → Setup guides
```

## Quick Start (Local)

### Step 1: PostgreSQL Setup
```bash
createdb bhumi_db
```

### Step 2: Backend
```bash
cd backend
npm install
cp .env.example .env   # fill your values
npm run migrate        # create tables
npm run seed           # add sample data
npm run dev            # starts on :5000
```

### Step 3: Notification Service
```bash
cd notification-service
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --port 8000 --reload
```

### Step 4: Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev            # starts on :3000
```

## Default Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bhumi.gov.in | Admin@123 |
| Officer | rajesh@bhumi.gov.in | Officer@123 |
| Public | user@gmail.com | User@123 |

## API Base URL
- Backend: `http://localhost:5000/api`
- Notifications: `http://localhost:8000`
