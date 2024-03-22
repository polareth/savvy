# savvy

**An interface for the EVM in the browser, to simulate and visualize your onchain activity, especially the costs associated with it.**

_A more comprehensive/readable version is available [in the documentation](https://docs.svvy.sh)._

## Table of contents

- [Overview](#overview)
- [About the project](#about-the-project)
  - [Progress](#progress)
  - [How to use](#how-to-use)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Acknowledgments](#acknowledgments)
- [Contributing](#contributing)
- [License](#license)

## Overview

**Think ~ Etherscan + Remix + Foundry**.

Basically, it's a way to interact with a forked EVM chain, in a local-first environment, with a comprehensive set of actions/hacks/utilities exposed by Tevm—which is doing all the heavy lifting.

The state of each chain is the initial fork + all the local transactions, which are displayed in the history with all the details (data, errors, logs, inputs...).

And also, and that's one of the main points of savvy, details on the gas usage of each transaction (fee, L1 submission fee if relevant...).

You can think of it as a way of simulating a set of transactions, and visualizing the results, without having to actually send them to the network.

With no setup (wallet, signatures, etc.), in the browser, from any account (impersonation), with any amount of native tokens.

**This is a WIP, and Tevm is still under heavy development; you _will_ encounter bugs and unhandled errors. Please report them if you have the time!**

## About the project

### Progress

|           |                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| available | run transactions in a simulated environment and remember activity on each chain                                                                                              |
| available | mock network condition/congestion                                                                                                                                            |
| available | estimate gas fees on EVM L1s, Polygon and OP-stack L2s                                                                                                                       |
| available | aggregate total fees, include/exclude transactions                                                                                                                           |
| todo      | provide helpers to generate mock data and quickly estimate costs for selected optimized solutions (e.g. GasliteDrop)                                                         |
| todo      | run a tx on multiple chains and provide a comparative estimation of gas spent on each                                                                                        |
| todo      | support Arbitrum orbit for gas fee on L1 submission                                                                                                                          |
| todo      | paste a contract in a browser editor, deploy it and use it just like a regular forked contract                                                                               |
| todo      | run ast on a pasted contract and provide inline recommendations to optimize both dependencies (e.g. OZ -> Solady) and known inefficient patterns                             |
| todo      | provide selected secure and optimized contracts to deploy in a click with mock data + estimate costs (e.g. Gaslite core, Solady libs)                                        |
| todo      | provide a rpc to publish tests to the Tevm forked chain and keep the state (already possible in the opposite way; fork a local Hardhat node to which tests can be published) |
| todo      | wallet/social login to save transactions (sync with local storage)                                                                                                           |
| todo      | separate between two versions: advanced (intended for devs) and "onboarding" for non-crypto natives, with detailed explanations, guidance and examples                       |

And a lot of other possibilities, although not prioritized because there are already great tools for most of these. Like:

- replicate transactions locally (given their hash + chain);
- debug transactions by exploring state change;
- copy a set of local transactions to get the multicall data and execute them on mainnet.

And any other ideas you might have (please share them).

### How to use

- **Search**
  - Select a chain and paste the address of a contract, or click `Try with an example`.
  - Click `Fork chain` to fork the chain again at the latest block.
- **Caller**
  - Enter an address to impersonate during calls; you can click `owner` to impersonate the owner of the contract if it found an appropriate method.
  - Toggle `skip balance` to [ignore or not the native tokens balance](https://tevm.sh/reference/tevm/actions-types/type-aliases/basecallparams/#skipbalance) during calls.
- **Low-level call**
  - Call the current account with an arbitrary amount of native tokens and/or arbitrary encoded data.
- **Contract interface**
  - The ABI is displayed inside a table you can navigate through; fill the inputs if relevant, and click `Call` to send a transaction.
  - Read methods are highlighted when they were found with certitude.
- **Local transactions**
  - The history of transactions displayed is the one recorded by the client for the selected chain, since the last fork.
  - You can navigate through the history, click ↓ to see more details (data, errors, logs, inputs...), and click on an address to search for it.

## Architecture

```ml
app - "Main entry points for pages, layout and routing"
├── (api) - "Serverless functions"
│   └── abi - "Get the ABI of a contract (WhatsABI)"
│   └── token-price - "Get the price of a native token (CoinMarketCap)"
├── address
│   └── [account] - "Account page (whenever an address is searched)"
components - "Everything related to the UI"
├── common - "Recurrent components across the app"
├── config - "Independent config-related components (e.g. theme, analytics)"
├── core - "Components related to the main logic/purpose of the app"
├── layouts - "Layouts for the app used across all pages"
├── templates - "Generic templates for better consistency"
├── ui - "shadcn/ui components"
lib - "Libraries, utilities and state management"
├─ constants - "Constants for the site, default config, providers, starting points"
├─ hooks - "Custom hooks (n.b. we're mostly using stores for state management)"
├─ store - "State management (providers, config, transactions, etc.)"
├─ tevm - "Tevm clients, calls and utilities"
├─ types - "Type definitions that are used across multiple files"
├─ ... - "Other libraries and utilities (e.g. WhatsABI, local storage, gas estimation)"
styles - "Global styles, theme, and tailwind classes"
```

## Getting started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), using [shadcn/ui](https://ui.shadcn.com/) components and design, as well as the overall project's organization. It is intended for use with the Next.js (13+) [App Router](https://nextjs.org/docs/app).

The minimal steps to get started are:

1. Clone the repository and navigate to this directory
   ```bash
   git clone git@github.com:0xpolarzero/savvy.git && cd savvy
   ```
2. Install the dependencies (preferably with [pnpm](https://pnpm.io))
   ```bash
   pnpm install
   ```
3. Copy the `.env.local.example` file to `.env.local` and fill in the required environment variables
   ```bash
   cp .env.local.example .env.local
   # Then edit .env.local
   # ALCHEMY_API_KEY
   # COINMARKETCAP_API_KEY
   # ETHERSCAN_API_KEY
   # ARBISCAN_API_KEY
   # BASESCAN_API_KEY
   # OPTIMISTIC_ETHERSCAN_API_KEY
   # POLYGONSCAN_API_KEY
   ```

We're using Alchemy for better modularity [when creating providers](./src/lib/constants/providers.ts#L49) and [Tevm clients](./src/lib/tevm/client.ts#L42), but you can replace it with any other provider, and update the way urls are created in the two aforementioned files.

4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

For any other considerations, please refer to the respective documentation for each package:

- [Next.js](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Tevm](https://tevm.sh/learn/reference)
- [WhatsABI](https://github.com/shazow/whatsabi)

## Acknowledgments

You will find references to any code or ideas that were used in the project directly in the code, but here are some of the main ones:

- [shadcn/ui](https://ui.shadcn.com/): components, design, code/application structure and best practices
- [fiveoutofnine](https://www.fiveoutofnine.com/): inspiration, best practices, organization

Obviously, huge thanks and gratitude to [Will Cory](https://twitter.com/FUCORY) for the incredible work on Tevm, and for the countless advice, explanations and feedback. To [Shazow](https://twitter.com/shazow) as well for WhatsABI, and to all open-source contributors maintaining the libraries and tools we're using.

## License

See [License](./LICENSE).
