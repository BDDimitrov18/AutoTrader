const BigNumber = require('bignumber.js');


module.exports = async(order,exchange) => {
    try{
        let symbol =
        order.orderOptionsFromMessage.pair + order.orderOptionsFromMessage.base;
      symbol = symbol.toUpperCase();
      let currentPosition;
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
            currentPosition = position_data[market];
          }
        }
      }
      if(!currentPosition){
        console.log("canceling");
        console.log(order.orderOptionsFromMessage.exits.multipleExitsFlag);
        if(order.orderOptionsFromMessage.exits.multipleExitsFlag){
            console.log(order.takeProfitOrdersIds.length);
            for(var currentOrderId of order.takeProfitOrdersIds){
                

                let orderId = await new BigNumber(currentOrderId).toFixed();
                console.log(`TAKE PROFIT ORDER CANCEL : ${orderId}`);
                await exchange.futuresCancel( symbol, {orderId: orderId} );
            }
        }
        else{
            let orderId = await new BigNumber(order.takeProfitOrdersIds[0]).toFixed();
            console.log(`TAKE PROFIT ORDER CANCEL : ${orderId}`);
            await exchange.futuresCancel( symbol, {orderId: orderId} );
        }
        let orderIdStopLoss = new BigNumber(order.stopLossOrderId).toFixed();
        console.log(`Stop Loss order cancel : ${orderIdStopLoss}`);
        await exchange.futuresCancel( symbol, {orderId:  orderIdStopLoss} );
        order.done = true;
      }
      
    }
    catch(err){
    } 
}