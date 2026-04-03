# Pulmón Verde — Guide messaging dashboard

Next.js operator UI based on **The Union / union-messaging**, with **Babelfish** (OASIS **ChatBridge**) embedded on the home dashboard — the same flow as **OASIS IDE** `BridgePanel` → `POST /api/ChatBridge/send` (Discord + Telegram bridge channels).

## Run

```bash
cd Hitchhikers/Pulmon_Verde/guide-messaging
cp .env.example .env.local
npm install
npm run dev
```

Open **http://localhost:3005**

## Environment

| Variable | Purpose |
|----------|---------|
| `OASIS_API_URL` | ONODE base URL (server-side proxy). ChatBridge must be enabled there. |
| `NEXT_PUBLIC_UNION_API_URL` | Optional. Points at **union-api** for WhatsApp compose / conversations / automations (same as original union-messaging). |

Without `NEXT_PUBLIC_UNION_API_URL`, WhatsApp sections show as disconnected; **Babelfish** still works if `OASIS_API_URL` reaches a running ONODE with ChatBridge configured.

## Source references

- Union UI clone: `The Union/union-messaging`
- IDE Babelfish client: `IDE-repo-push/src/main/services/OASISAPIClient.ts` (`getBridgeStatus`, `getBridgeMessages`, `sendBridgeMessage`)
- ONODE: `ChatBridgeController` + `ChatBridgeRouter`
