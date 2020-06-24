document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#form');
  const buttonToStripe = document.querySelector('#send-to-stripe');
  const tokenRevealContainer = document.querySelector('#token-reveal');

  const collectForm = VGSCollect.create('tnth4ujtd6w', 'sandbox', state => {});
  collectForm.field('#number', {
    type: 'card-number',
    name: 'number',
    placeholder: 'Card Number...',
    showCardIcon: true,
    validations: ['required', 'validCardNumber'],
    css: {
      border: '1px solid gray',
      height: 40,
      width: 400,
      padding: '0 10px',
      background: 'white'
    }
  });
  collectForm.field('#cvc', {
    type: 'card-security-code',
    name: 'cvc',
    placeholder: 'CVC...',
    validations: ['required', 'validCardSecurityCode'],
    css: {
      border: '1px solid gray',
      padding: '0 10px',
      height: 40,
      width: 400,
      background: 'white'
    }
  });
  collectForm.field('#exp_date', {
    type: 'card-expiration-date',
    name: 'exp_date',
    placeholder: 'MM / YYYY',
    validations: ['required', 'validCardExpirationDate'],
    css: {
      border: '1px solid gray',
      padding: '0 10px',
      height: 40,
      width: 80,
      background: 'white'
    }
  });
  let collectResult;
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    collectForm.submit(
      '/.netlify/functions/server/send-data',
      {},
      (status, response, error) => {
        console.log(response);
        tokenRevealContainer.innerHTML =
          'Collect results:\n================\n\n' +
          JSON.stringify(response, null, 2);
        collectResult = {
          number: response.number,
          cvc: response.cvc,
          exp_month: response.exp_date.split(' / ')[0],
          exp_year: response.exp_date.split(' / ')[1]
        };
        buttonToStripe.removeAttribute('disabled');
      }
    );
  });

  buttonToStripe.addEventListener('click', () => {
    fetch('.netlify/functions/server/api/stripe', {
      method: 'POST',
      body: JSON.stringify(collectResult),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(payload => payload.json())
      .then(data => {
        tokenRevealContainer.innerHTML =
          'Result from stripe:\n===================\n\n' +
          JSON.stringify(data, null, 2);
      })
      .catch(error => {
        tokenRevealContainer.innerHTML =
          'Error from stripe:\n==================\n\n' +
          JSON.stringify(error, null, 2);
      });
  });
});
