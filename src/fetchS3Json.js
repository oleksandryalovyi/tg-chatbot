const AWS = require("aws-sdk");

async function fetchS3Json(bucketName, filename) {
  const s3 = new AWS.S3();

  const params = {
    Bucket: bucketName,
    Key: filename,
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
