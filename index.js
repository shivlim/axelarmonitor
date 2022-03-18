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
    console.log(typeof data);
    const response = JSON.parse(data)
    if(response.hasOwnProperty('result') &&  response['result'].hasOwnProperty('events')){
        const txhash = response['result']['events']['tx.hash']
        const txurl = 'http://localhost:1317/cosmos/tx/v1beta1/txs/' + txhash;
        console.log('txurl is' + txurl)
        axios.get(txurl)
            .then(function (response) {
                // handle success
                const responsebody = response.data;
                console.log(responsebody);
                console.log(responsebody['tx']['body']['messages'][0]['inner_message']['chain']);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    }else{
        console.log('no own property result')
    }

});



