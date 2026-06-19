(() => {
  const players = document.querySelectorAll('[data-video-player]');

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const source = player.dataset.source;
    let initialized = false;

    const initialize = () => {
      if (!video || !source || initialized) {
        return;
      }

      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    };

    const play = async () => {
      initialize();
      if (button) {
        button.classList.add('is-hidden');
      }
      try {
        await video.play();
      } catch (error) {
        if (button) {
          button.classList.remove('is-hidden');
        }
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', () => {
        initialize();
      });
      video.addEventListener('play', () => {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', () => {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
    }
  });
})();
