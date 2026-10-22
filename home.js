// ---------- Shop by category ----------
$("#categories").innerHTML = CATEGORIES.map(c => `
  <a href="${categoryUrl(c.slug)}" class="cat-tile">
    <span class="cat-tile-art">${photo(c.icon, "")}</span>
    <span class="cat-tile-name">${esc(c.bn)}</span>
    <small>${esc(c.name)}</small>
  </a>`).join("");

// ---------- Featured products ----------
// best sellers first: nuts, then dates, then honey
const FEATURED_ORDER = ["nuts-seeds", "dates", "honey", "mix-food", "dry-food"];
const limit = 12;
// after the best sellers, a mix from the other aisles (oil, milk, oats, coffee, tea, dry fruits)
const MORE_PICKS = [
  "mustard-oil", "nescafe-gold", "dano-full-cream-milk", "ceylon-naturals-coconut-oil",
  "quaker-oats", "maccoffee-gold", "al-mudish-milk", "clariss-extra-virgin-olive-oil",
  "lipton-green-tea-pure", "cowhead-pure-milk", "golden-raisins", "oateo-instant-oats",
];

function renderProducts() {
  const list = PRODUCTS.filter(p => p.featured)
    .sort((a, b) => FEATURED_ORDER.indexOf(a.cat) - FEATURED_ORDER.indexOf(b.cat));
  const extra = MORE_PICKS.map(productBySlug).filter(p => p && !p.featured);
  const shown = [...list.slice(0, limit), ...extra];
  $("#products").innerHTML = shown.length ? shown.map(productCard).join("")
    : `<p class="muted center" style="grid-column:1/-1">No products found.</p>`;
}


renderProducts();

