import { H as Hls } from './hls-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

ready(function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-player-start]');
  var status = shell.querySelector('[data-player-status]');
  var source = shell.getAttribute('data-video-src');
  var hlsInstance = null;
  var hasStarted = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function startPlayer() {
    if (!video || !source || hasStarted) {
      if (!source) {
        setStatus('当前页面没有检测到播放源。');
      }
      return;
    }

    hasStarted = true;

    if (button) {
      button.classList.add('is-hidden');
    }

    setStatus('正在加载播放源，请稍候。');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          setStatus('播放源已加载，请再次点击视频播放。');
        });
      }, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源加载完成。');
        video.play().catch(function () {
          setStatus('播放源已加载，请再次点击视频播放。');
        });
      });

      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载失败，请检查网络或稍后重试。');
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        }
      });
      return;
    }

    setStatus('当前浏览器不支持 HLS 播放。');
  }

  if (button) {
    button.addEventListener('click', startPlayer);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!hasStarted) {
        startPlayer();
      }
    });
  }
});
