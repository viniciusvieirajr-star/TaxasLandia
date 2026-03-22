const API = {
    baseUrl: 'https://sua-api.com/api', // ALTERE PARA SUA API REAL
    
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('jobflex_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
        return response.json();
    },
    
    login(whatsapp, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ whatsapp, password })
        });
    },
    
    register(data) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    getProximosTrabalhos(trabalhadorId) {
        return this.request(`/trabalhadores/${trabalhadorId}/proximos`);
    },
    
    getOportunidades(trabalhadorId) {
        return this.request(`/trabalhadores/${trabalhadorId}/oportunidades`);
    },
    
    getTrabalhos(trabalhadorId, status) {
        return this.request(`/trabalhadores/${trabalhadorId}/trabalhos?status=${status}`);
    },
    
    getCarteira(trabalhadorId) {
        return this.request(`/trabalhadores/${trabalhadorId}/carteira`);
    },
    
    realizarCheckin(data) {
        return this.request('/checkin', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    candidatarDemanda(trabalhadorId, demandaId) {
        return this.request('/candidaturas', {
            method: 'POST',
            body: JSON.stringify({ trabalhador_id: trabalhadorId, demanda_id: demandaId })
        });
    },
    
    updateTrabalhadorStatus(id, status) {
        return this.request(`/trabalhadores/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },
    
    forgotPassword(whatsapp) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ whatsapp })
        });
    }
};