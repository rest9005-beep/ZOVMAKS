document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных из localStorage
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let files = JSON.parse(localStorage.getItem('files')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [
        {
            id: 1,
            username: 'demo',
            email: 'demo@fileshare.com',
            password: 'demo123',
            bio: 'Демонстрационный пользователь',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
            banner: 'linear-gradient(135deg, #FF6B00, #00D4FF)',
            uploads: 0,
            downloads: 0,
            likes: 0,
            settings: {
                publicProfile: true,
                showEmail: false,
                fileNotifications: true
            }
        }
    ];
    
    // Сохранение данных в localStorage
    function saveData() {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('files', JSON.stringify(files));
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Инициализация интерфейса
    function initUI() {
        updateUserUI();
        updateStats();
        renderFiles();
        
        // Инициализация счетчиков с анимацией
        animateStats();
    }
    
    // Обновление UI пользователя
    function updateUserUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const profileUserName = document.getElementById('profileUserName');
        const profileUserEmail = document.getElementById('profileUserEmail');
        const profileAvatar = document.querySelector('#profileAvatar img');
        
        if (currentUser) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            userProfile.style.display = 'block';
            
            // Обновление данных в профиле
            userName.textContent = currentUser.username;
            profileUserName.textContent = currentUser.username;
            profileUserEmail.textContent = currentUser.email;
            
            if (profileAvatar) {
                profileAvatar.src = currentUser.avatar;
            }
            
            // Обновление аватара в выпадающем меню
            const headerAvatar = document.querySelector('.profile-btn .avatar');
            if (headerAvatar) {
                headerAvatar.src = currentUser.avatar;
            }
            
            // Обновление статистики профиля
            document.getElementById('userUploadsCount').textContent = currentUser.uploads || 0;
            document.getElementById('userDownloadsCount').textContent = currentUser.downloads || 0;
            document.getElementById('userLikesCount').textContent = currentUser.likes || 0;
            
            // Обновление био
            const currentBio = document.getElementById('currentBio');
            if (currentBio && currentUser.bio) {
                currentBio.textContent = currentUser.bio;
            }
        } else {
            loginBtn.style.display = 'flex';
            registerBtn.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }
    
    // Обновление статистики сайта
    function updateStats() {
        const totalUsers = users.length;
        const totalFiles = files.length;
        const totalDownloads = files.reduce((sum, file) => sum + (file.downloads || 0), 0);
        const totalLikes = files.reduce((sum, file) => sum + (file.likes || 0), 0);
        
        document.getElementById('usersCount').textContent = totalUsers;
        document.getElementById('filesCount').textContent = totalFiles;
        document.getElementById('downloadsCount').textContent = totalDownloads;
        document.getElementById('likesCount').textContent = totalLikes;
    }
    
    // Анимация счетчиков
    function animateCounter(elementId, finalValue, duration = 1500) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const increment = Math.max(1, Math.floor((finalValue - startValue) / (duration / 16)));
        let currentValue = startValue;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                element.textContent = finalValue.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString();
            }
        }, 16);
    }
    
    function animateStats() {
        setTimeout(() => {
            const totalUsers = users.length;
            const totalFiles = files.length;
            const totalDownloads = files.reduce((sum, file) => sum + (file.downloads || 0), 0);
            const totalLikes = files.reduce((sum, file) => sum + (file.likes || 0), 0);
            
            animateCounter('usersCount', totalUsers);
            animateCounter('filesCount', totalFiles);
            animateCounter('downloadsCount', totalDownloads);
            animateCounter('likesCount', totalLikes);
        }, 500);
    }
    
    // Рендеринг файлов
    function renderFiles() {
        const filesContainer = document.getElementById('filesContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (files.length === 0) {
            emptyState.style.display = 'block';
            filesContainer.innerHTML = '';
            filesContainer.appendChild(emptyState);
            return;
        }
        
        emptyState.style.display = 'none';
        filesContainer.innerHTML = '';
        
        // Фильтрация по активной категории
        const activeCategory = document.querySelector('.category-filter.active')?.dataset.category || 'all';
        const filteredFiles = activeCategory === 'all' 
            ? files 
            : files.filter(file => file.category === activeCategory);
        
        if (filteredFiles.length === 0) {
            const noFiles = document.createElement('div');
            noFiles.className = 'empty-state';
            noFiles.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>Файлы не найдены</h3>
                <p>Попробуйте выбрать другую категорию</p>
            `;
            filesContainer.appendChild(noFiles);
            return;
        }
        
        filteredFiles.forEach(file => {
            const fileCard = createFileCard(file);
            filesContainer.appendChild(fileCard);
        });
    }
    
    // Создание карточки файла
    function createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.dataset.category = file.category;
        card.dataset.id = file.id;
        
        // Определяем иконку для категории
        let iconClass = 'fas fa-file';
        if (file.category === 'documents') iconClass = 'fas fa-file-pdf';
        if (file.category === 'images') iconClass = 'fas fa-file-image';
        if (file.category === 'music') iconClass = 'fas fa-file-audio';
        if (file.category === 'video') iconClass = 'fas fa-file-video';
        if (file.category === 'archives') iconClass = 'fas fa-file-archive';
        if (file.category === 'software') iconClass = 'fas fa-file-code';
        if (file.category === 'other') iconClass = 'fas fa-file';
        
        // Проверяем, лайкнул ли текущий пользователь этот файл
        const isLiked = currentUser && file.likedBy && file.likedBy.includes(currentUser.id);
        
        // Создаем теги
        const tagsHTML = file.tags ? file.tags.map(tag => 
            `<span class="tag">${tag.trim()}</span>`
        ).join('') : '';
        
        card.innerHTML = `
            <div class="file-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="file-info">
                <h3>${file.name}</h3>
                <p class="file-description">${file.description || 'Без описания'}</p>
                <div class="file-meta">
                    <span class="file-size"><i class="fas fa-weight-hanging"></i> ${file.size}</span>
                    <span class="file-author"><i class="fas fa-user"></i> ${file.author}</span>
                    <span class="file-date"><i class="far fa-calendar"></i> ${file.date}</span>
                </div>
                <div class="file-tags">
                    ${tagsHTML}
                </div>
            </div>
            <div class="file-actions">
                <div class="file-actions-main">
                    <button class="btn-download" data-file-id="${file.id}">
                        <i class="fas fa-download"></i> Скачать
                    </button>
                </div>
                <div class="file-actions-secondary">
                    <button class="btn-like ${isLiked ? 'liked' : ''}" data-file-id="${file.id}">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${file.likes || 0}</span>
                    </button>
                    <span class="download-count">
                        <i class="fas fa-download"></i> ${file.downloads || 0}
                    </span>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Модальные окна
    const modals = {
        login: document.getElementById('loginModal'),
        register: document.getElementById('registerModal'),
        upload: document.getElementById('uploadModal'),
        profile: document.getElementById('profileModal'),
        settings: document.getElementById('settingsModal')
    };
    
    const openModalButtons = {
        login: document.getElementById('loginBtn'),
        register: document.getElementById('registerBtn'),
        upload: document.getElementById('uploadBtn'),
        profile: document.getElementById('viewProfileBtn'),
        settings: document.getElementById('settingsBtn')
    };
    
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Открытие модальных окон
    Object.entries(openModalButtons).forEach(([modalName, button]) => {
        if (button) {
            button.addEventListener('click', (e) => {
                if (e.target.closest('#emptyUploadBtn')) return;
                if (modalName === 'upload' && !currentUser) {
                    showNotification('Для загрузки файлов необходимо войти в аккаунт', 'error');
                    openModal('login');
                    return;
                }
                if (modalName === 'profile' && !currentUser) {
                    showNotification('Для просмотра профиля необходимо войти в аккаунт', 'error');
                    openModal('login');
                    return;
                }
                openModal(modalName);
            });
        }
    });
    
    // Открытие профиля через кнопку в выпадающем меню
    document.getElementById('profileBtn')?.addEventListener('click', () => {
        if (currentUser) {
            openModal('profile');
        }
    });
    
    // Открытие загрузки файла через пустое состояние
    document.getElementById('emptyUploadBtn')?.addEventListener('click', () => {
        if (!currentUser) {
            showNotification('Для загрузки файлов необходимо войти в аккаунт', 'error');
            openModal('login');
            return;
        }
        openModal('upload');
    });
    
    // Закрытие модальных окон
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    function openModal(modalName) {
        const modal = modals[modalName];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Если открываем профиль или настройки, обновляем данные
            if (modalName === 'profile' || modalName === 'settings') {
                updateProfileData();
            }
        }
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Сбрасываем формы
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        // Сбрасываем информацию о файле
        const fileInfo = modal.querySelector('.file-info');
        if (fileInfo) {
            fileInfo.textContent = 'Файл не выбран';
            fileInfo.style.color = 'var(--text-muted)';
        }
    }
    
    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            // Поиск пользователя
            const user = users.find(u => 
                (u.username === username || u.email === username) && 
                u.password === password
            );
            
            if (user) {
                currentUser = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    bio: user.bio,
                    avatar: user.avatar,
                    banner: user.banner,
                    uploads: user.uploads || 0,
                    downloads: user.downloads || 0,
                    likes: user.likes || 0,
                    settings: user.settings || {
                        publicProfile: true,
                        showEmail: false,
                        fileNotifications: true
                    }
                };
                
                saveData();
                updateUserUI();
                showNotification(`Добро пожаловать, ${user.username}!`, 'success');
                closeModal(modals.login);
                loginForm.reset();
            } else {
                showNotification('Неверные имя пользователя или пароль', 'error');
            }
        });
    }
    
    // Обработка формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // Валидация
            if (!username || !email || !password || !confirmPassword) {
                showNotification('Заполните все поля!', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Пароли не совпадают!', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Пароль должен быть не менее 6 символов!', 'error');
                return;
            }
            
            // Проверка существования пользователя
            const userExists = users.some(u => u.username === username || u.email === email);
            if (userExists) {
                showNotification('Пользователь с таким именем или email уже существует', 'error');
                return;
            }
            
            // Создание нового пользователя
            const newUser = {
                id: users.length + 1,
                username,
                email,
                password,
                bio: 'Новый пользователь FileShare',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                banner: 'linear-gradient(135deg, #FF6B00, #00D4FF)',
                uploads: 0,
                downloads: 0,
                likes: 0,
                settings: {
                    publicProfile: true,
                    showEmail: false,
                    fileNotifications: true
                }
            };
            
            users.push(newUser);
            currentUser = {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                bio: newUser.bio,
                avatar: newUser.avatar,
                banner: newUser.banner,
                uploads: 0,
                downloads: 0,
                likes: 0,
                settings: newUser.settings
            };
            
            saveData();
            updateUserUI();
            updateStats();
            showNotification(`Регистрация успешна! Добро пожаловать, ${username}!`, 'success');
            closeModal(modals.register);
            registerForm.reset();
        });
    }
    
    // Обработка формы загрузки файла
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const fileSize = file.size < 1024 * 1024 
                    ? `${(file.size / 1024).toFixed(1)} KB` 
                    : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
                fileInfo.textContent = `${file.name} (${fileSize})`;
                fileInfo.style.color = 'var(--primary-color)';
                
                // Автоматическое заполнение названия
                const fileNameInput = document.getElementById('fileName');
                if (fileNameInput && !fileNameInput.value) {
                    fileNameInput.value = file.name.replace(/\.[^/.]+$/, ""); // Убираем расширение
                }
            }
        });
    }
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                showNotification('Для загрузки файлов необходимо войти в аккаунт', 'error');
                openModal('login');
                return;
            }
            
            const fileName = document.getElementById('fileName').value.trim();
            const fileDescription = document.getElementById('fileDescription').value.trim();
            const fileCategory = document.getElementById('fileCategory').value;
            const fileTags = document.getElementById('fileTags').value;
            const file = fileInput.files[0];
            
            if (!fileName || !fileCategory || !file) {
                showNotification('Заполните обязательные поля: название, категория и файл!', 'error');
                return;
            }
            
            // Создание нового файла
            const fileSize = file.size < 1024 * 1024 
                ? `${(file.size / 1024).toFixed(1)} KB` 
                : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
            
            const newFile = {
                id: files.length + 1,
                name: fileName,
                description: fileDescription,
                category: fileCategory,
                tags: fileTags.split(',').map(tag => tag.trim()).filter(tag => tag),
                size: fileSize,
                author: currentUser.username,
                authorId: currentUser.id,
                date: new Date().toLocaleDateString('ru-RU'),
                downloads: 0,
                likes: 0,
                likedBy: []
            };
            
            files.push(newFile);
            
            // Обновление статистики пользователя
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].uploads = (users[userIndex].uploads || 0) + 1;
                currentUser.uploads = users[userIndex].uploads;
            }
            
            saveData();
            updateUserUI();
            updateStats();
            renderFiles();
            
            showNotification(`Файл "${fileName}" успешно загружен!`, 'success');
            closeModal(modals.upload);
            uploadForm.reset();
            fileInfo.textContent = 'Файл не выбран';
            fileInfo.style.color = 'var(--text-muted)';
        });
    }
    
    // Обработка скачивания файлов
    document.addEventListener('click', function(e) {
        const downloadBtn = e.target.closest('.btn-download');
        if (downloadBtn) {
            e.preventDefault();
            const fileId = parseInt(downloadBtn.dataset.fileId);
            const file = files.find(f => f.id === fileId);
            
            if (!file) return;
            
            if (!currentUser) {
                showNotification('Для скачивания файлов необходимо войти в аккаунт', 'error');
                openModal('login');
                return;
            }
            
            // Имитация скачивания
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Скачивание...';
            downloadBtn.classList.add('downloading');
            downloadBtn.disabled = true;
            
            // Обновление счетчика скачиваний
            file.downloads = (file.downloads || 0) + 1;
            
            // Обновление статистики пользователя
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].downloads = (users[userIndex].downloads || 0) + 1;
                currentUser.downloads = users[userIndex].downloads;
            }
            
            saveData();
            updateUserUI();
            updateStats();
            
            // Обновление UI карточки файла
            const card = downloadBtn.closest('.file-card');
            const downloadCount = card.querySelector('.download-count');
            if (downloadCount) {
                downloadCount.innerHTML = `<i class="fas fa-download"></i> ${file.downloads}`;
            }
            
            setTimeout(() => {
                showNotification(`Файл "${file.name}" успешно скачан!`, 'success');
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Скачан!';
                
                setTimeout(() => {
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Скачать';
                    downloadBtn.classList.remove('downloading');
                    downloadBtn.disabled = false;
                }, 2000);
                
                // Создаем временную ссылку для скачивания
                const blob = new Blob([`Файл: ${file.name}\nОписание: ${file.description}\nКатегория: ${file.category}\nЗагружен: ${file.date}\nАвтор: ${file.author}`], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${file.name}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 1500);
        }
    });
    
    // Обработка лайков
    document.addEventListener('click', function(e) {
        const likeBtn = e.target.closest('.btn-like');
        if (likeBtn) {
            const fileId = parseInt(likeBtn.dataset.fileId);
            const file = files.find(f => f.id === fileId);
            
            if (!file || !currentUser) {
                if (!currentUser) {
                    showNotification('Для оценки файлов необходимо войти в аккаунт', 'error');
                    openModal('login');
                }
                return;
            }
            
            // Инициализация likedBy, если его нет
            if (!file.likedBy) {
                file.likedBy = [];
            }
            
            const userIndex = file.likedBy.indexOf(currentUser.id);
            const isLiked = userIndex !== -1;
            
            if (isLiked) {
                // Убираем лайк
                file.likedBy.splice(userIndex, 1);
                file.likes = Math.max(0, (file.likes || 0) - 1);
                likeBtn.classList.remove('liked');
                
                // Обновление статистики пользователя
                const userObjIndex = users.findIndex(u => u.id === currentUser.id);
                if (userObjIndex !== -1) {
                    users[userObjIndex].likes = Math.max(0, (users[userObjIndex].likes || 0) - 1);
                    currentUser.likes = users[userObjIndex].likes;
                }
            } else {
                // Добавляем лайк
                file.likedBy.push(currentUser.id);
                file.likes = (file.likes || 0) + 1;
                likeBtn.classList.add('liked');
                
                // Обновление статистики пользователя
                const userObjIndex = users.findIndex(u => u.id === currentUser.id);
                if (userObjIndex !== -1) {
                    users[userObjIndex].likes = (users[userObjIndex].likes || 0) + 1;
                    currentUser.likes = users[userObjIndex].likes;
                }
            }
            
            saveData();
            updateUserUI();
            updateStats();
            
            // Обновление счетчика лайков в UI
            const likeCount = likeBtn.querySelector('.like-count');
            if (likeCount) {
                likeCount.textContent = file.likes;
            }
            
            // Анимация лайка
            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 300);
        }
    });
    
    // Фильтрация по категориям
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            categoryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            renderFiles();
        });
    });
    
    // Поиск файлов
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            renderFiles();
            return;
        }
        
        const filesContainer = document.getElementById('filesContainer');
        const filteredFiles = files.filter(file => 
            file.name.toLowerCase().includes(searchTerm) ||
            (file.description && file.description.toLowerCase().includes(searchTerm)) ||
            (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
            file.author.toLowerCase().includes(searchTerm)
        );
        
        filesContainer.innerHTML = '';
        
        if (filteredFiles.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'empty-state';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить поисковый запрос</p>
            `;
            filesContainer.appendChild(noResults);
            return;
        }
        
        filteredFiles.forEach(file => {
            const fileCard = createFileCard(file);
            filesContainer.appendChild(fileCard);
        });
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Обновление данных профиля
    function updateProfileData() {
        if (!currentUser) return;
        
        document.getElementById('profileUserName').textContent = currentUser.username;
        document.getElementById('profileUserEmail').textContent = currentUser.email;
        
        const currentBio = document.getElementById('currentBio');
        if (currentBio) {
            currentBio.textContent = currentUser.bio || 'Расскажите о себе...';
        }
        
        const bioTextarea = document.getElementById('bioTextarea');
        if (bioTextarea) {
            bioTextarea.value = currentUser.bio || '';
        }
        
        const profileAvatar = document.querySelector('#profileAvatar img');
        if (profileAvatar) {
            profileAvatar.src = currentUser.avatar;
        }
        
        const profileBanner = document.getElementById('profileBanner');
        if (profileBanner) {
            profileBanner.style.background = currentUser.banner;
        }
        
        // Обновление статистики профиля
        document.getElementById('userUploadsCount').textContent = currentUser.uploads || 0;
        document.getElementById('userDownloadsCount').textContent = currentUser.downloads || 0;
        document.getElementById('userLikesCount').textContent = currentUser.likes || 0;
        
        // Обновление настроек
        const settingsUsername = document.getElementById('settingsUsername');
        const settingsEmail = document.getElementById('settingsEmail');
        
        if (settingsUsername) settingsUsername.value = currentUser.username;
        if (settingsEmail) settingsEmail.value = currentUser.email;
        
        // Обновление переключателей приватности
        if (currentUser.settings) {
            const publicProfile = document.getElementById('publicProfile');
            const showEmail = document.getElementById('showEmail');
            const fileNotifications = document.getElementById('fileNotifications');
            
            if (publicProfile) publicProfile.checked = currentUser.settings.publicProfile;
            if (showEmail) showEmail.checked = currentUser.settings.showEmail;
            if (fileNotifications) fileNotifications.checked = currentUser.settings.fileNotifications;
        }
    }
    
    // Редактирование био
    const editBioBtn = document.getElementById('editBioBtn');
    const editBioForm = document.getElementById('editBioForm');
    const saveBioBtn = document.getElementById('saveBioBtn');
    const cancelBioBtn = document.getElementById('cancelBioBtn');
    
    if (editBioBtn) {
        editBioBtn.addEventListener('click', () => {
            editBioForm.style.display = 'block';
            editBioBtn.style.display = 'none';
        });
    }
    
    if (saveBioBtn) {
        saveBioBtn.addEventListener('click', () => {
            const bioText = document.getElementById('bioTextarea').value.trim();
            currentUser.bio = bioText || 'Расскажите о себе...';
            
            // Обновление в массиве пользователей
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].bio = currentUser.bio;
            }
            
            saveData();
            updateProfileData();
            
            editBioForm.style.display = 'none';
            editBioBtn.style.display = 'inline-flex';
            showNotification('Информация о себе обновлена', 'success');
        });
    }
    
    if (cancelBioBtn) {
        cancelBioBtn.addEventListener('click', () => {
            editBioForm.style.display = 'none';
            editBioBtn.style.display = 'inline-flex';
            document.getElementById('bioTextarea').value = currentUser.bio || '';
        });
    }
    
    // Смена аватара
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            const newAvatarSeed = Math.random().toString(36).substring(7);
            const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newAvatarSeed}`;
            
            currentUser.avatar = newAvatarUrl;
            
            // Обновление в массиве пользователей
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].avatar = newAvatarUrl;
            }
            
            saveData();
            updateProfileData();
            updateUserUI();
            
            showNotification('Аватар обновлен', 'success');
        });
    }
    
    // Смена баннера
    const changeBannerBtn = document.getElementById('changeBannerBtn');
    if (changeBannerBtn) {
        changeBannerBtn.addEventListener('click', () => {
            const gradients = [
                'linear-gradient(135deg, #FF6B00, #00D4FF)',
                'linear-gradient(135deg, #667eea, #764ba2)',
                'linear-gradient(135deg, #f093fb, #f5576c)',
                'linear-gradient(135deg, #4facfe, #00f2fe)',
                'linear-gradient(135deg, #43e97b, #38f9d7)',
                'linear-gradient(135deg, #fa709a, #fee140)'
            ];
            
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            currentUser.banner = randomGradient;
            
            // Обновление в массиве пользователей
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].banner = randomGradient;
            }
            
            saveData();
            updateProfileData();
            
            showNotification('Баннер обновлен', 'success');
        });
    }
    
    // Обработка формы настроек аккаунта
    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newUsername = document.getElementById('settingsUsername').value.trim();
            const newEmail = document.getElementById('settingsEmail').value.trim();
            
            if (!newUsername || !newEmail) {
                showNotification('Заполните все поля', 'error');
                return;
            }
            
            // Проверка уникальности имени пользователя и email
            const usernameExists = users.some(u => 
                u.id !== currentUser.id && u.username === newUsername
            );
            const emailExists = users.some(u => 
                u.id !== currentUser.id && u.email === newEmail
            );
            
            if (usernameExists) {
                showNotification('Это имя пользователя уже занято', 'error');
                return;
            }
            
            if (emailExists) {
                showNotification('Этот email уже используется', 'error');
                return;
            }
            
            // Обновление данных
            currentUser.username = newUsername;
            currentUser.email = newEmail;
            
            // Обновление в массиве пользователей
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].username = newUsername;
                users[userIndex].email = newEmail;
            }
            
            saveData();
            updateUserUI();
            updateProfileData();
            
            showNotification('Данные аккаунта обновлены', 'success');
        });
    }
    
    // Обработка формы смены пароля
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            // Валидация
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                showNotification('Заполните все поля', 'error');
                return;
            }
            
            // Проверка текущего пароля
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex === -1 || users[userIndex].password !== currentPassword) {
                showNotification('Текущий пароль неверен', 'error');
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                showNotification('Новые пароли не совпадают', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('Новый пароль должен быть не менее 6 символов', 'error');
                return;
            }
            
            if (newPassword === currentPassword) {
                showNotification('Новый пароль должен отличаться от текущего', 'error');
                return;
            }
            
            // Обновление пароля
            users[userIndex].password = newPassword;
            saveData();
            
            showNotification('Пароль успешно изменен', 'success');
            passwordForm.reset();
        });
    }
    
    // Обработка переключателей приватности
    const privacySwitches = ['publicProfile', 'showEmail', 'fileNotifications'];
    privacySwitches.forEach(switchId => {
        const element = document.getElementById(switchId);
        if (element) {
            element.addEventListener('change', function() {
                if (!currentUser.settings) {
                    currentUser.settings = {
                        publicProfile: true,
                        showEmail: false,
                        fileNotifications: true
                    };
                }
                
                currentUser.settings[switchId] = this.checked;
                
                // Обновление в массиве пользователей
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    if (!users[userIndex].settings) {
                        users[userIndex].settings = currentUser.settings;
                    } else {
                        users[userIndex].settings[switchId] = this.checked;
                    }
                }
                
                saveData();
                showNotification('Настройки приватности обновлены', 'success');
            });
        }
    });
    
    // Переключение вкладок настроек
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsPanes = document.querySelectorAll('.settings-pane');
    
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Обновление активной вкладки
            settingsTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Показ соответствующей панели
            settingsPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `${tabName}Tab`) {
                    pane.classList.add('active');
                }
            });
        });
    });
    
    // Выход из аккаунта
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentUser = null;
            saveData();
            updateUserUI();
            showNotification('Вы вышли из аккаунта', 'success');
            closeModal(modals.profile);
            closeModal(modals.settings);
        });
    }
    
    // Кнопка "Загрузить еще"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.style.display = 'none';
            loadingIndicator.classList.add('active');
            
            // Имитация загрузки
            setTimeout(() => {
                loadingIndicator.classList.remove('active');
                this.style.display = 'inline-flex';
                showNotification('Больше файлов пока нет', 'info');
            }, 1500);
        });
    }
    
    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        // Удаляем предыдущее уведомление
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, 5000);
    }
    
    // Инициализация при загрузке
    initUI();
    console.log('FileShare загружен и готов к работе!');
});
