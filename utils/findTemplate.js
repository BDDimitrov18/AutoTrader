const { forEach, replace } = require("lodash");
const templates = [ 
` FUTURES (BINANCE) 

#{pair}

LONG ENTRY :- {upperLimit} - {lowerLimit}

MAX LEVERAGE   {leverage}

TAKE PROFIT

1 {takeProfitFirst}
2 {takeProfitSecond}
3 {takeProfitThird}
4 {takeProfitForth}
5 {takeProfitFifth}

Stop Loss : - {stopLoss}`,
`{Pair}/{BASE} SHORT 
Leverage {leverage}
Entries  {entry}
Target 1 {takeProfitFirst}
Target 2 {takeProfitSecond}
Target 3 {takeProfitThird}
Target 4 {takeProfitForth}
Target 5 {takeProfitFifth}

SL {stopLoss}`];

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
    newTemp += template;
    regex = new RegExp(newTemp.replace(/\{.*?\}/gm, '(.*)'));
    console.log(message);
    console.log();
    console.log('-----------------------------------------------------------------------')
    console.log();
    console.log(regex.source);
    match = message.match(regex);
    if (match) {
      matchedTemplate = template;
      console.log('match');
      break;
    }
  }

  if (matchedTemplate !== null) {
    console.log(`Received text matches template: ${matchedTemplate}`);
    console.log('Matched values:');
    for (let i = 1; i < match.length; i++) {
      console.log(`{${i}} = ${match[i]}`);
    }
  } else {
    console.log('Received text does not match any template');
  }
};


////////////////////////////////////////////////////////////////////////////////////////////