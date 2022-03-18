const WebSocket = require('ws');
const axios = require('axios');
const Slimbot = require('slimbot');
const https = require("https");
require('dotenv').config()
const ws = new WebSocket('ws://127.0.0.1:26657/websocket');

ws.on('open', function open() {
    console.log('Open now')
    ws.send('{ "jsonrpc": "2.0","method": "subscribe","id": 0,"params": {"query": "tm.event=\'Tx\' AND depositConfirmation.action=\'vote\' AND transfer.recipient=\'axelar1p8vpmajj4lym6x7r8wn0zjpdthah6ghx80lphe\' AND depositConfirmation.value=\'true\'"}}');
});

ws.on('message', function message(data) {
    console.log('received: %s', data);
});



