// app/api/create-checkout-session/route.js
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Use the latest API version
});

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Background Screening',
            },
            unit_amount: 1099, // $10.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/app/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/app/checkout/failure`,
    });
    console.log('session', session);
    if (!session.id) {
      return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}