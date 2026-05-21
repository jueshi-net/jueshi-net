import { redirect } from 'next/navigation';

export default function ShippingMarkRedirect() {
  redirect('/tools/documents/shipping-label');
}
