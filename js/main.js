document.addEventListener('DOMContentLoaded', () => {
    // 1. تشغيل الوظائف الأساسية
    initApp();
    
    // 2. تفعيل مراقب التمرير (Scroll Reveal)
    initScrollReveal();

    // 3. تفعيل بطاقات المبدعين (Modal)
    initCreatorsModal();
});

// =========================================
// 1. دالة تحميل الهيدر والفوتر
// =========================================
async function initApp() {
    try {
        const headerRes = await fetch('header.html');
        if (headerRes.ok) {
            document.getElementById('header-placeholder').innerHTML = await headerRes.text();
            
            // تشغيل الوظائف المعتمدة على الهيدر بعد تحميله
            initHeaderScroll(); 
            initDropdownMenu(); 
            initBranchSystem(); 
        }
    } catch (err) {
        console.error('خطأ في تحميل الهيدر:', err);
    }

    try {
        const footerRes = await fetch('footer.html');
        if (footerRes.ok) {
            document.getElementById('footer-placeholder').innerHTML = await footerRes.text();
        }
    } catch (err) {
        console.error('خطأ في تحميل الفوتر:', err);
    }
}

// =========================================
// 2. دالة حركات الظهور (Scroll Reveal)
// =========================================
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    // مراقبة العناصر الموجودة حالياً
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    // مراقبة العناصر التي قد تضاف ديناميكياً مستقبلاً
    const observerDynamic = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList.contains('reveal')) {
                    observer.observe(node);
                }
            });
        });
    });
    
    observerDynamic.observe(document.body, { childList: true, subtree: true });
}

// =========================================
// 3. دالة بطاقات المبدعين (Creators Modal)
// =========================================
function initCreatorsModal() {
    const cards = document.querySelectorAll('.creator-card');
    const modal = document.getElementById('creatorModal');
    const closeBtn = document.querySelector('.close-modal-btn');
    
    const modalImg = document.getElementById('modalImg');
    const modalName = document.getElementById('modalName');
    const modalRole = document.getElementById('modalRole');
    const modalDesc = document.getElementById('modalDesc');

    if (cards.length > 0 && modal) {
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                
                modalImg.src = this.getAttribute('data-img');
                modalName.textContent = this.getAttribute('data-name');
                modalRole.textContent = this.getAttribute('data-role');
                modalDesc.textContent = this.getAttribute('data-desc');
                
                modal.classList.add('active');
            });
        });

        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

