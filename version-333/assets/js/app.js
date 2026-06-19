(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showHero(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(activeIndex + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var yearFilter = document.querySelector('[data-year-filter]');
  var searchableItems = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilters() {
    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(' '));
    var year = yearFilter ? yearFilter.value : '';

    searchableItems.forEach(function (item) {
      var haystack = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-year'),
        item.getAttribute('data-genre'),
        item.textContent
      ].join(' '));
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedYear = !year || item.getAttribute('data-year') === year;
      item.classList.toggle('is-hidden', !(matchedQuery && matchedYear));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  var video = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play]');
  var playerState = document.querySelector('[data-player-state]');
  var hlsInstance = null;
  var loaded = false;

  function setState(text) {
    if (playerState) {
      playerState.textContent = text || '';
    }
  }

  function startPlayback() {
    if (!video) {
      return;
    }

    var url = video.getAttribute('data-url');

    if (!url) {
      setState('播放暂时不可用');
      return;
    }

    if (playButton) {
      playButton.classList.add('hidden');
    }

    if (!loaded) {
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            loaded = false;
            setState('播放暂时不可用');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    } else {
      video.play().catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
