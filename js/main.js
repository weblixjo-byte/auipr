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
    // تحميل الهيدر
    try {
        const headerRes = await fetch('header.html');
        if (headerRes.ok) {
            document.getElementById('header-placeholder').innerHTML = await headerRes.text();
            initHeaderScroll(); // تفعيل تأثير السكرول للهيدر بعد تحميله
        }
    } catch (err) {
        console.error('خطأ في تحميل الهيدر:', err);
    }

    // تحميل الفوتر
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
                // خيار: إلغاء المراقبة بعد الظهور الأول لتقليل الضغط على المتصفح
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1 // يبدأ الظهور عند رؤية 10% من العنصر
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
// 3. دالة بطاقات المبدعين (Creators Modal) - هام جداً
// =========================================
function initCreatorsModal() {
    const cards = document.querySelectorAll('.creator-card');
    const modal = document.getElementById('creatorModal');
    const closeBtn = document.querySelector('.close-modal-btn');
    
    // عناصر المودال الداخلية
    const modalImg = document.getElementById('modalImg');
    const modalName = document.getElementById('modalName');
    const modalRole = document.getElementById('modalRole');
    const modalDesc = document.getElementById('modalDesc');

    if (cards.length > 0 && modal) {
        
        // فتح المودال عند الضغط على الكرت
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                
                // تعبئة البيانات من الـ Data Attributes
                modalImg.src = this.getAttribute('data-img');
                modalName.textContent = this.getAttribute('data-name');
                modalRole.textContent = this.getAttribute('data-role');
                modalDesc.textContent = this.getAttribute('data-desc');
                
                // إظهار النافذة
                modal.classList.add('active');
            });
        });

        // إغلاق المودال من زر X
        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // إغلاق المودال عند الضغط في الخلفية
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
        // نبحث عن الهيدر داخل الـ placeholder لأنه تم تحميله ديناميكياً
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


document.addEventListener('DOMContentLoaded', function() {
    
    // 1. تعريف العناصر من الـ HTML الذي أرسلته
    const modal = document.getElementById('creatorModal'); // المودال الرئيسي
    const closeBtn = document.querySelector('.close-modal-btn'); // زر الإغلاق
    
    // عناصر المحتوى داخل المودال
    const modalImg = document.getElementById('modalImg');
    const modalName = document.getElementById('modalName');
    const modalRole = document.getElementById('modalRole');
    const modalDesc = document.getElementById('modalDesc');

    // جميع بطاقات المبدعين (التي يضغط عليها المستخدم)
    const cards = document.querySelectorAll('.creator-card');

    // 2. التحقق من وجود العناصر لتجنب الأخطاء
    if (modal && cards.length > 0) {

        // إضافة حدث النقر لكل بطاقة
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault(); // منع الرابط من تحديث الصفحة

                // 3. سحب البيانات من البطاقة ووضعها داخل المودال
                // ملاحظة: يجب أن تكون بطاقاتك تحتوي على data-name, data-role... إلخ
                const name = this.getAttribute('data-name');
                const role = this.getAttribute('data-role');
                const desc = this.getAttribute('data-desc');
                const img = this.getAttribute('data-img');

                // تحديث نصوص وصورة المودال
                if(modalName) modalName.textContent = name;
                if(modalRole) modalRole.textContent = role;
                if(modalDesc) modalDesc.textContent = desc;
                if(modalImg) modalImg.src = img;

                // 4. إظهار المودال
                modal.classList.add('active');
            });
        });

        // 5. إغلاق المودال عند الضغط على (X)
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // 6. إغلاق المودال عند الضغط في المساحة السوداء (Overlay)
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
});


