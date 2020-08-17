const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const fetch = require('node-fetch').default;
const HttpsProxyAgent = require('https-proxy-agent');
const app = express();
const url = require('url');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const router = express.Router();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

router.post('/send-data', async (req, res) => {
  res.json(req.body);
});

router.post('/api/stripe', async (req, res) => {
  const { number, exp_month, exp_year, cvc } = req.body;
  const urlParams = url.parse(
    `http://${process.env.AUTH}@${process.env.VAULT_ID}.sandbox.verygoodproxy.com:8080`
  );
  const agent = new HttpsProxyAgent(urlParams);

  try {
    const result = await fetch('https://api.stripe.com/v1/tokens', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.STRIPE_SK,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `card[number]=${number}&card[cvc]=${cvc}&card[exp_month]=${exp_month}&card[exp_year]=${exp_year}`,
      agent
    });
    console.log(process.env.STRIPE_SK)
    console.log(result);
    const returnValue = await result.json();
    res.json(returnValue);
  } catch (e) {
    console.error(e);
    res.json(e);
  }
});

router.get('/', (req, res) => {
  res.redirect('/payment-form.html');
});

app.use('/.netlify/functions/server', router);
app.use('/post', (req, res) => {
  console.log(req.data);
  res.redirect('/results');
});

module.exports = app;
module.exports.handler = serverless(app);
