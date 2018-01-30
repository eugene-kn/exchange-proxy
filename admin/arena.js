require('dotenv').config();
const Arena = require('bull-arena');
const express = require('express');
const router = express.Router();

const arena = Arena({
    queues: [
        {
            name: "exchange_proxy",
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            hostId: "CryptoBaseScanner",
            type: "bee"
        }
    ]
});

router.use('/', arena);