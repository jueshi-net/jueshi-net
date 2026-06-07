import { permanentRedirect } from 'next/navigation';

export default function LogisticsRedirect() {
  permanentRedirect('/shipping');
}
