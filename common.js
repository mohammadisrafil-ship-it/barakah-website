// ---------- Helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const bnNum = n => String(n); // the site shows English digits everywhere
const tk = n => "৳" + n.toLocaleString("en-US");
const photo = (src, alt = "", eager) => `<img src="${src}" alt="${esc(alt)}"${eager ? "" : ` loading="lazy"`} decoding="async">`;
const params = new URLSearchParams(location.search);

const CONTACT = { phone: "01869-018907", tel: "+8801869018907", whatsapp: "8801869018907", email: "israfilsupol836@gmail.com" };
// social media links: paste the full page address; an empty "" hides that icon
const SOCIAL = { facebook: "", tiktok: "", instagram: "", youtube: "" };

const catBySlug = slug => CATEGORIES.find(c => c.slug === slug);
const productBySlug = slug => PRODUCTS.find(p => p.slug === slug);
const productUrl = p => `product.html?p=${p.slug}`;
const categoryUrl = slug => `category.html?c=${slug}`;
const inStock = p => p.stock !== false;
const minPrice = p => Math.min(...p.variants.map(v => v[1]));
// variant = [label, price, oldPrice?]; no old price means no discount is shown
const discount = v => v[2] > v[1] ? Math.round((1 - v[1] / v[2]) * 100) : 0;