// ---------- Social reviews wall ----------
// SAMPLE comments for layout only: replace with real customer comments
// (with their permission) before going live.
// PLACEHOLDER photos (images/reviews/r1-r15.jpg) are AI-generated people who do not exist.
// Replace them, together with the sample comments, with real customers' reviews (with permission) before launch.
// Real customer reviews go here. To show their profile picture, save it as images/reviews/<name>.jpg
// and add  photo: "images/reviews/<name>.jpg"  to that review (only with the customer's permission).
const SOCIAL_REVIEWS = [
  { p: "fb", name: "Rahim Uddin", photo: "images/reviews/r1.jpg", when: "2 দিন আগে", text: "সুন্দরবনের মধুটা একদম খাঁটি। চামচে তুললে ঘন হয়ে পড়ে, ঘ্রাণটাও আসল। আলহামদুলিল্লাহ 🍯", likes: 48 },
  { p: "tt", name: "nusrat.cooks", photo: "images/reviews/r2.jpg", when: "1 সপ্তাহ আগে", text: "আজওয়া খেজুরের আনবক্সিং করলাম 😍 প্যাকিং খুবই সুন্দর, খেজুরগুলো নরম আর তাজা।", likes: 312 },
  { p: "fb", name: "Tanvir Hasan", photo: "images/reviews/r3.jpg", when: "3 দিন আগে", text: "কাজুবাদাম আর কাঠবাদাম অর্ডার করেছিলাম, পরদিনই ডেলিভারি পেয়েছি। দামও ন্যায্য 👍", likes: 27 },
  { p: "ig", name: "sadia_homekitchen", photo: "images/reviews/r4.jpg", when: "5 দিন আগে", text: "চিয়া সিড আর ওটস দিয়ে সকালের নাস্তা এখন রুটিন 🥣 কোয়ালিটি দারুণ!", likes: 96 },
  { p: "fb", name: "Mahmuda Akter", photo: "images/reviews/r5.jpg", when: "1 সপ্তাহ আগে", text: "আম্মুর জন্য কালোজিরা মধু নিয়েছিলাম, উনি খুব খুশি। ইনশাআল্লাহ আবার নেব।", likes: 33 },
  { p: "fb", name: "Arif Hossain", photo: "images/reviews/r6.jpg", when: "4 দিন আগে", text: "মিক্সড বাদামের প্যাকেটটা অফিসে নাস্তার জন্য পারফেক্ট। কোনো নষ্ট বাদাম পাইনি।", likes: 19 },
  { p: "tt", name: "foodie.dhaka", photo: "images/reviews/r7.jpg", when: "2 সপ্তাহ আগে", text: "মরিয়ম খেজুর vs আজওয়া টেস্ট করলাম ভিডিওতে 😄 দুটোই অসাধারণ, মরিয়ম একটু বেশি মিষ্টি!", likes: 540 },
  { p: "fb", name: "Shirin Sultana", photo: "images/reviews/r8.jpg", when: "6 দিন আগে", text: "ঘিয়ের গন্ধেই বোঝা যায় খাঁটি। পোলাওতে দিয়েছিলাম, সবাই প্রশংসা করেছে ❤️", likes: 41 },
  { p: "ig", name: "fit.with.rafi", photo: "images/reviews/r9.jpg", when: "3 দিন আগে", text: "পামকিন সিড আর আখরোট আমার জিম ডায়েটের নিয়মিত অংশ 💪 ফ্রেশ পেয়েছি।", likes: 74 },
  { p: "fb", name: "Kamrul Islam", photo: "images/reviews/r10.jpg", when: "1 দিন আগে", text: "ক্যাশ অন ডেলিভারি থাকায় নিশ্চিন্তে অর্ডার দিয়েছি। ডেলিভারি ম্যানও খুব ভদ্র ছিলেন।", likes: 22 },
  { p: "x", name: "@nadia_reads", photo: "images/reviews/r11.jpg", when: "1 সপ্তাহ আগে", text: "Barakah-এর সরিষা ফুলের মধু জমে যায়, তার মানেই খাঁটি। Highly recommended 🐝", likes: 15 },
  { p: "fb", name: "Jannatul Ferdous", photo: "images/reviews/r12.jpg", when: "5 দিন আগে", text: "ইফতারের জন্য সুক্কারি খেজুর নিয়েছিলাম, মুখে গলে যায়। পরিবারের সবার পছন্দ হয়েছে।", likes: 37 },
  { p: "tt", name: "ma.er.ranna", photo: "images/reviews/r13.jpg", when: "3 সপ্তাহ আগে", text: "সরিষার তেলের ঝাঁঝটা একদম গ্রামের মতো 😋 ভর্তা বানিয়ে দেখালাম ভিডিওতে।", likes: 228 },
  { p: "ig", name: "healthy.bangladesh", photo: "images/reviews/r14.jpg", when: "2 সপ্তাহ আগে", text: "ইসবগুল ভুষি আর তোকমা দিয়ে গরমের শরবত 🍹 পরিষ্কার আর ভালো মানের।", likes: 61 },
  { p: "fb", name: "Mizanur Rahman", photo: "images/reviews/r15.jpg", when: "2 সপ্তাহ আগে", text: "অর্ডার পরিবর্তন করতে চেয়েছিলাম, সাপোর্ট টিম সাথে সাথে করে দিয়েছে। ভালো সার্ভিস।", likes: 18 },
];

