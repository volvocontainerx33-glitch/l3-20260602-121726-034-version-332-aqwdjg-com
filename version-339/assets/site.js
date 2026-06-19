(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle("active", itemIndex === current);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle("active", itemIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            if (timer) {
                window.clearInterval(timer);
            }
            showSlide(index);
            startHero();
        });
    });

    startHero();

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function applySearch(query) {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var keyword = normalize(query);
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-region"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
            card.classList.toggle("hidden", keyword && haystack.indexOf(keyword) === -1);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
        var input = form.querySelector("input[type='search']");
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (input) {
                applySearch(input.value);
                var target = document.querySelector(".content-section");
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        });
        if (input) {
            input.addEventListener("input", function () {
                applySearch(input.value);
            });
        }
    });

    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            var value = chip.getAttribute("data-filter-chip");
            chips.forEach(function (item) {
                item.classList.toggle("active", item === chip);
            });
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
            cards.forEach(function (card) {
                if (value === "all") {
                    card.classList.remove("hidden");
                    return;
                }
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                card.classList.toggle("hidden", text.indexOf(normalize(value)) === -1);
            });
        });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-sort-select]")).forEach(function (select) {
        select.addEventListener("change", function () {
            var grid = document.querySelector("[data-sort-grid]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            var mode = select.value;
            cards.sort(function (a, b) {
                if (mode === "year-asc") {
                    return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                }
                if (mode === "title") {
                    return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-Hans-CN");
                }
                return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    });
})();
