const axios = require("axios");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to count the number of decimal places
function countDecimals(value) {
  if (Math.floor(value) === value) {
    return 0;
  }
  return value.toString().split(".")[1].length || 0;
}

module.exports = async (
  positionData,
  exchange,
  percentPerTrade,
  OrdersRunning
) => {
  let symbol = positionData.pair + positionData.base;
  symbol = symbol.toUpperCase();
  const accountInfo = await exchange.futuresBalance();
  const pricesInfo = await exchange.futuresPrices();
  let currentPrice;
  if (pricesInfo[symbol]) {
    currentPrice = parseFloat(pricesInfo[symbol]);
  } else {
    currentPrice = parseFloat(eval(`pricesInfo.${symbol}`));
  }
  // Find the USDT balance in the account
  const BalanceObj = await accountInfo.find(
    (balance) => balance.asset === positionData.base.toUpperCase()
  );
  const balance = parseFloat(BalanceObj.balance);
  
    await exchange.futuresLeverage(symbol, positionData.leverage);
    let price;
    if (positionData.entries.entriesBetweenFlag) {
      price = positionData.entries.lowerLimit;
    } else {
      price = positionData.entries.singleEntry;
    }
    const exchangeInfo = await exchange.futuresExchangeInfo();
    const pairObject = await exchangeInfo.symbols.find(
      (obj) => obj.symbol === symbol
    );
    let minOrderQty;
    let minNotional;
    let minPrice;
    let stepSize;
    for (let filter of pairObject.filters) {
      if (filter.filterType == "MIN_NOTIONAL") {
        minNotional = filter.minNotional;
      } else if (filter.filterType == "PRICE_FILTER") {
        minPrice = filter.minPrice;
      } else if (filter.filterType == "LOT_SIZE") {
        stepSize = filter.stepSize;
        minOrderQty = filter.minQty;
      }
    }
    let precision = countDecimals(stepSize);
    let quantity = (balance * percentPerTrade) / currentPrice;
    if (quantity < minOrderQty) quantity = minOrderQty;

    // Set minimum order amount with minNotional
    if (price * quantity < minNotional) {
        quantity = minNotional / price;
    }

    // Round to stepSize
    quantity = await exchange.roundStep(quantity, stepSize);
    //console.log(`${symbol}    ${quantity}    ${price} : minimum order qty : ${minOrderQty}, min order value : ${minOrderQty*price}`);
    if (positionData.long) {
    let resultFromOrder;
        resultFromOrder =await exchange.futuresBuy(symbol, quantity, price,{ timeInForce: 'GTC' });
    await OrdersRunning.push({
        orderOptionsFromMessage: positionData,
        orderId : resultFromOrder.orderId,
        precision : countDecimals(quantity),
    });
  } else {
    let resultFromOrder;
        resultFromOrder =await exchange.futuresSell(symbol, quantity, price,{ timeInForce: 'GTC' });
    await OrdersRunning.push({
        orderOptionsFromMessage: positionData,
        orderId : resultFromOrder.orderId,
        precision : countDecimals(quantity),
    });
  }
};
