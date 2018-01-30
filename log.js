const winston = require('winston');

const log = winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.printf(i => {
            return `${i.level}: ${i.message}`
        })
    ),
    transports: [new winston.transports.Console()]
});

module.exports = log;