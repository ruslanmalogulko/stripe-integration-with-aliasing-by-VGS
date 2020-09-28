document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#form');
  const buttonToStripe = document.querySelector('#send-to-stripe');
  const tokenRevealContainer = document.querySelector('#token-reveal');

  /* eslint-disable-next-line no-undef */
  const collectForm = VGSCollect.create('tnth4ujtd6w', 'sandbox', () => {});
  collectForm.field('#number', {
    type: 'card-number',
    name: 'number',
    placeholder: 'Card Number...',
    showCardIcon: true,
    validations: ['required', 'validCardNumber'],
    css: {
      border: '1px solid gray',
      height: 40,
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
      width: 428,
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
    tokenRevealContainer.style.display = 'block';
    tokenRevealContainer.innerHTML = 'Loading...';

    collectForm.submit(
      '/.netlify/functions/server/send-data',
      {},
      (status, response, error) => {
        if (error) {
          console.error(error);
          tokenRevealContainer.innerHTML =
            'Collect Error:\n================\n\n' +
            JSON.stringify(response, null, 2);

          return;
        }
        tokenRevealContainer.innerHTML =
          'Collect Results:\n================\n\n' +
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
