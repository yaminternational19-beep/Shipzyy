const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
require("dotenv").config({ path: "../../.env" });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

async function testS3() {
  try {
    const data = await s3.send(new ListBucketsCommand({}));
    console.log("Buckets:", data.Buckets);
  } catch (err) {
    console.error("S3 Error:", err);
  }
}

testS3();