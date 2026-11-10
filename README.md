This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment

Copy `.env.example` to `.env.local` and fill it in (see the comments there):

- `LUNACAL_API_KEY` and `LUNACAL_EVENT_TYPE_ID` — the scheduler in **Book an audit** (`#book`) reads availability from and books into [LunaCal](https://app.lunacal.ai) through `/api/schedule`. Without them the calendar shows sample availability and books nothing.
- `RESEND_API_KEY`, `MAIL_TO` and optionally `MAIL_FROM` — the "Write to us instead" form and the calculator's "Email me this estimate" are emailed through [Resend](https://resend.com) by `/api/book`: every request goes to `MAIL_TO`, and an estimate also goes to the visitor who asked for it. `MAIL_FROM` must be on a domain verified in Resend. Without the key and `MAIL_TO`, development logs the request and production answers 503.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
