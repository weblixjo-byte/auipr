/**
 * AUIPR Editorial Article Utilities (الاتحاد العربي لحماية حقوق الملكية الفكرية)
 * Handles social sharing, copy link toast, and reading interactions.
 */

function shareOnWhatsApp(title, url) {
  const pageUrl = url || window.location.href;
  const pageTitle = title || document.title;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(pageTitle + ' - ' + pageUrl)}`, '_blank', 'noopener,noreferrer');
}

function shareOnTwitter(title, url) {
  const pageUrl = url || window.location.href;
  const pageTitle = title || document.title;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}`, '_blank', 'noopener,noreferrer');
}

function shareOnFacebook(url) {
  const pageUrl = url || window.location.href;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank', 'noopener,noreferrer');
}

function shareOnLinkedIn(title, url) {
  const pageUrl = url || window.location.href;
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, '_blank', 'noopener,noreferrer');
}

function copyArticleLink() {
  const url = window.location.href;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(showToast).catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast();
  } catch (err) {
    console.error('Failed to copy', err);
  }
  document.body.removeChild(textArea);
}

function showToast() {
  let toast = document.getElementById('newsToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'newsToast';
    toast.className = 'news-toast';
    toast.innerHTML = '<i class="fa-solid fa-check-circle"></i> <span>تم نسخ رابط الخبر بنجاح!</span>';
    document.body.appendChild(toast);
  }
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}
