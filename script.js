document.addEventListener('DOMContentLoaded', function() {
    // Инициализация статистики с анимацией
    function animateCounter(elementId, finalValue, duration = 2000) {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const increment = finalValue / (duration / 16); // 60fps
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
    
    // Запускаем анимацию счетчиков
    setTimeout(() => {
        animateCounter('usersCount', 1245);
        animateCounter('filesCount', 5892);
        animateCounter('downloadsCount', 24567);
    }, 500);
    
    // Модальные окна
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const uploadModal = document.getElementById('uploadModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Открытие модальных окон
    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));
    uploadBtn.addEventListener('click', () => openModal(uploadModal));
    
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
    
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            // Имитация входа
            if (username && password) {
                showNotification(`Добро пожаловать, ${username}!`, 'success');
                closeModal(loginModal);
                loginForm.reset();
                
                // Обновляем кнопки (имитация входа)
                loginBtn.innerHTML = `<i class="fas fa-user"></i> ${username}`;
                registerBtn.style.display = 'none';
                uploadBtn.style.display = 'flex';
            } else {
                showNotification('Заполните все поля!', 'error');
            }
        });
    }
    
    // Обработка формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // Простая валидация
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
            
            // Имитация регистрации
            showNotification(`Регистрация успешна! Добро пожаловать, ${username}!`, 'success');
            closeModal(registerModal);
            registerForm.reset();
            
            // Обновляем кнопки (имитация входа)
            loginBtn.innerHTML = `<i class="fas fa-user"></i> ${username}`;
            registerBtn.style.display = 'none';
            uploadBtn.style.display = 'flex';
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
                const fileSize = (file.size / (1024*1024)).toFixed(2);
                fileInfo.textContent = `${file.name} (${fileSize} MB)`;
                fileInfo.style.color = 'var(--primary-color)';
            } else {
                fileInfo.textContent = 'Файл не выбран';
                fileInfo.style.color = 'var(--text-muted)';
            }
        });
    }
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fileName = document.getElementById('fileName').value;
            const fileDescription = document.getElementById('fileDescription').value;
            const fileCategory = document.getElementById('fileCategory').value;
            const fileTags = document.getElementById('fileTags').value;
            
            if (!fileName || !fileCategory || !fileInput.files[0]) {
                showNotification('Заполните обязательные поля: название, категория и файл!', 'error');
                return;
            }
            
            // Имитация загрузки файла
            showNotification(`Файл "${fileName}" успешно загружен!`, 'success');
            closeModal(uploadModal);
            uploadForm.reset();
            fileInfo.textContent = 'Файл не выбран';
            fileInfo.style.color = 'var(--text-muted)';
            
            // Добавляем новый файл в список
            addNewFile(fileName, fileDescription, fileCategory, fileTags);
        });
    }
    
    // Фильтрация по категориям
    const categoryFilters = document.querySelectorAll('.category-filter');
    const fileCards = document.querySelectorAll('.file-card');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Убираем активный класс у всех фильтров
            categoryFilters.forEach(f => f.classList.remove('active'));
            // Добавляем активный класс текущему фильтру
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Показываем/скрываем карточки в зависимости от категории
            fileCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Поиск файлов
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Если поиск пустой, показываем все файлы
            fileCards.forEach(card => {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            });
            return;
        }
        
        fileCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.file-description').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            const author = card.querySelector('.file-author').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || 
                description.includes(searchTerm) || 
                tags.some(tag => tag.includes(searchTerm)) ||
                author.includes(searchTerm)) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
                
                // Подсветка найденного текста
                highlightText(card, searchTerm);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Функция подсветки текста
    function highlightText(element, searchTerm) {
        const textElements = element.querySelectorAll('h3, .file-description, .tag, .file-author');
        
        textElements.forEach(textElement => {
            const originalText = textElement.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedText = originalText.replace(regex, '<mark class="highlight">$1</mark>');
            
            // Сохраняем исходный текст в data-атрибуте
            if (!textElement.hasAttribute('data-original-text')) {
                textElement.setAttribute('data-original-text', originalText);
            }
            
            textElement.innerHTML = highlightedText;
        });
    }
    
    // Кнопка "Загрузить еще"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.style.display = 'none';
            loadingIndicator.classList.add('active');
            
            // Имитация загрузки дополнительных файлов
            setTimeout(() => {
                addSampleFiles();
                loadingIndicator.classList.remove('active');
                this.style.display = 'inline-flex';
            }, 1500);
        });
    }
    
    // Кнопки скачивания
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-download') || 
            e.target.closest('.btn-download')) {
            const btn = e.target.classList.contains('btn-download') ? e.target : e.target.closest('.btn-download');
            const card = btn.closest('.file-card');
            const fileName = card.querySelector('h3').textContent;
            const downloadCount = card.querySelector('.download-count');
            const currentCount = parseInt(downloadCount.textContent.match(/\d+/)[0]);
            
            // Обновляем счетчик скачиваний
            downloadCount.innerHTML = `<i class="fas fa-download"></i> ${currentCount + 1}`;
            
            // Анимация кнопки
            btn.innerHTML = '<i class="fas fa-check"></i> Скачано!';
            btn.style.backgroundColor = 'var(--success-color)';
            
            // Показываем уведомление
            showNotification(`Начато скачивание файла "${fileName}"`, 'success');
            
            // Возвращаем кнопку в исходное состояние через 2 секунды
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-download"></i> Скачать';
                btn.style.backgroundColor = '';
            }, 2000);
        }
    });
    
    // Функция добавления нового файла
    function addNewFile(name, description, category, tags) {
        const filesContainer = document.querySelector('.files-container');
        
        // Определяем иконку для категории
        let iconClass = 'fas fa-file';
        if (category === 'documents') iconClass = 'fas fa-file-pdf';
        if (category === 'images') iconClass = 'fas fa-file-image';
        if (category === 'music') iconClass = 'fas fa-file-audio';
        if (category === 'video') iconClass = 'fas fa-file-video';
        if (category === 'archives') iconClass = 'fas fa-file-archive';
        if (category === 'software') iconClass = 'fas fa-file-code';
        
        // Создаем теги
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const tagsHTML = tagsArray.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // Создаем карточку файла
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.setAttribute('data-category', category);
        fileCard.style.opacity = '0';
        fileCard.style.transform = 'translateY(20px)';
        
        fileCard.innerHTML = `
            <div class="file-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="file-info">
                <h3>${name}</h3>
                <p class="file-description">${description || 'Без описания'}</p>
                <div class="file-meta">
                    <span class="file-size"><i class="fas fa-weight-hanging"></i> ${(Math.random() * 10 + 1).toFixed(1)} MB</span>
                    <span class="file-author"><i class="fas fa-user"></i> ${getCurrentUser()}</span>
                    <span class="file-date"><i class="far fa-calendar"></i> ${getCurrentDate()}</span>
                </div>
                <div class="file-tags">
                    ${tagsHTML || '<span class="tag">новый</span>'}
                </div>
            </div>
            <div class="file-actions">
                <button class="btn-download"><i class="fas fa-download"></i> Скачать</button>
                <span class="download-count"><i class="fas fa-download"></i> 0</span>
            </div>
        `;
        
        // Добавляем карточку в контейнер
        filesContainer.appendChild(fileCard);
        
        // Анимация появления
        setTimeout(() => {
            fileCard.style.opacity = '1';
            fileCard.style.transform = 'translateY(0)';
        }, 10);
        
        // Обновляем счетчик файлов
        const filesCount = document.getElementById('filesCount');
        const currentCount = parseInt(filesCount.textContent.replace(/,/g, ''));
        animateCounter('filesCount', currentCount + 1, 500);
    }
    
    // Функция добавления примеров файлов
    function addSampleFiles() {
        const sampleFiles = [
            {
                name: 'Шаблон резюме.docx',
                description: 'Профессиональный шаблон резюме в современном дизайне',
                category: 'documents',
                tags: ['работа', 'резюме', 'шаблон']
            },
            {
                name: 'Пейзаж заката.png',
                description: 'Высококачественное изображение заката в оранжевых тонах',
                category: 'images',
                tags: ['фото', 'пейзаж', 'закат']
            },
            {
                name: 'Саундтрек для видео.wav',
                description: 'Эпичная фоновая музыка для видеороликов',
                category: 'music',
                tags: ['музыка', 'саундтрек', 'фон']
            }
        ];
        
        sampleFiles.forEach(file => {
            addNewFile(file.name, file.description, file.category, file.tags.join(', '));
        });
    }
    
    // Вспомогательные функции
    function getCurrentUser() {
        const loginText = loginBtn.textContent.trim();
        return loginText.includes('Войти') ? 'Гость' : loginText.replace('Войти', '').trim();
    }
    
    function getCurrentDate() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}.${month}.${year}`;
    }
    
    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        // Удаляем предыдущее уведомление, если есть
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Добавляем стили для уведомления
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
                color: white;
                padding: 15px 25px;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow);
                z-index: 3000;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                max-width: 400px;
            }
            .notification.active {
                transform: translateX(0);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification i {
                font-size: 1.2rem;
            }
            .highlight {
                background-color: rgba(255, 107, 0, 0.3);
                color: var(--primary-color);
                font-weight: 600;
                padding: 0 2px;
                border-radius: 3px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 5000);
    }
    
    // Инициализация при загрузке
    console.log('FileShare загружен и готов к работе!');
});