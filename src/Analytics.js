const axios = require("axios");

class Analytics {
  constructor(props) {
    this.currenciesDataArr = props.currenciesDataArr;
    this.sumAnalytics = [];
    this.currenciesAnalytics = [];
    this.pricesObject = {};
  }

  async calculateTableData() {
    const currenciesNamesArr = this._getNames(this.currenciesDataArr);

    this.pricesObject = await this._getPricesObject(currenciesNamesArr);
    this.currenciesAnalytics = this._getCurrencyAnalytics();
    this.sumAnalytics = this._getSumAnalytics();
  }

  _getNames(array) {
    return array.map((currency) => currency.name);
  }

  async _getPricesObject(currencies) {
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

  _getSumAnalytics() {
    const initSum = this.currenciesDataArr.reduce(
      (acc, item) => acc + item.bought,
      0
    );
    const actualSum = this.currenciesAnalytics.reduce(
      (acc, item) => acc + Number(item["diff, $"]),
      initSum
    );
    const diffAbsolute = actualSum - initSum;
    const { differenceStr: diffPercent } = this._getPercentDifference(
      initSum,
      actualSum
    );

    return [
      {
        init: initSum,
        actual: actualSum.toFixed(2),
        "diff, $": diffAbsolute.toFixed(2),
        "diff, %": diffPercent,
      },
    ];
  }

  _getCurrencyAnalytics() {
    const analyticsArray = [];

    for (let i = 0; i < this.currenciesDataArr.length; i++) {
      const currentItem = this.currenciesDataArr[i];
      const oldPrice = Number(currentItem.price);
      const moneyAmount = Number(currentItem.bought);

      const newPrice = this.pricesObject[currentItem.name];

      const { differenceStr, relation } = this._getPercentDifference(
        oldPrice,
        newPrice
      );

      const absoluteDifference = this._getAbsoluteDifference(
        moneyAmount,
        relation
      );

      analyticsArray.push({
        name: currentItem.name,
        price: newPrice.toFixed(2),
        "diff, $": absoluteDifference,
        "diff, %": differenceStr,
      });
    }

    return analyticsArray;
  }

  _getPercentDifference(oldPrice, newPrice) {
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

  _getAbsoluteDifference(amount, relation) {
    return (amount * relation - amount).toFixed(2);
  }
}

module.exports = Analytics;
