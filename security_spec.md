# LuminaLeads AI - Lead Generation System

## Data Invariants
- A lead must have a `business_name` to be valid.
- Scraped data must follow a strict schema to ensure compatibility with CRM exports.
- All timestamps are UTC.

## Dirty Dozen Payloads (Security Audit)
1. **The Ghost Field**: `{"business_name": "Test", "is_admin": true}` - Should be rejected by schema block.
2. **The Huge String**: `{"business_name": "A".repeat(1000000)}` - Should be rejected by size check.
3. **The ID Poison**: `{"id": "../.../...", "data": "poison"}` - Path variable hardening.
4. **The Empty Payload**: `{}` - Required fields check.
5. **The Type Injection**: `{"phone": 123456789}` - Should be string.
6. **The Email Spoof**: `{"email": "admin@system.com"}` - Verification needed.
7. **The Rate Limit Break**: Sequential rapid requests.
8. **The Script Injection**: `{"owner_name": "<script>alert(1)</script>"}` - Sanitization needed.
9. **The Orphaned Lead**: Lead without a source ID.
10. **The PII Leak**: Accessing leads owned by others.
11. **The State Shortcut**: Jumping from 'pending' to 'closed' without validation.
12. **The SQL/NoSQL Injection**: Special characters in query strings.

## Test Runner (Mock)
/* firestore.rules.test.ts would go here if using Firebase */


## node installation :
    npm install


## Electron - Must Run :
    npm uninstall electron electron-builder
    npm install --save-dev electron electron-builder

## Electron Build EXE :
    npm run electron:build










## Build the Frontend:
    npm run build

## Compile the Backend: (Ensure your server.ts is compiled to dist/server.js) :
    npx esbuild server.ts --bundle --platform=node --outfile=dist/server.js --external:vite --external:express



## Github Deployments
    echo "# Unreal-Leads-Scrapper-Software" >> README.md
    git init
    git add README.md
    git commit -m "first commit"
    git branch -M main
        git remote add origin https://github.com/ceo-uploads/Unreal-Leads-Scrapper-Software.git
    git branch -M main
    git push -u origin main