(() => {
  const navButton = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach((dot, itemIndex) => {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    };

    const play = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.heroDot || 0));
        play();
      });
    });

    show(0);
    play();
  }

  const normalize = (value) => (value || '').toString().toLowerCase().trim();

  const applySearch = (input) => {
    const scope = input.closest('main') || document;
    const keyword = normalize(input.value);
    const cards = Array.from(scope.querySelectorAll('[data-title]'));

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.region,
        card.textContent
      ].join(' '));
      card.classList.toggle('is-hidden-by-search', keyword && !haystack.includes(keyword));
    });
  };

  document.querySelectorAll('[data-site-search]').forEach((input) => {
    input.addEventListener('input', () => applySearch(input));
  });

  document.querySelectorAll('[data-clear-search]').forEach((button) => {
    button.addEventListener('click', () => {
      const box = button.closest('.search-box');
      const input = box ? box.querySelector('[data-site-search]') : null;
      if (input) {
        input.value = '';
        applySearch(input);
        input.focus();
      }
    });
  });

  const yearButtons = Array.from(document.querySelectorAll('[data-filter-year]'));

  yearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filterYear || 'all';
      yearButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      document.querySelectorAll('[data-year]').forEach((card) => {
        const matched = selected === 'all' || card.dataset.year === selected;
        card.classList.toggle('is-hidden-by-filter', !matched);
      });
    });
  });
})();
