// FileSphere - Modern File Sharing Platform
class FileSphere {
    constructor() {
        this.init();
    }

    init() {
        // Инициализация всех компонентов
        this.initParticles();
        this.initEventListeners();
        this.initStatistics();
        this.initCarousel();
        this.initFiles();
        this.initChart();
        this.showToast('FileSphere загружен! Добро пожаловать!', 'success');
    }

    // Инициализация частиц фона
    initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        const particlesCount = 50;
        for (let i = 0; i < particlesCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: var(--primary);
                border-radius: 50%;
                opacity: ${Math.random() * 0.3 + 0.1};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 20 + 10}s infinite linear;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(particle);
        }

        // Добавляем стили для анимации частиц
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(0) translateX(0);
                }
                25% {
                    transform: translateY(-100px) translateX(100px);
                }
                50% {
                    transform: translateY(-200px) translateX(0);
                }
                75% {
                    transform: translateY(-100px) translateX(-100px);
                }
                100% {
                    transform: translateY(0) translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Инициализация обработчиков событий
    initEventListeners() {
        // Навигация
        this.setupNavigation();
        
        // Поиск
        this.setupSearch();
        
        // Модальные окна
        this.setupModals();
        
        // Загрузка файлов
        this.setupFileUpload();
        
        // Фильтрация
        this.setupFiltering();
        
        // Категории
        this.setupCategories();
        
        // Пользовательское меню
        this.setupUserMenu();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Кнопки героя
        document.getElementById('heroUploadBtn')?.addEventListener('click', () => {
            this.openModal('uploadModal');
        });

        document.getElementById('exploreBtn')?.addEventListener('click', () => {
            document.querySelector('[href="#explore"]')?.click();
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const filterBtn = document.getElementById('filterBtn');

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                this.filterFiles(query);
                this.showToast(`Найдено файлов по запросу: "${query}"`, 'info');
            }
        };

        searchBtn?.addEventListener('click', performSearch);
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        filterBtn?.addEventListener('click', () => {
            this.showToast('Фильтры поиска', 'info');
        });
    }

    setupModals() {
        // Закрытие модальных окон
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
            element.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Открытие модальных окон
        document.getElementById('uploadBtn')?.addEventListener('click', () => {
            this.openModal('uploadModal');
        });

        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.showToast('Функция входа в разработке', 'info');
        });

        document.getElementById('registerBtn')?.addEventListener('click', () => {
            this.showToast('Функция регистрации в разработке', 'info');
        });

        // Предотвращение закрытия при клике внутри модалки
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    setupFileUpload() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileUpload');
        const selectBtn = document.getElementById('selectFileBtn');

        // Клик по зоне загрузки
        uploadZone?.addEventListener('click', () => {
            fileInput?.click();
        });

        // Кнопка выбора файла
        selectBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput?.click();
        });

        // Перетаскивание файлов
        uploadZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });

        uploadZone?.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });

        uploadZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Выбор файла через input
        fileInput?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        if (!files.length) return;

        const uploadZone = document.getElementById('uploadZone');
        const uploadDetails = document.getElementById('uploadDetails');
        
        uploadZone.style.display = 'none';
        uploadDetails.style.display = 'block';

        const progressFill = document.querySelector('.progress-fill');
        const progressPercent = document.querySelector('.progress-percent');
        const progressSpeed = document.querySelector('.progress-speed');
        const progressTime = document.querySelector('.progress-time');

        let totalSize = 0;
        for (let file of files) {
            totalSize += file.size;
        }

        let loaded = 0;
        const startTime = Date.now();

        // Имитация загрузки
        const interval = setInterval(() => {
            loaded += totalSize / 100;
            const percent = Math.min((loaded / totalSize) * 100, 100);
            
            progressFill.style.width = `${percent}%`;
            progressPercent.textContent = `${Math.round(percent)}%`;

            const elapsed = (Date.now() - startTime) / 1000;
            const speed = loaded / elapsed;
            progressSpeed.textContent = this.formatFileSize(speed) + '/s';

            const remaining = (totalSize - loaded) / speed;
            progressTime.textContent = `Осталось: ${this.formatTime(remaining)}`;

            if (percent >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.showToast(`${files.length} файлов успешно загружены!`, 'success');
                    this.addSampleFiles(3);
                    this.closeAllModals();
                    
                    // Сброс формы
                    setTimeout(() => {
                        uploadZone.style.display = 'block';
                        uploadDetails.style.display = 'none';
                        progressFill.style.width = '0%';
                        progressPercent.textContent = '0%';
                    }, 1000);
                }, 500);
            }
        }, 50);
    }

    setupFiltering() {
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.changeViewMode(view);
            });
        });
    }

    setupCategories() {
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.dataset.category;
                this.filterByCategory(category);
                
                categoryItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                this.showToast(`Показаны файлы: ${item.querySelector('.category-name').textContent}`, 'info');
            });
        });

        // Переключение категорий
        document.getElementById('categoriesToggle')?.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar-categories');
            sidebar.style.transform = sidebar.style.transform ? '' : 'translateX(-100%)';
        });
    }

    setupUserMenu() {
        const userBtn = document.getElementById('userMenuBtn');
        const dropdown = document.getElementById('userDropdown');

        userBtn?.addEventListener('click', () => {
            dropdown.classList.toggle('show');
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (!userBtn?.contains(e.target) && !dropdown?.contains(e.target)) {
                dropdown?.classList.remove('show');
            }
        });

        // Обработка пунктов меню
        dropdown?.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const text = item.querySelector('span').textContent;
                this.showToast(`Открыто: ${text}`, 'info');
                dropdown.classList.remove('show');
            });
        });
    }

    // Инициализация анимированной статистики
    initStatistics() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = this.formatNumber(target);
                clearInterval(timer);
            } else {
                element.textContent = this.formatNumber(Math.floor(current));
            }
        }, 16);
    }

    // Инициализация карусели трендов
    initCarousel() {
        const carousel = document.getElementById('trendingCarousel');
        if (!carousel) return;

        const trendingFiles = [
            {
                icon: 'fas fa-file-code',
                title: 'AI Генератор градиентов',
                desc: 'Искусственный интеллект для создания уникальных градиентов',
                author: 'AI_Designer',
                views: '2.4k',
                downloads: '1.8k',
                type: 'development'
            },
            {
                icon: 'fas fa-file-video',
                title: 'Моушн дизайн курс',
                desc: 'Полный курс по анимации и моушн дизайну',
                author: 'MotionPro',
                views: '3.1k',
                downloads: '2.5k',
                type: 'multimedia'
            },
            {
                icon: 'fas fa-file-pdf',
                title: 'UI/UX руководство 2023',
                desc: 'Актуальное руководство по дизайну интерфейсов',
                author: 'DesignLab',
                views: '4.2k',
                downloads: '3.7k',
                type: 'design'
            },
            {
                icon: 'fas fa-file-archive',
                title: 'Библиотека текстур 4K',
                desc: 'Коллекция высококачественных текстур для дизайна',
                author: 'TextureHub',
                views: '1.9k',
                downloads: '1.5k',
                type: 'design'
            }
        ];

        trendingFiles.forEach(file => {
            const card = this.createTrendingCard(file);
            carousel.appendChild(card);
        });

        // Навигация карусели
        let scrollPosition = 0;
        const cardWidth = 324; // 300px + gap

        document.getElementById('prevTrending')?.addEventListener('click', () => {
            scrollPosition = Math.max(scrollPosition - cardWidth, 0);
            carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        });

        document.getElementById('nextTrending')?.addEventListener('click', () => {
            scrollPosition = Math.min(scrollPosition + cardWidth, carousel.scrollWidth - carousel.clientWidth);
            carousel.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        });
    }

    createTrendingCard(file) {
        const card = document.createElement('div');
        card.className = 'trending-card';
        card.dataset.type = file.type;
        
        card.innerHTML = `
            <div class="trending-badge">
                <i class="fas fa-fire"></i>
                <span>Тренд</span>
            </div>
            <div class="trending-icon">
                <i class="${file.icon}"></i>
            </div>
            <div class="trending-content">
                <h3>${file.title}</h3>
                <p>${file.desc}</p>
                <div class="trending-meta">
                    <div class="trending-author">
                        <div class="author-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <span>${file.author}</span>
                    </div>
                    <div class="trending-stats">
                        <div class="stat-item">
                            <i class="fas fa-eye"></i>
                            <span>${file.views}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-download"></i>
                            <span>${file.downloads}</span>
                        </div>
                    </div>
                </div>
                <div class="trending-actions">
                    <button class="btn-trending preview">
                        <i class="fas fa-eye"></i>
                        <span>Просмотр</span>
                    </button>
                    <button class="btn-trending download">
                        <i class="fas fa-download"></i>
                        <span>Скачать</span>
                    </button>
                </div>
            </div>
        `;

        // Обработчики кнопок
        card.querySelector('.preview').addEventListener('click', () => {
            this.showToast(`Просмотр: ${file.title}`, 'info');
        });

        card.querySelector('.download').addEventListener('click', () => {
            this.showToast(`Скачивание: ${file.title}`, 'success');
            this.incrementDownloadCount(card);
        });

        return card;
    }

    // Инициализация файлов
    initFiles() {
        const filesGrid = document.getElementById('filesGrid');
        if (!filesGrid) return;

        const sampleFiles = [
            {
                icon: 'fas fa-file-code',
                title: 'React компоненты',
                desc: 'Набор переиспользуемых React компонентов',
                size: '4.2 MB',
                date: '15.10.2023',
                tags: ['React', 'JavaScript', 'UI'],
                author: 'DevMaster',
                type: 'development'
            },
            {
                icon: 'fas fa-file-image',
                title: '3D иллюстрации',
                desc: 'Коллекция 3D иллюстраций для проектов',
                size: '28.5 MB',
                date: '14.10.2023',
                tags: ['3D', 'Дизайн', 'Иллюстрации'],
                author: 'Design3D',
                type: 'design'
            },
            {
                icon: 'fas fa-file-video',
                title: 'After Effects шаблоны',
                desc: 'Профессиональные шаблоны для After Effects',
                size: '156 MB',
                date: '13.10.2023',
                tags: ['Видео', 'Анимация', 'Шаблоны'],
                author: 'MotionFX',
                type: 'multimedia'
            },
            {
                icon: 'fas fa-file-pdf',
                title: 'Руководство по Figma',
                desc: 'Полное руководство по работе в Figma',
                size: '12.3 MB',
                date: '12.10.2023',
                tags: ['Figma', 'Дизайн', 'Обучение'],
                author: 'DesignPro',
                type: 'education'
            },
            {
                icon: 'fas fa-file-archive',
                title: 'Иконки Material Design',
                desc: 'Полный набор иконок в стиле Material Design',
                size: '8.7 MB',
                date: '11.10.2023',
                tags: ['Иконки', 'Material', 'UI'],
                author: 'IconDesigner',
                type: 'design'
            },
            {
                icon: 'fas fa-file-alt',
                title: 'Техническая документация',
                desc: 'Шаблоны технической документации',
                size: '6.5 MB',
                date: '10.10.2023',
                tags: ['Документы', 'Технические', 'Шаблоны'],
                author: 'TechWriter',
                type: 'documents'
            }
        ];

        sampleFiles.forEach(file => {
            const card = this.createFileCard(file);
            filesGrid.appendChild(card);
        });

        // Кнопка "Показать больше"
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.addSampleFiles(3);
        });
    }

    createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.dataset.type = file.type;
        
        card.innerHTML = `
            <div class="file-header">
                <div class="file-type">
                    <i class="${file.icon}"></i>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn favorite">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="file-action-btn share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
            <div class="file-content">
                <h3>${file.title}</h3>
                <p class="file-description">${file.desc}</p>
                <div class="file-meta">
                    <div class="file-size">
                        <i class="fas fa-weight-hanging"></i>
                        <span>${file.size}</span>
                    </div>
                    <div class="file-date">
                        <i class="far fa-calendar"></i>
                        <span>${file.date}</span>
                    </div>
                </div>
                <div class="file-tags">
                    ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="file-footer">
                    <div class="file-author">
                        <div class="author-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="author-info">
                            <div class="author-name">${file.author}</div>
                            <div class="author-role">Автор</div>
                        </div>
                    </div>
                    <button class="download-btn">
                        <i class="fas fa-download"></i>
                        <span>Скачать</span>
                    </button>
                </div>
            </div>
        `;

        // Обработчики действий
        const favoriteBtn = card.querySelector('.favorite');
        const shareBtn = card.querySelector('.share');
        const downloadBtn = card.querySelector('.download-btn');

        favoriteBtn.addEventListener('click', () => {
            const icon = favoriteBtn.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.className = 'fas fa-heart';
                favoriteBtn.style.color = 'var(--primary)';
                this.showToast('Добавлено в избранное', 'success');
            } else {
                icon.className = 'far fa-heart';
                favoriteBtn.style.color = '';
                this.showToast('Убрано из избранного', 'info');
            }
        });

        shareBtn.addEventListener('click', () => {
            this.showToast('Ссылка скопирована в буфер обмена', 'success');
        });

        downloadBtn.addEventListener('click', () => {
            this.showToast(`Скачивание: ${file.title}`, 'success');
            this.incrementDownloadCount(card);
        });

        return card;
    }

    addSampleFiles(count = 3) {
        const filesGrid = document.getElementById('filesGrid');
        if (!filesGrid) return;

        const newFiles = [
            {
                icon: 'fas fa-file-music',
                title: 'Звуковые эффекты',
                desc: 'Коллекция звуковых эффектов для видео',
                size: '45.2 MB',
                date: 'Сегодня',
                tags: ['Звук', 'Эффекты', 'Аудио'],
                author: 'SoundDesigner',
                type: 'multimedia'
            },
            {
                icon: 'fas fa-file-powerpoint',
                title: 'Презентация бизнес-плана',
                desc: 'Готовый шаблон для бизнес-презентаций',
                size: '18.7 MB',
                date: 'Сегодня',
                tags: ['Бизнес', 'Презентация', 'Шаблон'],
                author: 'BusinessPro',
                type: 'documents'
            },
            {
                icon: 'fas fa-file-csv',
                title: 'Датасет для анализа',
                desc: 'Набор данных для машинного обучения',
                size: '32.4 MB',
                date: 'Сегодня',
                tags: ['Данные', 'Анализ', 'ML'],
                author: 'DataScientist',
                type: 'development'
            }
        ];

        for (let i = 0; i < Math.min(count, newFiles.length); i++) {
            const card = this.createFileCard(newFiles[i]);
            filesGrid.appendChild(card);
            
            // Анимация появления
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 100);
        }

        this.showToast(`Добавлено ${Math.min(count, newFiles.length)} новых файлов`, 'info');
    }

    // Инициализация графика
    initChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                datasets: [{
                    label: 'Загрузки',
                    data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
                    borderColor: 'var(--primary)',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Загрузки файлов',
                    data: [800, 1200, 1500, 2000, 1800, 2500, 3000],
                    borderColor: 'var(--accent)',
                    backgroundColor: 'rgba(255, 167, 38, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text-primary)',
                            font: {
                                family: 'Inter'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'var(--text-secondary)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'var(--text-secondary)'
                        }
                    }
                }
            }
        });
    }

    // Утилиты
    filterFiles(query) {
        const files = document.querySelectorAll('.file-card, .trending-card');
        const searchTerm = query.toLowerCase();

        files.forEach(file => {
            const title = file.querySelector('h3')?.textContent.toLowerCase() || '';
            const desc = file.querySelector('.file-description')?.textContent.toLowerCase() || '';
            const tags = Array.from(file.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            const author = file.querySelector('.author-name')?.textContent.toLowerCase() || '';

            const matches = title.includes(searchTerm) || 
                           desc.includes(searchTerm) || 
                           tags.some(tag => tag.includes(searchTerm)) ||
                           author.includes(searchTerm);

            file.style.display = matches ? '' : 'none';
            
            if (matches) {
                file.style.animation = 'none';
                setTimeout(() => {
                    file.style.animation = 'pulse 0.5s ease';
                }, 10);
            }
        });
    }

    filterByCategory(category) {
        const files = document.querySelectorAll('.file-card, .trending-card');
        
        files.forEach(file => {
            const fileType = file.dataset.type;
            const shouldShow = category === 'all' || fileType === category;
            
            file.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) {
                file.style.opacity = '0';
                file.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    file.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    file.style.opacity = '1';
                    file.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    }

    changeViewMode(mode) {
        const filesGrid = document.getElementById('filesGrid');
        if (!filesGrid) return;

        filesGrid.className = mode === 'list' ? 'files-list' : 'files-grid';
        
        const cards = filesGrid.querySelectorAll('.file-card');
        cards.forEach(card => {
            card.classList.toggle('list-view', mode === 'list');
        });
    }

    incrementDownloadCount(card) {
        const stats = card.querySelector('.trending-stats') || card.querySelector('.file-footer');
        if (!stats) return;

        let downloadsElement = stats.querySelector('.stat-item:nth-child(2) span') || 
                              stats.querySelector('.download-btn span:nth-child(2)');
        
        if (downloadsElement) {
            const current = parseInt(downloadsElement.textContent) || 0;
            downloadsElement.textContent = current + 1;
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.remove('active');
        
        document.body.style.overflow = '';
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">Уведомление</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Автоматическое удаление
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 5000);

        // Кнопка закрытия
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}с`;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new FileSphere();
    
    // Добавляем класс загруженной странице для плавного появления
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Начальная прозрачность для анимации появления
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';
