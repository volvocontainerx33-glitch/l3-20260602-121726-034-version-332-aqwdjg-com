(function () {
  const nav = document.querySelector('[data-site-nav]');
  const menuToggle = document.querySelector('[data-menu-toggle]');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 480);
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startAuto();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startAuto();
      });
    });

    startAuto();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-card-grid]');

  if (filterPanel && grid) {
    const searchInput = filterPanel.querySelector('[data-filter-search]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const sortSelect = filterPanel.querySelector('[data-filter-sort]');
    const emptyState = document.querySelector('[data-empty-state]');
    const originalCards = Array.from(grid.querySelectorAll('.movie-card'));
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q && searchInput) {
      searchInput.value = q;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      const keyword = normalize(searchInput ? searchInput.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      const sort = sortSelect ? sortSelect.value : 'default';
      const visibleCards = [];

      originalCards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags
        ].join(' '));
        const matchKeyword = !keyword || haystack.includes(keyword);
        const matchType = !type || normalize(card.dataset.type).includes(type);
        const isVisible = matchKeyword && matchType;

        card.hidden = !isVisible;
        if (isVisible) {
          visibleCards.push(card);
        }
      });

      if (sort !== 'default') {
        visibleCards.sort(function (a, b) {
          if (sort === 'year-desc') {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          if (sort === 'year-asc') {
            return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
          }
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
        });
        visibleCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (emptyState) {
        emptyState.hidden = visibleCards.length > 0;
      }
    }

    [searchInput, typeSelect, sortSelect].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();
