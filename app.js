class JobFlexApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.isMenuOpen = false;
        this.init();
    }
    
    async init() {
        setTimeout(() => {
            const splash = document.getElementById('splashScreen');
            if (splash) splash.style.display = 'none';
        }, 1500);
        
        const token = localStorage.getItem('jobflex_token');
        const userData = localStorage.getItem('jobflex_user');
        
        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.showMainApp();
            await this.loadDashboard();
        } else {
            this.showAuthScreen();
        }
        
        this.setupEventListeners();
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js');
        }
    }
    
    setupEventListeners() {
        document.getElementById('menuToggle')?.addEventListener('click', () => this.toggleMenu());
        document.getElementById('menuOverlay')?.addEventListener('click', () => this.closeMenu());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('toggleStatusBtn')?.addEventListener('click', () => this.toggleAvailability());
        document.getElementById('scanQRBtn')?.addEventListener('click', () => this.startQRScanner());
        document.getElementById('locationCheckinBtn')?.addEventListener('click', () => this.locationCheckin());
        document.getElementById('forgotPasswordBtn')?.addEventListener('click', () => this.forgotPassword());
        
        document.querySelectorAll('.nav-item, .menu-item[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateTo(page);
                this.closeMenu();
            });
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchAuthTab(tab);
            });
        });
        
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        document.querySelectorAll('.tab-mini').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                document.querySelectorAll('.tab-mini').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.loadTrabalhos(status);
            });
        });
    }
    
    showAuthScreen() {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }
    
    showMainApp() {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.nome?.split(' ')[0] || '';
            document.getElementById('welcomeName').textContent = `Olá, ${this.currentUser.nome?.split(' ')[0] || ''}!`;
            document.getElementById('profileName').textContent = this.currentUser.nome || '';
            document.getElementById('welcomeDate').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
            
            const avatar = this.currentUser.nome?.charAt(0).toUpperCase() || '👤';
            document.getElementById('userAvatar').textContent = avatar;
            document.getElementById('profileAvatar').textContent = avatar;
            
            const profileInfo = document.getElementById('profileInfo');
            if (profileInfo) {
                profileInfo.innerHTML = `
                    <div class="info-row"><span class="info-label">CPF</span><span class="info-value">${this.currentUser.cpf || '---'}</span></div>
                    <div class="info-row"><span class="info-label">WhatsApp</span><span class="info-value">${this.currentUser.whatsapp || '---'}</span></div>
                    <div class="info-row"><span class="info-label">Disponibilidade</span><span class="info-value">${this.currentUser.disponibilidade || '---'}</span></div>
                `;
            }
        }
    }
    
    async handleLogin() {
        const whatsapp = document.getElementById('loginWhatsapp').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!whatsapp || !password) {
            this.showToast('Preencha todos os campos', 'warning');
            return;
        }
        
        try {
            const response = await API.login(whatsapp, password);
            if (response.success) {
                this.currentUser = response.user;
                localStorage.setItem('jobflex_token', response.token);
                localStorage.setItem('jobflex_user', JSON.stringify(response.user));
                this.showMainApp();
                await this.loadDashboard();
                this.showToast('Login realizado!', 'success');
            } else {
                this.showToast(response.message || 'Credenciais inválidas', 'error');
            }
        } catch (error) {
            this.showToast('Erro ao fazer login', 'error');
        }
    }
    
    async handleRegister() {
        const nome = document.getElementById('regNome').value;
        const cpf = document.getElementById('regCpf').value;
        const nascimento = document.getElementById('regNascimento').value;
        const whatsapp = document.getElementById('regWhatsapp').value;
        const email = document.getElementById('regEmail').value;
        const funcoes = Array.from(document.getElementById('regFuncoes').selectedOptions).map(opt => opt.value);
        const disponibilidade = document.getElementById('regDisponibilidade').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        
        if (!nome || !cpf || !nascimento || !whatsapp || !disponibilidade || !password) {
            this.showToast('Preencha os campos obrigatórios', 'warning');
            return;
        }
        
        if (funcoes.length === 0) {
            this.showToast('Selecione pelo menos uma