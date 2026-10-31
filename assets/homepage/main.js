/* Progressive enhancement: every publication and contact link also works without JS. */
(() => {
  const root = document.documentElement;
  const languageButtons = [...document.querySelectorAll('[data-set-language]')];
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const publications = [...document.querySelectorAll('.publication-item')];
  const search = document.querySelector('#publication-search');
  const count = document.querySelector('#publication-count');
  let filter = 'all';

  function filterPublications() {
    const query = (search?.value || '').trim().toLocaleLowerCase();
    let visible = 0;
    publications.forEach(publication => {
      const matches = (filter === 'all' || publication.dataset.type === filter) && publication.dataset.search.includes(query);
      publication.hidden = !matches;
      if (matches) visible++;
    });
    document.querySelector('#no-publications').hidden = visible !== 0;
    count.textContent = root.lang === 'zh-CN' ? `显示 ${visible} / ${publications.length} 篇论文` : `Showing ${visible} of ${publications.length} publications`;
  }

  function setLanguage(language, persist = true) {
    const lang = language === 'zh-CN' ? 'zh-CN' : 'en';
    root.lang = lang;
    languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setLanguage === lang)));
    document.title = lang === 'zh-CN' ? 'Jiangxu Huang · 学术个人主页' : 'Jiangxu Huang · Academic Homepage';
    document.querySelector('meta[name="description"]').content = lang === 'zh-CN' ? 'Jiangxu Huang 的学术个人主页：多相流、相变、活性颗粒、相场建模与格子 Boltzmann 方法。' : "Jiangxu Huang's academic homepage. Multiphase flow, phase change, active particles, phase-field modeling, and the lattice Boltzmann method.";
    if (search) search.placeholder = lang === 'zh-CN' ? '搜索论文标题、作者、年份…' : 'Search title, author, year…';
    if (persist) { try { localStorage.setItem('jh-language', lang); } catch {} }
    filterPublications();
  }

  let savedLanguage;
  try { savedLanguage = localStorage.getItem('jh-language'); } catch {}
  const urlLanguage = new URLSearchParams(location.search).get('lang');
  const initialLanguage = urlLanguage === 'zh' || urlLanguage === 'zh-CN' ? 'zh-CN' : urlLanguage === 'en' ? 'en' : savedLanguage || 'en';
  setLanguage(initialLanguage, false);
  languageButtons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.setLanguage)));

  document.querySelector('.publication-tools').hidden = false;
  count.hidden = false;
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterPublications();
  }));
  search?.addEventListener('input', filterPublications);

  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-nav');
  function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); mobileMenu.hidden = true; }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); } });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  document.querySelector('#current-year').textContent = String(new Date().getFullYear());

  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('.main-nav a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) navLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
})();
