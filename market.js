class Market {
    constructor(
        id, exchange_id, symbol_id, symbol, base_currency, 
        quote_currency, volume, quote_volume, 
        last_price, created_at, updated_at
    ) {
        this.id = id;
        this.exchange_id = exchange_id;
        this.symbol_id = symbol_id;
        this.symbol = symbol;
        this.base_currency = base_currency;
        this.quote_currency = quote_currency;
        this.volume = volume;
        this.quote_volume = quote_volume;
        this.last_price = last_price;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

exports.Market = Market;