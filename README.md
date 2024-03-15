## TODO

[ ] See this for editor (optimize-dependencies but with code editor, analyze dependencies, provide alternative, compile + deploy both contracts, run some calls and let the user know the difference): https://github.com/evmts/tevm-monorepo/blob/40263b9eb62edb557d8ddbea45d29ddf755eb1e1/examples/vite/src/SolEditor.tsx

- Also that to compile: https://github.com/evmts/tevm-monorepo/blob/40263b9eb62edb557d8ddbea45d29ddf755eb1e1/examples/vite/src/SolcWorker.ts

[ ] Error handling: whenever an error occurs, the toast "contact" button should open a modal, with:

- a code block with all the values for the stores in json that can be copy/pasted
- a quick and a more long version of bug reporting: quick is just drop a dm with the logs, longer would be with some details, screenshots, etc
- maybe just automatically send/save the logs somewhere? would rather have the user decide if they want to send it or not, although the logs (stores) won't contain any sensitive information at all; or at most only send the data that comes from the app and nothing related to the user input

[ ] Fix nextBaseFee => priority ratios; really bad when the base fee starts very low, as it increases way too much

[ ] Save results history in local storage, and let the user retrieve them

[ ] Handle issues in retrieving token price (coinmarketcap), and other api calls as well (gas fees) => if error, use a default value & let the user choose

[ ] Add guides; e.g. on airdrop page, a button in the sidebar to go to a quick guide to use it

[ ] Add documentation (use vocs.dev) for both guides and breakdowns, how it works, calculations, contributing, roadmap, etc

[ ] Button "share results" to export them (md? pdf? json?); probably a table as well as all the details in a concise document

[ ] in the local-chain api, return different error codes based on what failed, and decode them browser-side to display in the toast

[ ] When integrating Arbitrum, will need to change 'hasCustomStack' to differenciate OP and Arbitrum + add oracle addresses to config

[ ] Add a "underlying" property on rollups to be able to calculate the fee later, for instance the id of the underlying chain (e.g. currentChain being Optimism, we need to access the Ethereum client)

- Use 2 gas price selection to simulate both the L2 and the L1 conditions
- We can't just return a l1Submission string/bigint to account for that, needs more complex logic

[ ] Allow do estimation with url query (amount of recipients, sender, token address, type…); even though drop.gaslite.org or any app can already do so with `estimateGas`, this provides a nice table with results + lets user estimate with different network conditions

- also maybe if more convenient directly an api endpoint would be better? Actually maybe can be setup from vercel

[x] REFACTORED: Put gas price & native token price inside Advanced (in a collapsible)

[x] DONE: Utils to convert gwei (or anything really) based on currency; e.g. L2 on OP stack need at least 3-4 decimals when Ethereum/Polygon is ok with 2

[x] REFACTORED: See if there is a "maxSupply" for the provided token (BEFORE fetching local-chain), and if so, compare it to the amount of tokens airdropped; if not enough, ask the user to provide an account that owns enough tokens

[x] Use some kind of toggle group for recipients amount/custom data

- when clicking on "mock" data, highlights input + slider, otherwise click on custom data (just the button like custom token but above the textarea on the left, and amount of recipients small on the right?) and highlight it and grey out the other
- Add accordion for example data

[x] DONE: Add custom priority fee button, and actually move "low", "medium" and "high" to a more stealthy place like right below

[x] DONE: Move everything using alchemy id in an api route, pass the chainId, the method from the client (with the params) the params and return the data; for each call to the api, decode the params using a type for this specific call (considering what should be returned)

[x] DONE: Put token above recipients, with a check "custom options" that opens a collapsible and sets some bool to true

[x] DONE: Same with the recipients, with a custom option to use custom addresses/amounts/(ids)

---

## Steps

[x] For ERC20, just fetch the owner of the token contract (if any), and either mint as them or as the contract itself

[ ] For ERC721, except if there is something better, crawl through the token IDS, see if there is an owner; if there is, impersonate them and send the token(s) to our caller, if not, mint them

[ ] For ERC1155, same as ERC721, but just mint the tokens for each id

---

## Error cases (to handle)

Just search for anny "throw" and "console.error" in the code

[ ] revert in a Tevm call

[ ] provided arguments (addresses, amounts, ids) not valid

[ ] provided token not found/issue

[ ] provided owner/holder not able to mint, not holding enough tokens

[ ] provided token not mintable/transferrable (see call revert)

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
