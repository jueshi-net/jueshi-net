// Fix: trust the request host to avoid UntrustedHost errors
// when NEXTAUTH_URL domain doesn't match the actual domain
process.env.AUTH_TRUST_HOST = 'true';

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
