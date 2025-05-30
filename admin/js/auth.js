// Verificar autenticação em todas as páginas do painel
document.addEventListener('DOMContentLoaded', async () => {
    // Não verificar na página de login
    if (window.location.pathname.includes('login.html')) {
        return;
    }

    // Verificar se tem token
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Verificar se o token é válido
        const response = await fetch('/api/admin/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        // Token válido, configurar interface
        setupInterface();
    } catch (error) {
        console.error('Erro de autenticação:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});

// Configurar interface do usuário autenticado
function setupInterface() {
    // Configurar botão de logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    // Configurar toggle do menu mobile
    const toggleMenu = document.createElement('button');
    toggleMenu.className = 'btn btn-outline-light d-md-none me-2';
    toggleMenu.innerHTML = '<i class="fas fa-bars"></i>';
    
    const topbar = document.querySelector('.topbar');
    if (topbar) {
        topbar.insertBefore(toggleMenu, topbar.firstChild);
        
        toggleMenu.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('show');
        });
    }
}

// Função auxiliar para fazer requisições autenticadas
window.authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('Não autenticado');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
        throw new Error('Sessão expirada');
    }

    return response;
}; 