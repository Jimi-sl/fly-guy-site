(() => {
  const API = 'https://fly-guy-back.onrender.com/api';

  // --- Tap Fly Guy to shoot (little hero easter egg) ---
  const guy = document.getElementById('flyguy');
  const bullets = document.getElementById('bullets');
  const scoreEl = document.getElementById('hud-score');
  const ammoEl = document.getElementById('hud-ammo');
  const hint = document.querySelector('.tap-hint');
  let score = 0;
  let ammo = 10;

  const bump = (el) => { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); };

  function shoot() {
    if (hint) hint.classList.add('gone');
    if (ammo <= 0) {
      ammo = 10; // free reload, it's a homepage
      ammoEl.textContent = ammo;
      bump(ammoEl);
      return;
    }
    ammo--;
    score += 100;
    ammoEl.textContent = ammo;
    scoreEl.textContent = score.toLocaleString();
    bump(scoreEl);

    const box = guy.getBoundingClientRect();
    const host = bullets.getBoundingClientRect();
    const x = box.left - host.left + box.width * 0.58;
    const y = box.top - host.top + box.height * 0.12;

    const b = document.createElement('img');
    b.src = 'assets/bullet.png';
    b.alt = '';
    b.className = 'bullet';
    b.style.left = `${x - 8}px`;
    b.style.top = `${y}px`;
    b.addEventListener('animationend', () => b.remove());
    bullets.appendChild(b);

    const plus = document.createElement('span');
    plus.className = 'plus';
    plus.textContent = '+100';
    plus.style.left = `${x + 18}px`;
    plus.style.top = `${y + 10}px`;
    plus.addEventListener('animationend', () => plus.remove());
    bullets.appendChild(plus);

    guy.classList.add('recoil');
    setTimeout(() => guy.classList.remove('recoil'), 90);
  }

  if (guy) guy.addEventListener('click', shoot);

  // Distance score ticks up slowly while the hero is on screen
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(document.querySelector('.hero'));
  setInterval(() => {
    if (!visible || document.hidden) return;
    score += 7;
    scoreEl.textContent = score.toLocaleString();
  }, 120);

  // --- Live leaderboard ---
  const list = document.getElementById('board-list');

  function message(text) {
    list.replaceChildren();
    const li = document.createElement('li');
    li.className = 'board-msg';
    li.textContent = text;
    list.appendChild(li);
  }

  async function loadBoard() {
    const slow = setTimeout(() => message('Waking up the scoreboard… (first load can take a few seconds)'), 2500);
    try {
      const res = await fetch(`${API}/game/leaderboard?page=0&pageSize=5`, { signal: AbortSignal.timeout(25000) });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      clearTimeout(slow);
      const items = (data && data.items) || [];
      if (!items.length) return message('No scores yet. Be the first on the board!');

      list.replaceChildren();
      for (const it of items) {
        const li = document.createElement('li');
        const rank = document.createElement('span');
        rank.className = 'rank';
        rank.textContent = it.rank;
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = it.displayName;
        const pts = document.createElement('span');
        pts.className = 'pts';
        pts.textContent = Number(it.highScore).toLocaleString();
        li.append(rank, name, pts);
        list.appendChild(li);
      }
    } catch {
      clearTimeout(slow);
      message('The scoreboard is taking a nap. Check back soon!');
    }
  }

  loadBoard();
})();
