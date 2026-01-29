import { CORS_HEADERS } from '../utils.js';
import { getUserFromRequest } from '../auth.js';

export async function requireAuth(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user) {
        return {
            user: null,
            response: new Response('Unauthorized', {
                status: 401,
                headers: CORS_HEADERS,
            }),
        };
    }
    return { user, response: null };
}