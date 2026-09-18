/**
 * AUIPR Multi-Branch & Representation Management
 * فرع المملكة الأردنية الهاشمية & ممثل الجمهورية اللبنانية للاتحاد العربي لحماية حقوق الملكية الفكرية
 */

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
        name: 'ممثل الجمهورية اللبنانية للاتحاد العربي لحماية حقوق الملكية الفكرية',
        subName: 'ممثل الجمهورية اللبنانية',
        shortName: 'ممثل الجمهورية اللبنانية',
        flag: '',
        badgeText: 'ممثل الجمهورية اللبنانية',
        phone: '+961 1 000 000',
        email: 'lebanon@auipr.org',
        address: 'بيروت - الجمهورية اللبنانية',
        contactTitle: 'تواصل مع ممثل الجمهورية اللبنانية',
        titleSuffix: ' | ممثل الجمهورية اللبنانية للاتحاد العربي'
    },
    jordan: {
        id: 'jordan',
        name: 'فرع المملكة الأردنية الهاشمية للاتحاد العربي لحماية حقوق الملكية الفكرية',
        subName: 'فرع المملكة الأردنية الهاشمية',
        shortName: 'فرع الأردن',
        decree: 'الصادر بالقرار رقم (1371/96/9) عن وزارة الخارجية',
        flag: '',
        badgeText: 'فرع المملكة الأردنية الهاشمية',
        phone: '+962 7 9555 5015',
        email: 'jordan@auipr.org',
        address: 'عمان - المملكة الأردنية الهاشمية',
        contactTitle: 'تواصل مع فرع المملكة الأردنية الهاشمية',
        titleSuffix: ' | فرع المملكة الأردنية الهاشمية'
    }
};

