/**
 * AUIPR Multi-Branch Management (نظام إدارة الفروع الإقليمية - الاتحاد العربي)
 * Multi-tenant architecture for Lebanon Branch & future branches.
 */

const AUIPR_BRANCHES = {
  main: {
    id: 'main',
    name: 'الاتحاد العربي لحماية حقوق الملكية الفكرية (منظمة عربية)',
    subName: '(منظمة عربية)',
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
  // 1. Check URL query parameter (e.g. ?branch=lebanon or ?branch=main)
  const params = new URLSearchParams(window.location.search);
  const qBranch = params.get('branch');
  if (qBranch && AUIPR_BRANCHES[qBranch]) {
    sessionStorage.setItem('auipr_active_branch', qBranch);
    return qBranch;
  }

  // 2. Check Subdomain (e.g. lebanon.auipr.org or lb.auipr.org)
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('lebanon') || hostname.startsWith('lb.')) {
    return 'lebanon';
  }

  // 3. Check Session Storage if previously switched
  const stored = sessionStorage.getItem('auipr_active_branch');
  if (stored && AUIPR_BRANCHES[stored]) {
    return stored;
  }

  // Default: Main site remains 100% standard
  return 'main';
}

function setBranch(branchId) {
  if (AUIPR_BRANCHES[branchId]) {
    sessionStorage.setItem('auipr_active_branch', branchId);
    const url = new URL(window.location.href);
    url.searchParams.set('branch', branchId);
    window.location.href = url.toString();
  }
}

function initBranchSystem() {
  const branchId = getActiveBranchId();
  const isLebanon = branchId === 'lebanon';

  // Apply visual adjustments if on Lebanon Branch
  if (isLebanon) {
    document.body.classList.add('branch-mode-lebanon');

    // Page title enhancement
    if (!document.title.includes('فرع لبنان')) {
      document.title = document.title + ' | فرع لبنان 🇱🇧';
    }

    // Adapt Header
    const applyHeaderLebanon = () => {
      const orgNames = document.querySelectorAll('.org-name');
      orgNames.forEach(el => {
        el.innerHTML = `الاتحاد العربي لحماية حقوق الملكية الفكرية <span class="branch-pill-header" style="background: rgba(60,235,195,0.18); color: #00876c; border: 1px solid rgba(60,235,195,0.5); padding: 3px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; margin-right: 8px; display: inline-block;">🇱🇧 فرع لبنان</span>`;
      });
    };

    if (document.querySelector('.org-name')) {
      applyHeaderLebanon();
    } else {
      setTimeout(applyHeaderLebanon, 300);
      setTimeout(applyHeaderLebanon, 800);
    }

    // Adapt Contact Page if active
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

  // Inject Branch Switcher into Dropdown Menu
  const injectSwitcher = () => {
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

      // Re-bind submenu click event for the injected item
      const toggleLink = switchLi.querySelector('> a');
      if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
          e.preventDefault();
          switchLi.classList.toggle('open');
        });
      }
    }
  };

  if (document.querySelector('.dropdown-list')) {
    injectSwitcher();
  } else {
    setTimeout(injectSwitcher, 300);
    setTimeout(injectSwitcher, 800);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBranchSystem);
} else {
  initBranchSystem();
}
