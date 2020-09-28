const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const fetch = require('node-fetch').default;
const HttpsProxyAgent = require('https-proxy-agent');
const app = express();
const url = require('url');
const fs = require('fs');
const path = require('path');

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
  const agent = new HttpsProxyAgent({
    ...urlParams,
    ca: [
      `
-----BEGIN CERTIFICATE-----
MIID2TCCAsGgAwIBAgIHAN4Gs/LGhzANBgkqhkiG9w0BAQ0FADB5MSQwIgYDVQQD
DBsqLnNhbmRib3gudmVyeWdvb2Rwcm94eS5jb20xITAfBgNVBAoMGFZlcnkgR29v
ZCBTZWN1cml0eSwgSW5jLjEuMCwGA1UECwwlVmVyeSBHb29kIFNlY3VyaXR5IC0g
RW5naW5lZXJpbmcgVGVhbTAgFw0xNjAyMDkyMzUzMzZaGA8yMTE3MDExNTIzNTMz
NloweTEkMCIGA1UEAwwbKi5zYW5kYm94LnZlcnlnb29kcHJveHkuY29tMSEwHwYD
VQQKDBhWZXJ5IEdvb2QgU2VjdXJpdHksIEluYy4xLjAsBgNVBAsMJVZlcnkgR29v
ZCBTZWN1cml0eSAtIEVuZ2luZWVyaW5nIFRlYW0wggEiMA0GCSqGSIb3DQEBAQUA
A4IBDwAwggEKAoIBAQDI3ukHpxIlDCvFjpqn4gAkrQVdWll/uI0Kv3wirwZ3Qrpg
BVeXjInJ+rV9r0ouBIoY8IgRLak5Hy/tSeV6nAVHv0t41B7VyoeTAsZYSWU11deR
DBSBXHWH9zKEvXkkPdy9tgHnvLIzui2H59OPljV7z3sCLguRIvIIw8djaV9z7FRm
KRsfmYHKOBlSO4TlpfXQg7jQ5ds65q8FFGvTB5qAgLXS8W8pvdk8jccmuzQXFUY+
ZtHgjThg7BHWWUn+7m6hQ6iHHCj34Qu69F8nLamd+KJ//14lukdyKs3AMrYsFaby
k+UGemM/s2q3B+39B6YKaHao0SRzSJC7qDwbWPy3AgMBAAGjZDBiMB0GA1UdDgQW
BBRWlIRrE2p2P018VTzTb6BaeOFhAzAPBgNVHRMBAf8EBTADAQH/MAsGA1UdDwQE
AwIBtjAjBgNVHSUEHDAaBggrBgEFBQcDAQYIKwYBBQUHAwIGBFUdJQAwDQYJKoZI
hvcNAQENBQADggEBAGWxLFlr0b9lWkOLcZtR9IDVxDL9z+UPFEk70D3NPaqXkoE/
TNNUkXgS6+VBA2G8nigq2Yj8qoIM+kTXPb8TzWv+lrcLm+i+4AShKVknpB15cC1C
/NJfyYGRW66s/w7HNS20RmrdN+bWS0PA4CVLXdGzUJn0PCsfsS+6Acn7RPAE+0A8
WB7JzXWi8x9mOJwiOhodp4j41mv+5eHM0reMh6ycuYbjquDNpiNnsLztk6MGsgAP
5C59drQWJU47738BcfbByuSTYFog6zNYCm7ACqbtiwvFTwjneNebOhsOlaEAHjup
d4QBqYVs7pzkhNNp9oUvv4wGf/KJcw5B9E6Tpfk=
-----END CERTIFICATE-----
`
    ]
  });

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
    console.log(process.env.STRIPE_SK);
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

app.use(express.static('.'));

module.exports = app;
module.exports.handler = serverless(app);
