# FixIt Project Review Notes

Date: 2026-10-06

## Overview
This project is a MERN-based maintenance and complaint management system with separate backend and frontend apps. The system supports user, worker, and admin roles with complaint creation, claim workflows, notifications, and admin analytics.

## Verified current status
- Frontend build successfully passes with Vite.
- Backend syntax validation passes for the server entrypoint.
- Frontend dependency audit shows 1 high severity vulnerability.
- The app is structured logically but still has a few production-readiness issues.

## Key observations

### 1. Role-based structure is good
- The backend has role-based access control middleware in `backend/middleware/role.js`.
- The frontend dashboard switches correctly by role in `frontend/src/pages/Dashboard.js`.
- This is a strong base for a multi-role maintenance system.

### 2. Auth flow is functional but needs hardening
- JWT-based auth is implemented in `backend/controllers/authController.js`.
- Frontend auth state is stored in localStorage in `frontend/src/context/AuthContext.js`.
- This is simple and workable, but not ideal for production due to XSS risk.
- CORS is currently permissive in `backend/server.js`.
- JWT secret validation is not enforced at startup.

### 3. Complaint workflow is mostly solid
- Complaint creation, list retrieval, claim, status updates, and reset logic exist in `backend/controllers/complaintController.js`.
- Worker claim model is implemented as a decentralized open-pool workflow.
- Notifications are created on claim, resolution, and reset actions.
- The logic is understandable and aligned with the domain.

### 4. There is a mismatch in status logic
- `backend/models/Complaint.js` includes status values like `Assigned`, `Pending`, `In Progress`, `Resolved`, and `Closed`.
- `backend/controllers/complaintController.js` only allows `In Progress`, `Resolved`, and `Closed` in the update endpoint.
- This mismatch can cause confusion and bugs in the application lifecycle.

### 5. Frontend route structure needs cleanup
- `frontend/src/App.js` has `/complaints` mapped to the dashboard instead of a dedicated complaints list view.
- There is a separate `frontend/src/pages/ComplaintsList.js`, suggesting route duplication or leftover structure.
- This should be cleaned up to avoid a confusing user experience.

### 6. There is no real testing setup
- No test scripts are configured in the package manifests.
- There are no backend API tests or frontend component tests.
- This is a major gap for long-term maintainability and regression protection.

### 7. Production readiness needs improvement
- There is no `.env.example` for onboarding.
- No startup validation of required env vars.
- The README is minimal and does not document setup or deployment steps.
- App will need more security and reliability hardening before production use.

## Recommended changes (priority order)

### Highest priority
1. Fix route mismatch in `frontend/src/App.js`. ✅ Completed in Update 1.
2. Harden CORS and auth security in `backend/server.js` and auth flow.
3. Standardize complaint lifecycle status handling between model and controller.

## Update 1: Route mismatch fix

### Changed files
- `frontend/src/App.js`

### What changed
- The `/complaints` route now renders `ComplaintsList` instead of the role-based dashboard component.

### Why this change was necessary
- The project already contains a dedicated complaints list page in `frontend/src/pages/ComplaintsList.js`.
- That component was designed to represent the complaints view, but the route was accidentally pointing to `Dashboard`.
- This mismatch caused the wrong UI to load on the complaints route and made the navigation structure inconsistent.
- The fix restores the expected route-to-page mapping and aligns the app shell with the actual project structure.

## Update 2: Shared city selection and worker same-city prioritization

### Changed files
- `backend/models/User.js`
- `backend/controllers/authController.js`
- `frontend/src/context/AuthContext.js`
- `frontend/src/pages/Register.js`
- `frontend/src/components/dashboards/WorkerDashboard.js`

### What changed
- Added a shared `city` field to user records for both users and workers.
- Added a city dropdown during registration so a city is selected for both account types.
- Stored the selected city in the authentication response and persisted it in local storage.
- Updated the worker dashboard to surface the `Same City` option first and sort same-city jobs before others.

### Why this change was necessary
- The app already had a role and skill model, but no shared city profile field.
- Workers need to see the most relevant jobs first, and the same-city job list is the most relevant match for local service requests.
- Keeping the city field across user and worker registration makes the system more realistic and preserves existing features while improving the worker prioritization flow.

### Next priority
4. Add automated tests for backend and frontend.
5. Upgrade vulnerable dependencies and run audit checks.
6. Add .env examples and clearer setup instructions.

### Nice-to-have improvements
7. Use stronger unique ticket IDs.
8. Add database indexes for core complaint queries.
9. Consider secure cookie auth instead of localStorage in production.

## Final take
The project is functionally promising and clearly organized around the maintenance workflow, but it still needs security hardening, route cleanup, status consistency, and test coverage before it is production-ready.

## Important file references
- Backend entry: `backend/server.js`
- Frontend app shell: `frontend/src/App.js`
- Auth context: `frontend/src/context/AuthContext.js`
- Auth controller: `backend/controllers/authController.js`
- Complaint controller: `backend/controllers/complaintController.js`
- Complaint model: `backend/models/Complaint.js`
- Role middleware: `backend/middleware/role.js`
- README: `README.md`

## Command evidence
- Frontend validation command: `Set-Location "E:\FixIt\frontend"; npm install; npm run build`
  Result: build succeeded.
- Backend validation command: `Set-Location "E:\FixIt\backend"; npm install; node --check server.js`
  Result: syntax check passed.

## Resume guidance
If work is paused, continue by addressing these in order:
1. Route cleanup
2. Security hardening
3. Status consistency
4. Testing and dependency audit

This is the point from which the next implementation cycle should begin.
