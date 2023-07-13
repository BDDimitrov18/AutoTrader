const axios = require('axios');
const crypto = require('crypto');

// Replace with your own API Key and Secret
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

async function getOpenPositionID(symbol,leverage) {
  try {
    // Set the API endpoint and parameters
    const endpoint = 'https://fapi.binance.com/fapi/v2/positionRisk';
    const params = {
      timestamp: Date.now(),
    };

    // Create the query string
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // Create the signature
    const signature = crypto
      .createHmac('sha256', API_SECRET)
      .update(queryString)
      .digest('hex');

    // Set the request headers
    const headers = {
      'X-MBX-APIKEY': API_KEY,
    };

    // Make the API request
    const response = await axios.get(endpoint, {
      headers,
      params: {
        ...params,
        signature,
      },
    });

    // Extract the position ID from the response
    const positions = response.data;
    
    const openPosition = positions.find(position => {if(parseFloat(position.positionAmt) !== 0){
        if(position.symbol === symbol && parseInt(position.leverage) === leverage){return position};
    }});
    if (openPosition) {
      const positionID = openPosition.positionAmt > 0 || openPosition.positionAmt < 0? openPosition.positionId : -openPosition.positionId;
      console.log('Open Position ID:', positionID);
      return positionID;
    } else {
      console.log('No open positions found.');
    }
  } catch (error) {
    console.error('Error retrieving open position ID:', error.message);
  }
}
  


module.exports = async (order, exchange) => {
  try {
    let symbol =
      order.orderOptionsFromMessage.pair + order.orderOptionsFromMessage.base;
    symbol = symbol.toUpperCase();
    let currentOrder;
    let position_data = await exchange.futuresPositionRisk(),
      markets = Object.keys(position_data);
    for (let market of markets) {
      let obj = position_data[market],
        size = Number(obj.positionAmt);
      if (size == 0) continue;
      else {
        if (
          obj.symbol === symbol &&
          parseInt(obj.leverage) === order.orderOptionsFromMessage.leverage
        ) {
          currentOrder = position_data[market];
        }
      }
    }
    
    if (currentOrder) {
        order.executed = true;
        const positionID = await getOpenPositionID(symbol,order.orderOptionsFromMessage.leverage);
      if (order.orderOptionsFromMessage.exits.multipleExitsFlag) {
        const takeProfitPrices =
          await order.orderOptionsFromMessage.exits.multipleExits.map(
            (exit) => ({
              price: exit.price,
              percentage: exit.percentage,
            })
          );
        const stopLossPrice = order.orderOptionsFromMessage.stopLoss;
        for (const takeProfitOrder of takeProfitPrices) {
          let quantity =
            parseFloat(currentOrder.positionAmt) * takeProfitOrder.percentage;
          quantity = quantity.toFixed(order.precision);
          quantity = Math.abs(quantity);
          if (order.orderOptionsFromMessage.long) {
            console.log(quantity);
            console.log("TAKE PROFIT ORDER:");


            let ret3 = await exchange.futuresSell(symbol, quantity, takeProfitOrder.price, {
                newClientOrderId: positionID,
                stopPrice: takeProfitOrder.price,
                type: "TAKE_PROFIT",
                timeInForce: "GTC",
                priceProtect: true,
                reduceOnly: true
            });
            await order.takeProfitOrdersIds.push(ret3.orderId);


    

          } else {
            if (!order.orderOptionsFromMessage.long) {
                console.log(quantity);
                console.log("TAKE PROFIT ORDER:");
    
    
                let ret3 = await exchange.futuresBuy(symbol, quantity, takeProfitOrder.price, {
                    newClientOrderId: positionID,
                    stopPrice: takeProfitOrder.price,
                    type: "TAKE_PROFIT",
                    timeInForce: "GTC",
                    priceProtect: true,
                    reduceOnly: true
                });
                console.log(ret3);
                await  order.takeProfitOrdersIds.push(ret3.orderId);
    

              //stop loss
            }
          }
        }
        //stop losss
      } else {
        if (order.orderOptionsFromMessage.long) {

            console.log(currentOrder.executedQty);
            console.log("TAKE PROFIT ORDER:");


            let ret3 = await exchange.futuresSell(symbol, Math.abs(floatParse(currentOrder.executedQty)), order.orderOptionsFromMessage.stopLoss, {
                newClientOrderId: positionID,
                stopPrice: takeProfitOrder.price,
                type: "TAKE_PROFIT",
                timeInForce: "GTC",
                priceProtect: true,
                reduceOnly: true
            });
            await  order.takeProfitOrdersIds.push(ret3.orderId);
          //stopp loss
        } else {
            console.log(currentOrder.executedQty);
            console.log("TAKE PROFIT ORDER:");


            let ret3 = await exchange.futuresBuy(symbol, Math.abs(floatParse(currentOrder.executedQty)), order.orderOptionsFromMessage.stopLoss, {
                newClientOrderId: positionID,
                stopPrice: takeProfitOrder.price,
                type: "TAKE_PROFIT",
                timeInForce: "GTC",
                priceProtect: true,
                reduceOnly: true
            });
            await  order.takeProfitOrdersIds.push(ret3.orderId);
        }
      }
      if (order.orderOptionsFromMessage.long) {
        //stopLoss
        let quantity =
            parseFloat(currentOrder.positionAmt);
          quantity.toFixed(order.precision);
          quantity = Math.abs(quantity);
          console.log('STOPLOSS ORDER');
          let ret2 = await exchange.futuresMarketSell(symbol, quantity, {
            newClientOrderId: positionID,
            type: "STOP_MARKET",
            stopPrice: order.orderOptionsFromMessage.stopLoss,
            priceProtect: true,
            reduceOnly: true
          });
            order.stopLossOrderId = ret2.orderId;
      }
      else{
        let quantity =
            parseFloat(currentOrder.positionAmt);
          quantity.toFixed(order.precision);
          quantity = Math.abs(quantity);
          console.log('STOPLOSS ORDER');
          let ret2 = await exchange.futuresMarketBuy(symbol, quantity, {
            newClientOrderId: positionID,
            type: "STOP_MARKET",
            stopPrice: order.orderOptionsFromMessage.stopLoss,
            priceProtect: true,
            reduceOnly: true
          });
           order.stopLossOrderId = ret2.orderId;
      }
      
    }
    
  } catch (err) {
    console.log(err);
  }

};
