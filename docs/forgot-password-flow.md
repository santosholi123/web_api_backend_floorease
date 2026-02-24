# Forgot Password (Email OTP) Flow

This document describes the Forgot Password flow and endpoints in this backend.

## Overview
1) User enters email → backend sends OTP to Gmail.
2) User submits OTP → backend verifies OTP.
3) User sets new password → backend updates password securely.

## OTP Rules
- 6-digit numeric OTP.
- Only OTP hash is stored in DB (bcrypt hash).
- OTP expires in 10 minutes.
- Max verify attempts: 5. After that, API returns 429 until a new OTP is requested.
- Resend cooldown: 60 seconds (based on `resetOtpLastSentAt`).

## Endpoints
Base path: `${config.apiPrefix}/auth`

### 1) POST /forgot-password
**Body**
- `email` (string, required)

**Behavior**
- Validates email.
- If user is not found, returns generic success message (does not reveal user existence).
- Enforces resend cooldown (60s).
- Generates OTP, hashes it, saves:
  - `resetOtpHash`
  - `resetOtpExpires`
  - `resetOtpVerified = false`
  - `resetOtpAttempts = 0`
  - `resetOtpLastSentAt = now`
- Sends OTP email using Gmail SMTP.

**Success (200)**
```json
{ "success": true, "message": "OTP sent to email" }
```

**Errors**
- 400: Validation error
- 429: Resend cooldown not met

---

### 2) POST /verify-reset-otp
**Body**
- `email` (string, required)
- `otp` (string, 6-digit numeric)

**Behavior**
- Validates input.
- Finds user and checks OTP hash and expiry.
- If attempts >= 5 → 429.
- Compares OTP with stored hash.
- If invalid → increments attempts, returns 400.
- If valid → sets `resetOtpVerified = true`.

**Success (200)**
```json
{ "success": true, "message": "OTP verified successfully" }
```

**Errors**
- 400: Invalid email/OTP or OTP expired
- 429: Too many attempts

---

### 3) POST /reset-password
**Body**
- `email` (string, required)
- `newPassword` (string, required, min 8)
- `confirmPassword` (string, required, min 8)

**Behavior**
- Validates passwords match and length.
- Finds user and checks OTP verified + not expired.
- Hashes new password and updates `passwordHash`.
- Clears reset fields:
  - `resetOtpHash = null`
  - `resetOtpExpires = null`
  - `resetOtpVerified = false`
  - `resetOtpAttempts = 0`
  - `resetOtpLastSentAt = null`

**Success (200)**
```json
{ "success": true, "message": "Password reset successful" }
```

**Errors**
- 400: Passwords mismatch, OTP not verified, or OTP expired

## Environment Variables
Set these in your `.env`:
- `SMTP_USER` — Gmail address
- `SMTP_PASS` — Gmail App Password
- `SMTP_FROM` — optional From address

**Note:** Gmail SMTP requires an App Password.
