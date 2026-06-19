var MovieSite = (function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        if (slides.length > 1) {
            play();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var sort = scope.querySelector("[data-filter-sort]");
            var list = scope.parentElement.querySelector("[data-card-list]");
            var empty = scope.parentElement.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

            function applySort() {
                if (!sort) {
                    return;
                }
                var mode = sort.value;
                var sorted = cards.slice().sort(function (a, b) {
                    var yearA = Number(a.getAttribute("data-year") || 0);
                    var yearB = Number(b.getAttribute("data-year") || 0);
                    var titleA = a.getAttribute("data-title") || "";
                    var titleB = b.getAttribute("data-title") || "";
                    if (mode === "year-asc") {
                        return yearA - yearB || titleA.localeCompare(titleB, "zh-Hans-CN");
                    }
                    if (mode === "title-asc") {
                        return titleA.localeCompare(titleB, "zh-Hans-CN");
                    }
                    return yearB - yearA || titleA.localeCompare(titleB, "zh-Hans-CN");
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var regionValue = normalize(region ? region.value : "");
                var typeValue = normalize(type ? type.value : "");
                var yearValue = normalize(year ? year.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-keywords")
                    ].join(" "));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
                    var matchesType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                    var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var show = matchesQuery && matchesRegion && matchesType && matchesYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", applyFilter);
                    element.addEventListener("change", applyFilter);
                }
            });

            if (sort) {
                sort.addEventListener("change", function () {
                    applySort();
                    applyFilter();
                });
            }

            applySort();
            applyFilter();
        });
    }

    function initPlayer(src) {
        var video = document.querySelector("[data-movie-player]");
        var button = document.querySelector("[data-player-start]");
        if (!video || !src) {
            return;
        }
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function start() {
            prepare();
            video.controls = true;
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
    });

    return {
        initPlayer: initPlayer
    };
}());
