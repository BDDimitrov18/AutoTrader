const { forEach, replace } = require("lodash");
function tradeOptionsBlank(){
  return  {
    pair: null,
    base: null,
    long: true,
    entries : {
      entriesBetweenFlag: false,
      multipleEntriesFlag: false,
      upperLimit: null,
      lowerLimit: null,
      multipleEntries: [],
      singleEntry: null,
    },
    leverage: null,
    exits: {
      multipleExitsFlag: false,
      multipleExits: [],
      singleExit: null,
    },
    stopLoss : null,
  };
}
const templates = [ {content: 
` FUTURES \\(BINANCE\\) 

#{pair}

{EntryType} ENTRY :- {upperLimit} - {lowerLimit}

MAX LEVERAGE   {leverage}X

TAKE PROFIT

1 {takeProfitFirst}
2 {takeProfitSecond}
3 {takeProfitThird}
4 {takeProfitForth}
5 {takeProfitFifth}

Stop Loss : - {stopLoss}`
,
createTradeOptions: async function(match){
  let tradeOptions = tradeOptionsBlank();
    if(await splitPairAndBase(match[1])){
      let pairBaseObj = await splitPairAndBase(match[1]); 
      tradeOptions.pair = pairBaseObj.pair;
      tradeOptions.base = pairBaseObj.base;
    }
    //POSITION TYPE
    match[2] === 'LONG' ? tradeOptions.long = true :  tradeOptions.long = false ;
    //ENTRIES LIMITS SET
    tradeOptions.entries.entriesBetweenFlag = true;
    tradeOptions.entries.upperLimit = parseFloat(match[3]);
    tradeOptions.entries.lowerLimit = parseFloat(match[4]);
    //Ajust Leverage
    tradeOptions.leverage = parseInt(match[5]);
    //Taking profit
    tradeOptions.exits.multipleExitsFlag = true;
    tradeOptions.exits.multipleExits.push({price: parseFloat(match[6]), percentage : .2});
    tradeOptions.exits.multipleExits.push({price: parseFloat(match[7]), percentage : .4});
    tradeOptions.exits.multipleExits.push({price: parseFloat(match[8]), percentage : .6});
    tradeOptions.exits.multipleExits.push({price: parseFloat(match[9]), percentage : .8});
    tradeOptions.exits.multipleExits.push({price: parseFloat(match[10]), percentage : 1});
    //stopLoss
    tradeOptions.stopLoss = parseFloat(match[11]);

    return tradeOptions;
  }
},{content:
`{Pair}/{BASE} {EntryType} 
Leverage {leverage}x
Entries  {entry}
Target 1 {takeProfitFirst}
Target 2 {takeProfitSecond}
Target 3 {takeProfitThird}
Target 4 {takeProfitForth}
Target 5 {takeProfitFifth}

SL {stopLoss}`,
createTradeOptions : async function(match){
  let tradeOptions = tradeOptionsBlank();
  //Pair and base
  tradeOptions.pair = match[1].toLowerCase();
  tradeOptions.base = match[2].toLowerCase();
  //Position type
  match[3] === "SHORT" ? tradeOptions.long = false : tradeOptions.long = true;
  //LEVERAGE
  tradeOptions.leverage = parseInt(match[4]);
  //Entries
  tradeOptions.entries.multipleEntriesFlag = false;
  tradeOptions.entries.singleEntry = parseFloat(match[5]);
  //take profit
  tradeOptions.exits.multipleExitsFlag = true;
  tradeOptions.exits.multipleExits.push({price: parseFloat(match[6]), percentage : 0.2});
  tradeOptions.exits.multipleExits.push({price: parseFloat(match[7]), percentage : 0.4});
  tradeOptions.exits.multipleExits.push({price: parseFloat(match[8]), percentage : 0.6});
  tradeOptions.exits.multipleExits.push({price: parseFloat(match[9]), percentage : 0.8});
  tradeOptions.exits.multipleExits.push({price: parseFloat(match[10]), percentage : 1});
  //stop Loss
  tradeOptions.stopLoss = parseFloat(match[11]);

  console.log(tradeOptions);
  
  return tradeOptions;
}
}];

async function splitPairAndBase(str){
  str = str.toLowerCase();
  let pairBaseObj = {
    pair : null, base : null,
  };
  if(await str.search('usdt')!=-1){
    let position = await str.search('usdt');
    pairBaseObj = {
      pair: await str.substring(0,position),
      base : 'usdt',
    };
  }
  else if(await str.search('usdc')!=-1){
    let position = await str.search('usdc');
    pairBaseObj = {
      pair: await str.substring(0,position),
      base : 'usdc',
    };
  }
  else if(await str.search('busd')!=-1){
    let position = await str.search('busd');
    pairBaseObj = {
      pair: await str.substring(0,position),
      base : 'busd',
    };
  }
  return pairBaseObj;
}

async function escapeEmoji(message){
  let result = '';
  for(let letter in message){
    if(message.charCodeAt(letter) >= 0 && message.charCodeAt(letter) <= 255){
      result += message[letter];
    }
  }  
  return result;
}

module.exports = async (message, senderUser) => {
  let matchedTemplate = null;
  let match;
  let regex;
message = await escapeEmoji(message);
  for (let template of templates) {
    let newTemp = '';
    newTemp += template.content;
    regex = new RegExp(newTemp.replace(/\{.*?\}/gm, '(.*)'));
    match = message.match(regex);
    if (match) {
      matchedTemplate = template.content;
       return template.createTradeOptions(match);
    }
  }
};


////////////////////////////////////////////////////////////////////////////////////////////