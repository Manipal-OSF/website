import { env } from 'process';

export const serverUrl = env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:8000';
