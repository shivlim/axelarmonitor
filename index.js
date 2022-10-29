const axios = require('axios');
const Slimbot = require('slimbot');
require('dotenv').config()
const TELEGRAMBOTTOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAMCHATID = process.env.TELEGRAM_CHAT_ID
const RPCSYNCCHECKRUNINTERVALINMINS = process.env.RPC_SYNC_CHECK_RUN_INTERVAL_IN_MINS
const DEADMANSSWITCHRUNINTERVALINMINS = process.env.DEAD_MANS_SWITCH_RUN_INTERVAL_IN_MINS
const NOVOTECHECKINTERVALINMINS = process.env.NO_VOTE_CHECK_INTERVAL_IN_MINS
const AXELAR_BROADCASTER_ADDRESS = process.env.AXELAR_BROADCASTER_ADDRESS
const AXELARSCAN_EVMPOLL_API_URL = process.env.AXELARSCAN_EVMPOLL_API_URL
const AXELARSCAN_HEARTBEAT_API_URL = process.env.AXELARSCAN_HEARTBEAT_API_URL
const ETHRPCENDPOINT = process.env.ETH_RPC_ENDPOINT
const ETH2RPCENDPOINT = process.env.ETH2_RPC_ENDPOINT
const MOONBEAMRPCENDPOINT = process.env.MOONBEAM_RPC_ENDPOINT
const FANTOMRPCENDPOINT = process.env.FANTOM_RPC_ENDPOINT
const AVAXRPCENDPOINT = process.env.AVAX_RPC_ENDPOINT
const POLYGONRPCENDPOINT = process.env.POLYGON_RPC_ENDPOINT
const BINANCERPCENDPOINT = process.env.BINANCE_RPC_ENDPOINT
const AURORARPCENDPOINT = process.env.AURORA_RPC_ENDPOINT
const ETH_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const ETH2_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const MOONBEAM_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const FANTOM_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const AVAX_RPC_ENDPOINT_REQUEST = {"jsonrpc": "2.0","method": "info.isBootstrapped","params":{"chain":"C"},"id":1}
const POLYGON_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const BINANCE_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const AURORA_RPC_ENDPOINT_REQUEST = {"id": 1, "jsonrpc": "2.0", "method": "eth_syncing", "params": []}
const TCP_CONNECT_TIMEOUT_IN_MS = 10000



const slimbot = new Slimbot(TELEGRAMBOTTOKEN);
//const now = new Date()
/*const utcMilllisecondsSinceEpoch = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000)
console.log('utcSecondsSinceEpoch' + utcSecondsSinceEpoch)*/
//console.log('utcSecondsSinceEpochutc ' + new Date(new Date().toUTCString()).valueOf())