// =========================================
// 4. دالة تأثير الهيدر عند السكرول
// =========================================
function initHeaderScroll() {
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header') || document.querySelector('.main-header');
        if (header) {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

// =========================================
// 5. دالة تشغيل القائمة المنسدلة
// =========================================
function initDropdownMenu() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const menu = document.getElementById('mainDropdownMenu');
    const overlay = document.getElementById('menuOverlay');
    const icon = toggleBtn ? toggleBtn.querySelector('.hamburger-icon i') : null;

    if (!toggleBtn || !menu || !overlay) return;

    function toggleMenu() {
        const isOpen = menu.classList.contains('active');
        if (isOpen) {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            if(icon) icon.className = 'fa-solid fa-bars';
        } else {
            menu.classList.add('active');
            overlay.classList.add('active');
            if(icon) icon.className = 'fa-solid fa-xmark';
        }
    }

    toggleBtn.onclick = toggleMenu;
    overlay.onclick = toggleMenu;

    // تفعيل القوائم الفرعية المنسدلة (عن الاتحاد والممثليات الإقليمية)
    const subMenuToggles = menu.querySelectorAll('.has-submenu > a');
    subMenuToggles.forEach(item => {
        item.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const parent = this.parentElement;
            parent.classList.toggle('open');
            
            const arrow = this.querySelector('.submenu-icon');
            if (arrow) {
                if (parent.classList.contains('open')) {
                    arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            }
        };
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDynamicNews();
    const popup = document.getElementById('welcomePopup');
    const closeBtn = document.getElementById('closePopup');

    if (popup) {
        setTimeout(() => {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }, 1200);

        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});

let lastScrollTop = 0;

window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    if (currentScroll > lastScrollTop && currentScroll > 150) {
        header.classList.add('header-hide');
    } else {
        header.classList.remove('header-hide');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, { passive: true });

// =========================================
// تحميل الأخبار الديناميكية من MongoDB / Netlify API
// =========================================
async function loadDynamicNews() {
    const homeGrid = document.querySelector('.news-cards-grid');
    const newsPageGrid = document.querySelector('.news-grid');

    if (!homeGrid && !newsPageGrid) return;

    try {
        const branchParam = typeof getActiveBranchId === 'function' ? getActiveBranchId() : 'main';
        const queryParam = branchParam && branchParam !== 'main' ? `?branch=${encodeURIComponent(branchParam)}` : '';
        const res = await fetch(`/.netlify/functions/news${queryParam}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.news && data.news.length > 0) {
            const resolveImg = (url, isSubfolder = false) => {
                if (!url) return isSubfolder ? '../img/ip_conference_2026.png' : 'img/ip_conference_2026.png';
                if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url;
                return isSubfolder ? '../' + url : url;
            };

            const getNewsUrl = (item, isSubfolder = false) => {
                if (item.slug) {
                    return isSubfolder ? item.slug : `news/${item.slug}`;
                }
                return isSubfolder ? `view.html?id=${item._id}` : `news/view.html?id=${item._id}`;
            };

            if (homeGrid) {
                const latestNews = data.news.slice(0, 3);
                homeGrid.innerHTML = latestNews.map(item => `
                    <div class="news-item">
                        <div class="news-item-top">
                            <img src="${resolveImg(item.imageUrl, false)}" alt="${item.title}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
                        </div>
                        <div class="news-item-bottom">
                            <h3>${item.title}</h3>
                            <p>${item.summary || ''}</p>
                            <a href="${getNewsUrl(item, false)}" class="news-action-btn" title="قراءة تفاصيل الخبر"><span class="icon-circle-news">←</span><span class="txt">اقرأ المزيد</span></a>
                        </div>
                    </div>
                `).join('');
            }

            if (newsPageGrid) {
                newsPageGrid.innerHTML = data.news.map(item => `
                    <div class="news-card">
                        <div class="news-card-header">
                            <img src="${resolveImg(item.imageUrl, true)}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                        </div>
                        <div class="news-card-body">
                            <h3>${item.title}</h3>
                            <p>${item.summary || ''}</p>
                            <a href="${getNewsUrl(item, true)}" class="news-read-more" title="قراءة تفاصيل الخبر"><span class="btn-icon">←</span><span class="btn-text">اقرأ المزيد</span></a>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.log('Dynamic news offline or fallback active:', e);
    }
}

// تصفية الأخبار حسب الفرع في صفحة الأخبار
window.filterNewsByBranch = async function(branchCode, btnEl) {
    if (btnEl) {
        document.querySelectorAll('.branch-filter-btn').forEach(b => {
            b.style.background = '#ffffff';
            b.style.color = '#1a2b4b';
            b.style.borderColor = '#cbd5e1';
        });
        btnEl.style.background = '#2b2346';
        btnEl.style.color = '#ffffff';
        btnEl.style.borderColor = 'rgba(255,255,255,0.2)';
    }

    const newsPageGrid = document.querySelector('.news-grid');
    if (!newsPageGrid) return;

    newsPageGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 40px;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.8rem; color: #00c4a7; margin-bottom: 12px; display: block;"></i> جاري تحميل الأخبار...</div>';

    try {
        const query = branchCode && branchCode !== 'all' ? `?branch=${branchCode}` : '';
        const res = await fetch(`/.netlify/functions/news${query}`);
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();

        if (data.news && data.news.length > 0) {
            const resolveImg = (url) => {
                if (!url) return '../img/ip_conference_2026.png';
                if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url;
                return '../' + url;
            };

            newsPageGrid.innerHTML = data.news.map(item => `
                <div class="news-card">
                    <div class="news-card-header">
                        <img src="${resolveImg(item.imageUrl)}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                    </div>
                    <div class="news-card-body">
                        <h3>${item.title}</h3>
                        <p>${item.summary || ''}</p>
                        <a href="${item.slug || `view.html?id=${item._id}`}" class="news-read-more" title="قراءة تفاصيل الخبر"><span class="btn-icon">←</span><span class="btn-text">اقرأ المزيد</span></a>
                    </div>
                </div>
            `).join('');
        } else {
            newsPageGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 40px; background: #fff; border-radius: 18px; border: 1px dashed #cbd5e1;">لا توجد أخبار منشورة لهذا الفرع حالياً.</div>';
        }
    } catch (e) {
        console.error('Filter news error:', e);
    }
};

// =========================================
// نظام إدارة الممثليات الإقليمية
// =========================================
const AUIPR_BRANCHES = {
    main: {
        id: 'main',
        name: 'الاتحاد العربي لحماية حقوق الملكية الفكرية (منظمة عربية)',
        shortName: 'المقر الرئيسي',
        flag: '',
        email: 'info@auipr.org',
        isDefault: true
    },
    lebanon: {
        id: 'lebanon',
        name: 'الاتحاد العربي لحماية حقوق الملكية الفكرية',
        subName: 'ممثلية الجمهورية اللبنانية',
        shortName: 'ممثلية الجمهورية اللبنانية',
        flag: '🇱🇧',
        badgeText: 'ممثلية الجمهورية اللبنانية 🇱🇧',
        phone: '+961 1 000 000',
        email: 'lebanon@auipr.org',
        address: 'بيروت - الجمهورية اللبنانية',
        contactTitle: 'تواصل مع ممثلية الجمهورية اللبنانية',
        titleSuffix: ' | ممثلية الجمهورية اللبنانية 🇱🇧'
    }
};

function getActiveBranchId() {
    // 1. الفحص من خلال الرابط (e.g. ?branch=lebanon)
    const params = new URLSearchParams(window.location.search);
    const qBranch = params.get('branch');
    if (qBranch && AUIPR_BRANCHES[qBranch]) {
        sessionStorage.setItem('auipr_active_branch', qBranch);
        return qBranch;
    }

    // 2. الفحص من خلال الدومين الفرعي (e.g. lebanon.auipr.org or lb.auipr.org)
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes('lebanon') || hostname.startsWith('lb.')) {
        return 'lebanon';
    }

    // 3. الدومين الرئيسي الإنتاجي يبقى المقر الرئيسي دون تغيير
    if (hostname === 'auipr.org' || hostname === 'www.auipr.org') {
        return 'main';
    }

    // 4. الفحص من خلال الجلسة في بيئات المعاينة و localhost
    const stored = sessionStorage.getItem('auipr_active_branch');
    if (stored && AUIPR_BRANCHES[stored]) {
        return stored;
    }

    return 'main';
}

function initBranchSystem() {
    const branchId = getActiveBranchId();
    const isLebanon = branchId === 'lebanon';
    const hostname = window.location.hostname.toLowerCase();
    const isProd = hostname.endsWith('auipr.org');

    const updateBranchUI = () => {
        // 1. تحديث نصوص وروابط تبديل الممثلية في القائمة
        const label = document.getElementById('branchMenuLabel');
        if (label) {
            label.textContent = isLebanon ? '🇱🇧 ممثلية لبنان' : 'الممثليات الإقليمية';
        }

        const mainLinks = document.querySelectorAll('.branch-nav-main');
        const lbLinks = document.querySelectorAll('.branch-nav-lebanon');
        const mainBadges = document.querySelectorAll('.badge-main-curr');
        const lbBadges = document.querySelectorAll('.badge-lb-curr');

        const currentPath = window.location.pathname;

        mainLinks.forEach(a => {
            if (isProd) {
                a.href = 'https://auipr.org' + currentPath;
            } else {
                const u = new URL(window.location.href);
                u.searchParams.set('branch', 'main');
                a.href = u.pathname + u.search;
            }
            a.onclick = () => sessionStorage.setItem('auipr_active_branch', 'main');
            if (!isLebanon) {
                a.style.fontWeight = 'bold';
                a.style.color = '#7251cd';
            } else {
                a.style.fontWeight = 'normal';
                a.style.color = '';
            }
        });

        lbLinks.forEach(a => {
            if (isProd) {
                a.href = 'https://lebanon.auipr.org' + currentPath;
            } else {
                const u = new URL(window.location.href);
                u.searchParams.set('branch', 'lebanon');
                a.href = u.pathname + u.search;
            }
            a.onclick = () => sessionStorage.setItem('auipr_active_branch', 'lebanon');
            if (isLebanon) {
                a.style.fontWeight = 'bold';
                a.style.color = '#00c4a7';
            } else {
                a.style.fontWeight = 'normal';
                a.style.color = '';
            }
        });

        mainBadges.forEach(b => b.style.display = !isLebanon ? 'inline' : 'none');
        lbBadges.forEach(b => b.style.display = isLebanon ? 'inline' : 'none');

        // 2. تطبيق هوية ممثلية لبنان عند التواجد في نطاق ممثلية لبنان
        if (isLebanon) {
            document.body.classList.add('branch-mode-lebanon');

            if (!document.title.includes('ممثلية الجمهورية اللبنانية')) {
                document.title = document.title + ' | ممثلية الجمهورية اللبنانية 🇱🇧';
            }

            const orgNames = document.querySelectorAll('.org-name');
            orgNames.forEach(el => {
                el.innerHTML = `الاتحاد العربي لحماية حقوق الملكية الفكرية <span class="branch-pill-header" style="background: rgba(60,235,195,0.18); color: #00876c; border: 1px solid rgba(60,235,195,0.5); padding: 3px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; margin-right: 8px; display: inline-block;">🇱🇧 ممثلية الجمهورية اللبنانية</span>`;
            });

            if (window.location.pathname.includes('contact.html')) {
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle) pageTitle.innerText = 'تواصل مع ممثلية الجمهورية اللبنانية';

                const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
                if (breadcrumbCurrent) breadcrumbCurrent.innerText = 'ممثلية الجمهورية اللبنانية 🇱🇧';

                const infoTexts = document.querySelectorAll('.info-text');
                infoTexts.forEach(box => {
                    if (box.innerHTML.includes('info@auipr.org')) {
                        box.innerHTML = '<a href="mailto:lebanon@auipr.org" dir="ltr">lebanon@auipr.org</a>';
                    }
                    if (box.innerText.includes('مصر') || box.innerText.includes('الأردن') || box.innerText.includes('عمان')) {
                        box.innerHTML = '<p>بيروت - الجمهورية اللبنانية</p>';
                    }
                });
            }
        }
    };

    updateBranchUI();
    setTimeout(updateBranchUI, 300);
}