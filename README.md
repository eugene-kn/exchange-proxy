# Exchange Proxy

Collects various trade information (markets, orders, OHLC) from different exchanges

## Prerequisites

Redis and MySQL

## Installing & Configuring & Running

```
git clone ...
npm install
```

Copy .env.example to .env and fill in the required enviromnent variables or just make sure all vars are set before starting. Then run it in worker mode (it will be constantly processing jobs from Redis queue):

```
npm start
```

## Managing Jobs

Run bull-arena queue management tool

```
npm run arena
```

Manually create jobs

```
node admin/create-job -t UPDATE_MARKETS -e CPIA
node admin/create-job -t UPDATE_OHLC -e CPIA -s ETH/BTC
node admin/create-job -t UPDATE_TRADES -e CPIA -s ETH/BTC
```

## Authors

* **Eugene K.**