const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY'); // Replace with your Stripe secret key
const QRCode = require('qrcode');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/create-checkout-session', async (req, res) => {
  const { amount, customer_note } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Energy Bracelet',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:3000/thank-you.html?note=${encodeURIComponent(customer_note)}`,
      cancel_url: 'http://localhost:3000/cancel.html',
      metadata: {
        customer_note: customer_note,
      }
    });

    const qrCodeDataURL = await QRCode.toDataURL(session.url);
    res.json({ url: session.url, qrCode: qrCodeDataURL });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));
