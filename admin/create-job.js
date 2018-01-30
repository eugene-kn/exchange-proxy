const queue = require('../queue').producer();
const command = require('commander');

command
    .option('-t, --type [value]', 'Job type (UPDATE_MARKETS|UPDATE_OHLC|UPDATE_TRADES)')
    .option('-e, --exchange [value]', 'Exchange code (CPIA)')
    .option('-s, --symbol  [value]', 'Symbol (ETH/BTC)')
    .parse(process.argv);

if (!command.type) {
    throw new Error('Missing commmand type (see --help)');
}

let params = {
    type: command.type
};

switch (command.type) {
    case 'UPDATE_MARKETS':
        if (!command.exchange) {
            throw new Error('Missing exchange code (see --help)');
        }

        params['exchange'] = command.exchange;
        break;

    case 'UPDATE_OHLC':
    case 'UPDATE_TRADES':
        if (!command.exchange || !command.symbol) {
            throw new Error('Missing exchange code and/or symbol (see --help)');
        }

        params['exchange'] = command.exchange;
        params['symbol'] = command.symbol;
        break;

    default:
        throw new Error(`Unknown job type - ${command.type}`);
}

console.log('Creating job %j', params);

(async () => {
    await queue
        .createJob(params)
        .timeout(30000)
        .save();

    queue.close(5000);
})();
