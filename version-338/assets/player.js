import { H as Hls } from './hls.js';

function setupPlayer(shell) {
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-play-button]');
  const message = shell.querySelector('[data-player-message]');
  const source = shell.dataset.videoSrc;
  const poster = shell.dataset.poster;
  let hlsInstance = null;

  if (!video || !button || !source) {
    if (message) {
      message.textContent = '当前影片播放源未配置。';
    }
    return;
  }

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function loadSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setMessage('已使用浏览器原生 HLS 能力载入播放源。');
      return;
    }

    if (Hls && Hls.isSupported && Hls.isSupported()) {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      setMessage('已通过 HLS 模块载入播放源。');
      return;
    }

    video.src = source;
    setMessage('浏览器将尝试直接播放该源。');
  }

  button.addEventListener('click', function () {
    button.disabled = true;
    button.textContent = '正在载入';
    loadSource();
    video.play().then(function () {
      button.textContent = '播放中';
      setMessage('播放已启动。');
    }).catch(function () {
      button.disabled = false;
      button.textContent = '再次播放';
      setMessage('播放源已绑定，浏览器需要再次点击或允许媒体播放后即可继续。');
    });
  });
}

Array.from(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
