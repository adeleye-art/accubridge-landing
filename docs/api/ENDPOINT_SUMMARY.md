# AfroCart — Endpoint Quick Reference

**Base URL:** `https://api.afrocart.co.uk/api/v1`  
**Auth:** `Authorization: Bearer <token>` unless marked Public  
**Full spec:** [AUTH_AND_ADMIN_API.md](./AUTH_AND_ADMIN_API.md)

---

## Auth Endpoints

| # | Method | Endpoint | Auth | Role | View / Hook |
|---|--------|----------|------|------|-------------|
| 2.1 | POST | `/auth/register` | Public | — | Register Page (customer/vendor) · `useRegisterMutation` |
| 2.2 | POST | `/auth/register` | Public | — | Register Page — Driver Step 2 · `useRegisterMutation` |
| 2.3 | POST | `/auth/login` | Public | — | Login Page · `useLoginMutation` |
| 2.4 | POST | `/auth/verify-otp` | Public | — | OTP Verification Page · `useVerifyOtpMutation` |
| 2.5 | POST | `/auth/refresh-token` | No (refresh token) | any | Silent refresh · baseApi interceptor |
| 2.6 | POST | `/drivers/documents/upload` | Bearer | driver | Register Step 2 + Driver Pending · `useUploadDriverDocumentMutation` |
| 2.7 | GET | `/users/me` | Bearer | any | App startup rehydration · `useGetMeQuery` |
| 2.8 | GET | `/drivers/me/approval-status` | Bearer | driver | Driver Pending Page (polls 30s) · `useGetDriverApprovalStatusQuery` |

---

## Admin Endpoints

### Overview Dashboard — `/admin/dashboard`

| # | Method | Endpoint | Auth | Role | View / Hook |
|---|--------|----------|------|------|-------------|
| 3.1 | GET | `/admin/stats` | Bearer | admin | KPI cards + charts · `useGetAdminStatsQuery` |
| 3.2 | GET | `/admin/orders?limit=10&sort=created_at:desc` | Bearer | admin | Recent Orders table · `useGetOrdersQuery` |

### Vendor Management — `/admin/vendors`

| # | Method | Endpoint | Auth | Role | View / Hook |
|---|--------|----------|------|------|-------------|
| 3.3 | GET | `/admin/vendors` | Bearer | admin | Vendor table (filter tabs) · `useGetVendorsQuery` |
| 3.4 | PATCH | `/admin/vendors/:id/approve` | Bearer | admin | Approve button · `useApproveVendorMutation` |
| 3.5 | PATCH | `/admin/vendors/:id/reject` | Bearer | admin | Reject button · `useRejectVendorMutation` |
| 3.6 | PATCH | `/admin/vendors/:id/commission` | Bearer | admin | VendorDetailPanel commission field · `useUpdateCommissionMutation` |

### Order Monitor — `/admin/orders`

| # | Method | Endpoint | Auth | Role | View / Hook |
|---|--------|----------|------|------|-------------|
| 3.7 | GET | `/admin/orders` | Bearer | admin | Orders table (filtered) · `useGetOrdersQuery` |
| 3.8 | GET | `/admin/orders/:id` | Bearer | admin | Order Detail Panel · `useGetOrderByIdQuery` |
| 3.9 | PATCH | `/admin/orders/:id/assign-driver` | Bearer | admin | Assign Driver modal + DriverGrid · `useAssignDriverMutation` |
| 3.10 | POST | `/admin/orders/:id/refund` | Bearer | admin | Refund button in Order Detail Panel · `useRefundOrderMutation` |

### Driver Management — `/admin/drivers`

| # | Method | Endpoint | Auth | Role | View / Hook |
|---|--------|----------|------|------|-------------|
| 3.11 | GET | `/admin/drivers` | Bearer | admin | Driver grid + KPI cards · `useGetDriversQuery` |
| 3.12 | GET | `/admin/drivers/:id/documents` | Bearer | admin | DriverDetailPanel documents · `useGetDriverDocumentsQuery` |
| 3.13 | PATCH | `/admin/drivers/:id/approve` | Bearer | admin | DriverDetailPanel Approve · `useApproveDriverMutation` |
| 3.14 | PATCH | `/admin/drivers/:id/reject` | Bearer | admin | DriverDetailPanel Reject · `useRejectDriverMutation` |
| 3.15 | PATCH | `/admin/drivers/:id/suspend` | Bearer | admin | DriverDetailPanel Suspend · `useSuspendDriverMutation` |
| 3.16 | PATCH | `/admin/drivers/:id/reinstate` | Bearer | admin | DriverDetailPanel Reinstate · ⚠️ hook not yet added |
| 3.17 | PATCH | `/admin/drivers/:id/documents/:document_type/verify` | Bearer | admin | DriverDetailPanel verify toggle · `useVerifyDriverDocumentMutation` |

### Referrals & Credits — `/admin/referrals`

| # | Method | Endpoint | Auth | Role | View / Hook |
|---|--------|----------|------|------|-------------|
| 3.18 | GET | `/admin/referrals` | Bearer | admin | Referral Tracking table · `useGetReferralsQuery` |
| 3.19 | GET | `/admin/credits/transactions` | Bearer | admin | Credit Transactions log · `useGetCreditTransactionsQuery` |

---

## Summary Counts

| Domain | Endpoints |
|--------|-----------|
| Authentication | 8 |
| Admin — Overview | 2 |
| Admin — Vendors | 4 |
| Admin — Orders | 4 |
| Admin — Drivers | 7 |
| Admin — Referrals & Credits | 2 |
| **Total** | **27** |

---

## Key Flags (⚠️ Needs Confirmation)

| # | Issue |
|---|-------|
| 2.5 | Refresh token endpoint — not yet wired in frontend; build for future use |
| 3.16 | Reinstate driver — UI exists but RTK mutation not yet in `adminApi.ts` |
| — | `Order.timeline` array not in frontend TypeScript type — add to type when integrating |
| — | `Referral` type missing `referrer_id`, `referred_id`, `reward_amount`, `rewarded_at` — add to type |
| — | `useGetCreditTransactionsQuery` doesn't pass filter params yet — backend must support from day one |
| — | Password minimum: Zod enforces 6 chars; confirm whether backend should enforce 6 or 8 |

---

*Cheat sheet generated from AfroCart frontend codebase · Full spec: [AUTH_AND_ADMIN_API.md](./AUTH_AND_ADMIN_API.md)*
