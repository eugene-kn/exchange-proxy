require('dotenv').config();
const Queue = require('bee-queue');

let opts = {
    prefix: 'bq',
    stallInterval: 5000,
    nearTermWindow: 1200000,
    delayedDebounce: 1000,
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        db: 0,
        options: {}
    }
};

function worker() {
    opts.isWorker = true;
    return new Queue(process.env.REDIS_QUEUE_NAME, opts);
}

function producer() {
    opts.isWorker = false;
    return new Queue(process.env.REDIS_QUEUE_NAME, opts);
}

module.exports = { worker, producer };