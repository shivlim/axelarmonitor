# axelarmonitor
Tool to monitor vlad votes in axelar as well as check if external RPC nodes are in sync.
It sends a telegram alert to the bot configured in case of NO votes or out of sync/doen node status.

# Prerequisites
**Install nodejs**
- Install nvm using this one liner [here](https://github.com/nvm-sh/nvm#installing-and-updating) and
  logout and log back in
- Install nodejs and npm using nvm  
  `nvm install 16`  
  `nvm use 16`
- Check version using `node -v` and it should be > 16

**Get telegram bot and chatid following the process below**

1. To create a free **Telegram account**, download the [app for Android / iPhone](https://telegram.org) and sign up using your phone number.
2. To create a **Telegram bot**, add [@BotFather](https://telegram.me/BotFather) on Telegram, press Start, and follow the below steps:
    1. Send a `/newbot` command and fill in the requested details, including a bot name and username.
    2. Take a note of the API token, which looks something like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`.
    3. Access the link `t.me/<username>` to your new bot given by BotFather and press Start.
    4. Access the link `api.telegram.org/bot<token>/getUpdates`, replacing `<token>` with the bot's API token. This gives a list of the bot's activity, including messages sent to the bot.
    5. The result section should contain at least one message, due to us pressing the Start button. If not, sending a `/start` command to the bot should do the trick. Take a note of the `"id"` number in the `"chat"` section of this message.
    6. One bot is enough for now, but you can repeat these steps to create more bots.

At the end, you should have:
1. A Telegram account
2. A Telegram bot *(at least one)*
3. The Telegram bot's API token *(at least one)*
4. The chat ID of your chat with the bot *(at least one)*


**Update env properties**

Rename env file to .env file and update properties accordingly.

Following are the properties used in the tool.

| Property Name | Description |
| --- | ----------- |
| TELEGRAM_BOT_TOKEN | Bot token |
| TELEGRAM_CHAT_ID | Chat Id |
| WS_URL | Web Socket URL |
| TX_URI | URI to retrieve tx |
| ETH_RPC_ENDPOINT | ETh RPC endpoint |
| MOONBEAM_RPC_ENDPOINT | Moonbeam RPC endpoint |
| FANTOM_RPC_ENDPOINT | Fantom RPC endpoint |
| AVAX_RPC_ENDPOINT | AVAX RPC endpoint |
| POLYGON_RPC_ENDPOINT | Polygon RPC endpoint |
| AXELAR_BROADCASTER_ADDRESS | Axelar broadcaster address which sends votes |
| RPC_SYNC_CHECK_RUN_INTERVAL_IN_MINS | How often to check sync status of rpc nodes(in minutes) |
| DEAD_MANS_SWITCH_RUN_INTERVAL_IN_MINS | How often to do Healthcheck of tool to see if its alive(in Minutes)|

# Running the application

Clone the github repo.
After that run the following commands
- `npm install`
- `node index.js`  This command should be ran in tmux or screen or using service file shown below



For simplicity, root user is used but you should change it to your own user.Also change the path in
WorkingDirectory as well as parameter for ExecStart based on where you checked out from GIT

```shell
tee $HOME/axelarmonitor.service > /dev/null <<EOF
[Unit]
Description=AXELARMONITOR
After=network.target
[Service]
Type=simple
User=root
WorkingDirectory=/root/axelarmonitor
ExecStart=$(which node) /root/axelarmonitor/index.js
Restart=on-failure
RestartSec=10
[Install]
WantedBy=multi-user.target
EOF
```

```shell
sudo mv $HOME/axelarmonitor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable axelarmonitor
sudo systemctl restart axelarmonitor && journalctl -u axelarmonitor -f -o cat
```
