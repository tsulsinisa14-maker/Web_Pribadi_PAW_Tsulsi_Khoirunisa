const PAGE_IDS = ['profil', 'tugas', 'matakuliah', 'dokumentasi'] as const;
type PageId = (typeof PAGE_IDS)[number];

function isPageId(value: string): value is PageId {
  return (PAGE_IDS as readonly string[]).includes(value);
}

function currentPage(): PageId {
  const hash: string = window.location.hash.replace('#', '');
  return isPageId(hash) ? hash : 'profil';
}

function showPage(): void {
  const active: PageId = currentPage();

  PAGE_IDS.forEach((id) => {
    const section = document.getElementById(id);
    if (section) section.hidden = id !== active;
  });

  document.querySelectorAll<HTMLAnchorElement>('nav a[data-page]').forEach((link) => {
    const isActive: boolean = link.dataset.page === active;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  window.scrollTo({ top: 0 });
}

export function initPages(): void {
  window.addEventListener('hashchange', showPage);
  showPage();
}