//let utcdate = new Date(new Date().toUTCString())
//utcdate.setMinutes(utcdate.getMinutes() - 10)
//console.log('utcSecondsSinceEpochutcminus ' + utcdate.valueOf())


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
        },
        {
            "rpcendpoint":ETH2RPCENDPOINT,
            "rpcendpointrequest":ETH2_RPC_ENDPOINT_REQUEST
        },
        {
            "rpcendpoint":AURORARPCENDPOINT,
            "rpcendpointrequest":AURORA_RPC_ENDPOINT_REQUEST
        },
        {
            "rpcendpoint":BINANCERPCENDPOINT,
            "rpcendpointrequest":BINANCE_RPC_ENDPOINT_REQUEST
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
            let eth2result = results[5]
            let auroraresult = results[6]
            let binanceresult = results[7]
            let ethstatus=false;
            let eth2status=false;
            let moonbeamstatus=false;
            let fantomstatus=false;
            let avaxstatus=false;
            let polygonstatus=false;
            let aurorastatus=false;
            let binancestatus=false;

            if(ethresult.status === 'fulfilled' && ethresult.value.data.hasOwnProperty('result') && !ethresult.value.data.result){
                ethstatus=true;
            }
            if(eth2result.status === 'fulfilled' && eth2result.value.data.hasOwnProperty('result') && !eth2result.value.data.result){
                eth2status=true;
            }
            if(auroraresult.status === 'fulfilled' && auroraresult.value.data.hasOwnProperty('result') && !auroraresult.value.data.result){
                aurorastatus=true;
            }
            if(binanceresult.status === 'fulfilled' && binanceresult.value.data.hasOwnProperty('result') && !binanceresult.value.data.result){
                binancestatus=true;
            }
            if(moonbeamresult.status === 'fulfilled' && moonbeamresult.value.data.hasOwnProperty('result') && !moonbeamresult.value.data.result){
                moonbeamstatus=true;
            }
            if(fantomresult.status === 'fulfilled' && fantomresult.value.data.hasOwnProperty('result') && !fantomresult.value.data.result){
                fantomstatus=true;
            }
            if(avaxresult.status === 'fulfilled' && avaxresult.value.data.hasOwnProperty('result') && avaxresult.value.data.result.isBootstrapped){
                avaxstatus=true;
            }
            if(polygonresult.status === 'fulfilled' && polygonresult.value.data.hasOwnProperty('result') && !polygonresult.value.data.result){
                polygonstatus=true;
            }
            if(!ethstatus || !moonbeamstatus || !fantomstatus || !avaxstatus || !polygonstatus || !eth2status || !aurorastatus || !binancestatus || deadmanswitchflag[0]){
                const alertmsg = `
                                __RPC Chain Status__
                                \`\`\`
                               ETHStatus:     ${getlogo(ethstatus)}
                               ETH2Status:     ${getlogo(eth2status)}
                               BinanceStatus:     ${getlogo(binancestatus)}
                               AuroraStatus:     ${getlogo(aurorastatus)}
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


function getlogo(ethstatus) {
    if(ethstatus)
        return '✅';
    else return '❌';
}
//curl 'https://testnet.api.axelarscan.io/heartbeats' \
//   -H 'authority: testnet.api.axelarscan.io' \
//   -H 'accept: */*' \
//   -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
//   -H 'cache-control: no-cache' \
//   -H 'content-type: text/plain;charset=UTF-8' \
//   -H 'origin: https://docs.axelarscan.io' \
//   -H 'pragma: no-cache' \
//   -H 'referer: https://docs.axelarscan.io/' \
//   -H 'sec-ch-ua: "Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'sec-fetch-dest: empty' \
//   -H 'sec-fetch-mode: cors' \
//   -H 'sec-fetch-site: same-site' \
//   -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36' \
//   --data-raw '{"sender":"axelar1rym08uqf7z3ccjr9q2x8zu8acrxq03n346snxt","size":5}' \
//   --compressed
async function checkheartbeat(){
    let requestbody = {}
    /**
     * {

	"voter": "axelar1d2pes5he2u756gscwewfammkhurelsghmjzcex",
     "vote":"no",
      "fromTime":"1666299208",
	"size": 10
}
     */
    let utcdate = new Date(new Date().toUTCString())
    utcdate.setMinutes(utcdate.getMinutes() - NOVOTECHECKINTERVALINMINS)
    // let curutctimeinsec = new Date(new Date().toUTCString()).valueOf()
    //date.setMinutes(date.getMinutes() - numOfMinutes);
    requestbody['sender'] = AXELAR_BROADCASTER_ADDRESS
    requestbody['size'] = 5

    const headers = {
        'Content-Type': 'application/json'
    }
    const json = JSON.stringify(requestbody);
    const res = await axios.post(AXELARSCAN_HEARTBEAT_API_URL, json,{headers: headers});
    console.log(res.data.data)
    res.data.data.forEach(poll=>{
        let totalparticipants = poll['participants'].length
        let pollid = poll['id']
        let chain = poll['sender_chain']
        let nooffalsevotesinpoll = 0;
        Object.keys(poll).forEach(key=>{
            //console.log(key)
            if(key.startsWith('axelar1')){
                let vote = poll[key]['vote']
                if(vote === false){
                    nooffalsevotesinpoll++;
                }
            }
        })
        console.log(totalparticipants)
        console.log(nooffalsevotesinpoll)
        console.log(' percentage of false votes ' + (nooffalsevotesinpoll/totalparticipants))
        if((nooffalsevotesinpoll/totalparticipants)<=0.5){
            //raise alarm
            slimbot.sendMessage(TELEGRAMCHATID, 'voted ❌ for ' + chain + ' in poll id '+ pollid,);
            console.log('voted false for ' + chain + ' in poll id '+ pollid)
        }

    })

}

async function checknovotes(){
    let requestbody = {}
    /**
     * {

	"voter": "axelar1d2pes5he2u756gscwewfammkhurelsghmjzcex",
     "vote":"no",
      "fromTime":"1666299208",
	"size": 10
}
     */
    let utcdate = new Date(new Date().toUTCString())
    utcdate.setMinutes(utcdate.getMinutes() - NOVOTECHECKINTERVALINMINS)
   // let curutctimeinsec = new Date(new Date().toUTCString()).valueOf()
    //date.setMinutes(date.getMinutes() - numOfMinutes);
    requestbody['voter'] = AXELAR_BROADCASTER_ADDRESS
    requestbody['vote'] = 'no'
    requestbody['fromTime'] =  String(Math.round(utcdate.valueOf() / 1000))
    //requestbody['fromTime'] =  '1666299208'
    requestbody['size'] = 10
    const headers = {
        'Content-Type': 'application/json'
    }
    const json = JSON.stringify(requestbody);
    const res = await axios.post(AXELARSCAN_API_URL, json,{headers: headers});
    console.log(res.data.data)
    res.data.data.forEach(poll=>{
        let totalparticipants = poll['participants'].length
        let pollid = poll['id']
        let chain = poll['sender_chain']
        let nooffalsevotesinpoll = 0;
        Object.keys(poll).forEach(key=>{
            //console.log(key)
            if(key.startsWith('axelar1')){
                let vote = poll[key]['vote']
                if(vote === false){
                    nooffalsevotesinpoll++;
                }
             }
        })
        console.log(totalparticipants)
        console.log(nooffalsevotesinpoll)
        console.log(' percentage of false votes ' + (nooffalsevotesinpoll/totalparticipants))
        if((nooffalsevotesinpoll/totalparticipants)<=0.5){
            //raise alarm
            slimbot.sendMessage(TELEGRAMCHATID, 'voted ❌ for ' + chain + ' in poll id '+ pollid,);
            console.log('voted false for ' + chain + ' in poll id '+ pollid)
        }

    })

}

//setInterval(checksyncstatus, RPCSYNCCHECKRUNINTERVALINMINS * 60  * 1000,false);
//setInterval(checksyncstatus, DEADMANSSWITCHRUNINTERVALINMINS * 60  * 1000,true);
//checksyncstatus(true);
//checknovotes();
checkheartbeat();
