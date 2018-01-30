const ccxt = require('ccxt');
const request = require('request-promise-native');
const log = require('./log');
const { Exchange } = require('./exchange');
const { Market } = require('./market');
const { Trade } = require('./trade');
const { OHLC } = require('./ohlc');

class Cryptopia extends Exchange {
    async loadMarkets() {
        log.info(`Loading markets from ${this.name}...`);

        let markets = [];
        const exchange = new ccxt.cryptopia({ timeout: 20000 });
        let tickers = await exchange.fetchTickers();
        let symbols = Object.keys(tickers).filter(symbol => symbol.endsWith('BTC'));

        log.info(`Got ${symbols.length} markets`);

        symbols.forEach(symbol => {
            let [base, quote] = symbol.split('/');
            let date = new Date();

            markets.push(new Market(
                null, this.id,
                tickers[symbol]['info'].TradePairId, symbol, base, quote,
                tickers[symbol].baseVolume,
                tickers[symbol].quoteVolume,
                tickers[symbol].last,
                date, date
            ));
        });

        return markets;
    }

    async loadOHLC(market) {
        log.info(`Loading OHLC data for ${market.symbol} from ${this.name}...`);

        let response = await request.get(
            'https://www.cryptopia.co.nz/Exchange/GetTradePairChart',
            {
                qs: {
                    tradePairId: market.symbol_id,
                    dataRange: 0,
                    dataGroup: 60
                },

                json: true,
                timeout: 20000
            }
        );

        let ohlcs = response.Candle.map((ohlc, i) => {
            let [ts, o, h, l, c] = ohlc;
            let base_volume = response.Volume[i].basev;
            let quote_volume = base_volume * c;
            
            // round the timestamp to the nearest hour
            // to kinda overcome weird Cryptopia's approach to timestamping candles
            // and cut off milliseconds
            let time = (ts - (ts % 3600000)) / 1000;

            return new OHLC(market.id, time, o, h, l, c, base_volume, quote_volume);
        });

        return ohlcs;
    }

    async loadTrades(market) {
        log.info(`Loading ${market.symbol} trades from ${this.name}...`);

        const exchange = new ccxt.cryptopia({ timeout: 20000 });
        let trades = await exchange.fetchTrades(market.symbol, undefined, 100);

        log.info(`Got ${trades.length} trades`);

        return trades.map(trade => {
            let ts = trade.timestamp / 1000;

            return new Trade(
                null, this.id, 
                market.id, 
                ts.toString(), // use timestamp as order id since Cryptopia doesn't provide it
                trade.side, 
                trade.price, 
                trade.amount, 
                trade.cost, 
                ts, new Date()
            )
        }).reverse(); // to make sure the most recent trades come last
    }
}

exports.Cryptopia = Cryptopia;