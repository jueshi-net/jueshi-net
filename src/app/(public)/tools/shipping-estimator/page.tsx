import { permanentRedirect } from 'next/navigation';

export default function ShippingEstimatorRedirect() {
  permanentRedirect('/tools/shipping-calculator');
}
