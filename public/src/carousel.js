export function connectCarousel(frame, { autoplay = false } = {}) {
  const strip = frame.querySelector('[data-strip]');
  const previous = frame.querySelector('[data-previous]');
  const next = frame.querySelector('[data-next]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const canScroll = () => strip.scrollWidth - strip.clientWidth > 2;
  const atEnd = () => strip.scrollWidth - strip.clientWidth - strip.scrollLeft < 3;
  const sync = () => {
    const left = canScroll() && strip.scrollLeft > 2;
    const right = canScroll() && !atEnd();
    previous.disabled = !left;
    next.disabled = !right;
    frame.classList.toggle('can-scroll-left', left);
    frame.classList.toggle('can-scroll-right', right);
  };
  const step = direction => {
    const card = strip.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(strip).columnGap) || 0;
    if (card) strip.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reduced.matches ? 'instant' : 'smooth',
    });
  };
  let lastInteraction = 0;
  const interact = () => { lastInteraction = performance.now(); };
  previous.addEventListener('click', () => { interact(); step(-1); }, options);
  next.addEventListener('click', () => { interact(); step(1); }, options);
  strip.addEventListener('scroll', sync, { ...options, passive: true });
  frame.addEventListener('pointerdown', interact, options);
  frame.addEventListener('wheel', interact, { ...options, passive: true });
  const resize = new ResizeObserver(sync);
  resize.observe(strip);
  sync();

  const timer = autoplay ? setInterval(() => {
    if (!canScroll() || reduced.matches || document.hidden || frame.matches(':focus-within') ||
        matchMedia('(hover: hover)').matches && frame.matches(':hover') ||
        performance.now() - lastInteraction < 6500) return;
    const bounds = frame.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
    if (atEnd()) strip.scrollTo({ left: 0, behavior: 'smooth' });
    else step(1);
  }, 4200) : null;

  return () => {
    abort.abort();
    resize.disconnect();
    if (timer !== null) clearInterval(timer);
  };
}

export function revealActivePhoto(strip) {
  const selected = strip.querySelector('[aria-pressed="true"]');
  if (!selected || strip.scrollWidth <= strip.clientWidth) return;
  const item = selected.getBoundingClientRect();
  const view = strip.getBoundingClientRect();
  if (item.left < view.left || item.right > view.right) {
    const inset = 30;
    strip.scrollBy({
      left: item.left < view.left ? item.left - view.left - inset : item.right - view.right + inset,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
}
