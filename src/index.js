(await import("dotenv")).config();
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

import Table from "./Table.js";
import Analytics from "./Analytics.js";
import S3 from "./S3.js";

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

  try {
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
  } catch (e) {
    await bot.sendMessage(chat_id, `Something went wrong, ${e}`);
  }
});

bot.onText(/\/check_pln_rate/, async (msg) => {
  console.log("/check_pln_rate");
  const chat_id = msg.chat.id;

  try {
    const res = await axios.get(
      `https://rest.coinapi.io/v1/exchangerate/USD/PLN?apikey=${process.env.COINAPI_TOKEN}`
    );
    const rate = Number(res.data.rate).toFixed(2);
    console.log("rate", rate);

    await bot.sendMessage(chat_id, `PLN rate is ${rate}`);
  } catch (e) {
    await bot.sendMessage(chat_id, `Something went wrong, ${e}`);
  }
});

bot.onText(/\/check_crypto_info/, async (msg) => {
  console.log("/check_crypto_info", new Date());
  const chat_id = msg.chat.id;

  try {
    const data = await S3.FetchS3Json(
      process.env.S3_CRYPTO_BUCKET,
      process.env.S3_CRYPTO_FILE_NAME
    );

    const analytics = new Analytics({
      currenciesDataArr: data.currencies,
      usdtSaved: data.usdtSaved,
    });

    const { sumAnalytics, currenciesAnalytics } =
      await analytics.calculateTableData();

    const sumTable = Table.GenerateMarkdownTable(sumAnalytics);
    const currencyTable = Table.GenerateMarkdownTable(currenciesAnalytics);

    bot.sendMessage(chat_id, sumTable, { parse_mode: "Markdown" });
    bot.sendMessage(chat_id, currencyTable, { parse_mode: "Markdown" });
  } catch (e) {
    console.error("error", e);
    await bot.sendMessage(chat_id, `Something went wrong, ${e}`);
  }
});
