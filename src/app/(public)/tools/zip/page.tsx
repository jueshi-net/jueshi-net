import { permanentRedirect } from 'next/navigation';

export default function ZipRedirect() {
  permanentRedirect('/tools/postal-code');
}
