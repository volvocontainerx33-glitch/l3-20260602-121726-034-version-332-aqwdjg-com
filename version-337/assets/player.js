(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var source = player.getAttribute('data-hls');
    var started = false;
    var hls = null;

    function start() {
      if (!video || !source) {
        return;
      }

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }

        started = true;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
