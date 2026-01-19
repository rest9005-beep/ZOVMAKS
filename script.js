document.addEventListener('DOMContentLoaded', function() {
    // Инициализация данных
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let files = JSON.parse(localStorage.getItem('files')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let categories = ['documents', 'images', 'audio', 'video', 'archives', 'software', 'other'];
    let currentFilter = 'all';
    let currentSort = 'newest';
    let viewMode = 'grid';
    let userSettings = JSON.parse(localStorage.getItem('userSettings')) || {
        theme: 'dark',
        fontSize: 'medium',
        notifyDownloads: true,
        notifyLikes: true
    };
    
    // DOM элементы
    const elements = {
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        uploadBtn: document.getElementById('uploadBtn'),
        userProfile: document.getElementById('userProfile'),
        userName: document.getElementById('userName'),
        avatarContainer: document.getElementById('avatarContainer'),
        filesContainer: document.getElementById('filesContainer'),
        usersCount: document.getElementById('usersCount'),
        filesCount: document.getElementById('filesCount'),
        downloadsCount: document.getElementById('downloadsCount'),
        heroUploadBtn: document.getElementById('heroUploadBtn'),
        exploreBtn: document.getElementById('exploreBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        themeToggle: document.getElementById('themeToggle'),
        footerThemeSelect: document.getElementById('footerThemeSelect'),
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        sortSelect: document.getElementById('sortSelect')
    };
    
    // Модальные окна
    const modals = {
        login: document.getElementById('loginModal'),
        register: document.getElementById('registerModal'),
        upload: document.getElementById('uploadModal'),
        profile: document.getElementById('profileModal'),
        stats: document.getElementById('statsModal'),
        settings: document.getElementById('settingsModal')
    };
    
    // Инициализация
    initApp();
    
    function initApp() {
        loadTheme();
        loadSettings();
        updateUI();
        renderFiles();
        setupEventListeners();
        updateStats();
        updateCategoryCounts();
        
        // Если есть демо-пользователь, авторизуем его
        if (!currentUser && users.length === 0) {
            createDemoUser();
        }
    }
    
    function loadTheme() {
        const savedTheme = userSettings.theme || 'dark';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'auto') {
            document.body.className = prefersDark ? 'dark-theme' : 'light-theme';
        } else {
            document.body.className = savedTheme + '-theme';
        }
        
        updateThemeIcon();
        if (elements.footerThemeSelect) {
            elements.footerThemeSelect.value = savedTheme;
        }
        if (document.getElementById('themeSelect')) {
            document.getElementById('themeSelect').value = savedTheme;
        }
    }
    
    function loadSettings() {
        // Применяем настройки шрифта
        const fontSize = userSettings.fontSize || 'medium';
        document.body.style.fontSize = fontSize === 'small' ? '14px' : 
                                      fontSize === 'large' ? '18px' : '16px';
        
        // Применяем другие настройки
        if (document.getElementById('fontSize')) {
            document.getElementById('fontSize').value = fontSize;
        }
        if (document.getElementById('notifyDownloads')) {
            document.getElementById('notifyDownloads').checked = userSettings.notifyDownloads;
        }
        if (document.getElementById('notifyLikes')) {
            document.getElementById('notifyLikes').checked = userSettings.notifyLikes;
        }
    }
    
    function generateAvatar(name) {
        if (!name) return 'U';
        const words = name.split(' ');
        let initials = '';
        
        if (words.length >= 2) {
            initials = words[0].charAt(0) + words[1].charAt(0);
        } else {
            initials = name.substring(0, 2);
        }
        
        return initials.toUpperCase();
    }
    
    function updateAvatar() {
        if (currentUser) {
            const avatarText = generateAvatar(currentUser.username);
            const avatarElements = document.querySelectorAll('.avatar, .avatar-large');
            avatarElements.forEach(el => {
                el.textContent = avatarText;
                
                // Генерация цвета на основе имени
                const colors = [
                    '#4361ee', '#7209b7', '#f72585', '#4cc9f0', 
                    '#06d6a0', '#ff9e00', '#ef233c', '#8338ec'
                ];
                const colorIndex = currentUser.username.length % colors.length;
                el.style.background = colors[colorIndex];
            });
        }
    }
    
    function updateThemeIcon() {
        const themeIcon = elements.themeToggle?.querySelector('i');
        if (themeIcon) {
            themeIcon.className = document.body.classList.contains('dark-theme') ? 
                'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    function createDemoUser() {
        const demoUser = {
            id: 1,
            username: 'Demo User',
            email: 'demo@fileshare.com',
            password: 'demo123',
            bio: 'Демонстрационный пользователь FileShare',
            uploads: 5,
            downloads: 85,
            likes: 42,
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
            
            updateAvatar();
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
    
    function updateCategoryCounts() {
        categories.forEach(category => {
            const count = files.filter(file => file.category === category).length;
            const element = document.getElementById(`count-${category}`);
            if (element) {
                element.textContent = count;
            }
        });
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
    
    function renderFiles(filteredFiles = null) {
        let filesToRender = filteredFiles || files;
        
        // Применяем фильтр
        filesToRender = applyFilter(filesToRender, currentFilter);
        
        // Применяем сортировку
        filesToRender = applySort(filesToRender, currentSort);
        
        elements.filesContainer.innerHTML = '';
        
        if (filesToRender.length === 0) {
            elements.filesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Файлы не найдены</h3>
                    <p>Попробуйте изменить параметры поиска или фильтрации</p>
                    <button class="btn btn-primary" id="emptyUploadBtn">
                        <i class="fas fa-cloud-upload-alt"></i> Загрузить первый файл
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
        
        filesToRender.forEach(file => {
            const fileCard = createFileCard(file);
            elements.filesContainer.appendChild(fileCard);
        });
        
        // Применяем режим просмотра
        elements.filesContainer.className = `files-grid ${viewMode}-view`;
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
                if (!currentUser) return [];
                return filesList.filter(file => file.authorId === currentUser.id);
            default:
                return filesList;
        }
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
        card.className = 'file-card';
        card.dataset.id = file.id;
        
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
        
        const isLiked = currentUser && file.likes && file.likes.includes(currentUser.id);
        const tags = file.tags || [];
        
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
                    <span><i class="far fa-calendar"></i> ${new Date(file.uploadedAt).toLocaleDateString('ru-RU')}</span>
                    <span><i class="fas fa-folder"></i> ${getCategoryName(file.category)}</span>
                </div>
                ${tags.length > 0 ? `
                <div class="file-tags">
                    ${tags.map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                </div>
                ` : ''}
            </div>
            <div class="file-actions">
                <button class="download-btn" data-file-id="${file.id}">
                    <i class="fas fa-download"></i> Скачать (${file.downloads || 0})
                </button>
                <button class="like-btn ${isLiked ? 'liked' : ''}" data-file-id="${file.id}">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${file.likes ? file.likes.length : 0}</span>
                </button>
                ${currentUser && file.authorId === currentUser.id ? `
                <button class="delete-btn" data-file-id="${file.id}">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </div>
        `;
        
        return card;
    }
    
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
        
        setTimeout(() => {
            let blobContent;
            let mimeType = 'application/octet-stream';
            let filename = file.name;
            
            switch(getFileType(file.name)) {
                case 'pdf':
                    mimeType = 'application/pdf';
                    blobContent = `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(FileShare - ${file.name}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n0000000172 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n235\n%%EOF`;
                    break;
                case 'image':
                    mimeType = 'image/png';
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
                    filename = file.name.endsWith('.png') ? file.name : file.name + '.png';
                    break;
                case 'text':
                default:
                    mimeType = 'text/plain';
                    blobContent = `FileShare - ${file.name}\n\nОписание: ${file.description || 'Нет описания'}\nАвтор: ${file.author}\nДата загрузки: ${new Date(file.uploadedAt).toLocaleString('ru-RU')}\nРазмер: ${formatFileSize(file.size)}\n\nСпасибо за использование FileShare!`;
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
            
            file.downloads = (file.downloads || 0) + 1;
            
            if (currentUser) {
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].downloads = (users[userIndex].downloads || 0) + 1;
                    currentUser.downloads = users[userIndex].downloads;
                }
                
                // Сохраняем информацию о скачивании для статистики
                if (!file.downloadHistory) file.downloadHistory = [];
                file.downloadHistory.push({
                    userId: currentUser.id,
                    username: currentUser.username,
                    date: new Date().toISOString()
                });
            }
            
            saveData();
            updateStats();
            renderFiles();
            
            if (downloadBtn) {
                setTimeout(() => {
                    downloadBtn.classList.remove('downloading');
                    downloadBtn.innerHTML = `<i class="fas fa-download"></i> Скачать (${file.downloads})`;
                    downloadBtn.disabled = false;
                }, 500);
            }
            
            if (userSettings.notifyDownloads) {
                showNotification(`Файл "${file.name}" успешно скачан!`, 'success');
            }
            
        }, 1500);
    }
    
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
            file.likes.splice(likeIndex, 1);
        } else {
            file.likes.push(currentUser.id);
        }
        
        saveData();
        
        const likeBtn = document.querySelector(`.like-btn[data-file-id="${fileId}"]`);
        const likeCount = likeBtn.querySelector('.like-count');
        
        if (isLiked) {
            likeBtn.classList.remove('liked');
        } else {
            likeBtn.classList.add('liked');
            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 300);
            
            if (userSettings.notifyLikes && file.authorId !== currentUser.id) {
                showNotification(`Вы поставили лайк файлу "${file.name}"`, 'success');
            }
        }
        
        likeCount.textContent = file.likes.length;
        
        if (currentUser) {
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].likes = (users[userIndex].likes || 0) + (isLiked ? -1 : 1);
                currentUser.likes = users[userIndex].likes;
            }
        }
    }
    
    function deleteFile(fileId) {
        if (!currentUser) return;
        
        const file = files.find(f => f.id === fileId);
        if (!file || file.authorId !== currentUser.id) {
            showNotification('Вы не можете удалить этот файл', 'error');
            return;
        }
        
        if (confirm(`Вы уверены, что хотите удалить файл "${file.name}"?`)) {
            files = files.filter(f => f.id !== fileId);
            
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].uploads = Math.max(0, (users[userIndex].uploads || 0) - 1);
                currentUser.uploads = users[userIndex].uploads;
            }
            
            saveData();
            updateStats();
            updateCategoryCounts();
            renderFiles();
            
            showNotification(`Файл "${file.name}" удален`, 'success');
        }
    }
    
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
            tags: fileData.tags || [],
            downloadHistory: []
        };
        
        files.unshift(newFile);
        
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].uploads = (users[userIndex].uploads || 0) + 1;
            currentUser.uploads = users[userIndex].uploads;
        }
        
        saveData();
        updateStats();
        updateCategoryCounts();
        renderFiles();
        
        showNotification(`Файл "${fileData.name}" успешно загружен!`, 'success');
    }
    
    function loadProfileData() {
        if (!currentUser) return;
        
        const userData = users.find(u => u.id === currentUser.id);
        if (!userData) return;
        
        // Обновляем данные в модальном окне профиля
        document.getElementById('profileUsername').textContent = userData.username;
        document.getElementById('profileEmail').textContent = userData.email;
        document.getElementById('profileBio').textContent = userData.bio || 'Описание профиля...';
        document.getElementById('statUploads').textContent = userData.uploads || 0;
        document.getElementById('statDownloads').textContent = userData.downloads || 0;
        document.getElementById('statLikes').textContent = userData.likes || 0;
        
        // Обновляем аватар
        const profileAvatar = document.getElementById('profileAvatar');
        profileAvatar.textContent = generateAvatar(userData.username);
    }
    
    function loadStatsData() {
        if (!currentUser) return;
        
        const myFiles = files.filter(f => f.authorId === currentUser.id);
        const totalDownloads = myFiles.reduce((sum, file) => sum + (file.downloads || 0), 0);
        const avgDailyDownloads = myFiles.length > 0 ? Math.round(totalDownloads / 30) : 0;
        
        let popularFile = 'Нет данных';
        if (myFiles.length > 0) {
            const mostPopular = myFiles.reduce((max, file) => 
                file.downloads > max.downloads ? file : max, myFiles[0]);
            popularFile = `${mostPopular.name} (${mostPopular.downloads} скачиваний)`;
        }
        
        document.getElementById('totalDownloadsStat').textContent = totalDownloads;
        document.getElementById('avgDailyDownloads').textContent = avgDailyDownloads;
        document.getElementById('popularFile').textContent = popularFile;
        
        // Статистика по категориям
        const categoryStats = {};
        myFiles.forEach(file => {
            categoryStats[file.category] = (categoryStats[file.category] || 0) + (file.downloads || 0);
        });
        
        const categoryStatsElement = document.getElementById('categoryStats');
        categoryStatsElement.innerHTML = '';
        
        for (const [category, count] of Object.entries(categoryStats)) {
            const div = document.createElement('div');
            div.className = 'category-stat-item';
            div.innerHTML = `
                <span>${getCategoryName(category)}:</span>
                <span>${count}</span>
            `;
            categoryStatsElement.appendChild(div);
        }
        
        // Последние скачивания
        const downloadsList = document.getElementById('downloadsList');
        downloadsList.innerHTML = '';
        
        const allDownloads = [];
        myFiles.forEach(file => {
            if (file.downloadHistory) {
                file.downloadHistory.forEach(download => {
                    allDownloads.push({
                        ...download,
                        fileName: file.name
                    });
                });
            }
        });
        
        allDownloads.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const recentDownloads = allDownloads.slice(0, 10);
        
        if (recentDownloads.length === 0) {
            downloadsList.innerHTML = '<p class="empty-text">Нет данных о скачиваниях</p>';
        } else {
            recentDownloads.forEach(download => {
                const div = document.createElement('div');
                div.className = 'download-item';
                div.innerHTML = `
                    <div>
                        <strong>${download.fileName}</strong>
                        <div class="download-meta">
                            <span>${download.username}</span>
                            <span>${new Date(download.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                    </div>
                `;
                downloadsList.appendChild(div);
            });
        }
    }
    
    function saveData() {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('files', JSON.stringify(files));
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    function openModal(modalName) {
        const modal = modals[modalName];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            if (modalName === 'profile') {
                loadProfileData();
            } else if (modalName === 'stats') {
                loadStatsData();
            }
        }
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    function setupEventListeners() {
        // Переключение темы
        elements.themeToggle?.addEventListener('click', toggleTheme);
        elements.footerThemeSelect?.addEventListener('change', function() {
            userSettings.theme = this.value;
            saveData();
            loadTheme();
        });
        
        // Настройки темы
        document.getElementById('themeSelect')?.addEventListener('change', function() {
            userSettings.theme = this.value;
        });
        
        // Настройки шрифта
        document.getElementById('fontSize')?.addEventListener('change', function() {
            userSettings.fontSize = this.value;
        });
        
        // Настройки уведомлений
        document.getElementById('notifyDownloads')?.addEventListener('change', function() {
            userSettings.notifyDownloads = this.checked;
        });
        
        document.getElementById('notifyLikes')?.addEventListener('change', function() {
            userSettings.notifyLikes = this.checked;
        });
        
        // Сохранение настроек
        document.getElementById('saveSettingsBtn')?.addEventListener('click', function() {
            saveData();
            loadSettings();
            loadTheme();
            showNotification('Настройки сохранены', 'success');
            closeModal(modals.settings);
        });
        
        // Переключение вью
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                viewMode = this.dataset.view;
                elements.filesContainer.className = `files-grid ${viewMode}-view`;
            });
        });
        
        // Сортировка
        elements.sortSelect?.addEventListener('change', function() {
            currentSort = this.value;
            renderFiles();
        });
        
        // Фильтры
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderFiles();
            });
        });
        
        // Категории
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function() {
                const category = this.dataset.category;
                const searchInput = document.getElementById('searchInput');
                searchInput.value = '';
                searchInput.focus();
                
                // Фильтруем по категории
                const filteredFiles = files.filter(f => f.category === category);
                renderFiles(filteredFiles);
                
                document.querySelectorAll('.category-card').forEach(c => {
                    c.style.borderColor = '';
                });
                this.style.borderColor = '#4361ee';
            });
        });
        
        // Поиск
        elements.searchBtn?.addEventListener('click', performSearch);
        elements.searchInput?.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Кнопка обновить
        elements.refreshBtn?.addEventListener('click', function() {
            this.classList.add('refreshing');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
            
            setTimeout(() => {
                renderFiles();
                updateStats();
                updateCategoryCounts();
                this.classList.remove('refreshing');
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
                showNotification('Данные обновлены', 'success');
            }, 1000);
        });
        
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
        elements.exploreBtn?.addEventListener('click', () => {
            elements.searchInput.focus();
        });
        
        // Профиль
        document.getElementById('profileBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.dropdown-menu').classList.toggle('show');
        });
        
        // Закрытие dropdown при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-menu')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
        
        document.getElementById('viewProfileBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('profile');
            document.querySelector('.dropdown-menu').classList.remove('show');
        });
        
        document.getElementById('myFilesBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                const myFiles = files.filter(f => f.authorId === currentUser.id);
                renderFiles(myFiles);
                showNotification(`Показаны ваши файлы (${myFiles.length})`, 'success');
                document.querySelector('.dropdown-menu').classList.remove('show');
            }
        });
        
        document.getElementById('myStatsBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUser) {
                openModal('stats');
                document.querySelector('.dropdown-menu').classList.remove('show');
            }
        });
        
        document.getElementById('settingsBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('settings');
            document.querySelector('.dropdown-menu').classList.remove('show');
        });
        
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти?')) {
                currentUser = null;
                saveData();
                updateUI();
                showNotification('Вы вышли из системы', 'success');
                document.querySelector('.dropdown-menu').classList.remove('show');
            }
        });
        
        // Редактирование профиля
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            showNotification('Функция редактирования профиля в разработке', 'info');
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
        
        // Переключение между логином и регистрацией
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(modals.login);
            openModal('register');
        });
        
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(modals.register);
            openModal('login');
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
            
            const userExists = users.some(u => u.username === username || u.email === email);
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
                uploads: 0,
                downloads: 0,
                likes: 0
            };
            
            saveData();
            updateUI();
            updateStats();
            showNotification('Регистрация успешна! Добро пожаловать!', 'success');
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
            const fileTags = document.getElementById('fileTags').value;
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
            
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const uploadProgress = document.getElementById('uploadProgress');
            const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');
            
            uploadProgress.style.display = 'block';
            uploadSubmitBtn.disabled = true;
            
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                    
                    const tags = fileTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                    
                    uploadFile({
                        name: fileName,
                        description: fileDescription,
                        category: fileCategory,
                        size: file.size,
                        tags: tags
                    });
                    
                    this.reset();
                    document.getElementById('fileInfo').textContent = '';
                    uploadProgress.style.display = 'none';
                    uploadSubmitBtn.disabled = false;
                    closeModal(modals.upload);
                    
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
                
                const fileNameInput = document.getElementById('fileName');
                if (!fileNameInput.value) {
                    fileNameInput.value = file.name.replace(/\.[^/.]+$/, "");
                }
            }
        });
        
        // Кнопка "Показать еще"
        elements.loadMoreBtn?.addEventListener('click', () => {
            const btn = elements.loadMoreBtn;
            btn.classList.add('loading');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
            
            setTimeout(() => {
                // В реальном приложении здесь была бы загрузка с сервера
                // Пока просто показываем уведомление
                showNotification('Все файлы загружены', 'info');
                btn.classList.remove('loading');
                btn.innerHTML = '<i class="fas fa-plus"></i> Загрузить еще файлы';
            }, 1000);
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
            
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const fileId = parseInt(deleteBtn.dataset.fileId);
                deleteFile(fileId);
                return;
            }
            
            const tag = e.target.closest('.tag');
            if (tag) {
                const tagText = tag.textContent;
                const searchInput = document.getElementById('searchInput');
                searchInput.value = tagText;
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        if (!query.trim()) {
            renderFiles();
            return;
        }
        
        const filteredFiles = files.filter(file => 
            file.name.toLowerCase().includes(query) ||
            file.description.toLowerCase().includes(query) ||
            file.author.toLowerCase().includes(query) ||
            (file.tags && file.tags.some(tag => tag.toLowerCase().includes(query))) ||
            file.category.toLowerCase().includes(query)
        );
        
        renderFiles(filteredFiles);
        
        if (filteredFiles.length === 0) {
            showNotification('По вашему запросу ничего не найдено', 'info');
        } else {
            showNotification(`Найдено файлов: ${filteredFiles.length}`, 'success');
        }
    }
    
    function toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        document.body.className = isDark ? 'light-theme' : 'dark-theme';
        userSettings.theme = isDark ? 'light' : 'dark';
        saveData();
        updateThemeIcon();
    }
    
    // Создаем несколько демо-файлов при первом запуске
    if (files.length === 0) {
        const demoFiles = [
            {
                id: 1,
                name: 'Презентация проекта.pdf',
                description: 'Подробная презентация нового IT-проекта с анализом рынка и финансовыми прогнозами',
                category: 'documents',
                size: 4500000,
                author: 'Admin User',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 42,
                likes: [1],
                tags: ['работа', 'презентация', 'проект', 'анализ'],
                downloadHistory: [
                    { userId: 1, username: 'Demo User', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
                ]
            },
            {
                id: 2,
                name: 'Градиенты для дизайна.jpg',
                description: 'Коллекция красивых градиентов для веб-дизайна и мобильных приложений',
                category: 'images',
                size: 2500000,
                author: 'Admin User',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 28,
                likes: [1, 2],
                tags: ['дизайн', 'градиент', 'фон', 'цвет'],
                downloadHistory: []
            },
            {
                id: 3,
                name: 'Музыка для видео.mp3',
                description: 'Фоновая музыка для видеороликов без авторских отчислений',
                category: 'audio',
                size: 8500000,
                author: 'Admin User',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 15,
                likes: [],
                tags: ['музыка', 'аудио', 'фон', 'видео'],
                downloadHistory: []
            },
            {
                id: 4,
                name: 'Руководство по JavaScript.pdf',
                description: 'Полное руководство по JavaScript с примерами и упражнениями',
                category: 'documents',
                size: 3200000,
                author: 'Demo User',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 56,
                likes: [1, 2, 3],
                tags: ['программирование', 'javascript', 'учебник', 'веб'],
                downloadHistory: []
            },
            {
                id: 5,
                name: 'Иконки для сайта.zip',
                description: 'Набор иконок в формате SVG для веб-разработки',
                category: 'archives',
                size: 1500000,
                author: 'Demo User',
                authorId: 1,
                uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                downloads: 33,
                likes: [1],
                tags: ['иконки', 'svg', 'дизайн', 'веб'],
                downloadHistory: []
            }
        ];
        
        files = demoFiles;
        saveData();
    }
});
