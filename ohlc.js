class OHLC {
    constructor(market_id, time, open, high, low, close, base_volume, quote_volume) {
        this.market_id = market_id;
        this.time = time;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.base_volume = base_volume;
        this.quote_volume = quote_volume;
    }
}

exports.OHLC = OHLC;