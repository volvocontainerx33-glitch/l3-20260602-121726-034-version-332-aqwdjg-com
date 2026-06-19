(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-movie-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
    var empty = document.querySelector('.not-found');

    function applySearch() {
        if (!searchInput || !cards.length) {
            return;
        }

        var keyword = searchInput.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var matched = !keyword || text.indexOf(keyword) > -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applySearch);
        var searchButton = document.querySelector('[data-search-button]');
        if (searchButton) {
            searchButton.addEventListener('click', applySearch);
        }
    }

    var video = document.querySelector('video[data-stream]');
    var playButton = document.querySelector('.play-btn');
    var playCover = document.querySelector('.play-cover');

    function prepareVideo() {
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-stream');
        if (!source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    if (video) {
        prepareVideo();

        if (playButton) {
            playButton.addEventListener('click', function () {
                if (playCover) {
                    playCover.classList.add('is-hidden');
                }
                var playback = video.play();
                if (playback && playback.catch) {
                    playback.catch(function () {});
                }
            });
        }

        video.addEventListener('play', function () {
            if (playCover) {
                playCover.classList.add('is-hidden');
            }
        });
    }
}());
