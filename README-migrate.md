# MySQL → mysql2 Migration Plan

## Goal

Migrate the Node.js data server from the legacy `mysql` client to `mysql2` to support `caching_sha2_password` and modern MySQL 8 authentication.

## Scope

- Replace the `mysql` dependency with `mysql2`.
- Update imports/usages in the codebase.
- Verify the application can connect to MySQL 8 using `caching_sha2_password`.

## Prerequisites

- Node.js installed.
- MySQL server reachable and credentials available.
- Ability to run `npm` in the project root.

## Migration Steps

### 1) Update dependencies

- Remove `mysql` from dependencies.
- Add `mysql2` (latest stable).
- Reinstall to update lockfile.

### 2) Update code imports

- Replace `import { createPool } from "mysql";` with `import { createPool } from "mysql2";`.
- Keep the same pool API usage; `mysql2` is largely compatible.

### 3) Verify connection configuration

- Ensure credentials are correct in the config and connection options.
- Optional: explicitly set `authPlugins` if the server uses a custom authentication flow (rare).

### 4) Run the app

- Start the server in dev or prod mode.
- Confirm it connects without `ER_NOT_SUPPORTED_AUTH_MODE`.

### 5) Validate key DB operations

- Exercise read/write flows (e.g., get items, add item, update item).
- Check error logs for any new DB errors.

### 6) Rollback plan (if needed)

- Revert `package.json` and `db.js` changes.
- Reinstall dependencies.

## Suggested Commands

Run these from the project root:

- `npm uninstall mysql`
- `npm install mysql2`
- `npm run dev_debug`

## Files to change

- package.json (dependencies)
- db.js (import)
- package-lock.json (auto-updated by npm)

## Success Criteria

- Server starts without auth errors.
- DB calls succeed with MySQL 8 default auth.
- No new runtime errors introduced.
