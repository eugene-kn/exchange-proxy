const { Market } = require('./market');

class Markets {
    static async find(symbol, exchange) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM markets WHERE exchange_id = ? AND symbol = ?',
                [exchange.id, symbol],

                (error, results, fields) => {
                    if (error != null)
                        return reject(error);

                    if (results.length == 0) {
                        return reject(
                            new Error(`No such market (exch. id: ${exchange.id}, symbol: ${symbol})`)
                        );
                    }

                    let m = results[0];

                    let market = new Market(
                        m.id, m.exchange_id, m.symbol_id, m.symbol, m.base_currency, m.quote_currency,
                        m.volume, m.quote_volume, m.last_price, m.created_at, m.updated_at
                    );
                    
                    resolve(market);
                });
        });
    }
}

exports.Markets = Markets;