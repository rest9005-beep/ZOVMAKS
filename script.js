document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let files = JSON.parse(localStorage.getItem('files')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let categories = ['documents', 'images', 'audio', 'video', 'archives', 'software', 'other'];
    
    // DOM элементы
    const elements = {
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        uploadBtn: document.getElementById('uploadBtn'),
        userProfile: document.getElementById('userProfile'),
        userName: document.getElementById('userName'),
        filesContainer: document.getElementById('filesContainer'),
        usersCount: document.getElementById('usersCount'),
        filesCount: document.getElementById('filesCount'),
        downloadsCount: document.getElementById('downloadsCount'),
        heroUploadBtn: document.getElementById('heroUploadBtn'),
        exploreBtn: document.getElementById('exploreBtn'),
        loadMoreBtn: document.getElementById('loadMoreBtn')
    };
    
    // Модальные окна
    const modals = {
        login: document.getElementById('loginModal'),
        register: document.getElementById('registerModal'),
        upload: document.getElementById('uploadModal'),
        profile: document.getElementById('profileModal'),
        settings: document.getElementById('settingsModal')
    };
    
    // Инициализация
    initApp();
    
    function initApp() {
        updateUI();
        renderFiles();
        setupEventListeners();
        updateStats();
        
        // Если есть демо-пользователь, авторизуем его
        if (!currentUser && users.length === 0) {
            createDemoUser();
        }
    }
    
    function createDemoUser() {
        const demoUser = {
            id: 1,
            username: 'demo',
            email: 'demo@fileshare.com',
            password: 'demo123',
            bio: 'Демонстрационный пользователь',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
            banner: 'linear-gradient(135deg, #4361ee, #f72585)',
            uploads: 0,
            downloads: 0,
            likes: 0,
            createdAt: new Date().toISOString()
        };
        
        users.push(demoUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    function updateUI() {
        if (currentUser) {
            elements.loginBtn.style.display = 'none';
            elements.registerBtn.style.display = 'none';
            elements.uploadBtn.style.display = 'flex';
            elements.userProfile.style.display = 'block';
            elements.userName.textContent = currentUser.username;
            
            // Обновляем аватар
            const avatarElements = document.querySelectorAll('.avatar');
            avatarElements.forEach(el => {
                if (el.tagName === 'IMG') {
                    el.src = currentUser.avatar;
                }
            });
        } else {
            elements.loginBtn.style.display = 'flex';
            elements.registerBtn.style.display = 'flex';
            elements.uploadBtn.style.display = 'none';
            elements.userProfile.style.display = 'none';
        }
    }
    
    function updateStats() {
        elements.usersCount.textContent = users.length;
        elements.filesCount.textContent = files.length;
        const totalDownloads = files.reduce((sum, file) => sum + (file.downloads || 0), 0);
        elements.downloadsCount.textContent = totalDownloads;
        
        // Анимация чисел
        animateNumber(elements.usersCount, users.length);
        animateNumber(elements.filesCount, files.length);
        animateNumber(elements.downloadsCount, totalDownloads);
    }
    
    function animateNumber(element, target) {
        let current = parseInt(element.textContent) || 0;
        const increment = Math.ceil((target - current) / 50);
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = current;
        }, 20);
    }
    
    function renderFiles(filteredFiles = files) {
        elements.filesContainer.innerHTML = '';
        
        if (filteredFiles.length === 0) {
            elements.filesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Файлы не найдены</h3>
                    <p>Будьте первым, кто загрузит файл!</p>
                    <button class="btn btn-primary" id="emptyUploadBtn">
                        <i class="fas fa-cloud-upload-alt"></i> Загрузить файл
                    </button>
                </div>
            `;
            
            document.getElementById('emptyUploadBtn')?.addEventListener('click', () => {
                if (!currentUser) {
                    showNotification('Для загрузки файлов необходимо войти в систему', 'error');
                    openModal('login');
                } else {
                    openModal('upload');
                }
            });
            
            return;
        }
        
        filteredFiles.forEach(file => {
            const fileCard = createFileCard(file);
            elements.filesContainer.appendChild(fileCard);
        });
    }
    
    function createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.dataset.id = file.id;
        
        // Определяем иконку по типу файла
        let iconClass = 'fas fa-file';
        let fileType = getFileType(file.name);
        
        switch(fileType) {
            case 'pdf': iconClass = 'fas fa-file-pdf'; break;
            case 'image': iconClass = 'fas fa-file-image'; break;
            case 'audio': iconClass = 'fas fa-file-audio'; break;
            case 'video': iconClass = 'fas fa-file-video'; break;
            case 'archive': iconClass = 'fas fa-file-archive'; break;
            case 'code': iconClass = 'fas fa-file-code'; break;
            case 'word': iconClass = 'fas fa-file-word'; break;
            case 'excel': iconClass = 'fas fa-file-excel'; break;
            case 'powerpoint': iconClass = 'fas fa-file-powerpoint'; break;
        }
        
        // Проверяем лайк текущего пользователя
        const isLiked = currentUser && file.likes && file.likes.includes(currentUser.id);
        
        card.innerHTML = `
            <div class="file-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="file-info">
                <h3>${file.name}</h3>
                <p class="file-description">${file.description || 'Без описания'}</p>
                <div class="file-meta">
                    <span><i class="fas fa-weight-hanging"></i> ${formatFileSize(file.size)}</span>
                    <span><i class="fas fa-user"></i> ${file.author}</span>
                    <span><i class="far fa-calendar"></i> ${new Date(file.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div class="file-tags">
                    ${file.tags ? file.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
            <div class="file-actions">
                <button class="download-btn" data-file-id="${file.id}">
                    <i class="fas fa-download"></i> Скачать (${file.downloads || 0})
                </button>
                <button class="like-btn ${isLiked ? 'liked' : ''}" data-file-id="${file.id}">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${file.likes ? file.likes.length : 0}</span>
                </button>
            </div>
        `;
        
        return card;
    }
    
    function getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
        const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
        const codeExts = ['js', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php'];
        
        if (imageExts.includes(ext)) return 'image';
        if (audioExts.includes(ext)) return 'audio';
        if (videoExts.includes(ext)) return 'video';
        if (archiveExts.includes(ext)) return 'archive';
        if (codeExts.includes(ext)) return 'code';
        if (ext === 'pdf') return 'pdf';
        if (ext === 'doc' || ext === 'docx') return 'word';
        if (ext === 'xls' || ext === 'xlsx') return 'excel';
        if (ext === 'ppt' || ext === 'pptx') return 'powerpoint';
        return 'other';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Реальное скачивание файлов
    function downloadFile(fileId) {
        const file = files.find(f => f.id === fileId);
        if (!file) {
            showNotification('Файл не найден', 'error');
            return;
        }
        
        if (!currentUser) {
            showNotification('Для скачивания файлов необходимо войти в систему', 'error');
            openModal('login');
            return;
        }
        
        const downloadBtn = document.querySelector(`.download-btn[data-file-id="${fileId}"]`);
        if (downloadBtn) {
            downloadBtn.classList.add('downloading');
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Скачивание...';
            downloadBtn.disabled = true;
        }
        
        // Имитация загрузки (в реальном приложении здесь был бы запрос к серверу)
        setTimeout(() => {
            // Создаем реальный файл для скачивания
            let blobContent;
            let mimeType = 'application/octet-stream';
            
            // В зависимости от типа файла создаем соответствующее содержимое
            switch(getFileType(file.name)) {
                case 'pdf':
                    mimeType = 'application/pdf';
                    blobContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(FileShare - ' + file.name + ') Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n0000000172 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n235\n%%EOF';
                    break;
                case 'image':
                    mimeType = 'image/png';
                    // Создаем простую картинку с текстом
                    const canvas = document.createElement('canvas');
                    canvas.width = 400;
                    canvas.height = 300;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#4361ee';
                    ctx.fillRect(0, 0, 400, 300);
                    ctx.fillStyle = 'white';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('FileShare', 200, 120);
                    ctx.fillText(file.name, 200, 160);
                    ctx.fillText('Создано с помощью FileShare', 200, 200);
                    blobContent = canvas.toDataURL('image/png').split(',')[1];
                    break;
                case 'text':
                default:
                    mimeType = 'text/plain';
                    blobContent = `FileShare - ${file.name}\n\nОписание: ${file.description || 'Нет описания'}\nАвтор: ${file.author}\nДата загрузки: ${new Date(file.uploadedAt).toLocaleString()}\nРазмер: ${formatFileSize(file.size)}\n\nСпасибо за использование FileShare!`;
                    break;
            }
            
            // Создаем Blob и скачиваем
            let blob;
            if (mimeType === 'image/png') {
                // Для PNG нужно декодировать base64
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
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Обновляем статистику
            file.downloads = (file.downloads || 0) + 1;
            
            // Обновляем статистику пользователя
            if (currentUser) {
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].downloads = (users[userIndex].downloads || 0) + 1;
                    currentUser.downloads = users[userIndex].downloads;
                }
            }
            
            // Сохраняем изменения
            saveData();
            updateStats();
            
            // Обновляем кнопку
            if (downloadBtn) {
                setTimeout(() => {
                    downloadBtn.classList.remove('downloading');
                    downloadBtn.innerHTML = `<i class="fas fa-download"></i> Скачать (${file.downloads})`;
                    downloadBtn.disabled = false;
                }, 500);
            }
            
            showNotification(`Файл "${file.name}" успешно скачан!`, 'success');
            
        }, 1500); // Имитация задержки скачивания
    }
    
    // Лайки
    function toggleLike(fileId) {
        if (!currentUser) {
            showNotification('Для оценки файлов необходимо войти в систему', 'error');
            openModal('login');
            return;
        }
        
        const file = files.find(f => f.id === fileId);
        if (!file) return;
        
        if (!file.likes) file.likes = [];
        
        const likeIndex = file.likes.indexOf(currentUser.id);
        const isLiked = likeIndex !== -1;
        
        if (isLiked) {
            // Убираем лайк
            file.likes.splice(likeIndex, 1);
        } else {
            // Добавляем лайк
            file.likes.push(currentUser.id);
        }
        
        // Сохраняем изменения
        saveData();
        
        // Обновляем UI
        const likeBtn = document.querySelector(`.like-btn[data-file-id="${fileId}"]`);
        const likeCount = likeBtn.querySelector('.like-count');
        
        if (isLiked) {
            likeBtn.classList.remove('liked');
        } else {
            likeBtn.classList.add('liked');
            // Анимация лайка
            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 300);
        }
        
        likeCount.textContent = file.likes.length;
        
        // Обновляем статистику пользователя
        if (currentUser) {
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].likes = (users[userIndex].likes || 0) + (isLiked ? -1 : 1);
                currentUser.likes = users[userIndex].likes;
            }
        }
    }
    
    // Загрузка файлов
    function uploadFile(fileData) {
        if (!currentUser) return;
        
        const newFile = {
            id: Date.now(),
            name: fileData.name,
            description: fileData.description,
            category: fileData.category,
            size: fileData.size,
            author: currentUser.username,
            authorId: currentUser.id,
            uploadedAt: new Date().toISOString(),
            downloads: 0,
            likes: [],
            tags: fileData.tags || []
        };
        
        files.unshift(newFile);
        
        // Обновляем статистику пользователя
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].uploads = (users[userIndex].uploads || 0) + 1;
            currentUser.uploads = users[userIndex].uploads;
        }
        
        saveData();
        updateStats();
        renderFiles();
        
        showNotification(`Файл "${fileData.name}" успешно загружен!`, 'success');
    }
    
    function saveData() {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('files', JSON.stringify(files));
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Уведомления
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Модальные окна
    function openModal(modalName) {
        const modal = modals[modalName];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Настройка обработчиков событий
    function setupEventListeners() {
        // Кнопки открытия модальных окон
        elements.loginBtn.addEventListener('click', () => openModal('login'));
        elements.registerBtn.addEventListener('click', () => openModal('register'));
        elements.uploadBtn.addEventListener('click', () => {
            if (!currentUser) {
                showNotification('Для загрузки файлов необходимо войти в систему', 'error');
                openModal('login');
            } else {
                openModal('upload');
            }
        });
        elements.heroUploadBtn.addEventListener('click', () => {
            if (!currentUser) {
                showNotification('Для загрузки файлов необходимо войти в систему', 'error');
                openModal('login');
            } else {
                openModal('upload');
            }
        });
        
        // Профиль
        document.getElementById('profileBtn')?.addEventListener('click', () => {
            if (currentUser) {
                openModal('profile');
                updateProfileModal();
            }
        });
        
        document.getElementById('viewProfileBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                openModal('profile');
                updateProfileModal();
            }
        });
        
        document.getElementById('settingsBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                openModal('settings');
            }
        });
        
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            currentUser = null;
            saveData();
            updateUI();
            showNotification('Вы вышли из системы', 'success');
            closeModal(modals.profile);
        });
        
        // Закрытие модальных окон
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Клик вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModal(e.target);
            }
        });
        
        // Форма входа
        document.getElementById('loginForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
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
                    likes: user.likes || 0
                };
                
                saveData();
                updateUI();
                showNotification(`Добро пожаловать, ${user.username}!`, 'success');
                closeModal(modals.login);
                this.reset();
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
                banner: 'linear-gradient(135deg, #4361ee, #f72585)',
                uploads: 0,
                downloads: 0,
                likes: 0,
                createdAt: new Date().toISOString()
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
                likes: 0
            };
            
            saveData();
            updateUI();
            updateStats();
            showNotification('Регистрация успешна!', 'success');
            closeModal(modals.register);
            this.reset();
        });
        
        // Форма загрузки файла
        document.getElementById('uploadForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                showNotification('Для загрузки файлов необходимо войти в систему', 'error');
                return;
            }
            
            const fileName = document.getElementById('fileName').value;
            const fileDescription = document.getElementById('fileDescription').value;
            const fileCategory = document.getElementById('fileCategory').value;
            const fileInput = document.getElementById('fileInput');
            
            if (!fileName || !fileCategory || !fileInput.files[0]) {
                showNotification('Заполните все обязательные поля', 'error');
                return;
            }
            
            const file = fileInput.files[0];
            const maxSize = 100 * 1024 * 1024; // 100MB
            
            if (file.size > maxSize) {
                showNotification('Файл слишком большой. Максимальный размер: 100MB', 'error');
                return;
            }
            
            // Показываем прогресс загрузки
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const uploadProgress = document.getElementById('uploadProgress');
            const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
            
            uploadProgress.style.display = 'block';
            uploadSubmitBtn.disabled = true;
            
            // Имитация загрузки с прогрессом
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                    
                    // Загружаем файл
                    uploadFile({
                        name: fileName,
                        description: fileDescription,
                        category: fileCategory,
                        size: file.size,
                        tags: []
                    });
                    
                    // Сбрасываем форму
                    this.reset();
                    uploadProgress.style.display = 'none';
                    uploadSubmitBtn.disabled = false;
                    closeModal(modals.upload);
                    
                    // Сбрасываем прогресс
                    setTimeout(() => {
                        progressFill.style.width = '0%';
                        progressText.textContent = '0%';
                    }, 500);
                }
                
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            }, 100);
        });
        
        // Drag and drop для загрузки файлов
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#4361ee';
                uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = '';
                uploadArea.style.backgroundColor = '';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '';
                uploadArea.style.backgroundColor = '';
                
                const fileInput = document.getElementById('fileInput');
                if (e.dataTransfer.files.length > 0) {
                    fileInput.files = e.dataTransfer.files;
                    const file = fileInput.files[0];
                    document.getElementById('fileInfo').textContent = 
                        `Выбран файл: ${file.name} (${formatFileSize(file.size)})`;
                    
                    // Автозаполнение названия
                    const fileNameInput = document.getElementById('fileName');
                    if (!fileNameInput.value) {
                        fileNameInput.value = file.name.replace(/\.[^/.]+$/, "");
                    }
                }
            });
        }
        
        // Выбор файла через кнопку
        document.getElementById('fileInput')?.addEventListener('change', function() {
            if (this.files[0]) {
                const file = this.files[0];
                document.getElementById('fileInfo').textContent = 
                    `Выбран файл: ${file.name} (${formatFileSize(file.size)})`;
                
                // Автозаполнение названия
                const fileNameInput = document.getElementById('fileName');
                if (!fileNameInput.value) {
                    fileNameInput.value = file.name.replace(/\.[^/.]+$/, "");
                }
            }
        });
        
        // Категории
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function() {
                const category = this.dataset.category;
                const filteredFiles = files.filter(f => f.category === category);
                renderFiles(filteredFiles);
                
                // Подсветка активной категории
                document.querySelectorAll('.category-card').forEach(c => {
                    c.style.borderColor = '';
                });
                this.style.borderColor = '#4361ee';
            });
        });
        
        // Поиск
        document.getElementById('searchBtn')?.addEventListener('click', performSearch);
        document.getElementById('searchInput')?.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        function performSearch() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            if (!query) {
                renderFiles();
                return;
            }
            
            const filteredFiles = files.filter(file => 
                file.name.toLowerCase().includes(query) ||
                file.description.toLowerCase().includes(query) ||
                file.author.toLowerCase().includes(query)
            );
            
            renderFiles(filteredFiles);
        }
        
        // Кнопка "Показать еще"
        elements.loadMoreBtn?.addEventListener('click', () => {
            showNotification('Все файлы загружены', 'info');
        });
        
        // Обработка кликов на файлы (делегирование)
        elements.filesContainer.addEventListener('click', function(e) {
            const downloadBtn = e.target.closest('.download-btn');
            if (downloadBtn) {
                const fileId = parseInt(downloadBtn.dataset.fileId);
                downloadFile(fileId);
                return;
            }
            
            const likeBtn = e.target.closest('.like-btn');
            if (likeBtn) {
                const fileId = parseInt(likeBtn.dataset.fileId);
                toggleLike(fileId);
                return;
            }
        });
        
        // Профиль: редактирование био
        document.getElementById('editBioBtn')?.addEventListener('click', function() {
            document.getElementById('editBioForm').style.display = 'block';
            this.style.display = 'none';
            document.getElementById('bioTextarea').value = 
                document.getElementById('currentBio').textContent;
        });
        
        document.getElementById('saveBioBtn')?.addEventListener('click', function() {
            const newBio = document.getElementById('bioTextarea').value;
            document.getElementById('currentBio').textContent = newBio;
            document.getElementById('editBioForm').style.display = 'none';
            document.getElementById('editBioBtn').style.display = 'flex';
            
            if (currentUser) {
                currentUser.bio = newBio;
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].bio = newBio;
                    saveData();
                }
            }
            
            showNotification('Информация обновлена', 'success');
        });
        
        document.getElementById('cancelBioBtn')?.addEventListener('click', function() {
            document.getElementById('editBioForm').style.display = 'none';
            document.getElementById('editBioBtn').style.display = 'flex';
        });
        
        // Смена аватара
        document.getElementById('changeAvatarBtn')?.addEventListener('click', function() {
            const newSeed = Math.random().toString(36).substring(7);
            const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`;
            
            document.querySelector('#profileAvatar img').src = newAvatar;
            document.querySelectorAll('.avatar').forEach(img => {
                if (img.tagName === 'IMG') {
                    img.src = newAvatar;
                }
            });
            
            if (currentUser) {
                currentUser.avatar = newAvatar;
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].avatar = newAvatar;
                    saveData();
                }
            }
            
            showNotification('Аватар обновлен', 'success');
        });
        
        // Смена баннера
        document.getElementById('changeBannerBtn')?.addEventListener('click', function() {
            const gradients = [
                'linear-gradient(135deg, #4361ee, #f72585)',
                'linear-gradient(135deg, #7209b7, #3a0ca3)',
                'linear-gradient(135deg, #f72585, #4cc9f0)',
                'linear-gradient(135deg, #4cc9f0, #4361ee)',
                'linear-gradient(135deg, #ff9e00, #ef233c)'
            ];
            
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            document.getElementById('profileBanner').style.background = randomGradient;
            
            if (currentUser) {
                currentUser.banner = randomGradient;
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].banner = randomGradient;
                    saveData();
                }
            }
            
            showNotification('Баннер обновлен', 'success');
        });
        
        // Настройки: смена пароля
        document.getElementById('passwordForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            if (!currentUser) {
                showNotification('Ошибка авторизации', 'error');
                return;
            }
            
            // Проверка текущего пароля
            const user = users.find(u => u.id === currentUser.id);
            if (!user || user.password !== currentPassword) {
                showNotification('Текущий пароль неверен', 'error');
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                showNotification('Новые пароли не совпадают', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('Новый пароль должен содержать минимум 6 символов', 'error');
                return;
            }
            
            // Обновление пароля
            user.password = newPassword;
            saveData();
            
            showNotification('Пароль успешно изменен', 'success');
            this.reset();
        });
        
        // Настройки: переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                // Обновляем активные вкладки
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabName + 'Tab').classList.add('active');
            });
        });
    }
    
    function updateProfileModal() {
        if (!currentUser) return;
        
        document.getElementById('profileUserName').textContent = currentUser.username;
        document.getElementById('profileUserEmail').textContent = currentUser.email;
        document.getElementById('currentBio').textContent = currentUser.bio || 'Пока нет информации о себе';
        
        const profileAvatar = document.querySelector('#profileAvatar img');
        if (profileAvatar) {
            profileAvatar.src = currentUser.avatar;
        }
        
        const profileBanner = document.getElementById('profileBanner');
        if (profileBanner) {
            profileBanner.style.background = currentUser.banner;
        }
        
        // Обновление статистики
        document.getElementById('userUploadsCount').textContent = currentUser.uploads || 0;
        document.getElementById('userDownloadsCount').textContent = currentUser.downloads || 0;
        document.getElementById('userLikesCount').textContent = currentUser.likes || 0;
    }
    
    // Создаем несколько демо-файлов при первом запуске
    if (files.length === 0) {
        const demoFiles = [
            {
                id: 1,
                name: 'Презентация проекта.pdf',
                description: 'Подробная презентация нового IT-проекта',
                category: 'documents',
                size: 4500000,
                author: 'admin',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 42,
                likes: [1],
                tags: ['работа', 'презентация', 'проект']
            },
            {
                id: 2,
                name: 'Градиенты для дизайна.jpg',
                description: 'Коллекция красивых градиентов для веб-дизайна',
                category: 'images',
                size: 2500000,
                author: 'admin',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 28,
                likes: [1],
                tags: ['дизайн', 'градиент', 'фон']
            },
            {
                id: 3,
                name: 'Музыка для видео.mp3',
                description: 'Фоновая музыка для видеороликов',
                category: 'audio',
                size: 8500000,
                author: 'admin',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 15,
                likes: [],
                tags: ['музыка', 'аудио', 'фон']
            }
        ];
        
        files = demoFiles;
        saveData();
    }
});
