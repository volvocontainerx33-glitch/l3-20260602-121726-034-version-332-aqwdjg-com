(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get('q') || '';
  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var genreSelect = filterPanel.querySelector('[data-filter-genre]');
    var categorySelect = filterPanel.querySelector('[data-filter-category]');
    var countNode = filterPanel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-empty-result]');

    if (searchInput && queryFromUrl) {
      searchInput.value = queryFromUrl;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var q = normalize(searchInput ? searchInput.value : '');
      var y = normalize(yearSelect ? yearSelect.value : '');
      var g = normalize(genreSelect ? genreSelect.value : '');
      var c = normalize(categorySelect ? categorySelect.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matched = (!q || haystack.indexOf(q) !== -1) &&
          (!y || cardYear === y) &&
          (!g || cardGenre.indexOf(g) !== -1) &&
          (!c || cardCategory === c);

        card.style.display = matched ? '' : 'none';

        if (matched) {
          shown += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(shown);
      }

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    [searchInput, yearSelect, genreSelect, categorySelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
