import type { APIRoute } from 'astro';
export const prerender = false;
export const GET: APIRoute = ({ redirect }) => redirect('/', 307);
