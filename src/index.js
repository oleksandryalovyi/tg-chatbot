require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const generateTable = require("./generateTable");
const calculateTableData = require("./calculateTableData");

const token = process.env.TOKEN;

// Created instance of TelegramBot
const bot = new TelegramBot(token, {
  polling: true,
});

bot.onText(/\/start/, async (msg) => {
  console.log("/start");
  const chat_id = msg.chat.id;

  await bot.sendMessage(
    chat_id,
    `Here are available commands: /send_stats /check_air /check_pln_rate `
  );
});

bot.onText(/\/send_stats/, async (msg) => {
  console.log("/send_stats");
  console.log(msg);
  const chat_id = msg.chat.id;

  try {
    await bot.sendMessage(chat_id, "Try to send analytics to your email");
    await axios.post(process.env.GOOGLE_SCRIPT_URL);
  } catch (e) {
    console.error("error", e);
    await bot.sendMessage(chat_id, "Something went wrong");
  }

  await bot.sendMessage(chat_id, "Check your email");
});

bot.onText(/\/check_air/, async (msg) => {
  console.log("/check_air");
  const chat_id = msg.chat.id;

  const res = await axios.get(
    `https://api.waqi.info/feed/geo:50.0438719;19.9907768/?token=${process.env.WAQI_TOKEN}`
  );

  const aqicnRes = res.data;
  const aqicnInd = aqicnRes.data.aqi;
  const forecastAqicnPm25 = aqicnRes.data.forecast.daily.pm25[0].avg;

  console.log("aqicnAqi", aqicnInd);
  console.log("forecastAqicnPm25", forecastAqicnPm25);

  const openWeatherRes = await axios.get(
    `http://api.openweathermap.org/data/2.5/air_pollution?lat=50.0438719&lon=19.9907768&appid=${process.env.OPENWEATHER_TOKEN}`
  );
  const openWeatherInd = openWeatherRes.data.list[0].main.aqi;
  console.log("openWeatherInd", openWeatherInd);

  await bot.sendMessage(
    chat_id,
    `Air quality index by aqicn ${aqicnRes.data.aqi}\n` +
      `Rest data: pm25 ${aqicnRes.data.iaqi.pm25.v}, pm10 ${aqicnRes.data.iaqi.pm10.v}\n` +
      `Forecast daily pm25: ${forecastAqicnPm25}\n` +
      `Open weather index: ${openWeatherInd}`
  );
});

bot.onText(/\/check_pln_rate/, async (msg) => {
  console.log("/check_pln_rate");
  const chat_id = msg.chat.id;

  const res = await axios.get(
    `https://rest.coinapi.io/v1/exchangerate/USD/PLN?apikey=${process.env.COINAPI_TOKEN}`
  );

  const rate = Number(res.data.rate).toFixed(2);
  console.log("res", res);
  console.log("rate", rate);

  await bot.sendMessage(chat_id, `PLN rate is ${rate}`);
});

bot.onText(/\/check_crypto_info/, async (msg) => {
  console.log("/check_crypto_info");
  const chat_id = msg.chat.id;

  const data = [
    {
      name: "ETH",
      price: 2908.6027519856807,
      bought: 2600,
    },
    {
      name: "BTC",
      price: 47140.807542529205,
      bought: 2300,
    },
    {
      name: "SOL",
      price: 128.51267991775188,
      bought: 1500,
    },
    {
      name: "DOT",
      price: 6.443691799212581,
      bought: 1300,
    },
    {
      name: "AVAX",
      price: 38.16551109980281,
      bought: 600,
    },
    {
      name: "XRP",
      price: 0.5711318795430945,
      bought: 550,
    },
    {
      name: "LINK",
      price: 17.649135192375574,
      bought: 500,
    },
    {
      name: "ADA",
      price: 0.46860356138706655,
      bought: 200,
    },
    {
      name: "LRC",
      price: 0.24813895781637718,
      bought: 200,
    },
    {
      name: "FLUX",
      price: 0.7620789513793629,
      bought: 200,
    },
    {
      name: "BNB",
      price: 231.4814814814815,
      bought: 100,
    },
    {
      name: "LTC",
      price: 68.68131868131869,
      bought: 100,
    },
    {
      name: "POL",
      price: 0.7518344761217369,
      bought: 100,
    },
    {
      name: "SUI",
      price: 1.2339585389930898,
      bought: 100,
    },
    {
      name: "NOT",
      price: 0.019331142470520007,
      bought: 100,
    },
    {
      name: "KDA",
      price: 0.5620187714269657,
      bought: 100,
    },
    {
      name: "TWT",
      price: 0.8333333333333334,
      bought: 100,
    },
  ];

  const analyticsData = await calculateTableData(data);

  const table = generateTable(analyticsData);

  bot.sendMessage(chat_id, table, { parse_mode: "Markdown" });
});
