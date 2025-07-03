// snippet-start:[ses.JavaScript.createclientv3]
// import { SESClient } from "@aws-sdk/client-ses"; //this will not workin this code, hence use require
const {SESClient} = require("@aws-sdk/client-ses");
// require('dotenv').config();
// Set the AWS Region.
const REGION = "eu-north-1";
// const REGION = "us-east-1";
// Create SES service object.
const sesClient = new SESClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET_KEY,
  },
});

// export { sesClient };
module.exports = {sesClient}; 
// snippet-end:[ses.JavaScript.createclientv3]