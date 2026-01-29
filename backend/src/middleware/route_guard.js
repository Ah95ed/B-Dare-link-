export function requiresAuth(path, method) {
    if (path === '/auth/me') return true;
    if (path === '/progress') return true;
    if (path.startsWith('/admin')) return true;
    if (path.startsWith('/rooms') || path.startsWith('/api/rooms')) return true;
    if (path.startsWith('/competitions') || path.startsWith('/api/competitions')) return true;
    if (path.startsWith('/manager')) return true;
    if (path === '/tournament/daily/submit') return true;
    return false;
}
