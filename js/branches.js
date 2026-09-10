/**
 * AUIPR Multi-Branch & Representation Management
 * الاتحاد العربي لحماية حقوق الملكية الفكرية - ممثلية الجمهورية اللبنانية
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBranchSystem);
} else {
  initBranchSystem();
}