// =========================================
// 1. دالة تحميل الهيدر والفوتر
// =========================================
async function initApp() {
    try {
        const headerRes = await fetch('header.html');
        if (headerRes.ok) {
            document.getElementById('header-placeholder').innerHTML = await headerRes.text();
            
            // تشغيل الوظائف المعتمدة على الهيدر *بعد* تحميله
            initHeaderScroll(); 
            initDropdownMenu(); // <-- تم إضافة هذه السطر لتشغيل المنيو
            initBranchSystem(); // <-- تفعيل نظام الفروع (فرع لبنان / المقر الرئيسي)
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
// دالة تشغيل القائمة المنسدلة (الجديدة)
// =========================================
function initDropdownMenu() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const menu = document.getElementById('mainDropdownMenu');
    const overlay = document.getElementById('menuOverlay');
    
    // الأيقونة داخل الزر (عشان نغيرها لـ X)
    const icon = toggleBtn ? toggleBtn.querySelector('.hamburger-icon i') : null;

    if (!toggleBtn || !menu || !overlay) return;

    // دالة الفتح والإغلاق
    function toggleMenu() {
        const isOpen = menu.classList.contains('active');
        
        if (isOpen) {
            // إغلاق القائمة
            menu.classList.remove('active');
            overlay.classList.remove('active');
            // إرجاع أيقونة الهامبرغر
            if(icon) icon.className = 'fa-solid fa-bars';
        } else {
            // فتح القائمة
            menu.classList.add('active');
            overlay.classList.add('active');
            // تحويل الأيقونة إلى X
            if(icon) icon.className = 'fa-solid fa-xmark';
        }
    }

    // عند الضغط على الزر
    toggleBtn.addEventListener('click', toggleMenu);

    // عند الضغط على الخلفية السوداء (إغلاق القائمة)
    overlay.addEventListener('click', toggleMenu);

    // تفعيل القوائم الفرعية (مثل: عن الاتحاد)
    const subMenuToggles = document.querySelectorAll('.has-submenu > a');
    subMenuToggles.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); // منع الرابط من تحديث الصفحة
            this.parentElement.classList.toggle('open');
            
            // قلب السهم للأسفل/الأعلى
            const arrow = this.querySelector('.submenu-icon');
            if(arrow) {
                if(this.parentElement.classList.contains('open')) {
                    arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDynamicNews();
    const popup = document.getElementById('welcomePopup');
    const closeBtn = document.getElementById('closePopup');

    if (popup) {
        // إظهار البوب اب عند كل زيارة ودخول للموقع
        setTimeout(() => {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }, 1200);
    }

    if (popup) {
        // إغلاق عند الضغط على زر X
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // إغلاق عند الضغط خارج محتوى البوب اب
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});



let lastScrollTop = 0; // متغير لتخزين آخر قيمة تمرير

window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    if (!header) return; // تأكد من وجود الهيدر

    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // 1. إضافة ظل وتغيير خلفية الهيدر بمجرد التحرك عن الصفر
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // 2. منطق الإخفاء والإظهار (Smart Sticky)
    if (currentScroll > lastScrollTop && currentScroll > 150) {
        // إذا كنت تنزل لأسفل وتجاوزت 150 بيكسل -> اختفي
        header.classList.add('header-hide');
    } else {
        // إذا كنت تصعد لأعلى -> اظهر
        header.classList.remove('header-hide');
    }

    // تحديث قيمة آخر تمرير (منع القيم السالبة في موبايلات آيفون)
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

            // 1. تحديث سكشن الأخبار في الصفحة الرئيسية (index.html) - أحدث 3 أخبار
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

            // 2. تحديث صفحة جميع الأخبار (news/index.html) - جميع الأخبار
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
// نظام إدارة الفروع الإقليمية (فرع لبنان / المقر العام)
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
        subName: 'فرع الجمهورية اللبنانية',
        shortName: 'فرع لبنان',
        flag: '🇱🇧',
        badgeText: 'فرع لبنان 🇱🇧',
        phone: '+961 1 000 000',
        email: 'lebanon@auipr.org',
        address: 'بيروت - الجمهورية اللبنانية',
        contactTitle: 'تواصل مع فرع لبنان',
        titleSuffix: ' | فرع لبنان 🇱🇧'
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

    // 3. الفحص من خلال الجلسة المخزنة سابقاً
    const stored = sessionStorage.getItem('auipr_active_branch');
    if (stored && AUIPR_BRANCHES[stored]) {
        return stored;
    }

    // الافتراضي: المقر العام (الموقع الأصلي دون أي تعديل)
    return 'main';
}

function initBranchSystem() {
    const branchId = getActiveBranchId();
    const isLebanon = branchId === 'lebanon';

    // تطبيق تخصيصات فرع لبنان فقط في حال كان الفرع النشط هو لبنان
    if (isLebanon) {
        document.body.classList.add('branch-mode-lebanon');

        // تحديث عنوان الصفحة
        if (!document.title.includes('فرع لبنان')) {
            document.title = document.title + ' | فرع لبنان 🇱🇧';
        }

        // تحديث اسم الهيدر لفرع لبنان
        const applyHeaderLebanon = () => {
            const orgNames = document.querySelectorAll('.org-name');
            orgNames.forEach(el => {
                el.innerHTML = `الاتحاد العربي لحماية حقوق الملكية الفكرية <span class="branch-pill-header" style="background: rgba(60,235,195,0.18); color: #00876c; border: 1px solid rgba(60,235,195,0.5); padding: 3px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; margin-right: 8px; display: inline-block;">🇱🇧 فرع لبنان</span>`;
            });
        };

        applyHeaderLebanon();
        setTimeout(applyHeaderLebanon, 300);

        // تخصيص صفحة تواصل معنا لفرع لبنان
        if (window.location.pathname.includes('contact.html')) {
            setTimeout(() => {
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle) pageTitle.innerText = 'تواصل مع فرع لبنان';

                const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
                if (breadcrumbCurrent) breadcrumbCurrent.innerText = 'تواصل مع فرع لبنان 🇱🇧';

                const infoTexts = document.querySelectorAll('.info-text');
                infoTexts.forEach(box => {
                    if (box.innerHTML.includes('info@auipr.org')) {
                        box.innerHTML = '<a href="mailto:lebanon@auipr.org" dir="ltr">lebanon@auipr.org</a>';
                    }
                    if (box.innerText.includes('مصر') || box.innerText.includes('الأردن') || box.innerText.includes('عمان')) {
                        box.innerHTML = '<p>بيروت - الجمهورية اللبنانية</p>';
                    }
                });
            }, 350);
        }
    }

    // إضافة خيار التنقل بين الفروع في القائمة المنسدلة
    const injectBranchNav = () => {
        const dropdownList = document.querySelector('.dropdown-list');
        if (dropdownList && !dropdownList.querySelector('.branch-switch-item')) {
            const switchLi = document.createElement('li');
            switchLi.className = 'branch-switch-item has-submenu';
            
            const isLb = branchId === 'lebanon';
            switchLi.innerHTML = `
                <a href="#" style="color: #7251cd; font-weight: 700;">
                    <i class="fa-solid fa-globe"></i> ${isLb ? '🇱🇧 فرع لبنان' : 'فروع الاتحاد'} 
                    <i class="fa-solid fa-chevron-down submenu-icon"></i>
                </a>
                <ul class="sub-menu">
                    <li>
                        <a href="?branch=main" onclick="sessionStorage.setItem('auipr_active_branch','main');" style="${!isLb ? 'font-weight: bold; color: #7251cd;' : ''}">
                            <i class="fa-solid fa-building-columns"></i> المقر الرئيسي ${!isLb ? '(الحالي)' : ''}
                        </a>
                    </li>
                    <li>
                        <a href="?branch=lebanon" onclick="sessionStorage.setItem('auipr_active_branch','lebanon');" style="${isLb ? 'font-weight: bold; color: #00c4a7;' : ''}">
                            🇱🇧 فرع لبنان ${isLb ? '(الحالي)' : ''}
                        </a>
                    </li>
                </ul>
            `;
            dropdownList.appendChild(switchLi);

            // تفعيل السهم وفتح القائمة الفرعية
            const toggleLink = switchLi.querySelector('> a');
            if (toggleLink) {
                toggleLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchLi.classList.toggle('open');
                    const arrow = switchLi.querySelector('.submenu-icon');
                    if (arrow) {
                        if (switchLi.classList.contains('open')) {
                            arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
                        } else {
                            arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
                        }
                    }
                });
            }
        }
    };

    injectBranchNav();
    setTimeout(injectBranchNav, 300);
}