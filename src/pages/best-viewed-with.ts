import { TARGET_URL } from "astro:env/server";

export const prerender = false;

export async function GET({ request }: { request: Request }) {
    const targetUA = 'Mozilla/3.0 (compatible; Netscape Navigator 3.0; Samsung Smart Fridge)';
    const headers = new Headers(request.headers);
    const actualUA = headers.get('User-Agent');
    if (actualUA !== targetUA) {
        return new Response('Incompatible User-Agent', {
            status: 400,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    const redirect = TARGET_URL;
    const response = new Response(null, {
        status: 302,
        headers: {
            Location: redirect,
            'Set-Cookie': `best-viewed-with=${targetUA}; Path=/; Secure; HttpOnly; SameSite=Strict`,
        },
    });
    return response;
}