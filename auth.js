// Funções auxiliares de autenticação
function getAuthToken() {
    return localStorage.getItem('jobflex_token');
}

function isAuthenticated() {
    return !!getAuthToken();
}

function setAuthData(token, user) {
    localStorage.setItem('jobflex_token', token);
    localStorage.setItem('jobflex_user', JSON.stringify(user));
}

function clearAuthData() {
    localStorage.removeItem('jobflex_token');
    localStorage.removeItem('jobflex_user');
}