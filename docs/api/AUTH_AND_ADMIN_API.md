# AfroCart — Auth & Admin API Specification

**Version:** 1.0.0  
**Domain:** Authentication + Admin Portal  
**Prepared for:** Backend Engineering Team  
**Prepared by:** AfroCart Frontend Team  
**Base URL:** `https://api.afrocart.co.uk/api/v1`  
**Auth:** Bearer token (JWT) in Authorization header  
`Authorization: Bearer <token>`

---

## Table of Contents

1. [Overview](#1-overview)
   - 1.1 [Architecture Notes](#11-architecture-notes)
   - 1.2 [Standard Error Response](#12-standard-error-response)
   - 1.3 [Standard Success Response Envelope](#13-standard-success-response-envelope)
   - 1.4 [Role Definitions](#14-role-definitions)
2. [Domain: Authentication](#2-domain-authentication)
   - 2.1 [POST /auth/register (Customer & Vendor)](#21-post-authregister--customer--vendor)
   - 2.2 [POST /auth/register (Driver Extended)](#22-post-authregister--driver-extended)
   - 2.3 [POST /auth/login](#23-post-authlogin)
   - 2.4 [POST /auth/verify-otp](#24-post-authverify-otp)
   - 2.5 [POST /auth/refresh-token](#25-post-authrefresh-token)
   - 2.6 [POST /drivers/documents/upload](#26-post-driversdocumentsupload)
   - 2.7 [GET /users/me](#27-get-usersme)
   - 2.8 [GET /drivers/me/approval-status](#28-get-driversmerapproval-status)
3. [Domain: Admin](#3-domain-admin)
   - View: Admin Overview Dashboard
     - 3.1 [GET /admin/stats](#31-get-adminstats)
     - 3.2 [GET /admin/orders (recent)](#32-get-adminorders--recent-for-overview)
   - View: Vendor Management
     - 3.3 [GET /admin/vendors](#33-get-adminvendors)
     - 3.4 [PATCH /admin/vendors/:id/approve](#34-patch-adminvendorsidapprove)
     - 3.5 [PATCH /admin/vendors/:id/reject](#35-patch-adminvendorsidreject)
     - 3.6 [PATCH /admin/vendors/:id/commission](#36-patch-adminvendorsidcommission)
   - View: Order Monitor
     - 3.7 [GET /admin/orders (filtered)](#37-get-adminorders--order-monitor)
     - 3.8 [GET /admin/orders/:id](#38-get-adminordersid)
     - 3.9 [PATCH /admin/orders/:id/assign-driver](#39-patch-adminordersidassign-driver)
     - 3.10 [POST /admin/orders/:id/refund](#310-post-adminordersidrefund)
   - View: Driver Management
     - 3.11 [GET /admin/drivers](#311-get-admindrivers)
     - 3.12 [GET /admin/drivers/:id/documents](#312-get-admindrivesiddocuments)
     - 3.13 [PATCH /admin/drivers/:id/approve](#313-patch-admindiversidapprove)
     - 3.14 [PATCH /admin/drivers/:id/reject](#314-patch-admindriversidreject)
     - 3.15 [PATCH /admin/drivers/:id/suspend](#315-patch-admindriversidsuspend)
     - 3.16 [PATCH /admin/drivers/:id/reinstate](#316-patch-admindriversidsreinstate)
     - 3.17 [PATCH /admin/drivers/:id/documents/:document_type/verify](#317-patch-admindiversiddocumentsdocument_typeverify)
   - View: Referrals & Credits
     - 3.18 [GET /admin/referrals](#318-get-adminreferrals)
     - 3.19 [GET /admin/credits/transactions](#319-get-admincreditstransactions)
4. [Shared Object Schemas](#4-shared-object-schemas)
5. [Pagination Contract](#5-pagination-contract)
6. [Security & Rate Limiting](#6-security--rate-limiting)

---

## 1. Overview

### 1.1 Architecture Notes

- **Domain-driven grouping:** Each section maps to one bounded context (auth, vendors, orders, drivers, referrals/credits).
- **JWT claims:** `id`, `email`, `role`. For drivers only: `approval_status` is also embedded in the token payload.
- **Timestamps:** All timestamps are ISO 8601 UTC strings — e.g. `"2025-09-14T13:45:00.000Z"`.
- **Money values:** All monetary amounts are integers in **pence**. £1.00 = `100`. Never use decimal floats for money. Examples: `total_amount: 1850` means £18.50.
- **Pagination:** All list endpoints use **offset-based pagination** via `page` and `per_page` query parameters. See [Section 5](#5-pagination-contract).
- **Error format:** Consistent across all endpoints. Defined once in [Section 1.2](#12-standard-error-response).
- **Base URL used by frontend:** `{NEXT_PUBLIC_API_URL}/api` — production resolves to `https://api.afrocart.co.uk/api/v1`.

---

### 1.2 Standard Error Response

All errors return this envelope. HTTP status code reflects the error category.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "fields": {
      "email": "Email is already in use"
    }
  }
}
```

`fields` is only present for validation errors (422). It is omitted for all other error types.

**All error codes used across Auth + Admin:**

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 422 | One or more request fields failed validation |
| `EMAIL_ALREADY_EXISTS` | 409 | Email is already registered in the system |
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT access token has expired |
| `AUTH_TOKEN_INVALID` | 401 | JWT is malformed or signature invalid |
| `AUTH_INSUFFICIENT_ROLE` | 403 | Token role does not have access to this resource |
| `FORBIDDEN` | 403 | Authenticated but not authorised for this action |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `OTP_INVALID` | 422 | OTP code does not match |
| `OTP_EXPIRED` | 422 | OTP has expired (10-minute window) |
| `VENDOR_NOT_FOUND` | 404 | Vendor with given ID does not exist |
| `DRIVER_NOT_FOUND` | 404 | Driver with given ID does not exist |
| `ORDER_NOT_FOUND` | 404 | Order with given ID does not exist |
| `DOCUMENT_UPLOAD_FAILED` | 500 | File storage failed after passing validation |
| `DRIVER_DOCUMENTS_UNVERIFIED` | 422 | Approval attempted before all docs are verified |
| `REFUND_NOT_ELIGIBLE` | 422 | Order status does not allow refund |
| `DRIVER_NOT_ELIGIBLE` | 422 | Driver not approved or not active for assignment |

---

### 1.3 Standard Success Response Envelope

All successful responses wrap their payload in this envelope.

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 143,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

`meta` is only present on list endpoints that support pagination. Single-resource endpoints omit `meta`.

---

### 1.4 Role Definitions

| Role | Portal | Access Level |
|------|--------|-------------|
| `customer` | Customer Web (`/customer`) | Own orders, own profile, own credits |
| `vendor` | Vendor Portal (`/vendor`) | Own store, own product listings, own orders |
| `driver` | Driver Portal (`/driver`) | Own assigned deliveries, own earnings |
| `admin` | Admin Dashboard (`/admin`) | Full system access — all users, orders, vendors, drivers |

**Admin accounts cannot be created via `/auth/register`.** They must be seeded directly in the database.

---

## 2. Domain: Authentication

All user types (customer, vendor, driver, admin) share the same auth endpoints. The `role` field at registration determines which portal the user lands in. Driver registration has an extended payload due to vehicle and document requirements.

---

### 2.1 POST /auth/register — Customer & Vendor

**Used by view:** Register Page (customer and vendor roles)  
**RTK Query hook:** `useRegisterMutation` (`store/api/authApi.ts`)  
**Auth required:** No  
**Role required:** Public

**Description:** Creates a new user account for customer or vendor roles. Returns a JWT token immediately on success — no email verification required at this stage.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Adaeze Okonkwo",
  "email": "adaeze@example.com",
  "phone": "+447911123456",
  "password": "SecurePass1",
  "role": "vendor"
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | Min 2 characters |
| `email` | string | Yes | Valid email format; unique across all users |
| `phone` | string | Yes | Min 10 characters; frontend always sends in E.164 format with `+44` prefix |
| `password` | string | Yes | Min 6 characters |
| `role` | enum | Yes | Must be `customer` or `vendor` — **not** `admin` or `driver` |

> ⚠️ **Frontend Note:** The Zod schema enforces `min 6` for password. The spec above says 8 — confirm with the frontend team which rule to enforce. Current frontend sends passwords of 6+ characters.

#### Response

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1713001234567",
      "name": "Adaeze Okonkwo",
      "email": "adaeze@example.com",
      "phone": "+447911123456",
      "role": "vendor",
      "referral_code": "AFRO-AO47",
      "referred_by": null,
      "credit_balance": 500,
      "created_at": "2025-09-14T13:45:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Account created successfully"
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `user.id` | string | Unique user ID — prefix `usr_` + timestamp or UUID |
| `user.referral_code` | string | Auto-generated referral code, e.g. `AFRO-XX99` |
| `user.credit_balance` | integer | Starting balance in pence — backend should initialise at `500` (£5.00) |
| `token` | string | JWT access token, expires in 7 days |
| `message` | string | Human-readable confirmation string |

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 422 | `VALIDATION_ERROR` | Missing or invalid fields |
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |

#### Frontend Behaviour After This Response

Token is stored in `localStorage` under key `afrocart_auth` and dispatched to Redux via `setCredentials`. An `afrocart_token` httpOnly cookie is also set for middleware-level route protection. After registration, the frontend redirects to `/customer/home` (customer) or `/vendor/dashboard` (vendor) based on the `role` in the returned user object.

#### Notes / Business Rules

- Admin accounts cannot be created via this endpoint.
- If `referred_by` is present in the request (referral link flow), store the referrer's `referral_code` on the new user record. Referral reward logic is triggered after the referred user completes their first order.
- `credit_balance` starts at `500` (£5.00 sign-up credit).

---

### 2.2 POST /auth/register — Driver Extended

**Used by view:** Register Page — Driver Step 2 (`/register`)  
**RTK Query hook:** `useRegisterMutation` (`store/api/authApi.ts`)  
**Auth required:** No  
**Role required:** Public

**Description:** Same endpoint as 2.1 but with an extended payload for driver registration. Driver accounts are created with `approval_status: pending` and cannot access any protected driver routes until an admin approves them.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Kofi Asante",
  "email": "kofi@example.com",
  "phone": "+447700900321",
  "password": "DriveSecure7",
  "role": "driver",
  "vehicle_type": "motorcycle",
  "vehicle_plate": "LN21 KFA",
  "licence_number": "ASANT901234KF9AB",
  "dbs_check_acknowledged": true
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | Min 2 characters |
| `email` | string | Yes | Valid email format; unique |
| `phone` | string | Yes | Min 10 chars; E.164 format |
| `password` | string | Yes | Min 6 characters |
| `role` | enum | Yes | Must be exactly `"driver"` |
| `vehicle_type` | enum | Yes | `bicycle`, `moped`, `motorcycle`, `car`, `van` |
| `vehicle_plate` | string | Yes | Min 4 chars, max 10 chars |
| `licence_number` | string | Yes | Min 5 characters |
| `dbs_check_acknowledged` | boolean | Yes | Must be `true` — backend rejects if `false` |

#### Response

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1713009876543",
      "name": "Kofi Asante",
      "email": "kofi@example.com",
      "phone": "+447700900321",
      "role": "driver",
      "referral_code": "AFRO-KA88",
      "referred_by": null,
      "credit_balance": 0,
      "created_at": "2025-09-14T14:10:00.000Z"
    },
    "approval_status": "pending",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Driver application submitted. Please upload your documents."
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `approval_status` | string | Always `"pending"` on creation — embedded at top level of `data`, not inside `user` |
| `token` | string | JWT with `approval_status: "pending"` claim; expires in 7 days |

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 422 | `VALIDATION_ERROR` | Missing or invalid fields, or `dbs_check_acknowledged: false` |
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |

#### Frontend Behaviour After This Response

After successful registration, the frontend proceeds to the document upload step in the same register flow. The user is prompted to upload: driving licence, vehicle insurance, right to work proof, and profile photo (see [2.6](#26-post-driversdocumentsupload)). The driver is then redirected to `/driver/pending`.

#### Notes / Business Rules

- Driver `credit_balance` starts at `0` — they do not receive sign-up credit.
- `approval_status` must be `"pending"` on creation. Driver cannot access any `GET /driver/*` routes until this is `"approved"`.
- Documents are uploaded **after** this call completes — they are separate requests to `/drivers/documents/upload`.
- Backend must store `vehicle_type`, `vehicle_plate`, `licence_number`, and `dbs_check_acknowledged` on the driver profile record.

---

### 2.3 POST /auth/login

**Used by view:** Login Page (`/login`) — all roles  
**RTK Query hook:** `useLoginMutation` (`store/api/authApi.ts`)  
**Auth required:** No  
**Role required:** Public

**Description:** Authenticates a user by email and password. Returns a JWT token and the full user object. For driver accounts, `approval_status` is returned so the frontend can gate route access immediately.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "kofi@example.com",
  "password": "DriveSecure7"
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Min 6 characters |

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1713009876543",
      "name": "Kofi Asante",
      "email": "kofi@example.com",
      "phone": "+447700900321",
      "role": "driver",
      "referral_code": "AFRO-KA88",
      "referred_by": null,
      "credit_balance": 0,
      "created_at": "2025-09-14T14:10:00.000Z"
    },
    "approval_status": "pending",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Login successful"
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `approval_status` | string | Present **only** when `user.role === "driver"`. Values: `pending`, `approved`, `rejected`, `suspended`. Must be returned even for non-pending drivers so the frontend can gate routes. |
| `token` | string | JWT, expires in 7 days. For drivers, includes `approval_status` claim. |

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 401 | `AUTH_INVALID_CREDENTIALS` | Email not found, or password incorrect |
| 422 | `VALIDATION_ERROR` | Missing email or password field |

#### Frontend Behaviour After This Response

Token stored in localStorage + httpOnly cookie. Redux `setCredentials` dispatched. Role-based redirect:
- `admin` → `/admin/dashboard`
- `vendor` → `/vendor/dashboard`
- `driver` with `approval_status: approved` → `/driver/dashboard`
- `driver` with `approval_status: pending | rejected` → `/driver/pending`
- `customer` → `/customer/home`

Middleware also sets a `driver_approval_status` cookie from the token for SSR-level route gating.

#### Notes / Business Rules

- Do **not** return different error messages for "email not found" vs "wrong password" — always return `AUTH_INVALID_CREDENTIALS` to prevent email enumeration.
- Response shape must be identical across all roles; `approval_status` is simply omitted for non-driver roles.

---

### 2.4 POST /auth/verify-otp

**Used by view:** OTP Verification Page (`/verify-otp`)  
**RTK Query hook:** `useVerifyOtpMutation` (`store/api/authApi.ts`)  
**Auth required:** No  
**Role required:** Public

**Description:** Verifies the 6-digit OTP sent to the user's phone number after registration. On success, returns an updated token with `phone_verified: true` claim.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "+447911123456",
  "code": "482916"
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `phone` | string | Yes | E.164 format — frontend sends the phone from query param `?phone=+447...` |
| `code` | string | Yes | Exactly 6 numeric digits |

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `verified` | boolean | Always `true` on success |
| `token` | string | New JWT token with `phone_verified: true` claim embedded |

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 422 | `OTP_INVALID` | Code does not match what was sent |
| 422 | `OTP_EXPIRED` | OTP window has passed (recommend 10-minute TTL) |
| 429 | `VALIDATION_ERROR` | Exceeded 5 OTP attempts for this phone |

#### Frontend Behaviour After This Response

The OTP page reads the phone number from the URL query string (`?phone=...`). The 6-digit code is entered digit-by-digit into individual inputs. On success, the frontend replaces the stored token with the new token (which carries `phone_verified: true`) and redirects the user to their role dashboard. A 60-second countdown controls the resend button.

#### Notes / Business Rules

- Maximum 5 OTP attempts per phone number per code session. After 5 failures, the OTP is invalidated and the user must request a new one.
- OTP TTL: 10 minutes recommended.
- The resend endpoint (POST `/auth/resend-otp` or similar) is not currently wired in the frontend but should be planned for.

---

### 2.5 POST /auth/refresh-token

**Used by view:** All protected pages (via RTK Query base query interceptor)  
**RTK Query hook:** baseApi re-auth logic (`store/api/baseApi.ts`)  
**Auth required:** No (uses refresh token)  
**Role required:** Any authenticated role

> ⚠️ **Frontend Note:** A refresh token flow is not currently explicit in `authApi.ts`. The frontend relies on a 7-day token expiry. This endpoint should be built so the frontend can add silent refresh when token expiry is shortened in production.

**Description:** Exchanges a valid refresh token for a new access token and a new refresh token (rotation pattern). Called silently by the frontend when a 401 `AUTH_TOKEN_EXPIRED` is received.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `refresh_token` | string | Yes | Valid, non-expired refresh token |

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 401 | `AUTH_TOKEN_INVALID` | Refresh token is invalid or already rotated |
| 401 | `AUTH_TOKEN_EXPIRED` | Refresh token has also expired (user must log in again) |

---

### 2.6 POST /drivers/documents/upload

**Used by view:** Register Page — Driver Step 2; Driver Pending Page (`/driver/pending`)  
**RTK Query hook:** `useUploadDriverDocumentMutation` (`store/api/authApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `driver`

**Description:** Uploads a single driver verification document. Called once per document type. If a document of the same type already exists for this driver, it is replaced. Documents are stored in a private S3 bucket; the response returns a signed URL.

#### Request

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `file` | binary | Yes | Max 10MB. Accepted: `jpg`, `jpeg`, `png`, `pdf` |
| `document_type` | string | Yes | Enum: `driving_licence`, `vehicle_insurance`, `right_to_work`, `profile_photo` |

**document_type enum values:**

| Value | Description |
|-------|-------------|
| `driving_licence` | UK Driving Licence (front) |
| `vehicle_insurance` | Vehicle Insurance Certificate |
| `right_to_work` | Proof of Right to Work (UK) |
| `profile_photo` | Driver profile photo |

#### Response

**Success — 201 Created:**
```json
{
  "success": true,
  "data": {
    "document_type": "driving_licence",
    "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/driving_licence.jpg?X-Amz-Expires=3600&...",
    "message": "Document uploaded successfully"
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `document_type` | string | The type that was uploaded (mirrors the request value) |
| `file_url` | string | Pre-signed S3 URL — expires in 1 hour. Not a permanent public URL. |
| `message` | string | Confirmation string |

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 422 | `VALIDATION_ERROR` | Invalid `document_type`, or file exceeds 10MB, or unsupported format |
| 500 | `DOCUMENT_UPLOAD_FAILED` | S3 write error |
| 403 | `AUTH_INSUFFICIENT_ROLE` | Non-driver token |

#### Frontend Behaviour After This Response

After each upload, the frontend shows a green checkmark next to that document type in the upload list. All four documents must be uploaded before the submit button is enabled. The `file_url` is not stored in Redux — the frontend re-fetches documents via `GET /drivers/me/approval-status`.

#### Notes / Business Rules

- Uploading a `document_type` that already exists **replaces** the existing document and resets its `verified: false` (admin must re-verify if updated).
- Files are scanned for malware before being stored. The endpoint should return a `DOCUMENT_UPLOAD_FAILED` error if the scan fails, not silently pass.
- `file_url` in all subsequent GET responses must be a freshly signed URL (1-hour expiry) generated at response time — not a stored URL. Admin "View Document" clicks trigger a fresh signed URL fetch.

---

### 2.7 GET /users/me

**Used by view:** App startup / route guard (rehydrates user from stored token)  
**RTK Query hook:** `useGetMeQuery` (`store/api/authApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** Any authenticated role

**Description:** Returns the full profile for the authenticated user. Called on app load to rehydrate Redux state from a valid token. For drivers, includes the current `approval_status` and all uploaded documents.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

No request body or query parameters.

#### Response

**Success — 200 OK (driver example):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1713009876543",
      "name": "Kofi Asante",
      "email": "kofi@example.com",
      "phone": "+447700900321",
      "role": "driver",
      "referral_code": "AFRO-KA88",
      "referred_by": null,
      "credit_balance": 0,
      "created_at": "2025-09-14T14:10:00.000Z"
    },
    "approval_status": "pending",
    "documents": [
      {
        "type": "driving_licence",
        "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/...",
        "uploaded_at": "2025-09-14T14:25:00.000Z",
        "verified": false
      }
    ]
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `user` | object | Full User object (see [Section 4.1](#41-user-object)) |
| `approval_status` | string | Driver only. Omitted for all other roles. |
| `documents` | array | Driver only. All uploaded DriverDocument objects. Omitted for other roles. |

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 401 | `AUTH_TOKEN_EXPIRED` | Token has expired |
| 401 | `AUTH_TOKEN_INVALID` | Token is malformed |

---

### 2.8 GET /drivers/me/approval-status

**Used by view:** Driver Pending Page (`/driver/pending`) — polls every 30 seconds  
**RTK Query hook:** `useGetDriverApprovalStatusQuery` (`store/api/authApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `driver`

**Description:** Returns the driver's current approval status, rejection reason, all uploaded documents with their individual verification state, and a list of document types not yet uploaded. The Driver Pending Page polls this endpoint every 30 seconds and auto-redirects to `/driver/dashboard` when `approval_status` becomes `"approved"`.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

No request body or query parameters.

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "approval_status": "pending",
    "rejection_reason": null,
    "documents": [
      {
        "type": "driving_licence",
        "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/driving_licence.jpg?X-Amz-Expires=3600&...",
        "uploaded_at": "2025-09-14T14:25:00.000Z",
        "verified": true
      },
      {
        "type": "vehicle_insurance",
        "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/vehicle_insurance.pdf?X-Amz-Expires=3600&...",
        "uploaded_at": "2025-09-14T14:27:00.000Z",
        "verified": false
      }
    ],
    "missing_documents": ["right_to_work", "profile_photo"]
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `approval_status` | string | `pending`, `approved`, `rejected`, or `suspended` |
| `rejection_reason` | string\|null | Set by admin on rejection. `null` if not rejected. |
| `documents` | array | All uploaded documents with individual `verified` status |
| `missing_documents` | array | List of `document_type` strings not yet uploaded |

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 403 | `AUTH_INSUFFICIENT_ROLE` | Non-driver token |
| 401 | `AUTH_TOKEN_EXPIRED` | Token has expired |

#### Frontend Behaviour After This Response

The Driver Pending Page (`/driver/pending`) renders:
- The `approval_status` badge
- The `rejection_reason` if present
- A checklist of documents — uploaded ones show a tick; unverified ones show a clock icon
- An "Upload Now" link for each entry in `missing_documents`

The page polls every 30 seconds. When `approval_status === "approved"` is received, the page immediately redirects to `/driver/dashboard` without user interaction.

---

## 3. Domain: Admin

All admin endpoints require:
```
Authorization: Bearer <token>
```
The `role` claim in the token must be `"admin"`. Any request from a token with a different role returns:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INSUFFICIENT_ROLE",
    "message": "Admin access required"
  }
}
```
HTTP Status: `403`

---

### View: Admin Overview Dashboard

> **Page:** `/admin/dashboard`  
> **Purpose:** Give the admin a real-time snapshot of platform health — KPI cards, charts, and a recent orders table.

---

### 3.1 GET /admin/stats

**Used by view:** Admin Overview — KPI cards + bar/pie charts  
**RTK Query hook:** `useGetAdminStatsQuery` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns a single object containing all KPI figures and chart data for the admin overview dashboard. This is one request — not multiple. The frontend renders 5 KPI cards, an orders bar chart (last 7 days), and a revenue pie chart from this single response.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

No query parameters.

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "total_users": 1847,
    "orders_today": 43,
    "revenue_today": 89450,
    "active_vendors": 28,
    "pending_vendors": 5,
    "active_drivers": 12,
    "pending_drivers": 3,
    "daily_orders": [
      { "date": "2025-09-08", "count": 31 },
      { "date": "2025-09-09", "count": 47 },
      { "date": "2025-09-10", "count": 38 },
      { "date": "2025-09-11", "count": 52 },
      { "date": "2025-09-12", "count": 29 },
      { "date": "2025-09-13", "count": 61 },
      { "date": "2025-09-14", "count": 43 }
    ],
    "revenue_split": {
      "vendor": 74500,
      "platform": 14950
    }
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `total_users` | integer | Total registered users across all roles |
| `orders_today` | integer | Count of orders created today (UTC day) |
| `revenue_today` | integer | Total order value today in pence |
| `active_vendors` | integer | Vendors with `status: "approved"` |
| `pending_vendors` | integer | Vendors with `status: "pending"` — drives the sidebar badge |
| `active_drivers` | integer | Drivers with `approval_status: "approved"` |
| `pending_drivers` | integer | Drivers with `approval_status: "pending"` — drives the sidebar badge |
| `daily_orders` | array | Last 7 days of order counts. `date` in `YYYY-MM-DD` format. Powers the bar chart. |
| `revenue_split.vendor` | integer | Sum of `total_amount` across delivered/completed orders today, in pence |
| `revenue_split.platform` | integer | Platform commission share today in pence |

> ⚠️ **Frontend Note:** The `AdminStats` TypeScript type uses `revenue_split.vendor` and `revenue_split.platform` — not `vendor_total` / `platform_total`. Use these exact field names.

---

### 3.2 GET /admin/orders — Recent (for Overview)

**Used by view:** Admin Overview — Recent Orders table (bottom of dashboard)  
**RTK Query hook:** `useGetOrdersQuery({})` with `limit=10, sort=created_at:desc` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns the 10 most recent orders across all vendors. This is the same endpoint as [3.7](#37-get-adminorders--order-monitor) — the dashboard simply calls it with a small limit and no filters. See [3.7](#37-get-adminorders--order-monitor) for the full query parameter reference.

**Quick Query Params for Dashboard Use:**

| Param | Value |
|-------|-------|
| `limit` | `10` |
| `sort` | `created_at:desc` |

**Response:** Same structure as [3.7](#37-get-adminorders--order-monitor). `meta` pagination object still returned.

---

### View: Vendor Management

> **Page:** `/admin/vendors`  
> **Purpose:** Allow admin to review, approve, reject, and manage commission for all vendors.

---

### 3.3 GET /admin/vendors

**Used by view:** Admin Vendor Management — vendor table with filter tabs  
**RTK Query hook:** `useGetVendorsQuery({status})` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns a paginated list of vendors, optionally filtered by status. The vendor page has four tabs: All | Pending | Approved | Rejected.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | string | No | (all) | Filter by vendor status: `pending`, `approved`, `rejected`. Omit for all. |
| `search` | string | No | — | Search by `business_name` or `owner_name` (case-insensitive, partial match) |
| `page` | integer | No | 1 | Page number |
| `per_page` | integer | No | 20 | Results per page |

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ven_001",
      "user_id": "usr_1713001111111",
      "business_name": "Mama Africa Kitchen",
      "business_type": "restaurant",
      "address": "47 Rye Lane, Peckham, London SE15 4ST",
      "status": "pending",
      "commission_rate": 15,
      "created_at": "2025-08-20T09:30:00.000Z",
      "owner_name": "Amara Diallo",
      "email": "amara@mamaafrica.co.uk",
      "phone": "+447911234501"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 41,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 3.4 PATCH /admin/vendors/:id/approve

**Used by view:** Vendor table Approve button; VendorDetailPanel Approve button  
**RTK Query hook:** `useApproveVendorMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Sets the vendor's `status` to `"approved"`. The vendor can now appear on the customer-facing platform.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | UUID/ID of the vendor |

No request body.

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "ven_001",
    "business_name": "Mama Africa Kitchen",
    "status": "approved",
    "commission_rate": 15,
    "owner_name": "Amara Diallo",
    "email": "amara@mamaafrica.co.uk",
    "phone": "+447911234501",
    "business_type": "restaurant",
    "address": "47 Rye Lane, Peckham, London SE15 4ST",
    "user_id": "usr_1713001111111",
    "created_at": "2025-08-20T09:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `VENDOR_NOT_FOUND` | No vendor exists with this ID |

#### Notes / Business Rules

Approving a vendor should trigger a notification to the vendor (email/push) informing them their application has been approved. RTK Query invalidates `['Vendor', 'Stats']` tags after this mutation.

---

### 3.5 PATCH /admin/vendors/:id/reject

**Used by view:** Vendor table Reject button; VendorDetailPanel Reject button  
**RTK Query hook:** `useRejectVendorMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Sets the vendor's `status` to `"rejected"`.

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | UUID/ID of the vendor |

**Request Body:**
```json
{
  "reason": "Incomplete business documentation provided."
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `reason` | string | Yes | Min 1 character |

#### Response

**Success — 200 OK:** Returns updated Vendor object with `"status": "rejected"`.

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `VENDOR_NOT_FOUND` | No vendor with this ID |
| 422 | `VALIDATION_ERROR` | Missing `reason` field |

---

### 3.6 PATCH /admin/vendors/:id/commission

**Used by view:** VendorDetailPanel — commission rate input field  
**RTK Query hook:** `useUpdateCommissionMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Updates the commission rate for a specific vendor. The admin can set a custom rate different from the platform default.

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | UUID/ID of the vendor |

**Request Body:**
```json
{
  "commission_rate": 12
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `commission_rate` | number | Yes | Min `0`, max `100`. Represents percentage (e.g. `15` = 15%). |

#### Response

**Success — 200 OK:** Returns updated Vendor object with new `commission_rate`.

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `VENDOR_NOT_FOUND` | No vendor with this ID |
| 422 | `VALIDATION_ERROR` | `commission_rate` outside 0–100 range |

---

### View: Order Monitor

> **Page:** `/admin/orders`  
> **Purpose:** Full order history with filters by status, vendor, date range, and search. Admins can view order details, assign drivers, and process refunds.

---

### 3.7 GET /admin/orders — Order Monitor

**Used by view:** Admin Order Monitor — main orders table  
**RTK Query hook:** `useGetOrdersQuery({status, vendor_id, from, to})` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns a paginated, filterable list of all orders across all vendors.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | string | No | all | Filter by order status enum |
| `vendor_id` | string | No | — | Filter by vendor UUID |
| `from` | string | No | — | ISO 8601 date — orders created on or after this date |
| `to` | string | No | — | ISO 8601 date — orders created on or before this date |
| `search` | string | No | — | Search by `order_number` or `customer_name` |
| `limit` | integer | No | — | Hard cap on results (used by dashboard for top-10 view) |
| `sort` | string | No | `created_at:desc` | Sort field and direction |
| `page` | integer | No | 1 | Page number |
| `per_page` | integer | No | 20 | Results per page |

**status enum values:** `pending`, `accepted`, `preparing`, `picked_up`, `delivered`, `completed`, `cancelled`

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ord_001",
      "order_number": "AFRO-20250914-001",
      "user_id": "usr_1713000000001",
      "customer_name": "Ngozi Eze",
      "vendor_id": "ven_001",
      "vendor_name": "Mama Africa Kitchen",
      "items": [
        { "name": "Jollof Rice (Large)", "quantity": 2, "unit_price": 850, "total": 1700 },
        { "name": "Egusi Soup", "quantity": 1, "unit_price": 950, "total": 950 }
      ],
      "total_amount": 2800,
      "delivery_fee": 350,
      "credits_used": 200,
      "status": "delivered",
      "driver_id": "usr_1713009876543",
      "driver_name": "Kofi Asante",
      "created_at": "2025-09-14T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 97,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 3.8 GET /admin/orders/:id

**Used by view:** Order Detail slide-in panel (opened by clicking View on any order row)  
**RTK Query hook:** `useGetOrderByIdQuery(id)` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns full details for a single order, including all items, a payment breakdown, driver and customer info, and the order timeline. The timeline powers the visual stepper component in the detail panel.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Order UUID |

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "ord_001",
    "order_number": "AFRO-20250914-001",
    "user_id": "usr_1713000000001",
    "customer_name": "Ngozi Eze",
    "vendor_id": "ven_001",
    "vendor_name": "Mama Africa Kitchen",
    "items": [
      { "name": "Jollof Rice (Large)", "quantity": 2, "unit_price": 850, "total": 1700 },
      { "name": "Egusi Soup", "quantity": 1, "unit_price": 950, "total": 950 }
    ],
    "total_amount": 2800,
    "delivery_fee": 350,
    "credits_used": 200,
    "status": "delivered",
    "driver_id": "usr_1713009876543",
    "driver_name": "Kofi Asante",
    "created_at": "2025-09-14T12:00:00.000Z",
    "timeline": [
      { "status": "pending", "timestamp": "2025-09-14T12:00:00.000Z", "note": "Order placed" },
      { "status": "accepted", "timestamp": "2025-09-14T12:03:00.000Z", "note": "Vendor accepted order" },
      { "status": "preparing", "timestamp": "2025-09-14T12:05:00.000Z", "note": "Kitchen started preparation" },
      { "status": "picked_up", "timestamp": "2025-09-14T12:28:00.000Z", "note": "Kofi Asante picked up the order" },
      { "status": "delivered", "timestamp": "2025-09-14T12:47:00.000Z", "note": "Delivered to customer" }
    ]
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `timeline` | array | Ordered list of status transitions. Each entry has `status`, `timestamp`, and `note`. |
| `timeline[].note` | string | Human-readable event description |

> ⚠️ **Frontend Note:** The `Order` TypeScript type in `types/index.ts` does not currently include a `timeline` field. The `OrderDetailPanel` renders a visual stepper but the backend must return this array. The frontend will need a type update to consume it — flag this to the frontend team.

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `ORDER_NOT_FOUND` | No order with this ID |

---

### 3.9 PATCH /admin/orders/:id/assign-driver

**Used by view:** Assign Driver modal (Order Monitor); Manual Assignment table (Driver Management page)  
**RTK Query hook:** `useAssignDriverMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Assigns an approved, active driver to a pending or accepted order. The DriverGrid component on the Driver Management page also uses this endpoint to manually assign unassigned orders.

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Order UUID |

**Request Body:**
```json
{
  "driver_id": "usr_1713009876543"
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `driver_id` | string | Yes | Must be a valid driver ID |

#### Response

**Success — 200 OK:** Returns updated Order object with `driver_id` and `driver_name` populated.

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `ORDER_NOT_FOUND` | No order with this ID |
| 404 | `DRIVER_NOT_FOUND` | No driver with this ID |
| 422 | `DRIVER_NOT_ELIGIBLE` | Driver's `approval_status` is not `"approved"` |
| 422 | `VALIDATION_ERROR` | Order status is not `pending` or `accepted` |

#### Notes / Business Rules

- After assignment, increment `driver.active_deliveries` by 1.
- The frontend dropdown for driver selection is pre-filtered to only show drivers with `approval_status: "approved"` and `status: "online"`.
- On the Driver Management page (DriverGrid), pending orders are shown in a table. The admin selects a driver from a dropdown and clicks confirm — the same `PATCH /admin/orders/:id/assign-driver` call is made.

---

### 3.10 POST /admin/orders/:id/refund

**Used by view:** Refund button in Order Detail Panel  
**RTK Query hook:** `useRefundOrderMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Processes a full or partial refund for an order. Only orders in `completed` or `delivered` status are eligible.

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Order UUID |

**Request Body:**
```json
{
  "reason": "Customer received incorrect items.",
  "amount": 1700
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `reason` | string | Yes | Min 1 character |
| `amount` | integer | No | Partial refund amount in pence. If omitted, full `total_amount` is refunded. |

#### Response

**Success — 200 OK:** Returns updated Order object with `status: "cancelled"` and refund metadata.

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `ORDER_NOT_FOUND` | No order with this ID |
| 422 | `REFUND_NOT_ELIGIBLE` | Order status is not `completed` or `delivered` |
| 422 | `VALIDATION_ERROR` | `amount` exceeds `total_amount`, or missing `reason` |

#### Notes / Business Rules

- Full refund (no `amount` provided): refund `total_amount + delivery_fee` back to customer's payment method.
- Partial refund: refund only the specified `amount`.
- If `credits_used` was applied to the order, credits should be restored to the customer's `credit_balance` proportionally.
- Set `order.status = "cancelled"` after successful refund.

---

### View: Driver Management

> **Page:** `/admin/drivers`  
> **Purpose:** Review driver applications, verify documents, approve/reject/suspend drivers, and manually assign drivers to pending orders.

---

### 3.11 GET /admin/drivers

**Used by view:** Admin Driver Management — driver grid cards + KPI counters  
**RTK Query hook:** `useGetDriversQuery({approval_status})` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns a paginated list of all drivers, with optional filtering by `approval_status`. Each driver record includes their `documents` array so the DriverDetailPanel can show document status without a separate request.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `approval_status` | string | No | all | Filter by: `pending`, `approved`, `rejected`, `suspended` |
| `search` | string | No | — | Search by driver name or email |
| `page` | integer | No | 1 | Page number |
| `per_page` | integer | No | 20 | Results per page |

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_1713009876543",
      "name": "Kofi Asante",
      "email": "kofi@example.com",
      "phone": "+447700900321",
      "status": "online",
      "approval_status": "approved",
      "rejection_reason": null,
      "vehicle_type": "motorcycle",
      "vehicle_plate": "LN21 KFA",
      "documents": [
        {
          "type": "driving_licence",
          "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/...",
          "uploaded_at": "2025-09-14T14:25:00.000Z",
          "verified": true
        },
        {
          "type": "vehicle_insurance",
          "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/...",
          "uploaded_at": "2025-09-14T14:27:00.000Z",
          "verified": true
        },
        {
          "type": "right_to_work",
          "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/...",
          "uploaded_at": "2025-09-14T14:29:00.000Z",
          "verified": true
        },
        {
          "type": "profile_photo",
          "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/...",
          "uploaded_at": "2025-09-14T14:30:00.000Z",
          "verified": true
        }
      ],
      "dbs_check_acknowledged": true,
      "active_deliveries": 1,
      "total_completed": 47,
      "rating": 4.8,
      "earnings_today": 3250,
      "created_at": "2025-09-14T14:10:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 18,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

---

### 3.12 GET /admin/drivers/:id/documents

**Used by view:** DriverDetailPanel — Documents section  
**RTK Query hook:** `useGetDriverDocumentsQuery(id)` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns the full document list for a specific driver. Used when the admin opens a driver's detail panel to see document verification status.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Driver UUID |

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "type": "driving_licence",
      "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/driving_licence.jpg?X-Amz-Expires=3600&...",
      "uploaded_at": "2025-09-14T14:25:00.000Z",
      "verified": false
    },
    {
      "type": "vehicle_insurance",
      "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/vehicle_insurance.pdf?X-Amz-Expires=3600&...",
      "uploaded_at": "2025-09-14T14:27:00.000Z",
      "verified": false
    }
  ]
}
```

#### Notes / Business Rules

All `file_url` values must be freshly signed S3 URLs generated at response time — not cached URLs. Signed URLs expire in 1 hour.

---

### 3.13 PATCH /admin/drivers/:id/approve

**Used by view:** DriverDetailPanel — Approve button  
**RTK Query hook:** `useApproveDriverMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Approves a driver's application. Sets `approval_status` to `"approved"`. The backend must verify that **all four documents** have `verified: true` before approving — if any document is unverified, the endpoint must return an error.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Driver UUID |

No request body.

#### Response

**Success — 200 OK:** Returns updated Driver object with `"approval_status": "approved"`.

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `DRIVER_NOT_FOUND` | No driver with this ID |
| 422 | `DRIVER_DOCUMENTS_UNVERIFIED` | One or more documents are not verified |

**Error response for unverified documents:**
```json
{
  "success": false,
  "error": {
    "code": "DRIVER_DOCUMENTS_UNVERIFIED",
    "message": "All documents must be verified before approving this driver.",
    "fields": {
      "unverified_documents": ["vehicle_insurance", "right_to_work"]
    }
  }
}
```

#### Notes / Business Rules

- On success: set `approval_status = "approved"`. The driver's JWT at next login will reflect the new status.
- Should trigger a push notification / email to the driver: "Your application has been approved. You can now start delivering."
- The Approve button in the DriverDetailPanel UI is disabled if any document is not verified — but the backend must also enforce this server-side.

---

### 3.14 PATCH /admin/drivers/:id/reject

**Used by view:** DriverDetailPanel — Reject button  
**RTK Query hook:** `useRejectDriverMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Rejects a driver's application. Sets `approval_status` to `"rejected"` and stores the rejection reason. The driver will see this reason on their `/driver/pending` page.

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Driver UUID |

**Request Body:**
```json
{
  "reason": "Vehicle insurance document appears expired. Please upload a valid certificate."
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `reason` | string | Yes | Min 1 character |

#### Response

**Success — 200 OK:** Returns updated Driver object with `"approval_status": "rejected"` and `rejection_reason` populated.

#### Notes / Business Rules

`rejection_reason` is returned in `GET /drivers/me/approval-status` so the driver can see why they were rejected and re-upload corrected documents.

---

### 3.15 PATCH /admin/drivers/:id/suspend

**Used by view:** DriverDetailPanel — Suspend button (only shown for `approved` drivers)  
**RTK Query hook:** `useSuspendDriverMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Suspends an approved driver. Sets `approval_status` to `"suspended"`. The driver immediately loses access to all driver routes.

#### Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Driver UUID |

**Request Body:**
```json
{
  "reason": "Multiple customer complaints received this week."
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `reason` | string | Yes | Min 1 character |

#### Response

**Success — 200 OK:** Returns updated Driver object with `"approval_status": "suspended"`.

#### Notes / Business Rules

- Route gating is enforced in middleware via the `approval_status` JWT claim. After suspension, the claim only updates on next login or token refresh.
- Any active deliveries assigned to this driver should be flagged for reassignment.

---

### 3.16 PATCH /admin/drivers/:id/reinstate

**Used by view:** DriverDetailPanel — Reinstate button (shown for `suspended` drivers)  
**RTK Query hook:** ⚠️ Not currently defined in `store/api/adminApi.ts` — endpoint is needed  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

> ⚠️ **Frontend Note:** The DriverDetailPanel renders a "Reinstate" button for suspended drivers, but the RTK mutation for this endpoint has not been added to `adminApi.ts` yet. The backend should build this endpoint; the frontend team will add `useReinstateDriverMutation` when integrating.

**Description:** Reinstates a suspended driver, setting their `approval_status` back to `"approved"`.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Driver UUID |

No request body.

#### Response

**Success — 200 OK:** Returns updated Driver object with `"approval_status": "approved"`.

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `DRIVER_NOT_FOUND` | No driver with this ID |
| 422 | `VALIDATION_ERROR` | Driver is not currently suspended |

---

### 3.17 PATCH /admin/drivers/:id/documents/:document_type/verify

**Used by view:** DriverDetailPanel — "Mark as Verified" toggle next to each document  
**RTK Query hook:** `useVerifyDriverDocumentMutation` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Marks a single driver document as verified. The admin clicks "Mark as Verified" next to each document after reviewing the file via the signed URL. All four documents must be verified before the driver can be approved.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Driver UUID |
| `document_type` | string | Yes | Enum: `driving_licence`, `vehicle_insurance`, `right_to_work`, `profile_photo` |

No request body.

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": {
    "type": "driving_licence",
    "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/...",
    "uploaded_at": "2025-09-14T14:25:00.000Z",
    "verified": true
  }
}
```

**Error Responses:**

| Status | Code | When it happens |
|--------|------|-----------------|
| 404 | `DRIVER_NOT_FOUND` | No driver with this ID |
| 404 | `NOT_FOUND` | Driver has not uploaded a document of this type |

---

### View: Referrals & Credits

> **Page:** `/admin/referrals`  
> **Purpose:** Track referral rewards and credit transactions across the platform.

---

### 3.18 GET /admin/referrals

**Used by view:** Admin Referrals page — Referral Tracking table (left panel)  
**RTK Query hook:** `useGetReferralsQuery` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns a paginated list of all referral records showing which users referred whom and whether the reward has been paid.

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | string | No | all | Filter by reward status: `pending`, `paid` |
| `page` | integer | No | 1 | Page number |
| `per_page` | integer | No | 20 | Results per page |

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ref_001",
      "referrer_name": "Emeka Nwosu",
      "referrer_id": "usr_1713000000010",
      "referred_name": "Chidi Okafor",
      "referred_id": "usr_1713000000020",
      "orders_completed": 1,
      "reward_status": "pending",
      "reward_amount": 500,
      "created_at": "2025-08-15T10:00:00.000Z",
      "rewarded_at": null
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 34,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

**Response Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `referrer_id` | string | UUID of the user who shared their referral code |
| `referred_id` | string | UUID of the user who signed up with the code |
| `orders_completed` | integer | Number of orders the referred user has completed (reward triggers at 2) |
| `reward_amount` | integer | Reward value in pence (e.g. `500` = £5.00) |
| `rewarded_at` | string\|null | ISO 8601 timestamp when reward was paid. `null` if pending. |

> ⚠️ **Frontend Note:** The current `Referral` TypeScript type in `types/index.ts` is missing `referrer_id`, `referred_id`, `reward_amount`, and `rewarded_at`. The frontend type will need updating to consume these fields. The backend must include them.

---

### 3.19 GET /admin/credits/transactions

**Used by view:** Admin Referrals page — Credit Transactions log (right panel)  
**RTK Query hook:** `useGetCreditTransactionsQuery` (`store/api/adminApi.ts`)  
**Auth required:** Yes (Bearer)  
**Role required:** `admin`

**Description:** Returns a paginated log of all credit transactions across all users — both credits earned (referral rewards, promotions) and credits deducted (applied at checkout).

#### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | No | all | Filter by transaction type: `earned`, `deducted` |
| `user_id` | string | No | — | Filter by specific user UUID |
| `from` | string | No | — | ISO 8601 date — transactions on or after |
| `to` | string | No | — | ISO 8601 date — transactions on or before |
| `page` | integer | No | 1 | Page number |
| `per_page` | integer | No | 20 | Results per page |

> ⚠️ **Frontend Note:** The current `useGetCreditTransactionsQuery` hook in `adminApi.ts` does not pass any query params. These params should be added as the filter UI is built. The backend must support them from the start.

#### Response

**Success — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cred_001",
      "user_id": "usr_1713000000010",
      "user_name": "Emeka Nwosu",
      "amount": 500,
      "type": "earned",
      "reason": "Referral Reward AFRO-EN12 — Chidi Okafor completed 2 orders",
      "created_at": "2025-09-01T14:00:00.000Z"
    },
    {
      "id": "cred_002",
      "user_id": "usr_1713000000001",
      "user_name": "Ngozi Eze",
      "amount": 200,
      "type": "deducted",
      "reason": "Applied at checkout — Order AFRO-20250914-001",
      "created_at": "2025-09-14T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 208,
    "total_pages": 11,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 4. Shared Object Schemas

Full JSON examples with realistic AfroCart data for every reusable object type.

---

### 4.1 User Object

```json
{
  "id": "usr_1713000000001",
  "name": "Ngozi Eze",
  "email": "ngozi@example.com",
  "phone": "+447800123456",
  "role": "customer",
  "referral_code": "AFRO-NE31",
  "referred_by": "AFRO-EN12",
  "credit_balance": 750,
  "created_at": "2025-07-10T09:00:00.000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique user identifier |
| `name` | string | Full name |
| `email` | string | Unique across all users |
| `phone` | string | E.164 format |
| `role` | string | `customer`, `vendor`, `driver`, `admin` |
| `referral_code` | string | Auto-generated; e.g. `AFRO-XX99` |
| `referred_by` | string\|null | Referral code used at signup, or `null` |
| `credit_balance` | integer | In pence |
| `created_at` | string | ISO 8601 UTC |

---

### 4.2 Vendor Object

```json
{
  "id": "ven_001",
  "user_id": "usr_1713001111111",
  "business_name": "Mama Africa Kitchen",
  "business_type": "restaurant",
  "address": "47 Rye Lane, Peckham, London SE15 4ST",
  "status": "approved",
  "commission_rate": 15,
  "created_at": "2025-08-20T09:30:00.000Z",
  "owner_name": "Amara Diallo",
  "email": "amara@mamaafrica.co.uk",
  "phone": "+447911234501"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Vendor record ID |
| `user_id` | string | Linked User ID |
| `business_name` | string | Trading name |
| `business_type` | string | `restaurant` or `store` |
| `address` | string | Full UK address |
| `status` | string | `pending`, `approved`, `rejected` |
| `commission_rate` | number | Percentage (0–100) |
| `owner_name` | string | Full name of owner |
| `email` | string | Vendor contact email |
| `phone` | string | Vendor contact phone |

---

### 4.3 Driver Object (Full)

```json
{
  "id": "usr_1713009876543",
  "name": "Kofi Asante",
  "email": "kofi@example.com",
  "phone": "+447700900321",
  "status": "online",
  "approval_status": "approved",
  "rejection_reason": null,
  "vehicle_type": "motorcycle",
  "vehicle_plate": "LN21 KFA",
  "documents": [
    {
      "type": "driving_licence",
      "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/driving_licence.jpg?X-Amz-Expires=3600&...",
      "uploaded_at": "2025-09-14T14:25:00.000Z",
      "verified": true
    },
    {
      "type": "vehicle_insurance",
      "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/vehicle_insurance.pdf?X-Amz-Expires=3600&...",
      "uploaded_at": "2025-09-14T14:27:00.000Z",
      "verified": true
    },
    {
      "type": "right_to_work",
      "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/right_to_work.pdf?X-Amz-Expires=3600&...",
      "uploaded_at": "2025-09-14T14:29:00.000Z",
      "verified": true
    },
    {
      "type": "profile_photo",
      "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/profile_photo.jpg?X-Amz-Expires=3600&...",
      "uploaded_at": "2025-09-14T14:30:00.000Z",
      "verified": true
    }
  ],
  "dbs_check_acknowledged": true,
  "active_deliveries": 1,
  "total_completed": 47,
  "rating": 4.8,
  "earnings_today": 3250,
  "created_at": "2025-09-14T14:10:00.000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `status` | string | `online` or `offline` — real-time availability |
| `approval_status` | string | `pending`, `approved`, `rejected`, `suspended` |
| `rejection_reason` | string\|null | Set by admin; `null` otherwise |
| `vehicle_type` | string | `bicycle`, `moped`, `motorcycle`, `car`, `van` |
| `vehicle_plate` | string\|null | UK registration plate |
| `dbs_check_acknowledged` | boolean | Driver confirmed DBS check consent |
| `active_deliveries` | integer | Currently assigned live deliveries |
| `total_completed` | integer | All-time completed deliveries |
| `rating` | number | Average rating (1.0–5.0) |
| `earnings_today` | integer | Today's earnings in pence |

---

### 4.4 DriverDocument Object

```json
{
  "type": "driving_licence",
  "file_url": "https://afrocart-docs.s3.eu-west-2.amazonaws.com/drivers/usr_1713009876543/driving_licence.jpg?X-Amz-Expires=3600&...",
  "uploaded_at": "2025-09-14T14:25:00.000Z",
  "verified": false
}
```

| Field | Type | Notes |
|-------|------|-------|
| `type` | string | `driving_licence`, `vehicle_insurance`, `right_to_work`, `profile_photo` |
| `file_url` | string | Freshly signed S3 URL — expires 1 hour from response generation |
| `uploaded_at` | string | ISO 8601 UTC |
| `verified` | boolean | `true` when admin has clicked "Mark as Verified" |

---

### 4.5 Order Object (Full)

```json
{
  "id": "ord_001",
  "order_number": "AFRO-20250914-001",
  "user_id": "usr_1713000000001",
  "customer_name": "Ngozi Eze",
  "vendor_id": "ven_001",
  "vendor_name": "Mama Africa Kitchen",
  "items": [
    { "name": "Jollof Rice (Large)", "quantity": 2, "unit_price": 850, "total": 1700 },
    { "name": "Egusi Soup", "quantity": 1, "unit_price": 950, "total": 950 },
    { "name": "Scotch Bonnet Pack (x10)", "quantity": 1, "unit_price": 150, "total": 150 }
  ],
  "total_amount": 2800,
  "delivery_fee": 350,
  "credits_used": 200,
  "status": "delivered",
  "driver_id": "usr_1713009876543",
  "driver_name": "Kofi Asante",
  "created_at": "2025-09-14T12:00:00.000Z",
  "timeline": [
    { "status": "pending", "timestamp": "2025-09-14T12:00:00.000Z", "note": "Order placed" },
    { "status": "accepted", "timestamp": "2025-09-14T12:03:00.000Z", "note": "Mama Africa Kitchen accepted the order" },
    { "status": "preparing", "timestamp": "2025-09-14T12:05:00.000Z", "note": "Kitchen started preparation" },
    { "status": "picked_up", "timestamp": "2025-09-14T12:28:00.000Z", "note": "Kofi Asante picked up the order" },
    { "status": "delivered", "timestamp": "2025-09-14T12:47:00.000Z", "note": "Delivered to customer in SE15" }
  ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `order_number` | string | Human-readable; format `AFRO-YYYYMMDD-NNN` |
| `total_amount` | integer | Sum of all item totals in pence |
| `delivery_fee` | integer | Delivery charge in pence |
| `credits_used` | integer | Credits applied at checkout in pence |
| `driver_id` | string\|null | `null` until driver is assigned |
| `driver_name` | string\|null | `null` until driver is assigned |
| `timeline` | array | See [4.7](#47-ordertimelineevent-object) — only on single-order GET |

---

### 4.6 OrderItem Object

```json
{
  "name": "Jollof Rice (Large)",
  "quantity": 2,
  "unit_price": 850,
  "total": 1700
}
```

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Product name |
| `quantity` | integer | Number of units |
| `unit_price` | integer | Price per unit in pence |
| `total` | integer | `quantity × unit_price` in pence |

---

### 4.7 OrderTimelineEvent Object

```json
{
  "status": "picked_up",
  "timestamp": "2025-09-14T12:28:00.000Z",
  "note": "Kofi Asante picked up the order from Mama Africa Kitchen on Rye Lane"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `status` | string | The `OrderStatus` value at this point in time |
| `timestamp` | string | ISO 8601 UTC when this status was set |
| `note` | string | Human-readable event description |

---

### 4.8 Referral Object

```json
{
  "id": "ref_001",
  "referrer_name": "Emeka Nwosu",
  "referrer_id": "usr_1713000000010",
  "referred_name": "Chidi Okafor",
  "referred_id": "usr_1713000000020",
  "orders_completed": 2,
  "reward_status": "paid",
  "reward_amount": 500,
  "created_at": "2025-08-15T10:00:00.000Z",
  "rewarded_at": "2025-09-01T14:00:00.000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `orders_completed` | integer | 0, 1, or 2 — reward triggers at 2 |
| `reward_status` | string | `pending` or `paid` |
| `reward_amount` | integer | In pence — £5.00 = `500` |
| `rewarded_at` | string\|null | ISO 8601 when credit was issued |

---

### 4.9 CreditTransaction Object

```json
{
  "id": "cred_001",
  "user_id": "usr_1713000000010",
  "user_name": "Emeka Nwosu",
  "amount": 500,
  "type": "earned",
  "reason": "Referral Reward AFRO-EN12 — Chidi Okafor completed 2 orders",
  "created_at": "2025-09-01T14:00:00.000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `amount` | integer | In pence. Positive for earned, positive for deducted (the `type` field carries the sign direction) |
| `type` | string | `earned` or `deducted` |
| `reason` | string | Eg. `"Referral Reward AFRO-XX99"`, `"Applied at checkout"`, `"Admin adjustment"` |

---

### 4.10 AdminStats Object

```json
{
  "total_users": 1847,
  "orders_today": 43,
  "revenue_today": 89450,
  "active_vendors": 28,
  "pending_vendors": 5,
  "active_drivers": 12,
  "pending_drivers": 3,
  "daily_orders": [
    { "date": "2025-09-08", "count": 31 },
    { "date": "2025-09-09", "count": 47 },
    { "date": "2025-09-10", "count": 38 },
    { "date": "2025-09-11", "count": 52 },
    { "date": "2025-09-12", "count": 29 },
    { "date": "2025-09-13", "count": 61 },
    { "date": "2025-09-14", "count": 43 }
  ],
  "revenue_split": {
    "vendor": 74500,
    "platform": 14950
  }
}
```

| Field | Type | Notes |
|-------|------|-------|
| `revenue_today` | integer | Total pence across all orders today |
| `revenue_split.vendor` | integer | Amount going to vendors in pence |
| `revenue_split.platform` | integer | AfroCart's commission share in pence |
| `daily_orders` | array | Exactly 7 entries — last 7 calendar days in ascending date order |

---

## 5. Pagination Contract

All list endpoints use **offset-based pagination**.

**Request parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | `1` | 1-indexed page number |
| `per_page` | integer | `20` | Items per page (max `100`) |

**Response `meta` object (present on all paginated responses):**

```json
{
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 143,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `page` | integer | Current page (mirrors request) |
| `per_page` | integer | Items per page (mirrors request) |
| `total` | integer | Total items matching the current filters |
| `total_pages` | integer | `ceil(total / per_page)` |
| `has_next` | boolean | `page < total_pages` |
| `has_prev` | boolean | `page > 1` |

---

## 6. Security & Rate Limiting

### 6.1 Rate Limits

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| `POST /auth/login` | 10 requests | Per minute, per IP |
| `POST /auth/register` | 5 requests | Per minute, per IP |
| `POST /auth/verify-otp` | 5 OTP attempts | Per OTP code (then code is invalidated) |
| `POST /drivers/documents/upload` | 20 requests | Per hour, per authenticated user |
| `GET /admin/*` | 300 requests | Per minute, per admin token |
| All other endpoints | 60 requests | Per minute, per authenticated user |

Responses when rate limit is exceeded:
```json
HTTP 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 45
  }
}
```
`retry_after` is seconds until the limit resets.

---

### 6.2 JWT Claims Structure

**Standard claims (all roles):**
```json
{
  "sub": "usr_1713000000001",
  "email": "ngozi@example.com",
  "role": "customer",
  "iat": 1726300800,
  "exp": 1726905600
}
```

**Driver claims (with approval_status):**
```json
{
  "sub": "usr_1713009876543",
  "email": "kofi@example.com",
  "role": "driver",
  "approval_status": "pending",
  "iat": 1726300800,
  "exp": 1726905600
}
```

| Claim | Description |
|-------|-------------|
| `sub` | User ID string |
| `email` | User's email |
| `role` | One of: `customer`, `vendor`, `driver`, `admin` |
| `approval_status` | Driver only — `pending`, `approved`, `rejected`, `suspended` |
| `iat` | Issued at (Unix timestamp) |
| `exp` | Expiry (Unix timestamp) — recommended: 7 days for access token |

The middleware decodes the JWT from the `afrocart_token` httpOnly cookie for SSR route gating. The Authorization Bearer token is used for API calls.

---

### 6.3 Document Upload Security

- **Malware scanning:** All uploaded files must pass a malware/virus scan before being moved to final storage. If the scan fails, return `DOCUMENT_UPLOAD_FAILED` (500).
- **Storage:** Files stored in a **private** S3 bucket — no public access configured.
- **URLs:** All `file_url` values returned in API responses are **pre-signed S3 URLs** generated at response time. They expire in **1 hour**.
- **Admin document access:** When an admin clicks "View Document" in the DriverDetailPanel, the frontend uses the URL from the latest GET response. Since signed URLs expire, admin document views will always use a freshly generated signed URL from the most recent response.
- **Accepted file types:** `jpg`, `jpeg`, `png`, `pdf`
- **Max file size:** 10MB per document

---

*Document generated from AfroCart frontend codebase. Last updated: 2026-04-26.*
