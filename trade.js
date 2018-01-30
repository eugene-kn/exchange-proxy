class Trade {
    constructor(
        id, exchange_id, market_id, order_id, order_type,
        price, quantity, total, order_time, created_at
    ) {
        this.id = id;
        this.exchange_id = exchange_id;
        this.market_id = market_id;
        this.order_id = order_id;
        this.order_type = order_type;
        this.price = price;
        this.quantity = quantity;
        this.total = total;
        this.order_time = order_time;
        this.created_at = created_at;
    }
}

exports.Trade = Trade;