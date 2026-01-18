// Liquid Glass FileShare - Enhanced Version
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных с улучшенной структурой
    let appState = {
        currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
        files: JSON.parse(localStorage.getItem('files')) || [],
        users: JSON.parse(localStorage.getItem('users')) || [],
        categories: ['documents', 'images', 'audio', 'video', 'archives', 'software', 'other'],
        currentFilter: 'all',
        currentSort: 'newest',
        viewMode: 'grid',
        tags: ['работа', 'проект', 'дизайн', 'разработка', 'учеба', 'личное', 'музыка', 'видео', 'фото'],
        isUploading: false,
        pageSize: 12,
        currentPage: 1,
        searchQuery: ''
    };

    // DOM элементы
    const DOM = {
        // Кнопки
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        uploadBtn: document.getElementById('uploadBtn'),
        heroUploadBtn: document.getElementById('heroUploadBtn'),
        exploreBtn: document.getElementById('exploreBtn'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        themeToggle: document.getElementById('themeToggle'),
        
        // Элементы интерфейса
        userProfile: document.getElementById('userProfile'),
        authButtons: document.getElementById('authButtons'),
        userName: document.getElementById('userName'),
        userEmail: document.getElementById('userEmail'),
        dropdownUserName: document.getElementById('dropdownUserName'),
        dropdownUserEmail: document.getElementById('dropdownUserEmail'),
        myFilesCount: document.getElementById('myFilesCount'),
        
        // Статистика
        usersCount: document.getElementById('usersCount'),
        filesCount: document.getElementById('filesCount'),
        downloadsCount: document.getElementById('downloadsCount'),
        showingCount: document.getElementById('showingCount'),
        totalCount: document.getElementById('totalCount'),
        
        // Категории
        categoryCounts: {
            documents: document.getElementById('count-documents'),
            images: document.getElementById('count-images'),
            audio: document.getElementById('count-audio'),
            video: document.getElementById('count-video'),
            archives: document.getElementById('count-archives'),
            software: document.getElementById('count-software'),
            other: document.getElementById('count-other')
        },
        
        // Поиск и фильтры
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        sortSelect: document.getElementById('sortSelect'),
        
        // Контейнеры
        filesContainer: document.getElementById('filesContainer'),
        
        // Модальные окна
        modals: {
            login: document.getElementById('loginModal'),
            register: document.getElementById('registerModal'),
            upload: document.getElementById('uploadModal')
        },
        
        // Canvas для эффектов
        particlesCanvas: document.getElementById('particlesCanvas'),
        
        // Время сервера
        serverTime: document.getElementById('serverTime')
    };

    // Инициализация приложения
    initApp();

    function initApp() {
        loadTheme();
        initParticles();
        updateUI();
        renderFiles();
        setupEventListeners();
        updateStats();
        updateCategoryCounts();
        initServerTime();
        
        // Создание демо-данных, если их нет
        if (appState.users.length === 0) {
            createDemoData();
        }
        
        // Загрузка файлов из localStorage
        loadFilesFromStorage();
    }

    // === ТЕМА ИНТЕРФЕЙСА ===
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'auto') {
            document.body.className = prefersDark ? 'dark-theme' : 'light-theme';
        } else {
            document.body.className = savedTheme + '-theme';
        }
        
        updateThemeButtons(savedTheme);
        updateThemeIcon();
    }

    function updateThemeButtons(theme) {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
    }

    function updateThemeIcon() {
        const isDark = document.body.classList.contains('dark-theme');
        const themeIcon = DOM.themeToggle?.querySelector('i');
        if (themeIcon) {
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    function toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        document.body.className = newTheme + '-theme';
        localStorage.setItem('theme', newTheme);
        updateThemeIcon();
        updateThemeButtons(newTheme);
        showNotification('Тема изменена', 'success');
    }

    // === ЭФФЕКТ ЧАСТИЦ ===
    function initParticles() {
        const canvas = DOM.particlesCanvas;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50;
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = getComputedStyle(document.documentElement)
                    .getPropertyValue('--primary-color')
                    .trim() || '#4361ee';
                this.opacity = Math.random() * 0.3 + 0.1;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
            }
        }
        
        function init() {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        init();
        animate();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        });
    }

    // === ВРЕМЯ СЕРВЕРА ===
    function initServerTime() {
        if (!DOM.serverTime) return;
        
        function updateTime() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            DOM.serverTime.textContent = timeString;
        }
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    // === ДЕМО-ДАННЫЕ ===
    function createDemoData() {
        const demoUsers = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@fileshare.com',
                password: 'admin123',
                bio: 'Администратор системы',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                banner: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
                uploads: 15,
                downloads: 320,
                likes: 89,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                role: 'admin'
            },
            {
                id: 2,
                username: 'designer',
                email: 'designer@fileshare.com',
                password: 'design123',
                bio: 'UI/UX дизайнер',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer',
                banner: 'linear-gradient(135deg, #f72585, #b5179e)',
                uploads: 8,
                downloads: 145,
                likes: 42,
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                role: 'user'
            },
            {
                id: 3,
                username: 'developer',
                email: 'dev@fileshare.com',
                password: 'dev123',
                bio: 'Full-stack разработчик',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer',
                banner: 'linear-gradient(135deg, #4cc9f0, #00b4d8)',
                uploads: 12,
                downloads: 210,
                likes: 67,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                role: 'user'
            }
        ];
        
        const demoFiles = [
            {
                id: 1,
                name: 'Дизайн системы.pdf',
                description: 'Полный гайд по дизайн-системе Liquid Glass с компонентами и паттернами',
                category: 'documents',
                size: 5200000,
                author: 'admin',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 45,
                likes: [1, 2, 3],
                tags: ['дизайн', 'система', 'гайд', 'ui/ux'],
                access: 'public',
                fileType: 'pdf',
                preview: 'https://api.dicebear.com/7.x/identicon/svg?seed=design'
            },
            {
                id: 2,
                name: 'Градиенты для интерфейсов.jpg',
                description: 'Коллекция современных градиентов для веб и мобильных интерфейсов',
                category: 'images',
                size: 3200000,
                author: 'designer',
                authorId: 2,
                uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 38,
                likes: [1, 2],
                tags: ['градиент', 'дизайн', 'интерфейс', 'цвет'],
                access: 'public',
                fileType: 'image',
                preview: 'https://api.dicebear.com/7.x/identicon/svg?seed=gradient'
            },
            {
                id: 3,
                name: 'Фоновые треки.mp3',
                description: 'Набор фоновых музыкальных треков для видео и презентаций',
                category: 'audio',
                size: 12500000,
                author: 'admin',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 29,
                likes: [3],
                tags: ['музыка', 'аудио', 'фон', 'трек'],
                access: 'public',
                fileType: 'audio',
                preview: 'https://api.dicebear.com/7.x/identicon/svg?seed=music'
            },
            {
                id: 4,
                name: 'Документация API.pdf',
                description: 'Полная документация по REST API FileShare с примерами запросов',
                category: 'documents',
                size: 7800000,
                author: 'developer',
                authorId: 3,
                uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 52,
                likes: [1, 3],
                tags: ['api', 'документация', 'разработка', 'rest'],
                access: 'public',
                fileType: 'pdf',
                preview: 'https://api.dicebear.com/7.x/identicon/svg?seed=api'
            },
            {
                id: 5,
                name: 'Иконки интерфейса.zip',
                description: 'Набор векторных иконок в формате SVG для веб-интерфейсов',
                category: 'archives',
                size: 4500000,
                author: 'designer',
                authorId: 2,
                uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 41,
                likes: [1, 2, 3],
                tags: ['иконки', 'svg', 'интерфейс', 'вектор'],
                access: 'public',
                fileType: 'archive',
                preview: 'https://api.dicebear.com/7.x/identicon/svg?seed=icons'
            },
            {
                id: 6,
                name: 'Примеры кода.js',
                description: 'Полезные примеры кода на JavaScript для современных веб-приложений',
                category: 'documents',
                size: 1800000,
                author: 'developer',
                authorId: 3,
                uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 37,
                likes: [2, 3],
                tags: ['код', 'javascript', 'примеры', 'разработка'],
                access: 'public',
                fileType: 'code',
                preview: 'https://api.dicebear.com/7.x/identicon/svg?seed=code'
            },
            {
                id: 7,
                name: 'Анимации интерфейса.mp4',
                description: 'Коллекция анимаций для улучшения пользовательского опыта',
                category: 'video',
                size: 25600000,
                author: 'designer',
                authorId: 2,
                uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 24,
                likes: [1],
                tags: ['анимация', 'интерфейс', 'ui', 'ux'],
                access: 'public',
                fileType: 'video',
                preview: 'https://api.dicebear.com/7.x/identicon/svg?seed=animation'
            },
            {
                id: 8,
                name: 'Шрифты для веба.zip',
                description: 'Подборка современных веб-шрифтов с поддержкой кириллицы',
                category: 'archives',
                size: 9500000,
                author: 'admin',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 33,
                likes: [2],
                tags: ['шрифты', 'типографика', 'веб', 'дизайн'],
                access: 'public',
                fileType: 'archive',
                preview: 'https://api.dicebear.com/7.x/identicon/svg?seed=fonts'
            }
        ];
        
        appState.users = demoUsers;
        appState.files = demoFiles;
        
        saveData();
    }

    // === ЗАГРУЗКА ИЗ ХРАНИЛИЩА ===
    function loadFilesFromStorage() {
        const storedFiles = JSON.parse(localStorage.getItem('files')) || [];
        if (storedFiles.length > 0) {
            appState.files = storedFiles;
        }
    }

    // === ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ===
    function updateUI() {
        if (appState.currentUser) {
            // Показать профиль
            DOM.authButtons.style.display = 'none';
            DOM.uploadBtn.style.display = 'flex';
            DOM.userProfile.style.display = 'block';
            
            // Обновить информацию пользователя
            DOM.userName.textContent = appState.currentUser.username;
            DOM.userEmail.textContent = appState.currentUser.email;
            DOM.dropdownUserName.textContent = appState.currentUser.username;
            DOM.dropdownUserEmail.textContent = appState.currentUser.email;
            
            // Обновить аватар
            updateAvatar(appState.currentUser.avatar);
            
            // Обновить счетчик файлов пользователя
            updateUserFileCount();
        } else {
            // Показать кнопки авторизации
            DOM.authButtons.style.display = 'flex';
            DOM.uploadBtn.style.display = 'none';
            DOM.userProfile.style.display = 'none';
        }
    }

    function updateAvatar(avatarUrl) {
        const avatarElements = document.querySelectorAll('.avatar');
        avatarElements.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = avatarUrl;
            }
        });
    }

    function updateUserFileCount() {
        if (!appState.currentUser) return;
        
        const userFiles = appState.files.filter(file => file.authorId === appState.currentUser.id);
        DOM.myFilesCount.textContent = userFiles.length;
    }

    // === СТАТИСТИКА ===
    function updateStats() {
        // Обновить общую статистику
        DOM.usersCount.textContent = appState.users.length;
        DOM.filesCount.textContent = appState.files.length;
        
        const totalDownloads = appState.files.reduce((sum, file) => sum + (file.downloads || 0), 0);
        DOM.downloadsCount.textContent = totalDownloads;
        
        // Анимировать числа
        animateNumber(DOM.usersCount, appState.users.length);
        animateNumber(DOM.filesCount, appState.files.length);
        animateNumber(DOM.downloadsCount, totalDownloads);
    }

    function updateCategoryCounts() {
        Object.keys(DOM.categoryCounts).forEach(category => {
            const count = appState.files.filter(file => file.category === category).length;
            const element = DOM.categoryCounts[category];
            if (element) {
                element.textContent = count;
                animateNumber(element, count);
            }
        });
    }

    function animateNumber(element, target) {
        let current = parseInt(element.textContent) || 0;
        const increment = Math.ceil((target - current) / 20);
        
        if (increment === 0) return;
        
        const timer = setInterval(() => {
            current += increment;
            
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = current;
        }, 30);
    }

    // === ОТОБРАЖЕНИЕ ФАЙЛОВ ===
    function renderFiles(filteredFiles = null) {
        let filesToRender = filteredFiles || appState.files;
        
        // Применить фильтр
        filesToRender = applyFilter(filesToRender, appState.currentFilter);
        
        // Применить поиск
        if (appState.searchQuery) {
            filesToRender = searchFiles(filesToRender, appState.searchQuery);
        }
        
        // Применить сортировку
        filesToRender = applySort(filesToRender, appState.currentSort);
        
        // Обновить счетчики
        DOM.totalCount.textContent = filesToRender.length;
        DOM.showingCount.textContent = Math.min(filesToRender.length, appState.pageSize * appState.currentPage);
        
        // Очистить контейнер
        DOM.filesContainer.innerHTML = '';
        
        // Проверить, есть ли файлы для отображения
        if (filesToRender.length === 0) {
            showEmptyState();
            return;
        }
        
        // Отобразить файлы для текущей страницы
        const startIndex = 0;
        const endIndex = appState.pageSize * appState.currentPage;
        const filesToShow = filesToRender.slice(startIndex, endIndex);
        
        filesToShow.forEach(file => {
            const fileCard = createFileCard(file);
            DOM.filesContainer.appendChild(fileCard);
        });
        
        // Обновить стиль отображения
        DOM.filesContainer.className = `files-container ${appState.viewMode}-view`;
        
        // Показать/скрыть кнопку "Загрузить еще"
        updateLoadMoreButton(filesToRender.length > endIndex);
    }

    function applyFilter(filesList, filter) {
        switch(filter) {
            case 'popular':
                return filesList.filter(file => file.downloads >= 10);
            case 'recent':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return filesList.filter(file => new Date(file.uploadedAt) > weekAgo);
            case 'myfiles':
                if (!appState.currentUser) return [];
                return filesList.filter(file => file.authorId === appState.currentUser.id);
            default:
                return filesList;
        }
    }

    function searchFiles(filesList, query) {
        const searchLower = query.toLowerCase();
        return filesList.filter(file => 
            file.name.toLowerCase().includes(searchLower) ||
            file.description.toLowerCase().includes(searchLower) ||
            file.author.toLowerCase().includes(searchLower) ||
            (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
            file.category.toLowerCase().includes(searchLower)
        );
    }

    function applySort(filesList, sort) {
        return [...filesList].sort((a, b) => {
            switch(sort) {
                case 'newest':
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                case 'oldest':
                    return new Date(a.uploadedAt) - new Date(b.uploadedAt);
                case 'downloads':
                    return (b.downloads || 0) - (a.downloads || 0);
                case 'likes':
                    return (b.likes?.length || 0) - (a.likes?.length || 0);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }

    function createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card-glass';
        card.dataset.id = file.id;
        
        const fileType = getFileType(file.name);
        const isLiked = appState.currentUser && file.likes && file.likes.includes(appState.currentUser.id);
        const tags = file.tags || [];
        
        const fileIcon = getFileIcon(fileType);
        const uploadDate = formatDate(file.uploadedAt);
        const fileSize = formatFileSize(file.size);
        
        card.innerHTML = `
            <div class="file-header">
                <div class="file-icon-glass">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-info-compact">
                    <h3 title="${file.name}">${file.name}</h3>
                    <div class="file-meta-compact">
                        <span><i class="fas fa-user"></i> ${file.author}</span>
                        <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
                        <span><i class="fas fa-weight-hanging"></i> ${fileSize}</span>
                    </div>
                </div>
            </div>
            
            <p class="file-description" title="${file.description || 'Без описания'}">
                ${file.description || 'Без описания'}
            </p>
            
            ${tags.length > 0 ? `
            <div class="file-tags-glass">
                ${tags.map(tag => `<span class="tag-glass" data-tag="${tag}">${tag}</span>`).join('')}
            </div>
            ` : ''}
            
            <div class="file-footer">
                <div class="file-stats">
                    <span class="file-stat">
                        <i class="fas fa-download"></i>
                        ${file.downloads || 0}
                    </span>
                    <span class="file-stat">
                        <i class="fas fa-heart"></i>
                        ${file.likes ? file.likes.length : 0}
                    </span>
                    <span class="file-stat">
                        <i class="fas fa-eye"></i>
                        ${Math.floor(file.downloads * 1.5) || 0}
                    </span>
                </div>
                <div class="file-actions-glass">
                    <button class="btn-download-glass" data-file-id="${file.id}">
                        <i class="fas fa-download"></i>
                        Скачать
                    </button>
                    <button class="btn-like-glass ${isLiked ? 'liked' : ''}" data-file-id="${file.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    function showEmptyState() {
        DOM.filesContainer.innerHTML = `
            <div class="empty-state-glass">
                <div class="empty-state-content">
                    <div class="empty-icon">
                        <i class="fas fa-cloud"></i>
                    </div>
                    <h3>Файлы не найдены</h3>
                    <p>${appState.searchQuery ? 
                        'Попробуйте изменить поисковый запрос' : 
                        'Попробуйте изменить фильтры или загрузите первый файл'
                    }</p>
                    ${!appState.currentUser ? `
                    <button class="btn btn-primary-liquid" id="emptyLoginBtn">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Войти для загрузки</span>
                    </button>
                    ` : `
                    <button class="btn btn-primary-liquid" id="emptyUploadBtn">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Загрузить первый файл</span>
                    </button>
                    `}
                </div>
            </div>
        `;
        
        document.getElementById('emptyUploadBtn')?.addEventListener('click', () => openModal('upload'));
        document.getElementById('emptyLoginBtn')?.addEventListener('click', () => openModal('login'));
    }

    function updateLoadMoreButton(show) {
        DOM.loadMoreBtn.style.display = show ? 'flex' : 'none';
    }

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    function getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
        const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
        const codeExts = ['js', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'json', 'xml'];
        const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
        const spreadsheetExts = ['xls', 'xlsx', 'csv'];
        const presentationExts = ['ppt', 'pptx'];
        
        if (imageExts.includes(ext)) return 'image';
        if (audioExts.includes(ext)) return 'audio';
        if (videoExts.includes(ext)) return 'video';
        if (archiveExts.includes(ext)) return 'archive';
        if (codeExts.includes(ext)) return 'code';
        if (docExts.includes(ext)) return 'document';
        if (spreadsheetExts.includes(ext)) return 'spreadsheet';
        if (presentationExts.includes(ext)) return 'presentation';
        return 'other';
    }

    function getFileIcon(fileType) {
        switch(fileType) {
            case 'image': return 'fas fa-file-image';
            case 'audio': return 'fas fa-file-audio';
            case 'video': return 'fas fa-file-video';
            case 'archive': return 'fas fa-file-archive';
            case 'code': return 'fas fa-file-code';
            case 'document': return 'fas fa-file-alt';
            case 'spreadsheet': return 'fas fa-file-excel';
            case 'presentation': return 'fas fa-file-powerpoint';
            case 'pdf': return 'fas fa-file-pdf';
            default: return 'fas fa-file';
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Сегодня';
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дня назад`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} недели назад`;
        
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // === СКАЧИВАНИЕ ФАЙЛОВ ===
    function downloadFile(fileId) {
        const file = appState.files.find(f => f.id === fileId);
        if (!file) {
            showNotification('Файл не найден', 'error');
            return;
        }
        
        if (!appState.currentUser) {
            showNotification('Для скачивания файлов необходимо войти в систему', 'error');
            openModal('login');
            return;
        }
        
        const downloadBtn = document.querySelector(`.btn-download-glass[data-file-id="${fileId}"]`);
        if (downloadBtn) {
            downloadBtn.classList.add('downloading');
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
            downloadBtn.disabled = true;
        }
        
        // Имитация загрузки
        setTimeout(() => {
            // Генерация файла
            let blobContent;
            let mimeType = 'application/octet-stream';
            let filename = file.name;
            
            switch(getFileType(file.name)) {
                case 'document':
                    mimeType = 'application/pdf';
                    blobContent = `%PDF-1.4\n%FileShare\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 150\n>>\nstream\nBT\n/F1 24 Tf\n72 720 Td\n(FileShare - ${file.name}) Tj\nET\nBT\n/F1 12 Tf\n72 680 Td\n(Автор: ${file.author}) Tj\nET\nBT\n/F1 12 Tf\n72 660 Td\n(Дата: ${new Date(file.uploadedAt).toLocaleDateString('ru-RU')}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n0000000172 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n322\n%%EOF`;
                    break;
                case 'image':
                    mimeType = 'image/png';
                    const canvas = document.createElement('canvas');
                    canvas.width = 800;
                    canvas.height = 600;
                    const ctx = canvas.getContext('2d');
                    
                    // Градиентный фон
                    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
                    gradient.addColorStop(0, '#4361ee');
                    gradient.addColorStop(1, '#3a0ca3');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 800, 600);
                    
                    // Текст
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 40px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('FileShare', 400, 200);
                    ctx.font = '30px Arial';
                    ctx.fillText(file.name, 400, 250);
                    ctx.font = '20px Arial';
                    ctx.fillText(`Автор: ${file.author}`, 400, 300);
                    ctx.fillText(`Скачано: ${file.downloads + 1} раз`, 400, 330);
                    
                    blobContent = canvas.toDataURL('image/png').split(',')[1];
                    filename = file.name.endsWith('.png') ? file.name : file.name + '.png';
                    break;
                default:
                    mimeType = 'text/plain';
                    blobContent = `FileShare - ${file.name}\n\nОписание: ${file.description || 'Нет описания'}\nАвтор: ${file.author}\nДата загрузки: ${new Date(file.uploadedAt).toLocaleString('ru-RU')}\nРазмер: ${formatFileSize(file.size)}\nКатегория: ${file.category}\nТеги: ${file.tags ? file.tags.join(', ') : 'нет'}\n\nСпасибо за использование FileShare!\n\n---\nСкачано: ${file.downloads + 1} раз\nЛайков: ${file.likes ? file.likes.length : 0}`;
                    filename = file.name.endsWith('.txt') ? file.name : file.name + '.txt';
                    break;
            }
            
            let blob;
            if (mimeType === 'image/png') {
                const byteCharacters = atob(blobContent);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                blob = new Blob([byteArray], { type: mimeType });
            } else {
                blob = new Blob([blobContent], { type: mimeType });
            }
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Обновить статистику
            file.downloads = (file.downloads || 0) + 1;
            
            if (appState.currentUser) {
                const userIndex = appState.users.findIndex(u => u.id === appState.currentUser.id);
                if (userIndex !== -1) {
                    appState.users[userIndex].downloads = (appState.users[userIndex].downloads || 0) + 1;
                    appState.currentUser.downloads = appState.users[userIndex].downloads;
                }
            }
            
            saveData();
            updateStats();
            renderFiles();
            
            if (downloadBtn) {
                setTimeout(() => {
                    downloadBtn.classList.remove('downloading');
                    downloadBtn.innerHTML = `<i class="fas fa-download"></i> Скачать`;
                    downloadBtn.disabled = false;
                }, 500);
            }
            
            showNotification(`Файл "${file.name}" успешно скачан!`, 'success');
            
        }, 2000);
    }

    // === ЛАЙКИ ===
    function toggleLike(fileId) {
        if (!appState.currentUser) {
            showNotification('Для оценки файлов необходимо войти в систему', 'error');
            openModal('login');
            return;
        }
        
        const file = appState.files.find(f => f.id === fileId);
        if (!file) return;
        
        if (!file.likes) file.likes = [];
        
        const likeIndex = file.likes.indexOf(appState.currentUser.id);
        const isLiked = likeIndex !== -1;
        
        if (isLiked) {
            file.likes.splice(likeIndex, 1);
        } else {
            file.likes.push(appState.currentUser.id);
        }
        
        saveData();
        
        const likeBtn = document.querySelector(`.btn-like-glass[data-file-id="${fileId}"]`);
        
        if (isLiked) {
            likeBtn.classList.remove('liked');
        } else {
            likeBtn.classList.add('liked');
            likeBtn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Обновить отображение счетчика лайков в карточке
        const card = likeBtn.closest('.file-card-glass');
        const likesCount = card.querySelector('.file-stat:nth-child(2)');
        if (likesCount) {
            likesCount.innerHTML = `<i class="fas fa-heart"></i> ${file.likes.length}`;
        }
        
        if (appState.currentUser) {
            const userIndex = appState.users.findIndex(u => u.id === appState.currentUser.id);
            if (userIndex !== -1) {
                appState.users[userIndex].likes = (appState.users[userIndex].likes || 0) + (isLiked ? -1 : 1);
                appState.currentUser.likes = appState.users[userIndex].likes;
            }
        }
    }

    // === ЗАГРУЗКА ФАЙЛОВ ===
    function uploadFile(fileData) {
        if (!appState.currentUser) return;
        
        const newFile = {
            id: Date.now(),
            name: fileData.name,
            description: fileData.description,
            category: fileData.category,
            size: fileData.size,
            author: appState.currentUser.username,
            authorId: appState.currentUser.id,
            uploadedAt: new Date().toISOString(),
            downloads: 0,
            likes: [],
            tags: fileData.tags || [],
            access: fileData.access || 'public',
            fileType: getFileType(fileData.name)
        };
        
        appState.files.unshift(newFile);
        
        const userIndex = appState.users.findIndex(u => u.id === appState.currentUser.id);
        if (userIndex !== -1) {
            appState.users[userIndex].uploads = (appState.users[userIndex].uploads || 0) + 1;
            appState.currentUser.uploads = appState.users[userIndex].uploads;
        }
        
        saveData();
        updateStats();
        updateCategoryCounts();
        updateUserFileCount();
        renderFiles();
        
        showNotification(`Файл "${fileData.name}" успешно загружен!`, 'success');
    }

    // === СОХРАНЕНИЕ ДАННЫХ ===
    function saveData() {
        localStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
        localStorage.setItem('files', JSON.stringify(appState.files));
        localStorage.setItem('users', JSON.stringify(appState.users));
    }

    // === УВЕДОМЛЕНИЯ ===
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        
        // Создать уведомление, если его нет
        if (!notification) return;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.className = `notification-glass ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                <h4>${type === 'success' ? 'Успешно!' : 
                     type === 'error' ? 'Ошибка!' : 
                     type === 'warning' ? 'Внимание!' : 'Информация'}</h4>
                <p>${message}</p>
            </div>
        `;
        
        notification.classList.add('show');
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    // === МОДАЛЬНЫЕ ОКНА ===
    function openModal(modalName) {
        const modal = DOM.modals[modalName];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Инициализация для модального окна загрузки
            if (modalName === 'upload') {
                initUploadModal();
            }
        }
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Сброс состояния загрузки
        appState.isUploading = false;
    }

    function initUploadModal() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const filePreview = document.getElementById('filePreview');
        const progressCircle = document.querySelector('.progress-bar');
        const progressPercent = document.getElementById('progressPercent');
        const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
        
        // Сброс предпросмотра
        filePreview.innerHTML = '';
        
        // Сброс прогресса
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = '339.292';
        }
        if (progressPercent) {
            progressPercent.textContent = '0%';
        }
        
        // Активировать кнопку загрузки
        if (uploadSubmitBtn) {
            uploadSubmitBtn.disabled = false;
            uploadSubmitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Начать загрузку</span>';
        }
        
        // Drag and drop
        if (uploadZone) {
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            });
            
            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('dragover');
            });
            
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                
                if (e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    handleFileSelect(fileInput.files);
                }
            });
        }
        
        // Выбор файла через кнопку
        if (fileInput) {
            fileInput.onchange = () => handleFileSelect(fileInput.files);
        }
    }

    function handleFileSelect(files) {
        const filePreview = document.getElementById('filePreview');
        const fileNameInput = document.getElementById('fileName');
        
        filePreview.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            fileItem.innerHTML = `
                <div class="file-preview-info">
                    <div class="file-preview-icon">
                        <i class="${getFileIcon(getFileType(file.name))}"></i>
                    </div>
                    <div>
                        <div class="file-preview-name">${file.name}</div>
                        <div class="file-preview-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="btn-remove-file" type="button">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            filePreview.appendChild(fileItem);
            
            // Заполнить название файла, если поле пустое
            if (fileNameInput && !fileNameInput.value) {
                fileNameInput.value = file.name.replace(/\.[^/.]+$/, "");
            }
            
            // Удаление файла из предпросмотра
            const removeBtn = fileItem.querySelector('.btn-remove-file');
            removeBtn.addEventListener('click', () => {
                fileItem.remove();
            });
        });
    }

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===
    function setupEventListeners() {
        // Переключение темы
        DOM.themeToggle?.addEventListener('click', toggleTheme);
        
        // Кнопки темы в футере
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const theme = this.dataset.theme;
                localStorage.setItem('theme', theme);
                loadTheme();
                showNotification(`Тема изменена на ${theme === 'dark' ? 'тёмную' : theme === 'light' ? 'светлую' : 'автоматическую'}`, 'success');
            });
        });
        
        // Режимы просмотра
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                appState.viewMode = this.dataset.view;
                renderFiles();
            });
        });
        
        // Сортировка
        DOM.sortSelect?.addEventListener('change', function() {
            appState.currentSort = this.value;
            renderFiles();
        });
        
        // Фильтры
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                appState.currentFilter = this.dataset.filter;
                appState.currentPage = 1;
                renderFiles();
            });
        });
        
        // Категории
        document.querySelectorAll('.category-card-glass').forEach(card => {
            card.addEventListener('click', function() {
                const category = this.dataset.category;
                
                // Подсветка выбранной категории
                document.querySelectorAll('.category-card-glass').forEach(c => {
                    c.style.borderColor = '';
                });
                this.style.borderColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--primary-color')
                    .trim();
                
                // Фильтрация по категории
                const filteredFiles = appState.files.filter(f => f.category === category);
                renderFiles(filteredFiles);
                
                showNotification(`Показаны файлы категории: ${getCategoryName(category)}`, 'info');
            });
        });
        
        // Поиск
        DOM.searchBtn?.addEventListener('click', performSearch);
        DOM.searchInput?.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Кнопки открытия модальных окон
        DOM.loginBtn.addEventListener('click', () => openModal('login'));
        DOM.registerBtn.addEventListener('click', () => openModal('register'));
        DOM.uploadBtn.addEventListener('click', () => {
            if (!appState.currentUser) {
                showNotification('Для загрузки файлов необходимо войти в систему', 'error');
                openModal('login');
            } else {
                openModal('upload');
            }
        });
        DOM.heroUploadBtn.addEventListener('click', () => {
            if (!appState.currentUser) {
                showNotification('Для загрузки файлов необходимо войти в систему', 'error');
                openModal('login');
            } else {
                openModal('upload');
            }
        });
        DOM.exploreBtn?.addEventListener('click', () => {
            DOM.searchInput.focus();
        });
        
        // Обновление
        DOM.refreshBtn?.addEventListener('click', () => {
            renderFiles();
            showNotification('Список файлов обновлен', 'success');
            
            // Анимация вращения
            DOM.refreshBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                DOM.refreshBtn.style.transform = 'rotate(0deg)';
            }, 600);
        });
        
        // Загрузить еще
        DOM.loadMoreBtn?.addEventListener('click', () => {
            appState.currentPage++;
            renderFiles();
            showNotification(`Загружено еще ${appState.pageSize} файлов`, 'info');
        });
        
        // Профиль
        document.getElementById('profileBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.dropdown-menu-glass').classList.toggle('show');
        });
        
        // Закрытие dropdown при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-menu')) {
                document.querySelectorAll('.dropdown-menu-glass').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
        
        // Действия в профиле
        document.getElementById('viewProfileBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Функционал профиля в разработке', 'info');
        });
        
        document.getElementById('myFilesBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (appState.currentUser) {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.filter-btn[data-filter="myfiles"]').classList.add('active');
                appState.currentFilter = 'myfiles';
                renderFiles();
            }
        });
        
        document.getElementById('settingsBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Настройки в разработке', 'info');
        });
        
        document.getElementById('statsBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Статистика системы:\nПользователей: ' + appState.users.length + 
                           '\nФайлов: ' + appState.files.length + 
                           '\nСкачиваний: ' + appState.files.reduce((sum, f) => sum + (f.downloads || 0), 0), 'info');
        });
        
        document.getElementById('helpBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Документация доступна по ссылке в подвале сайта', 'info');
        });
        
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти?')) {
                appState.currentUser = null;
                saveData();
                updateUI();
                showNotification('Вы вышли из системы', 'success');
            }
        });
        
        // Закрытие модальных окон
        document.querySelectorAll('.close-modal-glass').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal-glass');
                closeModal(modal);
            });
        });
        
        // Клик вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-glass')) {
                closeModal(e.target);
            }
        });
        
        // Переключение между логином и регистрацией
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(DOM.modals.login);
            openModal('register');
        });
        
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(DOM.modals.register);
            openModal('login');
        });
        
        // Показать/скрыть пароль
        document.getElementById('showLoginPassword')?.addEventListener('click', function() {
            const passwordInput = document.getElementById('loginPassword');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
        
        document.getElementById('showRegPassword')?.addEventListener('click', function() {
            const passwordInput = document.getElementById('regPassword');
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
        
        // Форма входа
        document.getElementById('loginForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            const user = appState.users.find(u => 
                (u.username === username || u.email === username) && 
                u.password === password
            );
            
            if (user) {
                appState.currentUser = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    bio: user.bio,
                    avatar: user.avatar,
                    banner: user.banner,
                    uploads: user.uploads || 0,
                    downloads: user.downloads || 0,
                    likes: user.likes || 0
                };
                
                saveData();
                updateUI();
                showNotification(`Добро пожаловать, ${user.username}!`, 'success');
                closeModal(DOM.modals.login);
                this.reset();
                
                // Обновить список файлов для показа файлов пользователя
                renderFiles();
            } else {
                showNotification('Неверные учетные данные', 'error');
            }
        });
        
        // Форма регистрации
        document.getElementById('registerForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // Валидация
            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Пароль должен содержать минимум 6 символов', 'error');
                return;
            }
            
            if (username.length < 3) {
                showNotification('Логин должен содержать минимум 3 символа', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Введите корректный email', 'error');
                return;
            }
            
            const userExists = appState.users.some(u => u.username === username || u.email === email);
            if (userExists) {
                showNotification('Пользователь с таким именем или email уже существует', 'error');
                return;
            }
            
            const newUser = {
                id: Date.now(),
                username,
                email,
                password,
                bio: 'Новый пользователь FileShare',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                banner: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
                uploads: 0,
                downloads: 0,
                likes: 0,
                createdAt: new Date().toISOString(),
                role: 'user'
            };
            
            appState.users.push(newUser);
            appState.currentUser = {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                bio: newUser.bio,
                avatar: newUser.avatar,
                banner: newUser.banner,
                uploads: 0,
                downloads: 0,
                likes: 0
            };
            
            saveData();
            updateUI();
            updateStats();
            showNotification('Регистрация успешна! Добро пожаловать!', 'success');
            closeModal(DOM.modals.register);
            this.reset();
        });
        
        // Форма загрузки файла
        document.getElementById('uploadForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!appState.currentUser) {
                showNotification('Для загрузки файлов необходимо войти в систему', 'error');
                return;
            }
            
            const fileName = document.getElementById('fileName').value;
            const fileDescription = document.getElementById('fileDescription').value;
            const fileCategory = document.getElementById('fileCategory').value;
            const fileAccess = document.getElementById('fileAccess').value;
            const fileInput = document.getElementById('fileInput');
            
            if (!fileName || !fileCategory || !fileInput.files[0]) {
                showNotification('Заполните все обязательные поля', 'error');
                return;
            }
            
            const file = fileInput.files[0];
            const maxSize = 100 * 1024 * 1024;
            
            if (file.size > maxSize) {
                showNotification('Файл слишком большой. Максимальный размер: 100MB', 'error');
                return;
            }
            
            // Получить теги
            const tags = [];
            document.querySelectorAll('.tag-input-item').forEach(tag => {
                const tagText = tag.textContent.replace('×', '').trim();
                if (tagText) tags.push(tagText);
            });
            
            // Начать загрузку
            appState.isUploading = true;
            const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
            const progressCircle = document.querySelector('.progress-bar');
            const progressPercent = document.getElementById('progressPercent');
            
            if (uploadSubmitBtn) {
                uploadSubmitBtn.disabled = true;
                uploadSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Загрузка...</span>';
            }
            
            // Анимация прогресса
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                    
                    // Загрузка завершена
                    uploadFile({
                        name: fileName,
                        description: fileDescription,
                        category: fileCategory,
                        size: file.size,
                        tags: tags,
                        access: fileAccess
                    });
                    
                    this.reset();
                    document.getElementById('filePreview').innerHTML = '';
                    closeModal(DOM.modals.upload);
                    appState.isUploading = false;
                    
                    // Сброс прогресса
                    setTimeout(() => {
                        if (progressCircle) {
                            progressCircle.style.strokeDashoffset = '339.292';
                        }
                        if (progressPercent) {
                            progressPercent.textContent = '0%';
                        }
                    }, 500);
                }
                
                // Обновить прогресс
                const progressOffset = 339.292 - (339.292 * progress) / 100;
                if (progressCircle) {
                    progressCircle.style.strokeDashoffset = progressOffset;
                }
                if (progressPercent) {
                    progressPercent.textContent = `${Math.round(progress)}%`;
                }
            }, 100);
        });
        
        // Отмена загрузки
        document.getElementById('cancelUpload')?.addEventListener('click', () => {
            closeModal(DOM.modals.upload);
        });
        
        // Теги
        const tagsInput = document.getElementById('fileTags');
        const tagsSuggestions = document.getElementById('tagsSuggestions');
        
        if (tagsInput && tagsSuggestions) {
            tagsInput.addEventListener('input', function(e) {
                const value = e.target.value.trim();
                
                if (value.length > 1) {
                    // Фильтрация предложений
                    const suggestions = appState.tags.filter(tag => 
                        tag.toLowerCase().includes(value.toLowerCase()) && 
                        !Array.from(document.querySelectorAll('.tag-input-item')).some(t => 
                            t.textContent.replace('×', '').trim() === tag
                        )
                    );
                    
                    if (suggestions.length > 0) {
                        tagsSuggestions.innerHTML = suggestions.map(tag => 
                            `<div class="tag-suggestion" data-tag="${tag}">${tag}</div>`
                        ).join('');
                        tagsSuggestions.classList.add('show');
                    } else {
                        tagsSuggestions.classList.remove('show');
                    }
                } else {
                    tagsSuggestions.classList.remove('show');
                }
            });
            
            tagsInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && this.value.trim()) {
                    e.preventDefault();
                    addTag(this.value.trim());
                    this.value = '';
                    tagsSuggestions.classList.remove('show');
                }
            });
            
            // Выбор предложения
            tagsSuggestions.addEventListener('click', function(e) {
                if (e.target.classList.contains('tag-suggestion')) {
                    const tag = e.target.dataset.tag;
                    addTag(tag);
                    tagsInput.value = '';
                    this.classList.remove('show');
                }
            });
            
            // Закрытие предложений при клике вне
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.tags-input-container')) {
                    tagsSuggestions.classList.remove('show');
                }
            });
        }
        
        // Добавление тега
        function addTag(tag) {
            const tagsContainer = document.getElementById('tagsInput');
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-input-item';
            tagElement.innerHTML = `${tag} <span class="tag-remove">×</span>`;
            
            tagsContainer.insertBefore(tagElement, tagsContainer.querySelector('input'));
            
            // Удаление тега
            tagElement.querySelector('.tag-remove').addEventListener('click', function() {
                tagElement.remove();
            });
        }
        
        // Обработка кликов на файлы (делегирование)
        DOM.filesContainer.addEventListener('click', function(e) {
            const downloadBtn = e.target.closest('.btn-download-glass');
            if (downloadBtn) {
                const fileId = parseInt(downloadBtn.dataset.fileId);
                downloadFile(fileId);
                return;
            }
            
            const likeBtn = e.target.closest('.btn-like-glass');
            if (likeBtn) {
                const fileId = parseInt(likeBtn.dataset.fileId);
                toggleLike(fileId);
                return;
            }
            
            const tag = e.target.closest('.tag-glass');
            if (tag) {
                const tagText = tag.dataset.tag;
                DOM.searchInput.value = tagText;
                performSearch();
            }
        });
    }

    // === ПОИСК ===
    function performSearch() {
        const query = DOM.searchInput.value;
        appState.searchQuery = query;
        appState.currentPage = 1;
        
        if (!query.trim()) {
            renderFiles();
            return;
        }
        
        renderFiles();
        
        const filteredFiles = searchFiles(appState.files, query);
        if (filteredFiles.length === 0) {
            showNotification('По вашему запросу ничего не найдено', 'info');
        } else {
            showNotification(`Найдено файлов: ${filteredFiles.length}`, 'success');
        }
    }

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    function getCategoryName(category) {
        const categoryNames = {
            'documents': 'Документы',
            'images': 'Изображения',
            'audio': 'Аудио',
            'video': 'Видео',
            'archives': 'Архивы',
            'software': 'Программы',
            'other': 'Другое'
        };
        return categoryNames[category] || 'Другое';
    }

    // === СОЦИАЛЬНЫЕ КНОПКИ ===
    document.querySelectorAll('.social-login-buttons button').forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Социальные сети в разработке', 'info');
        });
    });

    // === ПОДПИСКА НА ОБНОВЛЕНИЯ ===
    document.querySelector('.btn-subscribe')?.addEventListener('click', function(e) {
        e.preventDefault();
        const emailInput = this.closest('.newsletter-form').querySelector('input[type="email"]');
        const email = emailInput.value;
        
        if (email && /\S+@\S+\.\S+/.test(email)) {
            emailInput.value = '';
            showNotification('Вы успешно подписались на обновления!', 'success');
        } else {
            showNotification('Введите корректный email', 'error');
        }
    });
});

// Инициализация при полной загрузке страницы
window.addEventListener('load', function() {
    // Анимация появления элементов
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, i * 100);
    });
});
