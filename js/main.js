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
        const hidePopup = () => {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        // التحقق مما إذا كانت النافذة قد ظهرت في جلسة التصفح الحالية
        const popupSeen = sessionStorage.getItem('auipr_welcome_popup_seen');

        if (!popupSeen) {
            setTimeout(() => {
                popup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                // تسجيل ظهورها حتى لا تعود للظهور إطلاقاً أثناء التنقل أو الرجوع للصفحة الرئيسية
                sessionStorage.setItem('auipr_welcome_popup_seen', 'true');
            }, 1200);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', hidePopup);
        }

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                hidePopup();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.style.display === 'flex') {
                hidePopup();
            }
        });
    }

    // تشغيل نظام استمارة التسجيل والحجز التفاعلية
    initRegistrationModal();
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
        flag: '',
        badgeText: 'ممثلية الجمهورية اللبنانية',
        phone: '+961 1 000 000',
        email: 'lebanon@auipr.org',
        address: 'بيروت - الجمهورية اللبنانية',
        contactTitle: 'تواصل مع ممثلية الجمهورية اللبنانية',
        titleSuffix: ' | ممثلية الجمهورية اللبنانية'
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
        const currentPath = window.location.pathname;

        const mainTabs = document.querySelectorAll('.branch-tab-main, .branch-nav-main');
        const lbTabs = document.querySelectorAll('.branch-tab-lebanon, .branch-nav-lebanon');

        mainTabs.forEach(a => {
            if (isProd) {
                a.href = 'https://auipr.org' + currentPath;
            } else {
                const u = new URL(window.location.href);
                u.searchParams.set('branch', 'main');
                a.href = u.pathname + u.search;
            }
            a.onclick = () => sessionStorage.setItem('auipr_active_branch', 'main');
            if (!isLebanon) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });

        lbTabs.forEach(a => {
            if (isProd) {
                a.href = 'https://lebanon.auipr.org' + currentPath;
            } else {
                const u = new URL(window.location.href);
                u.searchParams.set('branch', 'lebanon');
                a.href = u.pathname + u.search;
            }
            a.onclick = () => sessionStorage.setItem('auipr_active_branch', 'lebanon');
            if (isLebanon) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });

        // 2. تطبيق هوية ممثلية لبنان عند التواجد في نطاق ممثلية لبنان
        if (isLebanon) {
            document.body.classList.add('branch-mode-lebanon');

            if (!document.title.includes('ممثلية الجمهورية اللبنانية')) {
                document.title = document.title + ' | ممثلية الجمهورية اللبنانية';
            }

            const orgNames = document.querySelectorAll('.org-name');
            orgNames.forEach(el => {
                el.innerHTML = `الاتحاد العربي لحماية حقوق الملكية الفكرية<span class="branch-subname" style="display: block; font-size: 0.85em; font-weight: 600; color: #475569; margin-top: 2px;">- ممثلية الجمهورية اللبنانية</span>`;
            });

            if (window.location.pathname.includes('contact.html')) {
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle) pageTitle.innerText = 'تواصل مع ممثلية الجمهورية اللبنانية';

                const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
                if (breadcrumbCurrent) breadcrumbCurrent.innerText = 'ممثلية الجمهورية اللبنانية';

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

/* ========================================================
   REGISTRATION & BOOKING POPUP (WEB3FORMS INTEGRATION)
   ======================================================== */
const WEB3FORMS_ACCESS_KEY = "95bcb994-7d55-4e1e-a7d8-e0457880a2fe"; // مفتاح Web3Forms

function initRegistrationModal() {
    // 1. إنشاء وحقن هيكل النافذة في الصفحة إن لم تكن موجودة
    if (!document.getElementById('regModalOverlay')) {
        const modalHTML = `
        <div class="reg-modal-overlay" id="regModalOverlay" role="dialog" aria-modal="true" aria-labelledby="regModalTitle">
          <div class="reg-modal-content">
            <div class="reg-modal-header">
              <button type="button" class="reg-modal-close" id="regModalClose" aria-label="إغلاق">&times;</button>
              <div class="reg-modal-badge"><i class="fa-solid fa-calendar-check"></i> التسجيل والحجز المباشر</div>
              <h3 class="reg-modal-title" id="regModalTitle">استمارة التسجيل والمشاركة</h3>
              <p class="reg-modal-subtitle">الاتحاد العربي لحماية حقوق الملكية الفكرية - هيئة عربية دولية</p>
            </div>
            <div class="reg-modal-body" id="regModalBody">
              <form id="regModalForm">
                <input type="hidden" name="access_key" id="regWeb3FormsKey" value="${WEB3FORMS_ACCESS_KEY}">
                <input type="hidden" name="subject" value="طلب تسجيل جديد عبر موقع الاتحاد العربي للملكية الفكرية">
                <input type="hidden" name="from_name" value="بوابة التسجيل الإلكتروني AUIPR">
                <input type="checkbox" name="botcheck" style="display: none;">

                <div class="reg-form-grid">
                  <div class="reg-input-group">
                    <label class="reg-label" for="regFullName">الاسم الكامل <span class="required">*</span></label>
                    <div class="reg-input-wrap">
                      <i class="fa-regular fa-user reg-input-icon"></i>
                      <input type="text" id="regFullName" name="name" class="reg-input" placeholder="الاسم الثلاثي أو الرباعي" required>
                    </div>
                  </div>

                  <div class="reg-input-group">
                    <label class="reg-label" for="regPhone">رقم الهاتف / واتساب <span class="required">*</span></label>
                    <div class="reg-input-wrap">
                      <i class="fa-brands fa-whatsapp reg-input-icon"></i>
                      <input type="tel" id="regPhone" name="phone" class="reg-input" dir="ltr" placeholder="+962 ... / +966 ..." required>
                    </div>
                  </div>

                  <div class="reg-input-group">
                    <label class="reg-label" for="regEmail">البريد الإلكتروني <span class="required">*</span></label>
                    <div class="reg-input-wrap">
                      <i class="fa-regular fa-envelope reg-input-icon"></i>
                      <input type="email" id="regEmail" name="email" class="reg-input" dir="ltr" placeholder="example@domain.com" required>
                    </div>
                  </div>

                  <div class="reg-input-group">
                    <label class="reg-label" for="regOrg">جهة العمل / المؤسسة</label>
                    <div class="reg-input-wrap">
                      <i class="fa-regular fa-building reg-input-icon"></i>
                      <input type="text" id="regOrg" name="organization" class="reg-input" placeholder="الشركة / المؤسسة / الصفة">
                    </div>
                  </div>

                  <div class="reg-input-group reg-form-full">
                    <label class="reg-label" for="regEventType">نوع التسجيل / الفعالية <span class="required">*</span></label>
                    <div class="reg-input-wrap">
                      <i class="fa-solid fa-list-check reg-input-icon"></i>
                      <select id="regEventType" name="event_type" class="reg-select" required>
                        <option value="اليوم العربي للملكية الفكرية وعاصمتها (عمان)">اليوم العربي للملكية الفكرية وعاصمتها (عمان - 1 ديسمبر 2026)</option>
                        <option value="مؤتمر تطوير منظومة الملكية الفكرية (القاهرة)">مؤتمر تطوير منظومة الملكية الفكرية (القاهرة)</option>
                        <option value="مؤتمر الملكية الفكرية والذكاء الاصطناعي">مؤتمر الملكية الفكرية والذكاء الاصطناعي</option>
                        <option value="طلب الانضمام وعضوية الاتحاد">طلب الانضمام وعضوية الاتحاد العربي</option>
                        <option value="برامج ودورات الأكاديمية العربية الدولية">برامج ودورات الأكاديمية العربية الدولية للملكية الفكرية</option>
                        <option value="استفسار أو حجز عام">استفسار أو حجز عام</option>
                      </select>
                    </div>
                  </div>

                  <div class="reg-input-group reg-form-full">
                    <label class="reg-label" for="regMessage">ملاحظات إضافية أو رسالة مخصصة <span style="color:#64748b; font-weight:400;">(اختياري)</span></label>
                    <textarea id="regMessage" name="message" class="reg-textarea" rows="3" placeholder="أي استفسارات أو تفاصيل إضافية تود إضافتها مع التسجيل..."></textarea>
                  </div>
                </div>

                <button type="submit" class="reg-submit-btn" id="regSubmitBtn">
                  <span id="regBtnContent"><i class="fa-regular fa-paper-plane"></i> إرسال طلب التسجيل</span>
                </button>

                <p class="reg-footer-note">
                  <i class="fa-solid fa-lock" style="color: #3cebc3;"></i> بياناتكم محمية ومحفوظة بسرية تامة، وسيتم التواصل معكم لتأكيد التسجيل.
                </p>
              </form>
            </div>
          </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const overlay = document.getElementById('regModalOverlay');
    const closeBtn = document.getElementById('regModalClose');
    const form = document.getElementById('regModalForm');
    const select = document.getElementById('regEventType');

    window.openRegistrationModal = function(defaultEvent = '') {
        if (!overlay) return;
        
        if (defaultEvent && select) {
            let found = false;
            for (let i = 0; i < select.options.length; i++) {
                const opt = select.options[i];
                if (opt.value.includes(defaultEvent) || defaultEvent.includes(opt.value)) {
                    opt.selected = true;
                    found = true;
                    break;
                }
            }
            if (!found) {
                const customOpt = new Option(defaultEvent, defaultEvent, true, true);
                select.add(customOpt, 0);
            }
        }

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeRegistrationModal = function() {
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', window.closeRegistrationModal);
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                window.closeRegistrationModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
            window.closeRegistrationModal();
        }
    });

    // 2. إرسال النموذج مع Web3Forms
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('regSubmitBtn');
            const btnContent = document.getElementById('regBtnContent');
            const keyInput = document.getElementById('regWeb3FormsKey');
            const key = keyInput ? keyInput.value : '';

            if (!key || key === 'YOUR_ACCESS_KEY_HERE') {
                alert('يرجى تزويد مفتاح Web3Forms (Access Key) لتفعيل استلام رسائل واستمارات التسجيل على بريدكم الإلكتروني.');
                return;
            }

            btn.disabled = true;
            btnContent.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إرسال الطلب...';

            try {
                const formData = new FormData(form);
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    const body = document.getElementById('regModalBody');
                    body.innerHTML = `
                        <div class="reg-success-box">
                            <div class="reg-success-icon"><i class="fa-solid fa-circle-check"></i></div>
                            <h3 class="reg-success-title">تم استلام طلب التسجيل بنجاح!</h3>
                            <p class="reg-success-desc">شكراً لاهتمامكم بالتسجيل والمشاركة. تم إرسال بياناتكم بنجاح وسيقوم فريق الأمانة العامة للاتحاد بالتواصل معكم قريباً عبر الهاتف أو البريد الإلكتروني لتأكيد التسجيل.</p>
                            <button type="button" class="reg-success-btn" onclick="window.closeRegistrationModal()">إغلاق النافذة</button>
                        </div>
                    `;
                } else {
                    alert(data.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.');
                    btn.disabled = false;
                    btnContent.innerHTML = '<i class="fa-regular fa-paper-plane"></i> إرسال طلب التسجيل';
                }
            } catch (err) {
                console.error('Web3Forms Error:', err);
                alert('تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.');
                btn.disabled = false;
                btnContent.innerHTML = '<i class="fa-regular fa-paper-plane"></i> إرسال طلب التسجيل';
            }
        });
    }

    // 3. التقاط أي زر أو رابط في الموقع يحتوي على كلمات التسجيل أو الحجز أو الاشتراك
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (!target) return;

        // استثناء أزرار لوحة التحكم، تبديل الفرع، أزرار النموذج نفسه، أو روابط القائمة العلوية
        if (target.closest('.dropdown-list') || 
            target.closest('.branch-switcher-box') || 
            target.closest('.reg-modal-content') || 
            target.classList.contains('reg-modal-close') ||
            target.classList.contains('branch-tab-btn')) {
            return;
        }

        const text = (target.innerText || target.textContent || '').trim();
        const title = (target.getAttribute('title') || '').trim();

        const isRegisterTrigger = 
            target.classList.contains('btn-event-filled') ||
            target.classList.contains('btn-royal-cta') ||
            target.hasAttribute('data-open-register') ||
            /(التسجيل|تسجيل|حجز|اشترك|اشتراك|انضم|انضمام)/i.test(text) ||
            /(التسجيل|تسجيل|حجز|اشترك|اشتراك|انضم)/i.test(title);

        if (isRegisterTrigger) {
            e.preventDefault();
            
            let eventName = '';
            if (/اشترك|انضم/i.test(text) || /اشترك|انضم/i.test(title)) {
                eventName = 'طلب الانضمام وعضوية الاتحاد';
            } else {
                // استخراج عنوان الفعالية من الكرت المحيط بالزر إن وجد
                const card = target.closest('.events-main-card, .news-item, .seminars-banner-card, .cta-pixel-card, .news-card');
                if (card) {
                    const heading = card.querySelector('h2, h3, h4');
                    if (heading) eventName = heading.textContent.trim();
                }
                if (!eventName && title) {
                    eventName = title.replace(/^(التسجيل في|طلب الانضمام إلى|حجز في)\s*/, '');
                }
            }

            window.openRegistrationModal(eventName);
        }
    });
}