function getActiveBranchId() {
    // 1. الفحص من خلال الرابط (e.g. ?branch=jordan or ?branch=lebanon)
    const params = new URLSearchParams(window.location.search);
    const qBranch = params.get('branch');
    if (qBranch && AUIPR_BRANCHES[qBranch]) {
        sessionStorage.setItem('auipr_active_branch', qBranch);
        return qBranch;
    }

    // 2. الفحص من خلال الدومين الفرعي (e.g. jordan.auipr.org / jo.auipr.org / lebanon.auipr.org / lb.auipr.org)
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.includes('jordan') || hostname.startsWith('jo.')) {
        return 'jordan';
    }
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
    const isJordan = branchId === 'jordan';
    const isMain = branchId === 'main';
    const hostname = window.location.hostname.toLowerCase();
    const isProd = hostname.endsWith('auipr.org');

    const updateBranchUI = () => {
        const currentPath = window.location.pathname;

        const mainTabs = document.querySelectorAll('.branch-tab-main, .branch-nav-main');
        const lbTabs = document.querySelectorAll('.branch-tab-lebanon, .branch-nav-lebanon');
        const joTabs = document.querySelectorAll('.branch-tab-jordan, .branch-nav-jordan');

        mainTabs.forEach(a => {
            if (isProd) {
                a.href = 'https://auipr.org' + currentPath;
            } else {
                const u = new URL(window.location.href);
                u.searchParams.set('branch', 'main');
                a.href = u.pathname + u.search;
            }
            a.onclick = () => sessionStorage.setItem('auipr_active_branch', 'main');
            if (isMain) {
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

        joTabs.forEach(a => {
            if (isProd) {
                a.href = 'https://jordan.auipr.org' + currentPath;
            } else {
                const u = new URL(window.location.href);
                u.searchParams.set('branch', 'jordan');
                a.href = u.pathname + u.search;
            }
            a.onclick = () => sessionStorage.setItem('auipr_active_branch', 'jordan');
            if (isJordan) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });

        // 2. تطبيق هوية الفرع عند التواجد في نطاقه
        if (isLebanon) {
            document.body.classList.remove('branch-mode-jordan');
            document.body.classList.add('branch-mode-lebanon');
            sessionStorage.setItem('auipr_active_branch', 'lebanon');

            if (!document.title.includes('ممثل الجمهورية اللبنانية')) {
                document.title = document.title + ' | ممثل الجمهورية اللبنانية للاتحاد العربي';
            }

            const orgNames = document.querySelectorAll('.org-name');
            orgNames.forEach(el => {
                el.innerHTML = `ممثل الجمهورية اللبنانية<span class="branch-subname" style="display: block; font-size: 0.82em; font-weight: 600; color: #475569; margin-top: 2px;">للاتحاد العربي لحماية حقوق الملكية الفكرية</span>`;
            });

            const footerOrgs = document.querySelectorAll('.footer-org-name');
            footerOrgs.forEach(el => {
                el.innerHTML = `ممثل الجمهورية اللبنانية<span style="display:block;font-size:0.85em;color:#94a3b8;margin-top:4px;">للاتحاد العربي لحماية حقوق الملكية الفكرية</span>`;
            });

            if (window.location.pathname.includes('contact.html')) {
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle) pageTitle.innerText = 'تواصل مع ممثل الجمهورية اللبنانية';

                const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
                if (breadcrumbCurrent) breadcrumbCurrent.innerText = 'ممثل الجمهورية اللبنانية';

                const emailLink = document.querySelector('.contact-item a[href^="mailto:"]');
                if (emailLink) {
                    emailLink.href = 'mailto:lebanon@auipr.org';
                    emailLink.innerText = 'lebanon@auipr.org';
                }

                const itemJo = document.querySelector('.address-item-jo');
                const itemLb = document.querySelector('.address-item-lb');
                if (itemLb) itemLb.style.display = 'flex';
                if (itemJo) itemJo.style.display = 'none';
            }
        } else if (isJordan) {
            document.body.classList.remove('branch-mode-lebanon');
            document.body.classList.add('branch-mode-jordan');
            sessionStorage.setItem('auipr_active_branch', 'jordan');

            if (!document.title.includes('فرع المملكة الأردنية الهاشمية')) {
                document.title = document.title + ' | فرع المملكة الأردنية الهاشمية';
            }

            const orgNames = document.querySelectorAll('.org-name');
            orgNames.forEach(el => {
                el.innerHTML = `فرع المملكة الأردنية الهاشمية<span class="branch-subname" style="display: block; font-size: 0.82em; font-weight: 600; color: #475569; margin-top: 2px;">للاتحاد العربي لحماية حقوق الملكية الفكرية (قرار 1371/96/9)</span>`;
            });

            const footerOrgs = document.querySelectorAll('.footer-org-name');
            footerOrgs.forEach(el => {
                el.innerHTML = `فرع المملكة الأردنية الهاشمية<span style="display:block;font-size:0.85em;color:#94a3b8;margin-top:4px;">للاتحاد العربي لحماية حقوق الملكية الفكرية (قرار 1371/96/9)</span>`;
            });

            if (window.location.pathname.includes('contact.html')) {
                const pageTitle = document.querySelector('.page-title');
                if (pageTitle) pageTitle.innerText = 'تواصل مع فرع المملكة الأردنية الهاشمية';

                const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
                if (breadcrumbCurrent) breadcrumbCurrent.innerText = 'فرع المملكة الأردنية الهاشمية';

                const emailLink = document.querySelector('.contact-item a[href^="mailto:"]');
                if (emailLink) {
                    emailLink.href = 'mailto:jordan@auipr.org';
                    emailLink.innerText = 'jordan@auipr.org';
                }

                const itemEg = document.querySelector('.address-item-eg');
                const itemJo = document.querySelector('.address-item-jo');
                const itemLb = document.querySelector('.address-item-lb');
                if (itemJo) {
                    itemJo.style.display = 'flex';
                    const addrP = itemJo.querySelector('address');
                    if (addrP && !addrP.innerHTML.includes('1371/96/9')) {
                        addrP.innerHTML = '<p><strong>مقر الفرع الإقليمي:</strong> 240-شارع الملك حسين -العبدلي -الطابق الخامس، عمان.</p><p style="font-size:0.85em;color:#64748b;margin-top:4px;">الصادر بالقرار رقم (1371/96/9) عن وزارة الخارجية</p>';
                    }
                }
                if (itemLb) itemLb.style.display = 'none';

                if (typeof switchMap === 'function') {
                    const btnJo = document.querySelector('.map-tabs .tab-btn');
                    if (btnJo) switchMap('jo', btnJo);
                }
            }
        } else {
            document.body.classList.remove('branch-mode-lebanon', 'branch-mode-jordan');
            sessionStorage.setItem('auipr_active_branch', 'main');

            if (window.location.pathname.includes('contact.html')) {
                const itemEg = document.querySelector('.address-item-eg');
                const itemJo = document.querySelector('.address-item-jo');
                const itemLb = document.querySelector('.address-item-lb');
                if (itemEg) itemEg.style.display = 'flex';
                if (itemJo) itemJo.style.display = 'flex';
                if (itemLb) itemLb.style.display = 'flex';
            }
        }

        // 3. تحديث روابط Canonical والـ SEO والـ Meta Tags للفرع الحالي
        const canonicalEl = document.querySelector('link[rel="canonical"]');
        let targetOrigin = 'https://auipr.org';
        let branchTitleSuffix = '';
        if (isJordan) {
            targetOrigin = 'https://jordan.auipr.org';
            branchTitleSuffix = ' | فرع المملكة الأردنية الهاشمية';
        } else if (isLebanon) {
            targetOrigin = 'https://lebanon.auipr.org';
            branchTitleSuffix = ' | ممثل الجمهورية اللبنانية';
        }

        if (canonicalEl) {
            if (isJordan || isLebanon) {
                canonicalEl.href = targetOrigin + currentPath;
            } else if (isProd) {
                canonicalEl.href = 'https://auipr.org' + currentPath;
            }
        }
        const ogUrlEl = document.querySelector('meta[property="og:url"]');
        if (ogUrlEl) {
            ogUrlEl.content = targetOrigin + currentPath;
        }
        if (isJordan || isLebanon) {
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle && !ogTitle.content.includes(branchTitleSuffix.replace(' | ', ''))) {
                ogTitle.content = ogTitle.content + branchTitleSuffix;
            }
            const twTitle = document.querySelector('meta[name="twitter:title"]');
            if (twTitle && !twTitle.content.includes(branchTitleSuffix.replace(' | ', ''))) {
                twTitle.content = twTitle.content + branchTitleSuffix;
            }
        }
    };

    updateBranchUI();
    setTimeout(updateBranchUI, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBranchSystem);
} else {
    initBranchSystem();
}
