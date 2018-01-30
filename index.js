require('./db');
const perfy = require('perfy');
const queue = require('./queue').worker();
const log = require('./log');
const { Exchanges } = require('./exchanges');
const { Markets } = require('./markets');

log.info('Waiting for a job...');

queue.process(async (job) => {
    log.info('Processing job with id: %d %j', job.id, job.data);

    try {
        switch (job.data.type) {
            case 'UPDATE_MARKETS':
                return updateMarkets(job.data.exchange);
            case 'UPDATE_OHLC':
                return updateOHLC(job.data.exchange, job.data.symbol);
            case 'UPDATE_TRADES':
                return updateTrades(job.data.exchange, job.data.symbol);
            default:
                throw new Error(`Unsupported job type - ${job.data.type}`);
        }
    } catch (error) {
        log.error(error);
        throw error;
    }
});

async function updateMarkets(code) {
    return new Promise(async (resolve, reject) => {
        perfy.start('markets');

        try {
            let exchange = await Exchanges.find(code);
            let markets = await exchange.loadMarkets();

            log.info('Updating markets...');

            db.query(
                `INSERT INTO markets (
                    id, exchange_id, symbol_id, symbol, base_currency, 
                    quote_currency, volume, quote_volume, 
                    last_price, created_at, updated_at
                ) VALUES ? ON DUPLICATE KEY UPDATE
                    volume = VALUES(volume), 
                    quote_volume = VALUES(quote_volume),
                    last_price = VALUES(last_price),
                    updated_at = VALUES(updated_at)`,
                [markets.map(m => [
                    m.id, m.exchange_id, m.symbol_id, m.symbol, m.base_currency, m.quote_currency,
                    m.volume, m.quote_volume, m.last_price, m.created_at, m.updated_at
                ])],
                (error, results, fields) => {
                    if (error) return reject(error);
                    log.info('Updated in %f sec.', perfy.end('markets').time);
                    resolve();
                }
            );
        } catch (error) {
            log.error(error.message);
            return reject(error);
        }
    });
}

async function updateOHLC(code, symbol) {
    return new Promise(async (resolve, reject) => {
        perfy.start('ohlc');

        try {
            let exchange = await Exchanges.find(code);
            let market = await Markets.find(symbol, exchange);
            let ohlcs = await exchange.loadOHLC(market);

            log.info(`Updating OHLC data for ${symbol} ...`);

            db.query(
                `INSERT INTO candle_hours (
                    market_id, time, open, high, low, close, base_volume, quote_volume
                ) VALUES ? ON DUPLICATE KEY UPDATE
                    open = VALUES(open), 
                    high = VALUES(high),
                    low = VALUES(low),
                    close = VALUES(close),
                    base_volume = VALUES(base_volume),
                    quote_volume = VALUES(quote_volume)`,
                [ohlcs.map(ohlc => [
                    ohlc.market_id, ohlc.time,
                    ohlc.open, ohlc.high, ohlc.low, ohlc.close,
                    ohlc.base_volume, ohlc.quote_volume
                ])],
                (error, results, fields) => {
                    if (error) return reject(error);
                    log.info('Updated in %f sec.', perfy.end('ohlc').time);
                    resolve();
                }
            );
        } catch (error) {
            log.error(error.message);
            return reject(error);
        }
    });
}

async function updateTrades(code, symbol) {
    return new Promise(async (resolve, reject) => {
        perfy.start('trades');

        try {
            let exchange = await Exchanges.find(code);
            let market = await Markets.find(symbol, exchange);
            let trades = await exchange.loadTrades(market);

            log.info(`Updating ${symbol} trades...`);

            db.query(
                `INSERT IGNORE INTO orders (
                    id, exchange_id, market_id, order_id, order_type,
                    price, quantity, total, order_time, created_at
                ) VALUES ?`,
                [trades.map(trade => [
                    trade.id,
                    trade.exchange_id,
                    trade.market_id,
                    trade.order_id,
                    trade.order_type,
                    trade.price,
                    trade.quantity,
                    trade.total,
                    trade.order_time,
                    trade.created_at
                ])],
                (error, results, fields) => {
                    if (error) return reject(error);
                    log.info('Added %d trade(s) in %f sec.', results.affectedRows, perfy.end('trades').time);
                    resolve();
                }
            );
        } catch (error) {
            log.error(error.message);
            return reject(error);
        }
    });
}