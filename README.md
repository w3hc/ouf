# OUF

OUF (OUr Friendly assistant) allows users to create and personalize an AI assistant tailored to their organization's needs.

Live at https://ouf.netlify.app

Ouf UI interacts with [Fatou API](https://github.com/w3hc/fatou) (which uses Claude API). You can also view its Swagger UI [here](https://fatou.w3hc.org/api).

- OUF Governance Token contract repo: https://github.com/w3hc/ouf-contracts
- Arbitrum Sepolia deployment: https://sepolia.arbiscan.io/address/0x7ee0e86167746378f1C5bF947EC08c3B55B6Bb80#code

## Install

```bash
pnpm i
```

## Run

Create a `.env` file:

```
cp .env.example .env
```

Add your own keys in the `.env` file:

- You can get it in your [Reown dashboard](https://cloud.reown.com/)
- Ask Julien for a Fatou API key

Then:

```bash
pnpm dev
```

## Support

Feel free to reach out to [Julien](https://github.com/julienbrg) on [Farcaster](https://warpcast.com/julien-), [Element](https://matrix.to/#/@julienbrg:matrix.org), [Status](https://status.app/u/iwSACggKBkp1bGllbgM=#zQ3shmh1sbvE6qrGotuyNQB22XU5jTrZ2HFC8bA56d5kTS2fy), [Telegram](https://t.me/julienbrg), [Twitter](https://twitter.com/julienbrg), [Discord](https://discordapp.com/users/julienbrg), or [LinkedIn](https://www.linkedin.com/in/julienberanger/).
