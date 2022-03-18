const WebSocket = require('ws');
const axios = require('axios');
const Slimbot = require('slimbot');
require('dotenv').config()
const TELEGRAMBOTTOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAMCHATID = process.env.TELEGRAM_CHAT_ID
const WSURL = process.env.WS_URL
const TXURI = process.env.TX_URI
const RPCSYNCCHECKRUNINTERVALINMINS = process.env.RPC_SYNC_CHECK_RUN_INTERVAL_IN_MINS
const DEADMANSSWITCHRUNINTERVALINMINS = process.env.DEAD_MANS_SWITCH_RUN_INTERVAL_IN_MINS
const ETHRPCENDPOINT = process.env.ETH_RPC_ENDPOINT
const MOONBEAMRPCENDPOINT = process.env.MOONBEAM_RPC_ENDPOINT
const FANTOMRPCENDPOINT = process.env.FANTOM_RPC_ENDPOINT
const AVAXRPCENDPOINT = process.env.AVAX_RPC_ENDPOINT
const POLYGONRPCENDPOINT = process.env.POLYGON_RPC_ENDPOINT
const ETH_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const MOONBEAM_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const FANTOM_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const AVAX_RPC_ENDPOINT_REQUEST = {"jsonrpc": "2.0","method": "info.isBootstrapped","params":{"chain":"C"},"id":1}
const POLYGON_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const AXELARBROADCASTERADDRESS = process.env.AXELAR_BROADCASTER_ADDRESS
const TCP_CONNECT_TIMEOUT_IN_MS = 10000



const ws = new WebSocket(WSURL);
const slimbot = new Slimbot(TELEGRAMBOTTOKEN);

ws.on('open', function open() {
    console.log('Open now')
    const subscriberequest=`{ "jsonrpc": "2.0","method": "subscribe","id": 0,"params": {"query": "tm.event=\'Tx\' AND depositConfirmation.action=\'vote\' AND transfer.recipient=\'${AXELARBROADCASTERADDRESS}\' AND depositConfirmation.value=\'true\'"}}`
    ws.send(subscriberequest);
});



async function checksyncstatus(...deadmanswitchflag){
    let rpcrequestmap = [
        {
            "rpcendpoint":ETHRPCENDPOINT,
            "rpcendpointrequest":ETH_RPC_ENDPOINT_REQUEST
        },
        {
            "rpcendpoint":MOONBEAMRPCENDPOINT,
            "rpcendpointrequest":MOONBEAM_RPC_ENDPOINT_REQUEST
        },
        {
            "rpcendpoint":FANTOMRPCENDPOINT,
            "rpcendpointrequest":FANTOM_RPC_ENDPOINT_REQUEST
        },
        {
            "rpcendpoint":AVAXRPCENDPOINT,
            "rpcendpointrequest":AVAX_RPC_ENDPOINT_REQUEST
        },
        {
            "rpcendpoint":POLYGONRPCENDPOINT,
            "rpcendpointrequest":POLYGON_RPC_ENDPOINT_REQUEST
        }

    ]

    let source = axios.CancelToken.source();
    setTimeout(() => {
        source.cancel();
    }, TCP_CONNECT_TIMEOUT_IN_MS);

    Promise.allSettled(rpcrequestmap.map((endpoint) => axios.post(endpoint.rpcendpoint,endpoint.rpcendpointrequest,{cancelToken: source.token})))
        .then((results) => {
            let ethresult = results[0]
            let moonbeamresult = results[1]
            let fantomresult = results[2]
            let avaxresult = results[3]
            let polygonresult = results[4]
            let ethstatus=false;
            let moonbeamstatus=false;
            let fantomstatus=false;
            let avaxstatus=false;
            let polygonstatus=false;

            if(ethresult.status === 'fulfilled' && !ethresult.value.data.result){
                ethstatus=true;
            }
            if(moonbeamresult.status === 'fulfilled' && !moonbeamresult.value.data.result){
                moonbeamstatus=true;
            }
            if(fantomresult.status === 'fulfilled' && !fantomresult.value.data.result){
                fantomstatus=true;
            }
            if(avaxresult.status === 'fulfilled' && avaxresult.value.data.result.isBootstrapped){
                avaxstatus=true;
            }
            if(polygonresult.status === 'fulfilled' && !polygonresult.value.data.result){
                polygonstatus=true;
            }
            if(!ethstatus || !moonbeamstatus || !fantomstatus || !avaxstatus || !polygonstatus || deadmanswitchflag[0]){
                const alertmsg = `
                                __RPC Chain Status__
                                \`\`\`
                               ETHStatus:     ${getlogo(ethstatus)}
                               MbeamStatus:   ${getlogo(moonbeamstatus)}
                               FantomStatus:  ${getlogo(fantomstatus)}
                               AvaxStatus:    ${getlogo(avaxstatus)}
                               PolygonStatus: ${getlogo(polygonstatus)}
                                \`\`\`
                                `;
                slimbot.sendMessage(TELEGRAMCHATID, alertmsg,{parse_mode: 'MarkdownV2'});
            }
        }).catch(function(err) {
            console.log(err.message);
        });


}

function alertfornovotes(txurl){
    axios.get(txurl)
        .then(function (response) {
            const responsebody = response.data;
            console.log(responsebody);
            const chain = responsebody['tx']['body']['messages'][0]['inner_message']['chain']
            console.log("chain is %s",chain);
            const alertmsg = `*ALERT: Voted *NO on Chain *${chain}*`;
            slimbot.sendMessage(TELEGRAMCHATID, alertmsg,{parse_mode: 'MarkdownV2'});
        })
        .catch(function (error) {
            console.log(error);
            const alertmsg = `*ALERT: Voted *NO`;
            slimbot.sendMessage(TELEGRAMCHATID, alertmsg,{parse_mode: 'MarkdownV2'});
        });

}

ws.on('message', function message(data) {
    console.log('received: %s', data);
    console.log(typeof data);
    const response = JSON.parse(data)
    if(response.hasOwnProperty('result') &&  response['result'].hasOwnProperty('events')){
        const txhash = response['result']['events']['tx.hash']
        const txurl = TXURI + txhash;
        console.log('txurl is' + txurl)
        setTimeout(() => { alertfornovotes(txurl) }, 20000);
    }else{
        console.log('no own property result')
    }

});

function getlogo(ethstatus) {
    if(ethstatus)
        return '✅';
    else return '❌';
}

setInterval(checksyncstatus, RPCSYNCCHECKRUNINTERVALINMINS * 60  * 1000,false);
setInterval(checksyncstatus, DEADMANSSWITCHRUNINTERVALINMINS * 60  * 1000,true);
checksyncstatus(true);
