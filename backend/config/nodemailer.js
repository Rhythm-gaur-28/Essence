const nodemailer = require("nodemailer");
const dns = require("dns");

const resolve4 = dns.promises.resolve4;

const transporter = nodemailer.createTransport({
  host: "74.125.24.109", // smtp.gmail.com IPv4
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    servername: "smtp.gmail.com"
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

module.exports = transporter;