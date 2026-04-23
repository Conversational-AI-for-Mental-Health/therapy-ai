# Twilio SMS Integration Setup Guide

## Overview
This integration allows users to request professional mental health support via the "Contact Professional" button in the sidebar. When clicked, an SMS is sent to configured mental health professionals via Twilio.

## Prerequisites
1. Twilio account (sign up at https://www.twilio.com)
2. Twilio phone number
3. Mental health professional contact number(s)

## Setup Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install twilio
```

### 2. Get Twilio Credentials
1. Go to https://console.twilio.com
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Purchase a Twilio phone number (Phone Numbers → Buy a Number)

### 3. Configure Environment Variables
Add to `backend/.env`:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=?
TWILIO_AUTH_TOKEN=?
TWILIO_PHONE_NUMBER=+15551234567

# Professional Contact Numbers (Mock)
PROFESSIONAL_CONTACT_1=+15559876543
# Add more as needed:
# PROFESSIONAL_CONTACT_2=+15551112222
```

### 4. Start the Backend
```bash
cd backend
npm run dev
```

## How It Works

### User Flow
1. User clicks **"Contact Professional"** button in sidebar
2. Modal appears asking for optional phone number
3. User can:
   - Provide phone number → Receives SMS confirmation
   - Skip → Request sent without user SMS
4. Professional(s) receive SMS with:
   - User details (name, email, phone if provided)
   - Timestamp
   - Request reason

### Backend Files Created
- `services/twilioService.ts` - Twilio SMS service
- `controllers/emergencyController.ts` - Emergency request handler
- `routes/emergencyRoutes.ts` - Emergency API routes
- Updated `app.ts` - Added emergency routes

### Frontend Files Created
- `util/emergencyAPI.ts` - Emergency API client
- Updated `Sidebar.tsx` - Added contact professional functionality

## API Endpoints

### POST /api/emergency/request-support
Request professional mental health support.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "userPhone": "+15551234567",  // Optional
  "reason": "Custom reason text"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Professional support has been notified. Someone will contact you shortly.",
  "data": {
    "notified": true,
    "timestamp": "2026-02-05T10:30:00.000Z"
  }
}
```

## Testing

### Test SMS locally
```bash
# In backend directory
npm run dev

# Test with curl
curl -X POST http://localhost:3000/api/emergency/request-support \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userPhone": "+15551234567",
    "reason": "Test request"
  }'
```

## SMS Message Format

**To Professional:**
```
🚨 MENTAL HEALTH SUPPORT REQUEST

Time: Feb 5, 2026 10:30 AM
User: John Doe
Email: john@example.com
Phone: +15551234567
Reason: User requested professional mental health support

This user has requested to speak with a mental health professional. 
Please respond as soon as possible.
```

**To User (if phone provided):**
```
Thank you for reaching out. A mental health professional has been notified 
and will contact you soon. If this is an emergency, please call 988 
(Suicide & Crisis Lifeline) or 911 immediately.
```

## Cost Considerations
- Twilio charges per SMS sent (~$0.0075 per message in US)
- Each request sends 1 SMS per configured professional
- User confirmation SMS is optional (add cost per request)

## Security Notes
- Requires user authentication (JWT token)
- Twilio credentials stored in environment variables
- Phone numbers validated before sending
- Professional contact numbers configured server-side only

## Troubleshooting

### SMS not sending
- Verify Twilio credentials in `.env`
- Check Twilio account balance
- Verify phone numbers include country code (+1 for US)
- Check backend console for error messages

### User not receiving confirmation
- Verify user provided valid phone number
- Check Twilio logs in console
- Ensure Twilio number can send to destination country

## Next Steps
- Add SMS delivery tracking
- Implement retry logic for failed sends
- Add professional response tracking
- Create admin dashboard for emergency requests
- Integrate with calendar for professional availability
