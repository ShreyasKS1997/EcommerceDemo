import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Payment from './Payment';

export const PaymentChild = (stripeApiKey) => {
  if (!stripeApiKey)  console.log('stripeApiKey Error')
  return (
    <>
      <Elements stripe={loadStripe(stripeApiKey?.stripeApiKey)}>
        <Payment />
      </Elements>
    </>
  );
};