const PLATFORM = {
  fb: { label: "Facebook", color: "#1877f2", icon: '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8z" fill="currentColor" stroke="none"/></svg>', like: "👍" },
  tt: { label: "TikTok", color: "#111", icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>', like: "❤️" },
  ig: { label: "Instagram", color: "#e1306c", icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>', like: "❤️" },
  x: { label: "X", color: "#000", icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>', like: "♡" },
};
const AVATAR_TINTS = ["#f6d98a", "#cfe3c9", "#f3c6b8", "#cbd9f2", "#e7d3f0", "#f9e0b0"];

function reviewCard(r, i, tone = 0) {
  const pf = PLATFORM[r.p];
  return `
    <article class="sp-card sp-${r.p} sp-tone-${tone}">
      <header>
        ${r.photo
          ? `<img class="sp-avatar" src="${esc(r.photo)}" alt="" loading="lazy" width="40" height="40">`
          : `<span class="sp-avatar" style="background:${AVATAR_TINTS[i % AVATAR_TINTS.length]}">${esc(r.name.replace(/^[@.]/, "").charAt(0).toUpperCase())}</span>`}
        <span class="sp-who"><b>${esc(r.name)}</b><small>${esc(r.when)}</small></span>
        <span class="sp-platform" style="color:${pf.color}" title="${pf.label}">${pf.icon}</span>
      </header>
      <p>${esc(r.text)}</p>
      <footer><span>${pf.like} ${bnNum(r.likes)}</span><span>${pf.label}</span></footer>
    </article>`;
}

(function buildWall() {
  const wall = $("#spWall");
  if (!wall) return;
  // split every review across the columns that are actually visible (3 desktop, 2 tablet, 1 phone)
  const mqs = [matchMedia("(max-width: 640px)"), matchMedia("(max-width: 1023px)")];
  function render() {
    const n = mqs[0].matches ? 1 : mqs[1].matches ? 2 : 3;
    const cols = Array.from({ length: n }, () => []);
    // tone = (row + column) % 3, so no two neighbouring cards share a background
    SOCIAL_REVIEWS.forEach((r, i) => cols[i % n].push(reviewCard(r, i, (Math.floor(i / n) + (i % n)) % 3)));
    // each track holds its cards twice so the scroll loops seamlessly; speed scales with length
    wall.innerHTML = cols.map((c, i) => `
      <div class="sp-col" style="--dur:${Math.round(c.length * 7.5) + i * 7}s">
        <div class="sp-track">${c.join("")}${c.join("").replace(/<article /g, '<article aria-hidden="true" ')}</div>
      </div>`).join("");
  }
  render();
  mqs.forEach(m => m.addEventListener("change", render));
})();

// ---------- Hero slider: auto-advances, swipe on phones, dots + arrows ----------
(function heroSlider() {
  const root = $("#heroSlider");
  if (!root) return;
  const track = $(".hs-track", root), slides = $$(".hs-slide", root), dots = $(".hs-dots", root);
  const n = slides.length, DELAY = 5000;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = 0, timer = null, paused = false;

  dots.innerHTML = slides.map((_, k) => `<button type="button" role="tab" aria-label="স্লাইড ${bnNum(k + 1)}"></button>`).join("");
  const dotBtns = $$("button", dots);

  function go(k, user) {
    i = (k + n) % n;
    track.style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, j) => { s.inert = j !== i; s.setAttribute("aria-hidden", j !== i); });
    dotBtns.forEach((d, j) => d.setAttribute("aria-selected", j === i));
    // lazy slides: start loading the next one ahead of time
    const next = slides[(i + 1) % n].querySelector("img");
    if (next) next.loading = "eager";
    if (user) restart();
  }
  function restart() {
    clearInterval(timer);
    if (!still && !paused && n > 1) timer = setInterval(() => go(i + 1), DELAY);
  }
  const pause = on => { paused = on; restart(); };



  dots.addEventListener("click", e => { const b = e.target.closest("button"); if (b) go(dotBtns.indexOf(b), true); });
  root.addEventListener("mouseenter", () => pause(true));
  root.addEventListener("mouseleave", () => pause(false));
  root.addEventListener("focusin", () => pause(true));
  root.addEventListener("focusout", () => pause(false));
  document.addEventListener("visibilitychange", () => pause(document.hidden));
  root.addEventListener("keydown", e => { if (e.key === "ArrowLeft") go(i - 1, true); if (e.key === "ArrowRight") go(i + 1, true); });

  // swipe: follow the finger, snap to the nearest slide; a real swipe never opens the link
  let x0 = null, y0 = 0, dx = 0, swiped = false;
  track.addEventListener("pointerdown", e => { if (e.pointerType === "mouse") return; x0 = e.clientX; y0 = e.clientY; dx = 0; swiped = false; pause(true); });
  track.addEventListener("pointermove", e => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) {
      swiped = true;
      track.style.transition = "none";
      track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`;
    }
  });
  const end = () => {
    if (x0 === null) return;
    track.style.transition = "";
    if (swiped && Math.abs(dx) > root.clientWidth * .15) go(dx < 0 ? i + 1 : i - 1); else go(i);
    x0 = null; pause(false);
  };
  track.addEventListener("pointerup", end);
  track.addEventListener("pointercancel", end);
  track.addEventListener("click", e => { if (swiped) { e.preventDefault(); swiped = false; } }, true);

  go(0);
  restart();
})();
