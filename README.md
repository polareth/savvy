## TODO

- Put gas price & native token price inside Advanced (in a collapsible)
- Utils to convert gwei (or anything really) based on currency; e.g. L2 on OP stack need at least 3-4 decimals when Ethereum/Polygon is ok with 2
- See if there is a "maxSupply" for the provided token (BEFORE fetching local-chain), and if so, compare it to the amount of tokens airdropped; if not enough, ask the user to provide an account that owns enough tokens
- in the local-chain api, return different error codes based on what failed, and decode them browser-side to display in the toast

---

## Steps

- For ERC20, just fetch the owner of the token contract (if any), and either mint as them or as the contract itself
- For ERC721, except if there is something better, crawl through the token IDS, see if there is an owner; if there is, impersonate them and send the token(s) to our caller, if not, mint them
- For ERC1155, same as ERC721, but just mint the tokens for each id

---

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
