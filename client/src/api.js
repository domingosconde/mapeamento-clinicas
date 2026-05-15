// API Helper - Chamadas tRPC via fetch
const API_BASE = '/api/trpc';

// Função auxiliar para chamar tRPC
async function callTRPC(procedure, input = {}) {
    try {
        const url = new URL(`${API_BASE}/${procedure}`, window.location.origin);
        
        // Adicionar input como query params se for GET
        if (Object.keys(input).length > 0) {
            url.searchParams.append('input', JSON.stringify(input));
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // tRPC retorna { result: { data: ... } }
        if (data.result && data.result.data) {
            return data.result.data;
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Função auxiliar para POST (mutações)
async function callTRPCMutation(procedure, input = {}) {
    try {
        const response = await fetch(`${API_BASE}/${procedure}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.result.data) {
            return data.result.data;
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// API Endpoints
const API = {
    // Auth
    auth: {
        me: async () => callTRPC('auth.me'),
        logout: async () => callTRPCMutation('auth.logout'),
    },

    // Clinics
    clinics: {
        list: async () => callTRPC('clinics.list'),
        getById: async (id) => callTRPC('clinics.getById', { id }),
        getBySpecialty: async (specialtyId) => callTRPC('clinics.getBySpecialty', { specialtyId }),
        search: async (query) => callTRPC('clinics.search', { query }),
        create: async (data) => callTRPCMutation('clinics.create', data),
        update: async (id, data) => callTRPCMutation('clinics.update', { id, ...data }),
    },

    // Specialties
    specialties: {
        list: async () => callTRPC('specialties.list'),
    },

    // Ratings
    ratings: {
        getByClinic: async (clinicId) => callTRPC('ratings.getByClinic', { clinicId }),
        create: async (data) => callTRPCMutation('ratings.create', data),
    },

    // Comments
    comments: {
        getByClinic: async (clinicId) => callTRPC('comments.getByClinic', { clinicId }),
        create: async (data) => callTRPCMutation('comments.create', data),
    },

    // System
    system: {
        promoteToAdmin: async (email) => callTRPCMutation('system.promoteToAdmin', { email }),
        verifyClinic: async (clinicId) => callTRPCMutation('system.verifyClinic', { clinicId }),
        getUnverifiedClinics: async () => callTRPC('system.getUnverifiedClinics'),
    }
};

// Helper para mostrar alertas
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const container = document.body;
    container.insertBefore(alert, container.firstChild);
    
    setTimeout(() => alert.remove(), 5000);
}

// Helper para formatar data
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-PT');
}

// Helper para formatar rating
function formatRating(score) {
    return '⭐'.repeat(Math.round(score));
}
