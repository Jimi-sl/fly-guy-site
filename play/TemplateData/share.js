// Score cards, sharing and challenge links for Fly Guy.
// The game calls window.flyGuyShare.show(run) at game over and .hide() when a run starts
// (see Assets/Plugins/WebGL/FlyGuyShare.jslib).
(function () {
  var API = 'https://api.flyguy.imgdoesit.com/api';
  var SITE = 'https://flyguy.imgdoesit.com';
  var track = function (name, data) { if (window.fgTrack) window.fgTrack(name, data); };

  var shareBtn = document.getElementById('share-btn');
  var modal = document.getElementById('share-modal');
  var modalImg = document.getElementById('share-preview');
  var downloadLink = document.getElementById('share-download');
  var copyBtn = document.getElementById('share-copy');
  var closeBtn = document.getElementById('share-close');
  var pill = document.getElementById('challenge-pill');
  var loaderLine = document.getElementById('challenge-line');

  var challenge = null; // { displayName, score } from the link this visitor arrived on
  var run = null;       // the run currently on the game-over screen
  var cardUrl = null;

  // --- Challenge links: /play/?c=<id> -----------------------------------------
  var params = new URLSearchParams(location.search);
  var challengeId = parseInt(params.get('c'), 10);
  if (challengeId > 0) {
    fetch(API + '/game/challenge/' + challengeId)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (c) {
        if (!c) return;
        challenge = c;
        var line = c.displayName + ' scored ' + c.score.toLocaleString() + '. Can you beat it?';
        if (loaderLine) { loaderLine.textContent = line; loaderLine.hidden = false; }
        if (pill) { pill.textContent = 'BEAT ' + c.displayName.toUpperCase() + ': ' + c.score.toLocaleString(); pill.hidden = false; }
        track('challenge-open', { id: challengeId });
      })
      .catch(function () {});
  }

  // The pill is a reminder for the menu; it goes on the first tap into the game.
  var canvas = document.getElementById('unity-canvas');
  if (canvas && pill) canvas.addEventListener('pointerdown', function () { pill.hidden = true; }, { once: true });

  function challengeLink(r) {
    var query = 'utm_source=share&utm_medium=scorecard';
    return r.challengeId ? SITE + '/play/?c=' + r.challengeId + '&' + query : SITE + '/?' + query;
  }

  function beatChallenge(r) {
    return challenge && r.score > challenge.score;
  }

  function shareText(r) {
    var rank = r.weeklyRank ? " and I'm #" + r.weeklyRank + " on this week's MOST WANTED list" : '';
    var beat = beatChallenge(r) ? 'I just beat ' + challenge.displayName + '. ' : '';
    return beat + 'I scored ' + r.score.toLocaleString() + ' on Fly Guy' + rank + '. Think you can beat it? ' + challengeLink(r);
  }

  // --- The score card -------------------------------------------------------------
  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function fitText(ctx, text, maxWidth, size, font) {
    do { ctx.font = size + 'px ' + font; size -= 4; } while (ctx.measureText(text).width > maxWidth && size > 24);
  }

  function drawCard(r) {
    var W = 1080, H = 1350;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var ink = '#1a1a2e', paper = '#f6ecd4', flame = '#FF6B35', red = '#d93a2b';
    var display = 'Righteous, system-ui, sans-serif';
    var body = 'Manrope, system-ui, sans-serif';

    return Promise.all([
      loadImage('TemplateData/flyguy.png'),
      loadImage('TemplateData/cloud-1.png'),
      document.fonts && document.fonts.load ? document.fonts.load('80px Righteous').catch(function () {}) : null
    ]).then(function (assets) {
      var guy = assets[0], cloud = assets[1];

      // Sky
      var sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0277BD'); sky.addColorStop(0.55, '#29B6F6'); sky.addColorStop(1, '#B3E5FC');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      if (cloud) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cloud, 40, 70, 232, 132);
        ctx.drawImage(cloud, 850, 18, 174, 99);
        ctx.imageSmoothingEnabled = true;
      }

      // Poster, slightly tilted
      ctx.save();
      ctx.translate(W / 2, 640);
      ctx.rotate(-0.025);
      var pw = 820, ph = 1040, px = -pw / 2, py = -ph / 2;
      ctx.fillStyle = ink; ctx.fillRect(px + 14, py + 18, pw, ph);  // hard shadow
      ctx.fillStyle = paper; ctx.fillRect(px, py, pw, ph);
      ctx.lineWidth = 8; ctx.strokeStyle = ink; ctx.strokeRect(px, py, pw, ph);

      ctx.textAlign = 'center'; ctx.fillStyle = ink;
      fitText(ctx, 'MOST WANTED', pw - 110, 112, display); ctx.fillText('MOST WANTED', 0, py + 140);
      ctx.font = '700 34px ' + body; ctx.fillText('UNLICENSED FLYER', 0, py + 192);

      // Photo
      var fx = -260, fy = py + 225, fw = 520, fh = 430;
      ctx.fillStyle = '#4FC3F7'; ctx.fillRect(fx, fy, fw, fh);
      if (guy) {
        var scale = Math.min(fw / guy.width, fh / guy.height) * 0.9;
        var gw = guy.width * scale, gh = guy.height * scale;
        ctx.drawImage(guy, -gw / 2, fy + (fh - gh) / 2, gw, gh);
      }
      ctx.lineWidth = 6; ctx.strokeRect(fx, fy, fw, fh);

      // Name and score
      ctx.fillStyle = ink;
      fitText(ctx, r.name.toUpperCase(), pw - 120, 92, display);
      ctx.fillText(r.name.toUpperCase(), 0, fy + fh + 110);
      ctx.fillStyle = flame;
      ctx.font = '120px ' + display;
      ctx.fillText(r.score.toLocaleString(), 0, fy + fh + 235);
      ctx.fillStyle = ink; ctx.font = '700 32px ' + body;
      ctx.fillText('POINTS  ·  ' + r.kills + (r.kills === 1 ? ' DRONE' : ' DRONES') + ' DOWN', 0, fy + fh + 285);
      ctx.restore();

      // Rank stamp
      if (r.weeklyRank) {
        ctx.save();
        ctx.translate(800, 640);
        ctx.rotate(-0.16);
        ctx.fillStyle = 'rgba(246, 236, 212, 0.85)';
        ctx.fillRect(-135, -78, 270, 156);
        ctx.strokeStyle = red; ctx.fillStyle = red; ctx.lineWidth = 8;
        ctx.strokeRect(-135, -78, 270, 156);
        ctx.textAlign = 'center';
        ctx.font = '800 34px ' + body; ctx.fillText('THIS WEEK', 0, -26);
        fitText(ctx, '#' + r.weeklyRank, 230, 96, display); ctx.fillText('#' + r.weeklyRank, 0, 62);
        ctx.restore();
      }

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = ink; ctx.lineWidth = 10; ctx.lineJoin = 'round';
      ctx.font = '64px ' + display;
      var line = beatChallenge(r) ? 'I BEAT ' + challenge.displayName.toUpperCase() + '!' : 'THINK YOU CAN BEAT IT?';
      fitText(ctx, line, W - 120, 64, display);
      ctx.strokeText(line, W / 2, 1238); ctx.fillText(line, W / 2, 1238);
      ctx.font = '700 36px ' + body; ctx.fillStyle = ink;
      ctx.fillText('flyguy.imgdoesit.com', W / 2, 1300);

      return new Promise(function (resolve) { canvas.toBlob(resolve, 'image/png'); });
    });
  }

  // --- Sharing ------------------------------------------------------------------
  function openModal(blob, r) {
    if (cardUrl) URL.revokeObjectURL(cardUrl);
    cardUrl = URL.createObjectURL(blob);
    modalImg.src = cardUrl;
    downloadLink.href = cardUrl;
    downloadLink.download = 'fly-guy-score-' + r.score + '.png';
    copyBtn.textContent = 'Copy challenge link';
    modal.hidden = false;
    track('share-score', { method: 'modal', weeklyRank: r.weeklyRank || 0 });
  }

  function share() {
    if (!run) return;
    var r = run;
    shareBtn.disabled = true;
    drawCard(r).then(function (blob) {
      shareBtn.disabled = false;
      if (!blob) return;
      var file = new File([blob], 'fly-guy-score.png', { type: 'image/png' });
      var text = shareText(r);
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], text: text })
          .then(function () { track('share-score', { method: 'native', weeklyRank: r.weeklyRank || 0 }); })
          .catch(function (e) { if (e && e.name !== 'AbortError') openModal(blob, r); });
      }
      openModal(blob, r);
    }).catch(function () { shareBtn.disabled = false; });
  }

  shareBtn.addEventListener('click', share);
  closeBtn.addEventListener('click', function () { modal.hidden = true; });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
  downloadLink.addEventListener('click', function () { track('share-download'); });
  copyBtn.addEventListener('click', function () {
    if (!run) return;
    var link = challengeLink(run);
    var done = function () { copyBtn.textContent = 'Link copied'; track('share-copy-link'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText(run)).then(done, function () { window.prompt('Copy this link:', link); });
    } else {
      window.prompt('Copy this link:', link);
    }
  });

  window.flyGuyShare = {
    show: function (r) {
      run = r;
      shareBtn.textContent = beatChallenge(r) ? 'You beat ' + challenge.displayName + '! Share it' : 'Share your score';
      shareBtn.hidden = false;
      if (beatChallenge(r)) track('challenge-beaten', { score: r.score });
    },
    hide: function () {
      run = null;
      shareBtn.hidden = true;
      modal.hidden = true;
      if (pill) pill.hidden = true; // the challenge pill only shows until the first run starts
    }
  };
})();
