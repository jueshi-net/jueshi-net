import { permanentRedirect } from 'next/navigation';

export default function CalculatorRedirect() {
  permanentRedirect('/tools/shipping-calculator');
}
