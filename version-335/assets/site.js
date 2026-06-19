(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.textContent = open ? "×" : "☰";
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
            var index = 0;
            var show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(index + 1);
                }, 6500);
            }
            show(0);
        }

        document.querySelectorAll(".filter-panel").forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target") || "body";
            var target = document.querySelector(targetSelector) || document.body;
            var controls = panel.querySelectorAll("input, select");
            var reset = panel.querySelector("[data-filter-reset]");
            var apply = function () {
                var queryInput = panel.querySelector('[data-filter="search"]');
                var typeInput = panel.querySelector('[data-filter="type"]');
                var yearInput = panel.querySelector('[data-filter="year"]');
                var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
                var type = typeInput ? typeInput.value : "";
                var year = yearInput ? yearInput.value : "";
                var visible = 0;
                target.querySelectorAll(".movie-card").forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (type && card.getAttribute("data-type") !== type) {
                        ok = false;
                    }
                    if (year && card.getAttribute("data-year") !== year) {
                        ok = false;
                    }
                    var wrap = card.closest(".movie-card-wrap");
                    if (wrap) {
                        wrap.classList.toggle("hidden-by-filter", !ok);
                    }
                    if (ok) {
                        visible += 1;
                    }
                });
                var empty = target.querySelector("[data-empty]");
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            };
            controls.forEach(function (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    controls.forEach(function (control) {
                        control.value = "";
                    });
                    apply();
                });
            }
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            var searchInput = panel.querySelector('[data-filter="search"]');
            if (q && searchInput) {
                searchInput.value = q;
            }
            apply();
        });

        document.querySelectorAll(".player-shell").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-cover");
            var start = function () {
                if (!video) {
                    return;
                }
                var stream = video.getAttribute("data-stream");
                if (!stream) {
                    return;
                }
                player.classList.add("is-playing");
                video.setAttribute("controls", "controls");
                if (player.getAttribute("data-ready") === "1") {
                    video.play().catch(function () {});
                    return;
                }
                player.setAttribute("data-ready", "1");
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        maxBufferLength: 30
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    player.hlsPlayer = hls;
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", function () {
                        video.play().catch(function () {});
                    }, { once: true });
                    return;
                }
                video.src = stream;
                video.play().catch(function () {});
            };
            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    start();
                });
            }
            player.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                start();
            });
            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (video.currentTime === 0 || video.ended) {
                        player.classList.remove("is-playing");
                    }
                });
                video.addEventListener("ended", function () {
                    player.classList.remove("is-playing");
                });
            }
        });
    });
})();
