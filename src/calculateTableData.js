const axios = require("axios");

async function calculateTableData(array) {
  const currencies = getCurrencies(array);
  const pricesObj = await getPricesObject(currencies);
  const analyticsArray = [];

  for (let i = 0; i < array.length; i++) {
    const currentItem = array[i];
    const oldPrice = Number(currentItem.price);
    const moneyAmount = Number(currentItem.bought);

    const newPrice = pricesObj[currencies[i]];

    const { differenceStr, relation } = getPercentDifference(
      oldPrice,
      newPrice
    );

    const absoluteDifference = getAbsoluteDifference(moneyAmount, relation);

    analyticsArray.push({
      name: currentItem.name,
      actual_price: newPrice.toFixed(2),
      "diff, %": differenceStr,
      "diff, $": absoluteDifference,
    });
  }

  return analyticsArray;
}

function getPercentDifference(oldPrice, newPrice) {
  let difference = ((newPrice / oldPrice).toFixed(2) * 100).toFixed(2) - 100;
  let differenceStr;

  if (difference > 0) {
    differenceStr = `+${difference}%`;
  } else {
    differenceStr = `${difference}%`;
  }

  return {
    differenceStr,
    relation: newPrice / oldPrice,
  };
}

function getAbsoluteDifference(amount, relation) {
  return (amount * relation - amount).toFixed(2);
}

function getCurrencies(array) {
  return array.map((currency) => currency.name);
}

async function getPricesObject(currencies) {
  const res = await axios.get(
    `https://rest.coinapi.io/v1/exchangerate/USDT?apikey=${process.env.COINAPI_TOKEN}&invert=true`
  );

  return res.data.rates.reduce((acc, { asset_id_quote, rate }) => {
    if (currencies.includes(asset_id_quote)) {
      acc[asset_id_quote] = rate;
    }
    return acc;
  }, {});
}

module.exports = calculateTableData;
