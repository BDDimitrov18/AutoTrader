const {Client} = require('discord.js-selfbot-v13');
const dotenv = require('dotenv');
require('dotenv').config();
//const Binance = require('node-binance-api');
const client = new Client({
  checkUpdate : false,
});
const Binance = require('node-binance-api');
const binance =  new Binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.API_SECRET,
});

let OrdersRunning = [];
const findTemplate = require('./utils/findTemplate');
const executeTrade = require('./utils/executeTrade');
const checkOrderExecution = require('./utils/checkOrderExecution');
const disableAttachedOrders = require('./utils/disableAttachedOrders');

client.on('ready', async () =>{ 
  console.log('Bot is online!')
});



// Replace 'WEBHOOK_ID' and 'WEBHOOK_TOKEN' with your actual webhook ID and token
const webhookClient = new WebhookClient('1129000747095294062', '3LHAm16KrkaYAoCCkIqWLebn601xOAPsOJ9W8P564TLedxNi5z2DuxURPCdZVkDhYGT7');
const intervalTime = 5000;
const interval =  setInterval(async () => {
  for(const order of OrdersRunning){
    if(!order.executed){
      order.takeProfitOrdersIds = [];
      order.stopLossOrderId = null;
      order.executed = false;
     await checkOrderExecution(order,binance);
    }
    if(order.executed){
      console.log('entering cleanup func');
      order.done = false;
      await disableAttachedOrders(order,binance);
      if(order.done){
      let index = OrdersRunning.indexOf(order);
      OrdersRunning =OrdersRunning.splice(index,index);
      }
    }
  }
  ;
}, intervalTime);

client.on('messageCreate', async(message) =>{
  if (message.channel.id === "1129000013943537664") {
    if(message.content === '!TriggerSignalTest : 1'){
      webhookClient.send(`📊 FUTURES (BINANCE) 

      #ETHUSDT
      
      🟢LONG ENTRY :- 2000.1 - 1883.9
      
      MAX LEVERAGE 👉  20X
      
      👇TAKE PROFIT
      
      1️⃣ 1884.0
      2️⃣ 1885.0
      3️⃣ 1886.0
      4️⃣ 1887.0
      5️⃣ 1888.0➕🚀
      
      Stop Loss : - 1865.0`);
    }
    if(message.content === '!TriggerSignalTest : 2'){
      webhookClient.send(`ETH/USDT SHORT 🛑
      Leverage 20x
      Entries  1882.2
      Target 1 1880.0
      Target 2 1879.0
      Target 3 1878.1
      Target 4 1876.1
      Target 5 1875.1
      
      SL 1900.0`);
    }
    const tradeOptions = await findTemplate(message.content, message.author.nickname);
    await executeTrade(tradeOptions,binance,1,OrdersRunning);
  }

});


client.login(process.env.TOKEN);




//Haven, WWG Walsh Wealth TraderSZ, Dr.Profit, Chart Champions, Crypto Ken, Chroma, Futures125x