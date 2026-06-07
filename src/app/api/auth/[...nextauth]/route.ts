// Fix: trust the request host to avoid UntrustedHost errors
// Fix auth host trust for production domain jueshi.net
process.env.AUTH_TRUST_HOST = 'true';

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
