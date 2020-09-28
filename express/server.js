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
MIID0jCCArqgAwIBAgIGPraFBmGCMA0GCSqGSIb3DQEBDQUAMHYxITAfBgNVBAMM
GCoubGl2ZS52ZXJ5Z29vZHByb3h5LmNvbTEhMB8GA1UECgwYVmVyeSBHb29kIFNl
Y3VyaXR5LCBJbmMuMS4wLAYDVQQLDCVWZXJ5IEdvb2QgU2VjdXJpdHkgLSBFbmdp
bmVlcmluZyBUZWFtMCAXDTE2MDIwOTIzNTMzNloYDzIxMTcwMTE1MjM1MzM2WjB2
MSEwHwYDVQQDDBgqLmxpdmUudmVyeWdvb2Rwcm94eS5jb20xITAfBgNVBAoMGFZl
cnkgR29vZCBTZWN1cml0eSwgSW5jLjEuMCwGA1UECwwlVmVyeSBHb29kIFNlY3Vy
aXR5IC0gRW5naW5lZXJpbmcgVGVhbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
AQoCggEBAIaWead09ni5HVb6Z35MblQGzwQChshwO120nfyBsAUCGfK2SsIjFrV3
Nn0zlFn9h4SHplJPtxLHPiqFQLplv9sH4m78mK7EQ0I5CRPBc0FieOyFH5+UXZOv
Pl1NHstiAE2eHXpZQBKr7QO5h1dezILf88aK6aX9uojshxpXCrzlf2BlzYY8D4yb
IEedG61/aEjTQY+ATPW9oWDAeEIotgsC2aITw4qW3OxpP4f16QP/k8xazv23Pcha
JfQxjCnPIx1/IwQQi14qEqqGCKnreGL8KnAN1W3uz4JtRou01uAUGhhB+zkqSz9a
0P7RA0rWD5Sy34YNOiR4Dt8H8R8E+jECAwEAAaNkMGIwHQYDVR0OBBYEFBV0Bvd3
w6UGIgls8VKnooKjkmQYMA8GA1UdEwEB/wQFMAMBAf8wCwYDVR0PBAQDAgG2MCMG
A1UdJQQcMBoGCCsGAQUFBwMBBggrBgEFBQcDAgYEVR0lADANBgkqhkiG9w0BAQ0F
AAOCAQEAEwrq/aEgjjbcRZTbtrbIOLNsEoE4YSM/ZwFeCjGP9MWmq/qX3DZECwIC
gIc6kUQEdeAe3lt7GFfc+eY0HmximG0dnISSfzzpL33HQOhud6LITT0YAfqz0hxr
NLra+XfkIRMH/vs7PqzH8siqYXxW6w52PvwX1tbMJnoq1fUGSIyxF3wZ5i+OElP9
93KcZHeI6x8KSuCc+eNAV0eovsd9XN6Pzovf9BC3/HZANndI6JJ65XJ9MygdRNF7
qR90C8HYJYGpRE6nglQi0QOTHYC7xVqrU5bxuY7znWOEGfkFug4leuKdj12TkW73
bbTjK25TlDkdvsPq4otwBkXemYcoYA==
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