// ---------- Icons ----------
const ICON = {
  cart: `<svg viewBox="0 0 24 24"><path d="M6 6h15l-2 9H8L6 3H3"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>`,
  truck: `<svg viewBox="0 0 24 24"><path d="M3 7h13v10H3zM16 10h3l2 3v4h-5"/><circle cx="7" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
};

// ---------- Layout (shared header, drawers, footer, bottom bar) ----------
function renderLayout() {
  const page = document.body.dataset.page;
  const activeCat = page === "category" ? params.get("c")
    : page === "product" ? (productBySlug(params.get("p")) || {}).cat : null;
  const navLinks = CATEGORIES.map(c =>
    `<a href="${categoryUrl(c.slug)}"${c.slug === activeCat ? ` class="active" aria-current="page"` : ""}>${esc(c.name)} <span class="bn">(${esc(c.bn)})</span></a>`).join("");

  document.body.insertAdjacentHTML("afterbegin", `
<header class="site-header">
  <div class="container header-top">
    <button class="icon-btn menu-btn" aria-label="Open menu" data-open="drawer">
      <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
    <a href="index.html" class="logo" aria-label="Barakah home"><span class="logo-word">BARAKAH</span></a>
    <form class="search" role="search" id="searchForm">
      ${ICON.search}
      <input type="search" placeholder="মধু, খেজুর, বাদাম খুঁজুন…" id="searchInput" aria-label="Search products" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="searchSuggest" aria-autocomplete="list" value="${esc(params.get("q") || "")}">
    </form>
    <div class="header-actions">
      <button class="action-link wish-btn" data-open="wishlist" aria-label="Open wishlist">
        ${ICON.heart}<span class="cart-count wish-count" data-wish-count hidden>0</span>
      </button>
      <button class="action-link cart-btn" data-open="cart" aria-label="Open cart">
        ${ICON.cart}<span class="hide-sm">Cart</span><span class="cart-count" id="cartCount">0</span>
      </button>
      <a href="#" class="btn btn-primary signin hide-sm">Sign In</a>
    </div>
  </div>
  <nav class="category-bar" aria-label="Category navigation">
    <div class="container cat-scroll">${navLinks}</div>
  </nav>
</header>

<div class="overlay" id="overlay"></div>
<aside class="drawer" id="drawer" aria-label="Menu" role="dialog" aria-modal="true">
  <div class="drawer-head">
    <span class="logo-word dark">BARAKAH</span>
    <button class="icon-btn" data-close aria-label="Close menu">${ICON.close}</button>
  </div>
  <p class="drawer-hello">Hello, what are you looking for?</p>
  <a href="#" class="btn btn-primary btn-block">Sign In</a>
  <nav class="drawer-links" aria-label="Shop by category">
    <a href="category.html">All Products</a>${navLinks}
  </nav>
  <nav class="drawer-links secondary" aria-label="Additional pages">
    <a href="#">About us</a><a href="#">Corporate Deals</a><a href="#">Contact Us</a>
  </nav>
</aside>

<aside class="drawer drawer-right" id="wishlist" aria-labelledby="wish-title" role="dialog" aria-modal="true">
  <div class="drawer-head">
    <h3 id="wish-title">${ICON.heart} উইশলিস্ট</h3>
    <button class="icon-btn" data-close aria-label="Close wishlist">${ICON.close}</button>
  </div>
  <div id="wishBody" class="cart-body"></div>
</aside>

<aside class="drawer drawer-right" id="cart" aria-labelledby="cart-title" role="dialog" aria-modal="true">
  <div class="drawer-head">
    <h3 id="cart-title">${ICON.cart} শপিং কার্ট</h3>
    <button class="icon-btn" data-close aria-label="Close cart">${ICON.close}</button>
  </div>
  <div id="cartBody" class="cart-body"></div>
  <div class="cart-foot" id="cartFoot" hidden>
    <div class="cart-total"><span>সাবটোটাল <small>(ডেলিভারি চার্জ আলাদা)</small></span><strong id="cartTotal">৳0</strong></div>
    <a href="checkout.html" class="btn btn-primary btn-block cart-checkout">Checkout</a>
    <button type="button" class="cart-continue" data-close>Continue Shopping</button>
  </div>
</aside>`);

  document.body.insertAdjacentHTML("beforeend", `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <span class="logo-word">BARAKAH</span>
      <p>Pure honey, dates, nuts &amp; natural foods, sourced with care for your family's health.</p>
      <div class="socials">
        ${SOCIAL.facebook ? `<a href="${SOCIAL.facebook}" target="_blank" rel="noopener" aria-label="Facebook" style="--c:#1877f2"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8z" fill="currentColor" stroke="none"/></svg></a>` : ""}
        ${SOCIAL.tiktok ? `<a href="${SOCIAL.tiktok}" target="_blank" rel="noopener" aria-label="TikTok" style="--c:#000"><svg viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>` : ""}
        <a href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp" style="--c:#25d366"><svg viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>
      </div>
    </div>
    <div>
      <h3>কেনাকাটা</h3>
      <ul><li><a href="category.html">All Products</a></li>${CATEGORIES.map(c => `<li><a href="${categoryUrl(c.slug)}">${esc(c.name)}</a></li>`).join("")}</ul>
    </div>
    <div>
      <h3>যোগাযোগ</h3>
      <ul>
        <li><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
        <li><span class="muted">Customer Support / Hotline:</span><br><a href="tel:${CONTACT.tel}">${CONTACT.phone}</a></li>
        <li><span class="muted">WhatsApp:</span><br><a href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener">${CONTACT.phone}</a></li>
      </ul>
    </div>
    <div>
      <h3>সহায়তা</h3>
      <ul><li><a href="#">Contact Support</a></li><li><a href="#">Shipping &amp; Returns</a></li><li><a href="#">Privacy Policy</a></li></ul>
    </div>
  </div>
  <div class="container footer-bottom">Copyright © Barakah Food ${new Date().getFullYear()} – All Rights Reserved</div>
</footer>

<nav class="bottom-bar" aria-label="Mobile primary navigation">
  <a href="index.html"${page === "home" ? ` class="active"` : ""}><svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/></svg>Home</a>
  <a href="#" data-open="drawer"${page === "category" ? ` class="active"` : ""}><svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>Categories</a>
  <a href="category.html"><svg viewBox="0 0 24 24"><path d="M20 12 12 20 4 12V4h8z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>Shop</a>
  <a href="#" data-open="wishlist"><span class="bb-ic">${ICON.heart}<span class="bb-count" data-wish-count hidden>0</span></span>Wishlist</a>
  <a href="#" data-open="cart"><span class="bb-ic">${ICON.cart}<span class="bb-count" id="bbCartCount" hidden>0</span></span>Cart</a>
</nav>

<button class="float-cart" id="floatCart" data-open="cart" aria-label="Open cart" hidden>
  <span class="fc-top">${ICON.cart}<span><span id="fcCount">0</span> আইটেম</span></span>
  <b id="fcTotal">৳0</b>
</button>

<div class="toast" id="toast" role="status" aria-live="polite"></div>`);
}
renderLayout();

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

// ---------- Product card (home, category, related) ----------
// ---------- Wishlist (saved on the device like the cart) ----------
const wishlist = new Set();
try { JSON.parse(localStorage.getItem("barakah-wish") || "[]").forEach(id => PRODUCTS.some(p => p.id === id) && wishlist.add(id)); } catch (e) {}
const wishBtnAttrs = id => `class="wish${wishlist.has(id) ? " on" : ""}" data-wish="${id}" aria-pressed="${wishlist.has(id)}" aria-label="উইশলিস্ট"`;

function toggleWish(id) {
  wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
  try { localStorage.setItem("barakah-wish", JSON.stringify([...wishlist])); } catch (e) {}
  // a product can appear more than once on a page (e.g. related + main)
  $$(`[data-wish="${id}"]`).forEach(b => { b.classList.toggle("on", wishlist.has(id)); b.setAttribute("aria-pressed", wishlist.has(id)); });
  renderWishlist();
  toast(wishlist.has(id) ? "উইশলিস্টে যোগ হয়েছে ♥" : "উইশলিস্ট থেকে সরানো হয়েছে");
}

function renderWishlist() {
  const n = wishlist.size;
  $$("[data-wish-count]").forEach(el => { el.textContent = n; el.hidden = !n; });
  const body = $("#wishBody");
  if (!n) {
    body.innerHTML = `
      <div class="cart-empty">
        ${ICON.heart}
        <p>উইশলিস্ট খালি। পছন্দের পণ্যে ♥ চাপুন।</p>
        <a href="category.html" class="btn btn-primary">Shop Products</a>
      </div>`;
    return;
  }
  body.innerHTML = [...wishlist].reverse().map(id => {
    const p = PRODUCTS.find(x => x.id === id), v = p.variants[0];
    // one size: add straight to cart; several sizes: choose on the product page
    const act = !inStock(p) ? `<span class="muted">স্টক শেষ</span>`
      : p.variants.length > 1 ? `<a class="btn btn-primary wish-act" href="${productUrl(p)}">Choose Size</a>`
      : `<button class="btn btn-primary wish-act" data-add="${p.id}:0">${ICON.cart} Add to Cart</button>`;
    return `
    <div class="cart-item">
      <a class="thumb" href="${productUrl(p)}">${photo(p.img, p.name)}</a>
      <div>
        <h4><a href="${productUrl(p)}">${esc(p.bn)} | ${esc(p.name)}</a></h4>
        <small class="muted">${p.variants.length > 1 ? "শুরু " : ""}${tk(minPrice(p))} · ${esc(v[0])}</small>
        ${act}
      </div>
      <button class="remove" data-wish="${p.id}" aria-label="উইশলিস্ট থেকে সরান">${ICON.close}</button>
    </div>`;
  }).join("");
}

function productCard(p, i = 0) {
  const v = p.variants[0];
  const url = productUrl(p);
  const options = p.variants.length > 1;
  let action;
  if (!inStock(p)) action = `<button class="btn btn-block" disabled>Stock Out</button>`;
  // several sizes: pick one on the product page; single size: Buy Now goes straight to checkout
  else if (options) action = `<div class="card-actions"><a class="btn btn-primary" href="${url}">Buy Now</a><a class="btn card-cart" href="${url}" aria-label="Choose size">${ICON.cart}</a></div>`;
  else action = `<div class="card-actions"><button class="btn btn-primary" data-buy="${p.id}:0">Buy Now</button><button class="btn card-cart" data-add="${p.id}:0" aria-label="Add to cart">${ICON.cart}</button></div>`;
  return `
    <article class="card" style="animation-delay:${i * 30}ms">
      <div class="card-img">
        ${!inStock(p) ? `<span class="badge out">Stock Out</span>` : discount(v) ? `<span class="badge">-${discount(v)}%</span>` : ""}
        <button ${wishBtnAttrs(p.id)}>${ICON.heart}</button>
        <a href="${url}" tabindex="-1" aria-hidden="true">${photo(p.img, p.name)}</a>
      </div>
      <div class="card-body">
        <h3><a href="${url}">${esc(p.bn)} <span>| ${esc(p.name)}</span></a></h3>
        <div class="price"><b>${tk(v[1])}</b>${discount(v) ? `<s>${tk(v[2])}</s>` : ""}<small>${esc(v[0])}</small></div>
        ${action}
      </div>
    </article>`;
}

// ---------- Cart (persisted so it follows you between pages) ----------
// key "productId:variantIndex" -> qty
const cart = new Map();
try { JSON.parse(localStorage.getItem("barakah-cart") || "[]").forEach(([k, q]) => cart.set(k, q)); } catch (e) {}
const saveCart = () => { try { localStorage.setItem("barakah-cart", JSON.stringify([...cart])); } catch (e) {} };
const cartLine = key => {
  const [id, vi] = key.split(":").map(Number);
  const p = PRODUCTS.find(x => x.id === id);
  return p && p.variants[vi] ? { p, v: p.variants[vi] } : null;
};

function addToCart(key, qty = 1) {
  if (!cartLine(key)) return;
  cart.set(key, (cart.get(key) || 0) + qty);
  renderCart(true);
  openDrawer("cart");
}

// Buy Now: skip the cart and open checkout for just this item
function buyNow(key, qty = 1) {
  if (!cartLine(key)) return;
  location.href = `checkout.html?buy=${encodeURIComponent(key)}&qty=${qty}`;
}

function updateFloatCart(count, total) {
  const f = $("#floatCart");
  if (!f) return;
  f.hidden = !count || document.body.dataset.page === "checkout";
  $("#fcCount").textContent = bnNum(count);
  $("#fcTotal").textContent = tk(total);
}

function renderCart(bump) {
  for (const k of [...cart.keys()]) if (!cartLine(k)) cart.delete(k);
  saveCart();
  const count = [...cart.values()].reduce((a, b) => a + b, 0);
  const counter = $("#cartCount");
  counter.textContent = count;
  counter.hidden = !count;
  const bb = $("#bbCartCount");
  bb.textContent = count; bb.hidden = !count;
  if (bump) { counter.classList.remove("bump"); void counter.offsetWidth; counter.classList.add("bump"); }

  if (!cart.size) {
    $("#cartBody").innerHTML = `
      <div class="cart-empty">
        ${ICON.cart}
        <p>No products in the cart.</p>
        <a href="category.html" class="btn btn-primary">RETURN TO SHOP</a>
      </div>`;
    $("#cartFoot").hidden = true;
    updateFloatCart(0, 0);
    return;
  }
  let total = 0;
  $("#cartBody").innerHTML = [...cart].map(([key, qty]) => {
    const { p, v } = cartLine(key);
    total += v[1] * qty;
    return `
    <div class="cart-item">
      <a class="thumb" href="${productUrl(p)}">${photo(p.img)}</a>
      <div>
        <h4><a href="${productUrl(p)}">${esc(p.bn)} | ${esc(p.name)}</a></h4>
        <small class="muted">${esc(v[0])}</small><br>
        <div class="qty"><button data-dec="${key}" aria-label="Decrease">−</button><span>${qty}</span><button data-inc="${key}" aria-label="Increase">+</button></div>
      </div>
      <div style="text-align:right">
        <b>${tk(v[1] * qty)}</b><br>
        <button class="remove" data-rm="${key}" aria-label="Remove"><svg viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>
      </div>
    </div>`;
  }).join("");
  $("#cartTotal").textContent = tk(total);
  $("#cartFoot").hidden = false;
  updateFloatCart(count, total);
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-add],[data-buy],[data-wish],[data-inc],[data-dec],[data-rm],[data-open],[data-close]");
  if (!t) return;
  const d = t.dataset;
  if (d.add) {
    addToCart(d.add);
  } else if (d.buy) {
    buyNow(d.buy);
  } else if (d.wish) {
    toggleWish(+d.wish);
  } else if (d.inc) {
    cart.set(d.inc, cart.get(d.inc) + 1); renderCart();
  } else if (d.dec) {
    const q = cart.get(d.dec) - 1;
    q > 0 ? cart.set(d.dec, q) : cart.delete(d.dec); renderCart();
  } else if (d.rm) {
    cart.delete(d.rm); renderCart();
  } else if (d.open) {
    e.preventDefault(); openDrawer(d.open);
  } else if ("close" in d) {
    e.preventDefault(); closeDrawers();
  }
});

// ---------- Drawers ----------
// closed drawers are inert so taps, Tab and screen readers skip them
let drawerOpener = null;
$$(".drawer").forEach(d => d.inert = true);
function openDrawer(id) {
  const opener = document.activeElement;
  closeDrawers(false);
  drawerOpener = opener;
  const d = document.getElementById(id);
  d.inert = false;
  d.classList.add("open");
  $("#overlay").classList.add("show");
  document.body.style.overflow = "hidden";
  // focus the close button so keyboard / screen-reader users land inside the panel
  setTimeout(() => $("[data-close]", d)?.focus({ preventScroll: true }), 50);
}
function closeDrawers(restoreFocus = true) {
  const wasOpen = $$(".drawer.open");
  wasOpen.forEach(d => { d.classList.remove("open"); d.inert = true; });
  $("#overlay").classList.remove("show");
  document.body.style.overflow = "";
  if (restoreFocus && wasOpen.length && drawerOpener && document.contains(drawerOpener)) drawerOpener.focus({ preventScroll: true });
}
$("#overlay").addEventListener("click", closeDrawers);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawers(); });

// ---------- Search ----------
// Matches Bangla, English and Bangla typed in English letters ("khejur", "modhu").
const norm = s => String(s).toLowerCase().normalize("NFC");
// drop vowels from Latin text so "khajur" and "khejur" both become "khjr"
const skel = s => s.replace(/[aeiouyh]/g, "");
const searchIndex = PRODUCTS.map(p => {
  const c = catBySlug(p.cat);
  const text = norm([p.name, p.bn, c.name, c.bn, SEARCH_ALIASES[p.cat] || "", SEARCH_ALIASES[p.slug] || ""].join(" "));
  return { p, text, words: text.split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean) };
});
function searchProducts(q) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const run = fuzzy => {
    const scored = [];
    for (const it of searchIndex) {
      let score = 0;
      const ok = terms.every(t => {
        if (it.words.some(w => w.startsWith(t))) { score += 3; return true; }
        if (it.text.includes(t)) { score += 2; return true; }
        // misspelled Latin words: compare consonant skeletons ("khajur" ~ "khejur")
        const st = skel(t);
        if (fuzzy && /^[a-z]+$/.test(t) && st.length >= 3 && it.words.some(w => /^[a-z]+$/.test(w) && skel(w).startsWith(st))) { score += 1; return true; }
        return false;
      });
      if (ok) scored.push({ p: it.p, score: score + (inStock(it.p) ? 1 : 0) + (it.p.featured ? .5 : 0) });
    }
    return scored.sort((a, b) => b.score - a.score).map(x => x.p);
  };
  // exact matches first; only guess at spellings when nothing matched
  const exact = run(false);
  return exact.length ? exact : run(true);
}

const searchForm = $("#searchForm"), searchInput = $("#searchInput");
searchForm.insertAdjacentHTML("beforeend", `<div class="suggest" id="searchSuggest" role="listbox" hidden></div>`);
const suggestBox = $("#searchSuggest");
let activeIdx = -1;

function renderSuggest() {
  const q = searchInput.value.trim();
  if (!q) return hideSuggest();
  const hits = searchProducts(q);
  const cats = [...new Set(hits.map(p => p.cat))].map(catBySlug);
  if (!hits.length) {
    suggestBox.innerHTML = `<p class="suggest-empty">“${esc(q)}” এর সাথে মেলে এমন কিছু পাওয়া যায়নি।<br><a href="category.html">সব পণ্য দেখুন</a></p>`;
  } else {
    suggestBox.innerHTML =
      `<div class="suggest-cats">${cats.map(c => `<a href="${categoryUrl(c.slug)}">${esc(c.bn)} <span>${esc(c.name)}</span></a>`).join("")}</div>` +
      hits.slice(0, 6).map((p, i) => `
        <a class="suggest-item" role="option" id="sg-${i}" href="${productUrl(p)}">
          <img src="${p.img}" alt="" loading="lazy">
          <span class="suggest-name"><b>${esc(p.bn)}</b><small>${esc(p.name)}</small></span>
          <span class="suggest-price">${inStock(p) ? tk(minPrice(p)) : `<em>স্টক শেষ</em>`}</span>
        </a>`).join("") +
      `<a class="suggest-all" href="category.html?q=${encodeURIComponent(q)}">সব ফলাফল দেখুন (${bnNum(hits.length)}) →</a>`;
  }
  activeIdx = -1;
  suggestBox.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
}
function hideSuggest() {
  suggestBox.hidden = true;
  searchInput.setAttribute("aria-expanded", "false");
  searchInput.removeAttribute("aria-activedescendant");
}

let suggestTimer;
searchInput.addEventListener("input", () => { clearTimeout(suggestTimer); suggestTimer = setTimeout(renderSuggest, 120); });
searchInput.addEventListener("focus", () => { if (searchInput.value.trim()) renderSuggest(); });
searchInput.addEventListener("keydown", e => {
  if (e.key === "Escape") return hideSuggest();
  const items = $$(".suggest-item", suggestBox);
  if (suggestBox.hidden || !items.length || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
  e.preventDefault();
  // -1 means "back in the text box"
  const n = items.length + 1;
  activeIdx = ((activeIdx + 1 + (e.key === "ArrowDown" ? 1 : -1)) % n + n) % n - 1;
  items.forEach((el, i) => el.classList.toggle("active", i === activeIdx));
  if (activeIdx >= 0) searchInput.setAttribute("aria-activedescendant", items[activeIdx].id);
  else searchInput.removeAttribute("aria-activedescendant");
});
document.addEventListener("click", e => { if (!searchForm.contains(e.target)) hideSuggest(); });

// Enter: open the highlighted suggestion, otherwise the full results page
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  const active = $(".suggest-item.active", suggestBox);
  if (active) { location.href = active.href; return; }
  const q = searchInput.value.trim();
  location.href = q ? `category.html?q=${encodeURIComponent(q)}` : "category.html";
});

renderCart();
renderWishlist();

// ---------- One-line headings: shrink the font until the text fits its box ----------
function fitOneLine(root = document) {
  $$(".promo h3, .pd-banner h2", root).forEach(el => {
    el.style.fontSize = "";
    let size = parseFloat(getComputedStyle(el).fontSize);
    const holder = el.closest(".slide-copy, .promo, .pd-banner-copy");
    const cs = getComputedStyle(holder);
    const box = holder.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    while (el.scrollWidth > box && size > 14) el.style.fontSize = (size -= 1) + "px";
  });
}
let fitTimer;
window.addEventListener("resize", () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitOneLine, 100); });
// re-fit once the heading font has loaded, since fallback fonts measure differently
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => fitOneLine());

// ---------- Order delivery queue ----------
// Orders that could not reach the shop's inbox (e.g. the email service was down) are kept here
// and re-sent quietly on the customer's next page view, so no order is lost.
async function postOrderJob(job) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(job.url, { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(job.body) });
    const j = await r.json().catch(() => ({}));
    return r.ok && String(j.success) === "true";
  } catch (e) {
    return false;
  } finally {
    clearTimeout(t);
  }
}
function queueOrderJob(job) {
  try {
    const q = JSON.parse(localStorage.getItem("barakah-order-queue") || "[]");
    q.push(job);
    localStorage.setItem("barakah-order-queue", JSON.stringify(q.slice(-20)));
  } catch (e) {}
}
(async function flushOrderQueue() {
  let q;
  try { q = JSON.parse(localStorage.getItem("barakah-order-queue") || "[]"); } catch (e) { return; }
  if (!q.length) return;
  const left = [];
  for (const job of q) if (!(await postOrderJob(job))) left.push(job);
  try { localStorage.setItem("barakah-order-queue", JSON.stringify(left)); } catch (e) {}
})();
