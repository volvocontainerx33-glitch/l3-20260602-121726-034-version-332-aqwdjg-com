(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('is-open');
      });
    }

    setupHero();
    setupLocalFilters();
    setupSiteSearch();
  });

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    show(0);
    startTimer();
  }

  function setupLocalFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var root = panel.parentElement;
      var searchInput = panel.querySelector('.js-local-search');
      var yearSelect = panel.querySelector('.js-year-filter');
      var sortSelect = panel.querySelector('.js-sort-filter');
      var grid = root ? root.querySelector('[data-grid]') : null;

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      var years = cards
        .map(function (card) { return card.getAttribute('data-year'); })
        .filter(Boolean)
        .filter(function (value, index, array) { return array.indexOf(value) === index; })
        .sort(function (a, b) { return Number(b) - Number(a); });

      if (yearSelect) {
        years.forEach(function (year) {
          var option = document.createElement('option');
          option.value = year;
          option.textContent = year + '年';
          yearSelect.appendChild(option);
        });
      }

      function apply() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var sort = sortSelect ? sortSelect.value : 'score';

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || cardYear === year;
          card.classList.toggle('is-hidden-by-filter', !(matchKeyword && matchYear));
        });

        var sorted = cards.slice().sort(function (a, b) {
          if (sort === 'year') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }

          if (sort === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          }

          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        });

        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }

      if (sortSelect) {
        sortSelect.addEventListener('change', apply);
      }
    });
  }

  function setupSiteSearch() {
    var form = document.querySelector('[data-site-search]');
    var results = document.querySelector('[data-search-results]');
    var info = document.querySelector('[data-search-info]');

    if (!form || !results || !window.MOVIE_INDEX) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
      render(initialQuery);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input ? input.value : '');
    });

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    function render(query) {
      var keyword = (query || '').trim().toLowerCase();
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        return !keyword || movie.search.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-wrap" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-badge">' + movie.score + ' 分</span>',
          '    <span class="poster-play">▶</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '    <div class="movie-meta">',
          '      <span>' + movie.year + '年</span>',
          '      <span>' + escapeHtml(movie.region) + '</span>',
          '      <span>' + escapeHtml(movie.type) + '</span>',
          '    </div>',
          '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      if (info) {
        info.textContent = keyword
          ? '搜索到 ' + matched.length + ' 条匹配内容，最多展示前 120 条。'
          : '默认展示推荐内容，可在上方输入关键词。';
      }
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
