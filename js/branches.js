/**
 * AUIPR Multi-Branch & Representation Management
 * ممثل الجمهورية اللبنانية للاتحاد العربي لحماية حقوق الملكية الفكرية
 */

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
  }
};

function getActiveBranchId() {
  const params = new URLSearchParams(window.location.search);
  const qBranch = params.get('branch');
  if (qBranch && AUIPR_BRANCHES[qBranch]) {
    sessionStorage.setItem('auipr_active_branch', qBranch);
    return qBranch;
  }

  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('lebanon') || hostname.startsWith('lb.')) {
    return 'lebanon';
  }

  if (hostname === 'auipr.org' || hostname === 'www.auipr.org') {
    return 'main';
  }

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

    if (isLebanon) {
      document.body.classList.add('branch-mode-lebanon');

      if (!document.title.includes('ممثل الجمهورية اللبنانية')) {
        document.title = document.title + ' | ممثل الجمهورية اللبنانية للاتحاد العربي';
      }

      const orgNames = document.querySelectorAll('.org-name');
      orgNames.forEach(el => {
        el.innerHTML = `ممثل الجمهورية اللبنانية<span class="branch-subname" style="display: block; font-size: 0.82em; font-weight: 600; color: #475569; margin-top: 2px;">للاتحاد العربي لحماية حقوق الملكية الفكرية</span>`;
      });

      if (window.location.pathname.includes('contact.html')) {
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) pageTitle.innerText = 'تواصل مع ممثل الجمهورية اللبنانية';

        const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
        if (breadcrumbCurrent) breadcrumbCurrent.innerText = 'ممثل الجمهورية اللبنانية';

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBranchSystem);
} else {
  initBranchSystem();
}
