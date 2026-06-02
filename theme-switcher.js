/* 4deklas theme-switcher — modern ↔ speels */
(() => {
  const KEY = '4dk-theme';

  // Zet thema meteen (voorkomt flash)
  const saved = localStorage.getItem(KEY);
  if (saved === 'speels') document.documentElement.dataset.theme = 'speels';

  // Voeg toggle-knop toe zodra DOM klaar is
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.setAttribute('aria-label', 'Wissel thema');

    const styles = {
      position:     'fixed',
      bottom:       '22px',
      right:        '22px',
      zIndex:       '9997',
      padding:      '9px 18px',
      borderRadius: '99px',
      border:       'none',
      cursor:       'pointer',
      fontSize:     '12px',
      fontWeight:   '700',
      fontFamily:   "'Space Grotesk', system-ui, sans-serif",
      letterSpacing:'.04em',
      color:        'white',
      boxShadow:    '0 4px 16px rgba(0,0,0,.28)',
      transition:   'transform .15s, box-shadow .15s',
      lineHeight:   '1',
    };
    Object.assign(btn.style, styles);

    function updateBtn() {
      const isSpeels = document.documentElement.dataset.theme === 'speels';
      btn.textContent = isSpeels ? '🎨 Modern' : '🎨 Speels';
      btn.style.background = isSpeels ? '#1e3a8a' : '#1d3048';
    }
    updateBtn();

    btn.addEventListener('click', () => {
      const isSpeels = document.documentElement.dataset.theme === 'speels';
      if (isSpeels) {
        delete document.documentElement.dataset.theme;
        localStorage.setItem(KEY, 'modern');
      } else {
        document.documentElement.dataset.theme = 'speels';
        localStorage.setItem(KEY, 'speels');
      }
      updateBtn();
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transform  = 'translateY(-2px)';
      btn.style.boxShadow  = '0 8px 24px rgba(0,0,0,.35)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = '';
      btn.style.boxShadow  = '0 4px 16px rgba(0,0,0,.28)';
    });

    document.body.appendChild(btn);
  });
})();
