// Estado da aplicação
let currentUser = null;
let allClinics = [];
let allSpecialties = [];
let map = null;
let markers = [];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
});

async function initApp() {
    try {
        // Carregar usuário atual
        await loadCurrentUser();
        
        // Carregar dados iniciais
        await loadClinics();
        await loadSpecialties();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Inicializar mapa
        initMap();
        
        // Mostrar página inicial
        showPage('home-page');
    } catch (error) {
        console.error('Erro ao inicializar app:', error);
        showAlert('Erro ao carregar aplicação', 'error');
    }
}

// Carregar usuário atual
async function loadCurrentUser() {
    try {
        currentUser = await API.auth.me();
        updateUIForUser();
    } catch (error) {
        console.log('Usuário não autenticado');
        currentUser = null;
        updateUIForUser();
    }
}

// Atualizar UI baseado no usuário
function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const setupBtn = document.getElementById('setupBtn');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        
        if (currentUser.role === 'admin') {
            setupBtn.style.display = 'block';
            adminBtn.style.display = 'block';
        } else {
            setupBtn.style.display = 'none';
            adminBtn.style.display = 'none';
        }
    } else {
        loginBtn.style.display = 'block';
        setupBtn.style.display = 'none';
        adminBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

// Carregar clínicas
async function loadClinics() {
    try {
        allClinics = await API.clinics.list();
        renderClinicsList();
        placeMarkersOnMap();
    } catch (error) {
        console.error('Erro ao carregar clínicas:', error);
        showAlert('Erro ao carregar clínicas', 'error');
    }
}

// Carregar especialidades
async function loadSpecialties() {
    try {
        allSpecialties = await API.specialties.list();
        populateSpecialtyFilter();
    } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
    }
}

// Renderizar lista de clínicas
function renderClinicsList() {
    const clinicsList = document.getElementById('clinicsList');
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const selectedSpecialty = document.getElementById('specialtyFilter').value;

    let filtered = allClinics;

    // Filtrar por busca
    if (searchQuery) {
        filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(searchQuery) ||
            c.city.toLowerCase().includes(searchQuery)
        );
    }

    // Filtrar por especialidade
    if (selectedSpecialty) {
        filtered = filtered.filter(c => 
            c.specialties && c.specialties.some(s => s.id == selectedSpecialty)
        );
    }

    // Ordenar por avaliação
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Atualizar contagem
    document.getElementById('resultsCount').textContent = `${filtered.length} Clínica${filtered.length !== 1 ? 's' : ''} Encontrada${filtered.length !== 1 ? 's' : ''}`;

    // Renderizar cards
    clinicsList.innerHTML = filtered.map(clinic => `
        <div class="clinic-card" onclick="viewClinicDetail(${clinic.id})">
            <div class="clinic-name">
                ${clinic.name}
                ${clinic.isVerified ? '<span class="verified-badge">✓ Verificada</span>' : ''}
            </div>
            <div class="clinic-info">📍 ${clinic.city}, ${clinic.state || 'Angola'}</div>
            <div class="clinic-info">📞 ${clinic.phone}</div>
            <div class="clinic-info">📧 ${clinic.email}</div>
            ${clinic.rating ? `
                <div class="clinic-rating">
                    <span class="stars">${formatRating(clinic.rating)}</span>
                    <span>${clinic.rating.toFixed(1)} (${clinic.reviewCount || 0})</span>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Renderizar especialidades no filtro
function populateSpecialtyFilter() {
    const select = document.getElementById('specialtyFilter');
    const options = allSpecialties.map(s => 
        `<option value="${s.id}">${s.name}</option>`
    ).join('');
    select.innerHTML = '<option value="">Todas as especialidades</option>' + options;
}

// Inicializar mapa
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    map = new google.maps.Map(mapElement, {
        zoom: 12,
        center: { lat: -8.8383, lng: 13.2344 }, // Luanda, Angola
    });

    placeMarkersOnMap();
}

