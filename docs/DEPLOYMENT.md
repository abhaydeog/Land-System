# 🚀 Deployment Guide — Bhumi Shikayat System
## Free Cloud Deploy: Railway + Vercel + Render

---

## STEP 1: PostgreSQL Database (Railway) — FREE

1. Railway.app par jaayein: https://railway.app
2. GitHub se sign up karen
3. "New Project" → "Database" → "PostgreSQL" click karen
4. Database create hogi — "Connect" tab mein jaayein
5. `DATABASE_URL` copy karen (kuch aisa dikhega):
   ```
   postgresql://postgres:abc123@containers-us-west.railway.app:6789/railway
   ```
6. Yeh URL save karen — backend mein lagega

---

## STEP 2: Backend Deploy (Railway) — FREE

1. Railway mein "New Service" → "GitHub Repo" click karen
2. Apna GitHub repo connect karen
3. Root directory set karen: `backend`
4. Environment Variables add karen (Settings → Variables):

   ```
   DATABASE_URL    = (Step 1 se copy kiya hua URL)
   JWT_SECRET      = bhumi-super-secret-2025-jharkhand-rajaswa
   NODE_ENV        = production
   FRONTEND_URL    = https://aapka-frontend.vercel.app  (baad mein update karna)
   NOTIFICATION_SERVICE_URL = https://aapki-notify-service.render.com
   PORT            = 5000
   ```

5. Deploy hone ke baad "Migrations run karen":
   - Railway mein "Shell" tab kholein
   - Type karen: `npm run migrate`
   - Phir: `npm run seed`

6. Aapko URL milega jaise: `https://bhumi-backend.up.railway.app`

---

## STEP 3: Notification Service (Render) — FREE

1. Render.com par jaayein: https://render.com
2. GitHub se sign up karen
3. "New" → "Web Service" → Repo connect karen
4. Root directory: `notification-service`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Environment Variables:
   ```
   SMS_API_KEY = (agar SMS chahiye toh MSG91 se lein, warna khali rahne dein)
   ```
8. Deploy karne ke baad URL milega: `https://bhumi-notify.onrender.com`

---

## STEP 4: Frontend Deploy (Vercel) — FREE

1. Vercel.com par jaayein: https://vercel.com
2. GitHub se sign up karen
3. "Add New Project" → Repo import karen
4. Root Directory: `frontend`
5. Framework: Vite
6. Environment Variables:
   ```
   VITE_API_URL = https://bhumi-backend.up.railway.app/api
   ```
7. "Deploy" click karen
8. Aapko URL milega: `https://bhumi-shikayat.vercel.app`

---

## STEP 5: Final Configuration

### Backend mein FRONTEND_URL update karen:
Railway → Backend Service → Variables:
```
FRONTEND_URL = https://bhumi-shikayat.vercel.app
```
Redeploy karen.

### Backend mein NOTIFICATION_SERVICE_URL update karen:
```
NOTIFICATION_SERVICE_URL = https://bhumi-notify.onrender.com
```

---

## LOCAL DEVELOPMENT (Apne computer par)

### Prerequisites:
- Node.js 18+ install hona chahiye
- Python 3.9+ install hona chahiye
- PostgreSQL install hona chahiye

### Step-by-step:

```bash
# 1. Repo clone ya files copy karen
cd bhumi-system

# 2. PostgreSQL database banayein
createdb bhumi_db

# 3. Backend setup
cd backend
npm install
cp .env.example .env
# .env mein DATABASE_URL aur JWT_SECRET update karen
npm run migrate    # Tables create hongi
npm run seed       # Sample data aayega
npm run dev        # :5000 par start hoga

# 4. Notification Service (nayi terminal mein)
cd notification-service
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --port 8000 --reload

# 5. Frontend (nayi terminal mein)
cd frontend
npm install
cp .env.example .env
# .env mein: VITE_API_URL=https://land-system-1.onrender.com/api
npm run dev        # :3000 par start hoga
```

---

## SMS SETUP (Optional — MSG91)

1. msg91.com par account banayein
2. Template approve karvaayein: "Aapki shikayat {complaint_no} darj ho gayi"
3. API key copy karen
4. notification-service/.env mein:
   ```
   SMS_API_KEY=your_msg91_authkey
   MSG91_TEMPLATE_ID=your_template_id
   ```

---

## DEFAULT LOGIN CREDENTIALS

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@bhumi.gov.in       | Admin@123   |
| Officer | rajesh@bhumi.gov.in      | Officer@123 |
| Public  | user@gmail.com           | User@123    |

---

## API ENDPOINTS SUMMARY

### Auth
- POST `/api/auth/login`        — Login
- POST `/api/auth/register`     — Public registration
- GET  `/api/auth/me`           — Current user
- PUT  `/api/auth/change-password`

### Complaints
- GET  `/api/complaints`        — List (filters supported)
- GET  `/api/complaints/:id`    — Detail
- GET  `/api/complaints/track/:no` — Public tracking (no auth)
- POST `/api/complaints`        — New complaint
- PUT  `/api/complaints/:id/assign` — Assign officer
- PUT  `/api/complaints/:id/status` — Update status
- POST `/api/complaints/:id/comment` — Add comment

### Officers
- GET  `/api/officers`          — List officers
- POST `/api/officers`          — Add officer (admin)
- PUT  `/api/officers/:id/availability`

### Dashboard & Reports
- GET  `/api/dashboard/stats`
- GET  `/api/reports/monthly`
- GET  `/api/reports/officer-performance`

---

## TROUBLESHOOTING

**Backend start nahi ho raha?**
- `npm run migrate` chalayein pehle
- .env mein DATABASE_URL sahi hai?

**Frontend API connect nahi kar raha?**
- VITE_API_URL sahi set hai?
- Backend chal raha hai?

**CORS error aa raha hai?**
- Backend .env mein FRONTEND_URL sahi set karen

**Database connection error?**
- PostgreSQL service chal rahi hai?
- DATABASE_URL format sahi hai?

---

Koi problem ho toh issues/questions raise karen! 🙏
