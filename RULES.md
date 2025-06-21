# Project Development Rules

## 1. Service File Location
- All API service files must be placed inside the `src/services/` directory.
- No API service file should be created outside the `src/services/` folder.

## 2. Token Management
- Any token (such as access tokens, refresh tokens, or user-specific tokens) that is received and needs to be persisted must be stored in `localStorage` for the currently logged-in user.
- Do not store tokens in any other place (like sessionStorage, cookies, or global variables) unless explicitly required.

## 3. Permission Handling
- Any changes related to permissions (such as checking, updating, or enforcing permissions) must be reflected in all relevant files.
- Specifically, always update and review the `PermissionGuard` component (`src/components/PermissionGuard.tsx`) when making permission-related changes.
- Ensure that permission logic is centralized and consistently enforced across the application.

## 4. Consistency in Changes
- Whenever a change is made (for example, related to permissions, authentication, or service logic), ensure that all affected files are updated accordingly.
- Do not leave related files or logic outdated or inconsistent.

## 5. Documentation of Rules
- These rules must be documented and kept up to date.
- When a new rule is added or an existing rule is changed, update this documentation so that all developers can refer to it. 