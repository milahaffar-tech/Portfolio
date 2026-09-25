// Image slots: <div class="slot" data-src="images/foo.jpg" data-alt="..."> shows a
// placeholder until the image at data-src loads, then swaps it in.
document.querySelectorAll('.slot[data-src]').forEach((slot) => {
  const img = new Image();
  img.alt = slot.dataset.alt || '';
  img.decoding = 'async';
  img.addEventListener('load', () => {
    slot.appendChild(img);
    slot.classList.add('is-filled');
  });
  img.src = slot.dataset.src;
});

// Carousel arrows: <button data-scroll="strip-id" data-dir="-1|1">
document.querySelectorAll('[data-scroll]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const el = document.getElementById(btn.dataset.scroll);
    if (!el) return;
    const dir = Number(btn.dataset.dir) || 1;
    el.scrollBy({ left: dir * Math.min(576, el.clientWidth), behavior: 'smooth' });
  });
});
