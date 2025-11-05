/**
 * Verifica se usuário está autenticado validando presença de token.
 * Não valida expiração do token (validação ocorre no backend).
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('accessToken');
  return !!token;
}

/**
 * Remove token de autenticação e redireciona para login.
 * Útil para logout manual ou quando token é invalidado.
 */
export function logout(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('accessToken');
  window.location.href = '/auth/login';
}

/**
 * Obtém token de autenticação do localStorage.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('accessToken');
}
