const { forEach, replace } = require("lodash");

require('@unicode/unicode-12.0.0/Binary_Property/Emoji/code-points.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji/symbols.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji/regex.js');

require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Component/code-points.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Component/symbols.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Component/regex.js');

require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Modifier/code-points.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Modifier/symbols.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Modifier/regex.js');

require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Modifier_Base/code-points.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Modifier_Base/symbols.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Modifier_Base/regex.js');

require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Presentation/code-points.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Presentation/symbols.js');
require('@unicode/unicode-12.0.0/Binary_Property/Emoji_Presentation/regex.js');

const templates = [ 
`📊 FUTURES (BINANCE) 

#[Pair]

🟢LONG ENTRY :- [upperLimit] - [LowerLimit]

MAX LEVERAGE 👉  [leverage]

👇TAKE PROFIT

1️⃣ [takeProfit1]
2️⃣ [takeProfit2]
3️⃣ [takeProfit3]
4️⃣ [takeProfit4]
5️⃣ [takeProfit5]➕🚀

Stop Loss : - [stopLoss]`,
`[Pair]/[BASE] SHORT 🛑
Leverage [leverage]
Entries  [entry]
Target 1 [takeProfit1]
Target 2 [takeProfit2]
Target 3 [takeProfit3]
Target 4 [takeProfit4]
Target 5 [takeProfit5]

SL [stopLoss]`];

module.exports = (message,senderUser) => {

    
    let matchedTemplate = null;
let match;
let regex;
for (let template of templates) {
    let replacedTemp = template.replace(/\[.*?\]/ugm,'(.*)');
    regex = new RegExp('^' + replacedTemp + '$', 'umg');
    console.log(regex.source);
  match = message.match(regex);
  if (match) {
    matchedTemplate = template;
    console.log('match');
    break;
  }
}

if (matchedTemplate !== null) {
  console.log(`Received text matches template : ${matchedTemplate}`);
  console.log('Matched values:');
  for (let i = 1; i < match.length; i++) {
    console.log(`{${i}} = ${match[i]}`);
  }
} else {
  console.log('Received text does not match any template');
}
}







////////////////////////////////////////////////////////////////////////////////////////////