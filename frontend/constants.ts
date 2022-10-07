import { env } from 'process';

export const serverUrl = env.SERVER_URL ?? 'http://localhost:1337';
