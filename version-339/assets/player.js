function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movieVideo");
    var cover = document.querySelector(".play-cover");
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
        if (!video || attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 32,
                maxMaxBufferLength: 64,
                enableWorker: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playMovie() {
        attachStream();
        if (cover) {
            cover.classList.add("hidden");
        }
        if (video) {
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }
    }

    if (cover) {
        cover.addEventListener("click", playMovie);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!attached) {
                playMovie();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("hidden");
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
