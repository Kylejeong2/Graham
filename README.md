# Graham
________________________________

## Getting Started

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

## Stripe

To listen for webhooks, run the following command:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Tech Stack
- Supabase
- DrizzleORM
- Stripe
- Next
- Tailwind
- RadixUI (components)
- Clerk Auth
- OpenAI
- Mem0