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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Split delivery and after-sales

- In **Admin → Orders → order details**, confirm the order, select its unassigned
  product lines, and create a shipment with courier and tracking number. Each
  product line (including its entire quantity) belongs to one shipment.
- Mark each shipment delivered using its actual delivery date. Repeating this
  action never restarts the eligibility window. The order becomes partially
  delivered until all product lines have arrived. Shipping/delivery statuses
  are managed through shipment controls, not the whole-order status dropdown.
- In **Admin → Products → Edit → Returns & replacements**, enable each service
  independently and set its window (1–365 days, default 7). Save the policy
  separately. New products use the default policy until edited. Checkout stores
  the policy on each purchased line so later edits cannot change existing rights.
- **My Orders** and order details show tracking, delivered dates, deadlines and
  request status. Reviews require delivery of that exact purchased product.
  Return/replacement eligibility is checked again on the server at submission.
  The cutoff is delivery time plus the configured number of 24-hour days.
- Admin handles return/replacement requests on the order details page:
  requested → approved/rejected; approved → completed. One request is allowed
  per purchased line. Completing it records resolution; refunds and replacement
  dispatch must be arranged separately. No payment is automatically refunded.
- Existing orders have no reliable historical shipment dates. Register their
  shipments and actual delivery dates before reviews or service requests are
  enabled; do not mark historical deliveries as today. Existing lines receive
  the default seven-day policy during this additive schema upgrade.

Run `node --test tests/fulfillment.test.cjs` for delivery, policy-window,
authorization and review-eligibility checks.

The build command is `npm run build`. Set `DATABASE_URL` for the intended
Vercel environment before deploying. The build runs `npm run db:sync`, generates
Prisma Client, and then builds Next.js.

`db:sync` first applies the repeatable, additive SQL patch in
`prisma/patches/razorpay-order-fields.sql`. This adds missing Razorpay order/payment
columns and their unique indexes on existing databases. Fresh databases are
initialized by the following `prisma db push`. Existing order data is preserved;
duplicate non-null Razorpay IDs cause the patch to fail and must be investigated.
The remaining schema sync still stops on Prisma data-loss warnings.

After pulling schema changes locally, run `npm run db:sync` and
`npx prisma generate` before starting the development server.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Managed offers

Manage storefront offers at `/admin/coupons`. The same saved rules are used on product pages, in the cart and by both checkout payment paths.

- Percentage or fixed discount, with optional minimum spend, maximum saving, dates and usage limit.
- Buy X/get Y: customers add all qualifying units to their cart. The default groups units by identical current selling price. Selected-products mode supports cheapest-unit or designated-gift rules.
- Quantity pricing: select eligible products and add tiers such as 3 items at INR 399 each and 4 at INR 299 each. Quantities combine across selected products. The highest qualifying tier applies; existing lower prices never increase. Optional bundle mode applies a total price to complete bundles only.
- One offer per order. Usage includes order creation and pending online payment reservations; a failed payment setup releases the reservation.
- The one-time `managed-offers.sql` patch imports the original five offers without overwriting existing codes. Its marker prevents deleted offers from reappearing on later deployments. Run the normal build/database sync when deploying the new nullable Coupon rules field.

Admin order details also support correcting courier/tracking information without resetting delivery dates, downloading delivered-item invoices, and inspecting purchase-time return/replacement policies. New products can set their own policy before their first sale.

Demo promotion setup: `npm run offers:demo` creates DEMOBOGO, DEMO2GET1 and DEMOMORE in the configured database without overwriting existing codes. DEMOMORE selects up to five active products across categories priced at least INR 399. The demo script is intentionally not part of production builds. Offer visibility on product pages and eligibility in the cart follow each saved coupon. Manage promotional artwork separately under Admin → Banners.


### Offer Zone, sliders and current-price rules

Manage Home Offer Zone cards and page slider images in `/admin/banners`. Choose a placement, upload a PNG/JPG/WebP image (up to 2 MB), search for a product or choose an internal destination, and reorder/enable/disable slides. Images are stored with the banner in PostgreSQL, including on serverless deployments. Offer Zone uses a responsive two-column image grid on Home only; the previous global promotional section has been removed.

In `/admin/coupons`, quantity-based fixed discount tiers are separate from per-item/bundle-price tiers. Buy/Get defaults to groups with identical current selling prices. Selected-products mode permits mixed prices and supports cheapest-item or designated-gift calculation. An offer never reduces the merchandise subtotal to zero or below. Existing order snapshots retain their recorded prices/discounts. Cart quotes and checkout resolve current product/variant prices server-side; variant stock is checked separately and product card color counts come from real assigned options.

## GitHub Actions CI

`.github/workflows/ci-cd.yml` runs on pull requests, pushes to `main`, and manual
runs. With Node.js 22 it installs locked dependencies, generates Prisma Client,
runs ESLint and the existing Node tests, checks TypeScript, and builds Next.js.

CI uses dummy environment values and runs `next build` directly, bypassing the
`db:sync` step in `npm run build`. No production database or deployment secrets
are needed. Failed checks block the workflow; they are not ignored.

Commit and push the workflow to GitHub to enable it. This workflow does not deploy
the application. Deployment can be added when a hosting target is selected.
