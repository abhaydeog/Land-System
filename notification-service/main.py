from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import httpx, os, logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bhumi-notify")

app = FastAPI(title="Bhumi Notification Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──
class NotificationRequest(BaseModel):
    type: Literal["sms", "email", "both"] = "sms"
    mobile: Optional[str] = None
    email: Optional[str] = None
    message: str
    complaint_no: Optional[str] = None
    recipient_name: Optional[str] = None

class NotificationLog(BaseModel):
    id: str
    type: str
    recipient: str
    message: str
    status: str
    timestamp: str

# In-memory log (use DB in production)
notification_logs: list[dict] = []

# ── SMS via Textlocal / MSG91 ──
async def send_sms(mobile: str, message: str) -> bool:
    """
    Production mein yahan Textlocal, MSG91, or SMSTO API call lagayen.
    Abhi sirf log kar rahe hain.
    """
    api_key = os.getenv("SMS_API_KEY")
    sender  = os.getenv("SMS_SENDER", "BHUMI")

    if not api_key:
        logger.info(f"[SMS MOCK] To: {mobile} | Msg: {message[:60]}...")
        return True

    try:
        # MSG91 example:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.msg91.com/api/v5/flow/",
                headers={"authkey": api_key, "content-type": "application/json"},
                json={
                    "template_id": os.getenv("MSG91_TEMPLATE_ID", ""),
                    "short_url": "0",
                    "mobiles": f"91{mobile.replace('+91','').replace(' ','')}",
                    "VAR1": message
                },
                timeout=10
            )
        return resp.status_code == 200
    except Exception as e:
        logger.error(f"SMS error: {e}")
        return False

# ── Email via SMTP ──
async def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Production mein smtplib ya SendGrid use karen.
    """
    smtp_host = os.getenv("SMTP_HOST")
    if not smtp_host:
        logger.info(f"[EMAIL MOCK] To: {to_email} | Subject: {subject}")
        return True

    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    try:
        msg = MIMEMultipart()
        msg["From"] = os.getenv("SMTP_FROM", "noreply@bhumi.gov.in")
        msg["To"] = to_email
        msg["Subject"] = subject

        html = f"""
        <html><body style="font-family:Arial;color:#333;padding:20px">
        <h2 style="color:#1a4f7a">भूमि शिकायत प्रबंधन प्रणाली</h2>
        <div style="background:#f4f5f7;padding:16px;border-radius:8px">
          <p>{body}</p>
        </div>
        <p style="color:#999;font-size:12px;margin-top:16px">
          Jharkhand Rajaswa Vibhag | bhumi.jharkhand.gov.in
        </p>
        </body></html>"""

        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL(smtp_host, int(os.getenv("SMTP_PORT","465"))) as server:
            server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
            server.sendmail(msg["From"], to_email, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"Email error: {e}")
        return False

# ── Background task ──
async def process_notification(req: NotificationRequest):
    import uuid
    log = {
        "id": str(uuid.uuid4()),
        "type": req.type,
        "message": req.message,
        "timestamp": datetime.now().isoformat(),
        "status": "pending",
        "recipient": req.mobile or req.email or "unknown"
    }

    success = False
    if req.type in ("sms", "both") and req.mobile:
        success = await send_sms(req.mobile, req.message)

    if req.type in ("email", "both") and req.email:
        subject = f"Bhumi Shikayat — {req.complaint_no or 'Update'}"
        success = await send_email(req.email, subject, req.message)

    log["status"] = "sent" if success else "failed"
    notification_logs.append(log)
    logger.info(f"Notification [{log['status']}]: {log['recipient']}")

# ── Routes ──
@app.get("/")
def root():
    return {"service": "Bhumi Notification", "status": "running", "timestamp": datetime.now().isoformat()}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/notify")
async def notify(req: NotificationRequest, bg: BackgroundTasks):
    if not req.mobile and not req.email:
        raise HTTPException(400, "Mobile ya email zaroori hai")
    bg.add_task(process_notification, req)
    return {"success": True, "message": "Notification queue mein add ho gayi"}

@app.post("/notify/bulk")
async def bulk_notify(notifications: list[NotificationRequest], bg: BackgroundTasks):
    for n in notifications:
        bg.add_task(process_notification, n)
    return {"success": True, "message": f"{len(notifications)} notifications queued"}

@app.get("/logs")
def get_logs(limit: int = 50):
    return {"success": True, "data": notification_logs[-limit:]}

# ── Predefined templates ──
TEMPLATES = {
    "complaint_registered": "Aapki shikayat {complaint_no} darj ho gayi. Track karein: bhumi.jharkhand.gov.in/track",
    "officer_assigned":     "Shikayat {complaint_no} ke liye {officer_name} niyukt kiya gaya. Sampark: {mobile}",
    "status_update":        "Shikayat {complaint_no} ka status: {status}. Details ke liye login karen.",
    "hearing_reminder":     "Shikayat {complaint_no} ki sunavayi {date} ko {time} baje {location} mein hai.",
    "resolved":             "Aapki shikayat {complaint_no} ka nipatara ho gaya. Vivran ke liye portal dekhen.",
}

@app.post("/notify/template")
async def notify_template(
    template_name: str,
    mobile: Optional[str] = None,
    email: Optional[str] = None,
    variables: dict = {},
    bg: BackgroundTasks = None
):
    if template_name not in TEMPLATES:
        raise HTTPException(404, f"Template '{template_name}' nahi mila")

    message = TEMPLATES[template_name].format(**variables)
    req = NotificationRequest(type="sms", mobile=mobile, email=email, message=message)
    bg.add_task(process_notification, req)
    return {"success": True, "message": "Template notification queued", "preview": message}
