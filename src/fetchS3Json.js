// Імпортуємо AWS SDK
const AWS = require("aws-sdk");

async function fetchS3Json(filename) {
  const s3 = new AWS.S3();

  // Параметри запиту до S3
  const params = {
    Bucket: "alexyalovyi-crypto-bucket", // Ім'я вашого бакету
    Key: filename, // Шлях до JSON файлу
  };

  try {
    const data = await s3.getObject(params).promise();
    const jsonData = JSON.parse(data.Body.toString("utf-8"));
    return jsonData;
  } catch (err) {
    console.error("Error:", err);
  }
}

module.exports = fetchS3Json;
