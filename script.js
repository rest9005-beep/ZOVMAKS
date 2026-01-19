class FileSharePro {
    constructor() {
        this.init();
    }

    async init() {
        // Инициализация данных
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.files = JSON.parse(localStorage.getItem('files')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.settings = JSON.parse(localStorage.getItem('settings')) || {
            theme: 'dark',
            autoSave: true,
            notifications: true
        };
        
        // DOM элементы
        this.elements = {
            loader: document.getElementById('loader'),
            menuToggle: document.getElementById('menuToggle'),
            sidebar: document.getElementById('sidebar'),
            mainContent: document.getElementById('mainContent'),
            themeToggle: document.getElementById('themeToggle'),
            searchInput: document.getElementById('searchInput'),
            uploadBtn: document.getElementById('uploadBtn'),
            userMenu: document.getElementById('userMenu'),
            uploadModal: document.getElementById('uploadModal'),
            loginModal: document.getElementById('loginModal'),
            registerModal: document.getElementById('registerModal'),
            profileModal: document.getElementById('profileModal'),
            notification: document.getElementById('notification'),
            recentFilesGrid: document.getElementById('recentFilesGrid'),
            allFilesGrid: document.getElementById('allFilesGrid'),
            myFilesGrid: document.getElementById('myFilesGrid')
        };

        // Загрузка темы
        this.loadTheme();
        
        // Инициализация демо-данных
        if (this.users.length === 0) {
            this.createDemoData();
        }

        // Настройка событий
        this.setupEventListeners();
        
        // Обновление интерфейса
        this.updateUI();
        
        // Загрузка файлов
        this.loadFiles();
        
        // Обновление статистики
        this.updateStats();
        
        // Скрытие лоадера
        setTimeout(() => {
            this.elements.loader.style.opacity = '0';
            setTimeout(() => {
                this.elements.loader.style.display = 'none';
            }, 300);
        }, 1000);
    }

    loadTheme() {
        document.body.className = this.settings.theme + '-theme';
        const icon = this.elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = this.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    createDemoData() {
        const demoUsers = [
            {
                id: 1,
                username: 'Admin',
                email: 'admin@fileshare.com',
                password: 'admin123',
                avatar: 'AD',
                bio: 'Системный администратор',
                role: 'admin',
                storage: 10737418240, // 10GB
                usedStorage: 2147483648, // 2GB
                uploads: 15,
                downloads: 120,
                likes: 45,
                joinDate: '2024-01-01'
            },
            {
                id: 2,
                username: 'Demo User',
                email: 'demo@fileshare.com',
                password: 'demo123',
                avatar: 'DU',
                bio: 'Демонстрационный пользователь',
                role: 'user',
                storage: 5368709120, // 5GB
                usedStorage: 1073741824, // 1GB
                uploads: 8,
                downloads: 65,
                likes: 23,
                joinDate: '2024-02-15'
            }
        ];

        const demoFiles = [
            {
                id: 1,
                name: 'Презентация проекта.pdf',
                description: 'Подробная презентация нового IT-проекта',
                category: 'documents',
                size: 5242880, // 5MB
                authorId: 1,
                author: 'Admin',
                uploadDate: '2024-03-15',
                downloads: 42,
                likes: 15,
                tags: ['работа', 'презентация', 'проект'],
                extension: '.pdf',
                thumbnail: '📄'
            },
            {
                id: 2,
                name: 'Логотип компании.png',
                description: 'Векторный логотип компании в высоком разрешении',
                category: 'images',
                size: 2097152, // 2MB
                authorId: 1,
                author: 'Admin',
                uploadDate: '2024-03-14',
                downloads: 28,
                likes: 8,
                tags: ['лого', 'дизайн', 'компания'],
                extension: '.png',
                thumbnail: '🖼️'
            },
            {
                id: 3,
                name: 'Фоновая музыка.mp3',
                description: 'Лицензионная фоновая музыка для видео',
                category: 'audio',
                size: 8388608, // 8MB
                authorId: 2,
                author: 'Demo User',
                uploadDate: '2024-03-13',
                downloads: 15,
                likes: 5,
                tags: ['музыка', 'аудио', 'фон'],
                extension: '.mp3',
                thumbnail: '🎵'
            },
            {
                id: 4,
                name: 'Учебник JavaScript.pdf',
                description: 'Полное руководство по программированию на JavaScript',
                category: 'documents',
                size: 10485760, // 10MB
                authorId: 2,
                author: 'Demo User',
                uploadDate: '2024-03-12',
                downloads: 56,
                likes: 21,
                tags: ['программирование', 'js', 'учебник'],
                extension: '.pdf',
                thumbnail: '📚'
            },
            {
                id: 5,
                name: 'Архив с исходниками.zip',
                description: 'Исходные коды проекта веб-приложения',
                category: 'archives',
                size: 15728640, // 15MB
                authorId: 1,
                author: 'Admin',
                uploadDate: '2024-03-11',
                downloads: 33,
                likes: 12,
                tags: ['код', 'архив', 'проект'],
                extension: '.zip',
                thumbnail: '📦'
            }
        ];

        this.users = demoUsers;
        this.files = demoFiles;
        this.saveData();
    }

    saveData() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('files', JSON.stringify(this.files));
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    updateUI() {
        const userMenu = this.elements.userMenu;
        
        if (this.currentUser) {
            // Показать профиль пользователя
            userMenu.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; cursor: pointer;" id="profileDropdown">
                    <div class="profile-avatar" style="width: 40px; height: 40px; font-size: 16px;">${this.currentUser.avatar}</div>
                    <div>
                        <div style="font-weight: 600;">${this.currentUser.username}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${this.currentUser.role || 'user'}</div>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="dropdown-menu" style="display: none; position: absolute; top: 60px; right: 0; background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 10px; min-width: 200px; box-shadow: 0 10px 30px var(--shadow); z-index: 1000;">
                    <a href="#" class="dropdown-item" data-action="profile" style="display: flex; align-items: center; gap: 10px; padding: 12px; color: var(--text-primary); text-decoration: none; border-radius: 8px; transition: background 0.3s;">
                        <i class="fas fa-user"></i>
                        <span>Профиль</span>
                    </a>
                    <a href="#" class="dropdown-item" data-action="settings" style="display: flex; align-items: center; gap: 10px; padding: 12px; color: var(--text-primary); text-decoration: none; border-radius: 8px; transition: background 0.3s;">
                        <i class="fas fa-cog"></i>
                        <span>Настройки</span>
                    </a>
                    <div style="height: 1px; background: var(--border); margin: 8px 0;"></div>
                    <a href="#" class="dropdown-item" data-action="logout" style="display: flex; align-items: center; gap: 10px; padding: 12px; color: var(--danger); text-decoration: none; border-radius: 8px; transition: background 0.3s;">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Выйти</span>
                    </a>
                </div>
            `;
        } else {
            // Показать кнопки входа/регистрации
            userMenu.innerHTML = `
                <button class="btn btn-secondary" id="showLoginBtn">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Войти</span>
                </button>
                <button class="btn btn-primary" id="showRegisterBtn" style="display: none;">
                    <i class="fas fa-user-plus"></i>
                    <span>Регистрация</span>
                </button>
            `;
        }
    }

    updateStats() {
        // Обновляем статистику на дашборде
        document.getElementById('totalUsers').textContent = this.users.length;
        document.getElementById('totalFiles').textContent = this.files.length;
        
        const totalDownloads = this.files.reduce((sum, file) => sum + (file.downloads || 0), 0);
        document.getElementById('totalDownloads').textContent = totalDownloads;
        
        const totalStorage = this.files.reduce((sum, file) => sum + (file.size || 0), 0);
        document.getElementById('storageUsed').textContent = (totalStorage / (1024*1024*1024)).toFixed(1) + ' GB';
    }

    loadFiles() {
        // Загрузка недавних файлов
        this.loadRecentFiles();
        
        // Загрузка всех файлов
        this.loadAllFiles();
        
        // Загрузка файлов пользователя
        if (this.currentUser) {
            this.loadUserFiles();
        }
    }

    loadRecentFiles() {
        const grid = this.elements.recentFilesGrid;
        const recentFiles = [...this.files]
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 6);

        grid.innerHTML = recentFiles.map(file => this.createFileCard(file)).join('');
    }

    loadAllFiles() {
        const grid = this.elements.allFilesGrid;
        grid.innerHTML = this.files.map(file => this.createFileCard(file)).join('');
    }

    loadUserFiles() {
        const grid = this.elements.myFilesGrid;
        const userFiles = this.files.filter(file => file.authorId === this.currentUser.id);
        grid.innerHTML = userFiles.map(file => this.createFileCard(file)).join('');
    }

    createFileCard(file) {
        const fileSize = this.formatFileSize(file.size);
        const uploadDate = new Date(file.uploadDate).toLocaleDateString('ru-RU');
        
        return `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-header">
                    <div class="file-icon">
                        ${file.thumbnail || '📄'}
                    </div>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${fileSize} • ${uploadDate}</div>
                    </div>
                </div>
                <div style="margin-bottom: 15px; color: var(--text-secondary); font-size: 14px;">
                    ${file.description || 'Без описания'}
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;">
                    ${file.tags?.map(tag => `<span style="background: var(--border); padding: 4px 12px; border-radius: 20px; font-size: 12px;">${tag}</span>`).join('') || ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 20px;">
                        <span style="color: var(--text-secondary);">
                            <i class="fas fa-download"></i> ${file.downloads || 0}
                        </span>
                        <span style="color: var(--text-secondary);">
                            <i class="fas fa-heart"></i> ${file.likes || 0}
                        </span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="download-btn" data-file-id="${file.id}" style="background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-download"></i> Скачать
                        </button>
                        ${this.currentUser && this.currentUser.id === file.authorId ? `
                            <button class="delete-btn" data-file-id="${file.id}" style="background: var(--danger); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        const notification = this.elements.notification;
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    setupEventListeners() {
        // Меню бургер
        this.elements.menuToggle.addEventListener('click', () => {
            this.elements.sidebar.classList.toggle('active');
            this.elements.mainContent.classList.toggle('with-sidebar');
        });

        // Переключение темы
        this.elements.themeToggle.addEventListener('click', () => {
            this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
            this.saveData();
            this.loadTheme();
        });

        // Поиск
        this.elements.searchInput.addEventListener('input', (e) => {
            this.searchFiles(e.target.value);
        });

        // Загрузка файлов
        this.elements.uploadBtn.addEventListener('click', () => {
            if (!this.currentUser) {
                this.showLoginModal();
                return;
            }
            this.showUploadModal();
        });

        // Модальные окна
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Клик вне модальных окон
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Быстрая загрузка
        document.getElementById('quickUploadBtn')?.addEventListener('click', () => {
            if (!this.currentUser) {
                this.showLoginModal();
                return;
            }
            this.showUploadModal();
        });

        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                const category = item.dataset.category;
                
                if (section) {
                    this.showSection(section);
                } else if (category) {
                    this.filterByCategory(category);
                }
                
                // Закрываем меню на мобильных
                if (window.innerWidth <= 1200) {
                    this.elements.sidebar.classList.remove('active');
                    this.elements.mainContent.classList.remove('with-sidebar');
                }
            });
        });

        // Показ всех файлов
        document.getElementById('viewAllBtn')?.addEventListener('click', () => {
            this.showSection('files');
        });

        // Делегирование событий для файлов
        document.addEventListener('click', (e) => {
            // Скачивание файла
            if (e.target.closest('.download-btn')) {
                const fileId = parseInt(e.target.closest('.download-btn').dataset.fileId);
                this.downloadFile(fileId);
                return;
            }

            // Удаление файла
            if (e.target.closest('.delete-btn')) {
                const fileId = parseInt(e.target.closest('.delete-btn').dataset.fileId);
                this.deleteFile(fileId);
                return;
            }

            // Действия профиля
            if (e.target.closest('.dropdown-item')) {
                const action = e.target.closest('.dropdown-item').dataset.action;
                if (action === 'logout') {
                    this.logout();
                } else if (action === 'profile') {
                    this.showProfileModal();
                } else if (action === 'settings') {
                    this.showSettingsModal();
                }
                return;
            }

            // Профиль дропдаун
            if (e.target.closest('#profileDropdown')) {
                const dropdown = document.querySelector('.dropdown-menu');
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });

        // Drag and drop
        const dropArea = document.getElementById('dropArea');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');

        if (dropArea && browseBtn) {
            browseBtn.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, () => {
                    dropArea.style.borderColor = 'var(--primary)';
                    dropArea.style.background = 'rgba(99, 102, 241, 0.05)';
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, () => {
                    dropArea.style.borderColor = '';
                    dropArea.style.background = '';
                }, false);
            });

            dropArea.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            }, false);
        }

        // Форма входа
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Форма регистрации
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Форма загрузки
        document.getElementById('uploadForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadFile();
        });

        // Переключение между логином и регистрацией
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });
    }

    showSection(section) {
        // Скрываем все секции
        document.querySelectorAll('section').forEach(sec => {
            sec.style.display = 'none';
        });
        
        // Показываем нужную секцию
        document.getElementById(section + 'Section')?.style.display = 'block';
        
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[data-section="${section}"]`)?.classList.add('active');
    }

    filterByCategory(category) {
        const filteredFiles = this.files.filter(file => file.category === category);
        this.elements.allFilesGrid.innerHTML = filteredFiles.map(file => this.createFileCard(file)).join('');
        this.showSection('files');
    }

    searchFiles(query) {
        if (!query.trim()) {
            this.loadAllFiles();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filteredFiles = this.files.filter(file => 
            file.name.toLowerCase().includes(searchTerm) ||
            file.description.toLowerCase().includes(searchTerm) ||
            file.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            file.author.toLowerCase().includes(searchTerm)
        );

        this.elements.allFilesGrid.innerHTML = filteredFiles.map(file => this.createFileCard(file)).join('');
    }

    async downloadFile(fileId) {
        if (!this.currentUser) {
            this.showLoginModal();
            return;
        }

        const file = this.files.find(f => f.id === fileId);
        if (!file) {
            this.showNotification('Файл не найден', 'error');
            return;
        }

        // Имитация скачивания
        const downloadBtn = document.querySelector(`.download-btn[data-file-id="${fileId}"]`);
        if (downloadBtn) {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Скачивание...';
            downloadBtn.disabled = true;
        }

        // Имитация задержки скачивания
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Обновляем статистику
        file.downloads = (file.downloads || 0) + 1;
        
        if (this.currentUser) {
            const user = this.users.find(u => u.id === this.currentUser.id);
            if (user) {
                user.downloads = (user.downloads || 0) + 1;
            }
        }

        this.saveData();
        this.updateStats();
        this.loadFiles();

        if (downloadBtn) {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Скачать';
            downloadBtn.disabled = false;
        }

        this.showNotification(`Файл "${file.name}" скачан!`, 'success');
    }

    deleteFile(fileId) {
        if (!this.currentUser) {
            this.showLoginModal();
            return;
        }

        const file = this.files.find(f => f.id === fileId);
        if (!file) {
            this.showNotification('Файл не найден', 'error');
            return;
        }

        if (file.authorId !== this.currentUser.id) {
            this.showNotification('Вы не можете удалить этот файл', 'error');
            return;
        }

        if (confirm(`Удалить файл "${file.name}"?`)) {
            this.files = this.files.filter(f => f.id !== fileId);
            
            if (this.currentUser) {
                const user = this.users.find(u => u.id === this.currentUser.id);
                if (user) {
                    user.uploads = Math.max(0, (user.uploads || 0) - 1);
                }
            }

            this.saveData();
            this.updateStats();
            this.loadFiles();
            
            this.showNotification('Файл удален', 'success');
        }
    }

    handleFileSelect(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileNameInput = document.getElementById('fileName');
        
        fileInfo.innerHTML = `
            <div style="background: var(--dark-bg); padding: 15px; border-radius: 12px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-file" style="color: var(--primary); font-size: 24px;"></i>
                    <div>
                        <div style="font-weight: 600;">${file.name}</div>
                        <div style="color: var(--text-secondary); font-size: 12px;">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
            </div>
        `;
        
        if (!fileNameInput.value) {
            fileNameInput.value = file.name.replace(/\.[^/.]+$/, "");
        }
    }

    async uploadFile() {
        if (!this.currentUser) {
            this.showLoginModal();
            return;
        }

        const fileName = document.getElementById('fileName').value;
        const description = document.getElementById('fileDescription').value;
        const category = document.getElementById('fileCategory').value;
        const fileInput = document.getElementById('fileInput');

        if (!fileName || !category || !fileInput.files[0]) {
            this.showNotification('Заполните все обязательные поля', 'error');
            return;
        }

        const file = fileInput.files[0];
        const maxSize = 10 * 1024 * 1024 * 1024; // 10GB

        if (file.size > maxSize) {
            this.showNotification('Файл слишком большой. Максимальный размер: 10GB', 'error');
            return;
        }

        // Имитация загрузки с прогресс-баром
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');

        uploadProgress.style.display = 'block';
        uploadSubmitBtn.disabled = true;
        uploadSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';

        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                // Создаем новый файл
                const newFile = {
                    id: Date.now(),
                    name: fileName,
                    description: description,
                    category: category,
                    size: file.size,
                    authorId: this.currentUser.id,
                    author: this.currentUser.username,
                    uploadDate: new Date().toISOString().split('T')[0],
                    downloads: 0,
                    likes: 0,
                    tags: [],
                    extension: '.' + file.name.split('.').pop(),
                    thumbnail: this.getFileThumbnail(category)
                };

                this.files.unshift(newFile);

                if (this.currentUser) {
                    const user = this.users.find(u => u.id === this.currentUser.id);
                    if (user) {
                        user.uploads = (user.uploads || 0) + 1;
                        user.usedStorage = (user.usedStorage || 0) + file.size;
                    }
                }

                this.saveData();
                this.updateStats();
                this.loadFiles();

                // Сброс формы
                document.getElementById('uploadForm').reset();
                document.getElementById('fileInfo').innerHTML = '';
                uploadProgress.style.display = 'none';
                uploadSubmitBtn.disabled = false;
                uploadSubmitBtn.innerHTML = '<i class="fas fa-upload"></i> Начать загрузку';
                progressBar.style.width = '0%';
                progressText.textContent = '0%';

                this.closeAllModals();
                this.showNotification(`Файл "${fileName}" успешно загружен!`, 'success');
            }

            progressBar.style.width = progress + '%';
            progressText.textContent = progress + '%';
        }, 50);
    }

    getFileThumbnail(category) {
        const thumbnails = {
            'documents': '📄',
            'images': '🖼️',
            'audio': '🎵',
            'video': '🎬',
            'archives': '📦',
            'other': '📎'
        };
        return thumbnails[category] || '📎';
    }

    login() {
        const loginInput = document.getElementById('loginInput').value;
        const password = document.getElementById('loginPassword').value;

        const user = this.users.find(u => 
            (u.email === loginInput || u.username === loginInput) && 
            u.password === password
        );

        if (user) {
            this.currentUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role
            };

            this.saveData();
            this.updateUI();
            this.loadUserFiles();
            this.closeAllModals();
            this.showNotification(`Добро пожаловать, ${user.username}!`, 'success');
        } else {
            this.showNotification('Неверные учетные данные', 'error');
        }
    }

    register() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        if (username.length < 3) {
            this.showNotification('Имя пользователя должно содержать минимум 3 символа', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Введите корректный email', 'error');
            return;
        }

        const userExists = this.users.some(u => u.email === email || u.username === username);
        if (userExists) {
            this.showNotification('Пользователь с такими данными уже существует', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password,
            avatar: username.substring(0, 2).toUpperCase(),
            bio: 'Новый пользователь FileShare Pro',
            role: 'user',
            storage: 5368709120, // 5GB
            usedStorage: 0,
            uploads: 0,
            downloads: 0,
            likes: 0,
            joinDate: new Date().toISOString().split('T')[0]
        };

        this.users.push(newUser);
        this.currentUser = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            avatar: newUser.avatar,
            bio: newUser.bio,
            role: newUser.role
        };

        this.saveData();
        this.updateUI();
        this.updateStats();
        this.closeAllModals();
        this.showNotification('Регистрация успешна! Добро пожаловать!', 'success');
    }

    logout() {
        this.currentUser = null;
        this.saveData();
        this.updateUI();
        this.showNotification('Вы вышли из системы', 'success');
    }

    showUploadModal() {
        this.closeAllModals();
        this.elements.uploadModal.classList.add('active');
    }

    showLoginModal() {
        this.closeAllModals();
        this.elements.loginModal.classList.add('active');
    }

    showRegisterModal() {
        this.closeAllModals();
        this.elements.registerModal.classList.add('active');
    }

    showProfileModal() {
        if (!this.currentUser) return;
        
        document.getElementById('editUsername').value = this.currentUser.username;
        document.getElementById('editEmail').value = this.currentUser.email;
        document.getElementById('editBio').value = this.currentUser.bio;
        
        this.closeAllModals();
        this.elements.profileModal.classList.add('active');
    }

    showSettingsModal() {
        // Реализация окна настроек
        this.showNotification('Настройки в разработке', 'info');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.fileShareApp = new FileSharePro();
});