// Colocar marcadores no mapa
function placeMarkersOnMap() {
    if (!map) return;

    // Remover marcadores antigos
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // Adicionar novos marcadores
    allClinics.forEach(clinic => {
        if (!clinic.latitude || !clinic.longitude) return;

        const marker = new google.maps.Marker({
            position: { lat: parseFloat(clinic.latitude), lng: parseFloat(clinic.longitude) },
            map: map,
            title: clinic.name,
            icon: clinic.isVerified ? 
                'http://maps.google.com/mapfiles/ms/icons/green-dot.png' :
                'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

        marker.addListener('click', () => viewClinicDetail(clinic.id));
        markers.push(marker);
    });
}

// Ver detalhes da clínica
async function viewClinicDetail(clinicId) {
    try {
        const clinic = await API.clinics.getById(clinicId);
        const ratings = await API.ratings.getByClinic(clinicId);
        const comments = await API.comments.getByClinic(clinicId);

        const detailHtml = `
            <h1>${clinic.name} ${clinic.isVerified ? '<span class="verified-badge">✓ Verificada</span>' : ''}</h1>
            
            <div class="detail-section">
                <h2>Informações</h2>
                <p><strong>Endereço:</strong> ${clinic.address}, ${clinic.city}</p>
                <p><strong>Telefone:</strong> ${clinic.phone}</p>
                <p><strong>Email:</strong> ${clinic.email}</p>
                ${clinic.website ? `<p><strong>Website:</strong> <a href="${clinic.website}" target="_blank">${clinic.website}</a></p>` : ''}
                ${clinic.description ? `<p><strong>Descrição:</strong> ${clinic.description}</p>` : ''}
            </div>

            <div class="detail-section">
                <h2>Avaliações</h2>
                ${ratings.length > 0 ? `
                    <div>
                        <p>Média: ${formatRating(ratings.reduce((a, b) => a + b.score, 0) / ratings.length)} 
                        (${ratings.length} avaliações)</p>
                    </div>
                ` : '<p>Sem avaliações ainda</p>'}
            </div>

            <div class="detail-section">
                <h2>Comentários</h2>
                ${comments.length > 0 ? comments.map(c => `
                    <div style="border-bottom: 1px solid #eee; padding: 1rem 0;">
                        <strong>${c.author}</strong>
                        <p>${c.content}</p>
                        <small>${formatDate(c.createdAt)}</small>
                    </div>
                `).join('') : '<p>Sem comentários ainda</p>'}
            </div>

            ${currentUser ? `
                <button class="btn btn-primary" onclick="showBookingForm(${clinicId})">
                    Agendar Consulta
                </button>
            ` : `
                <p>Faça login para agendar uma consulta</p>
            `}
        `;

        document.getElementById('clinicDetail').innerHTML = detailHtml;
        showPage('clinic-detail-page');
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showAlert('Erro ao carregar detalhes da clínica', 'error');
    }
}

// Mostrar formulário de agendamento
function showBookingForm(clinicId) {
    if (!currentUser) {
        window.location.href = getLoginUrl();
        return;
    }
    showAlert('Funcionalidade de agendamento em desenvolvimento', 'info');
}

// Trocar abas do admin
function switchAdminTab(tabName) {
    // Remover active de todos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Adicionar active ao selecionado
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    // Carregar dados específicos
    if (tabName === 'verify') {
        loadUnverifiedClinics();
    }
}

// Carregar clínicas não verificadas
async function loadUnverifiedClinics() {
    try {
        const unverified = await API.system.getUnverifiedClinics();
        const verifyList = document.getElementById('verifyList');
        
        verifyList.innerHTML = unverified.map(clinic => `
            <div class="clinic-card">
                <div class="clinic-name">${clinic.name}</div>
                <div class="clinic-info">${clinic.city}</div>
                <button class="btn btn-primary" onclick="verifyClinic(${clinic.id})">
                    Verificar
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar clínicas não verificadas:', error);
    }
}

// Verificar clínica
async function verifyClinic(clinicId) {
    try {
        await API.system.verifyClinic(clinicId);
        showAlert('Clínica verificada com sucesso!', 'success');
        loadUnverifiedClinics();
        loadClinics();
    } catch (error) {
        console.error('Erro ao verificar clínica:', error);
        showAlert('Erro ao verificar clínica', 'error');
    }
}

// Mostrar página
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Configurar event listeners
function setupEventListeners() {
    // Botões de navegação
    document.getElementById('loginBtn').addEventListener('click', () => {
        window.location.href = getLoginUrl();
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await API.auth.logout();
        window.location.href = '/';
    });

    document.getElementById('setupBtn').addEventListener('click', () => {
        showPage('admin-page');
        switchAdminTab('clinics');
    });

    document.getElementById('adminBtn').addEventListener('click', () => {
        showPage('admin-page');
        switchAdminTab('clinics');
    });

    // Busca e filtros
    document.getElementById('searchInput').addEventListener('input', renderClinicsList);
    document.getElementById('specialtyFilter').addEventListener('change', renderClinicsList);

    // Formulário de criar clínica
    document.getElementById('clinicForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        // Implementar criação de clínica
        showAlert('Funcionalidade em desenvolvimento', 'info');
    });

    // Formulário de promover admin
    document.getElementById('promoteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        try {
            await API.system.promoteToAdmin(email);
            showAlert('Admin promovido com sucesso!', 'success');
            document.getElementById('emailInput').value = '';
        } catch (error) {
            showAlert('Erro ao promover admin', 'error');
        }
    });
}

// Função auxiliar para obter URL de login
function getLoginUrl() {
    const returnPath = window.location.pathname + window.location.search;
    return `/api/oauth/login?returnPath=${encodeURIComponent(returnPath)}`;
}
