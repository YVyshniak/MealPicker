const logos = [
    'chornomorka.png',
    'dominos.png',
    'gogi.png',
    'ilmolino.png',
    'kfc.png',
    'lviv.png',
    'mac.png',
    'musashi.png',
    'myastoria.png',
    'puzata.png',
    'salateria.png',
    'shashlik.png'
];

const containers = Array.from(document.querySelectorAll('.slot'));
const SLOT_STEP_PX = 110;
const LOOPS = 2;
const SPIN_DURATION_MS = 3000;
const SETTLE_DURATION_MS = 500;
let isSpinning = false;

function createItems(container, options) {
  container.innerHTML = '';

  const safeOptions = options && options.length ? options : logos;

  // duplicate many times for long scroll
  for (let i = 0; i < 50; i++) {
    const img = document.createElement('img');
    img.src = 'assets/' + safeOptions[i % safeOptions.length];
    container.appendChild(img);
  }
}

function spinWheel(container, selectedLogo) {
  return new Promise((resolve) => {
    // Keep full logo set in the reel visuals; we only narrow the selection.
    createItems(container, logos);

    container.classList.add('spinning');

    const selectedIndex = logos.indexOf(selectedLogo);
    // Safety fallback: if something went wrong, just use index 0.
    const safeSelectedIndex = selectedIndex >= 0 ? selectedIndex : 0;

    const finalIndex = LOOPS * logos.length + safeSelectedIndex;
    const offset = finalIndex * SLOT_STEP_PX;

    // reset animation state
    container.style.transition = 'none';
    container.style.transform = 'translateY(0)';

    requestAnimationFrame(() => {
      // start fast spin
      container.style.transition = 'transform 3s cubic-bezier(0.15, 0.85, 0.35, 1)';
      container.style.transform = `translateY(-${offset}px)`;

      // after spin ends, center the chosen image
      setTimeout(() => {
        container.classList.remove('spinning');
        container.style.transition = 'none';

        const wrapperHeight = container.parentElement.clientHeight;
        const centerOffset = (wrapperHeight - SLOT_STEP_PX) / 2;
        const preciseOffset = offset - centerOffset;

        container.style.transform = `translateY(-${preciseOffset}px)`;

        // smooth settle
        requestAnimationFrame(() => {
          container.style.transition = `transform ${SETTLE_DURATION_MS}ms ease-out`;
          container.style.transform = `translateY(-${preciseOffset}px)`;
        });

        setTimeout(() => resolve(selectedLogo), SETTLE_DURATION_MS);
      }, SPIN_DURATION_MS);
    });
  });
}

function spin() {
  if (!containers.length) return;
  if (isSpinning) return; // ignore repeated clicks until the whole sequence ends
  isSpinning = true;

  const results = new Array(containers.length);
  const N = logos.length;
  const wheel2TargetSize = Math.max(1, Math.ceil(N / 2));
  const wheel3TargetSize = Math.max(1, Math.ceil(wheel2TargetSize / 2));
  const wheelTargetSizes = [N, wheel2TargetSize, wheel3TargetSize];

  const spinOne = (index) => {
    if (index >= containers.length) {
      try {
        sendResult(results);
      } finally {
        isSpinning = false;
      }
      return;
    }

    // Wheel sizing:
    // - wheel 1 (index 0): N
    // - wheel 2 (index 1): ceil(N/2)
    // - wheel 3 (index 2): ceil(wheel2TargetSize/2)
    const targetSize = Math.min(logos.length, wheelTargetSizes[index] || logos.length);

    // Always keep already-picked logo(s) inside the choice set.
    // If wheel 1 and wheel 2 picked the same logo, then fixed forced size is 1 (not 2).
    const alreadyPicked = results.slice(0, index).filter(Boolean);
    const fixedSet = new Set(alreadyPicked);

    // For the 3rd wheel: only allow variants that were already picked.
    // This means wheel 3 can only land on one of the first two wheel results
    // (or just 1 logo if wheel 1 and wheel 2 matched).
    let narrowedOptions;
    if (index === 2) {
      narrowedOptions = Array.from(fixedSet);
      if (narrowedOptions.length === 0) narrowedOptions = logos;
    } else if (fixedSet.size >= targetSize) {
      narrowedOptions = Array.from(fixedSet);
    } else {
      const needed = targetSize - fixedSet.size;
      const remainingCandidates = logos.filter((logo) => !fixedSet.has(logo));

      // Pick "needed" additional unique candidates without replacement.
      const additional = [];
      const pool = remainingCandidates.slice();
      for (let i = 0; i < needed && pool.length; i++) {
        const pickIdx = Math.floor(Math.random() * pool.length);
        additional.push(pool.splice(pickIdx, 1)[0]);
      }

      narrowedOptions = [...fixedSet, ...additional];
    }

    const picked = narrowedOptions[Math.floor(Math.random() * narrowedOptions.length)];

    spinWheel(containers[index], picked).then((result) => {
      results[index] = result;
      spinOne(index + 1);
    });
  };

  spinOne(0);
}

function sendResult(results) {
  const safeResults = Array.isArray(results) ? results : [results];
  const payload = {
    result: safeResults[0],
    results: safeResults,
  };

  const resultEl = document.getElementById('result');
  if (resultEl) {
    resultEl.textContent = safeResults.join(', ');
  }

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(payload));
  }
}

containers.forEach((c) => createItems(c, logos));

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    spin();
  }
});



