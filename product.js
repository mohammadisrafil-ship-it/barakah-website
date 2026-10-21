const product = productBySlug(params.get("p"));
const root = $("#productPage");

const HIGHLIGHT_ICONS = [
  `<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="M12 9v6M9 12h6"/></svg>`,
  `<svg viewBox="0 0 24 24"><path d="M7 20c-2-2-3-5-1-8s5-4 6-8c2 3 6 6 5 11-1 3-3 5-6 5"/><path d="M10 14c1 1 3 1 4 0"/></svg>`,
  `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>`,
  `<svg viewBox="0 0 24 24"><path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z"/><path d="M5 19l7-7"/></svg>`,
];

if (!product) {
  document.title = "Product not found | Barakah";
  root.innerHTML = `
    <div class="container empty-state" style="padding:80px 16px">
      <h1 class="page-title">পণ্যটি পাওয়া যায়নি</h1>
      <p class="muted">This product may have moved or is no longer available.</p>
      <a class="btn btn-primary" href="category.html">Browse all products</a>
    </div>`;
} else {
  renderProduct(product);
  fitOneLine();
}

function renderProduct(p) {
  const cat = catBySlug(p.cat);
  // a product can override any of benefits / usage / highlights from its category
  const copy = { ...CATEGORY_COPY[p.cat], ...(p.copy || {}) };
  // product photos first (p.gallery when a product has several), then the category banner
  // (the shared fallback banner isn't product-specific, so it stays out of the photo strip)
  const gallery = p.gallery ? [...p.gallery] : [p.img, cat.banner].filter(src => src !== "images/hero-golden.jpg");
  const stock = inStock(p);
  document.title = `${p.name} | Barakah`;

  root.innerHTML = `
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span>/</span>
      <a href="${categoryUrl(cat.slug)}">${esc(cat.name)}</a><span>/</span>
      <span aria-current="page">${esc(p.name)}</span>
    </nav>
  </div>

  <section class="container">
    <div class="pd-card">
      <div class="pd-gallery${gallery.length > 1 ? "" : " single"}">
        <div class="pd-thumbs" role="tablist" aria-label="Product images"${gallery.length > 1 ? "" : " hidden"}>
          ${gallery.map((src, i) => `<button type="button" class="${i ? "" : "active"}" data-img="${src}" aria-label="Image ${i + 1}">${photo(src, "", true)}</button>`).join("")}
        </div>
        <div class="pd-main-img">
          ${stock ? "" : `<span class="badge out">Stock Out</span>`}
          <button ${wishBtnAttrs(p.id).replace('class="wish', 'class="wish pd-wish')}>${ICON.heart}</button>
          <img id="mainImg" src="${gallery[0]}" alt="${esc(p.name)}">
        </div>
      </div>

      <div class="pd-info">
        <h1 class="pd-title">${esc(p.bn)}</h1>
        <p class="pd-title-en">${esc(p.name)}</p>
        <div class="pd-price" id="pdPrice"></div>

        <div class="pd-variants">
          <span class="pd-label">বাছাই করুন:</span>
          <div class="chips" id="variantChips">
            ${p.variants.map((v, i) => `<button type="button" class="chip${i ? "" : " on"}" data-vi="${i}">${esc(v[0])}</button>`).join("")}
          </div>
        </div>

        <div class="pd-qty">
          <span class="pd-label">পরিমাণ:</span>
          <div class="stepper">
            <button type="button" id="qtyDec" aria-label="Decrease quantity">−</button>
            <input type="number" id="qty" value="1" min="1" max="99" aria-label="Quantity">
            <button type="button" id="qtyInc" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <div class="pd-actions">
          <button type="button" class="btn btn-outline" id="addBtn"${stock ? "" : " disabled"}>${ICON.cart} কার্টে যোগ করুন</button>
          <button type="button" class="btn btn-primary" id="orderBtn"${stock ? "" : " disabled"}>
            <svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg> অর্ডার করুন
          </button>
          <a class="btn btn-whatsapp" id="waBtn" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/></svg>
            হোয়াটসঅ্যাপে অর্ডার করুন
          </a>
          <a class="btn btn-call" href="tel:${CONTACT.tel}">
            <svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>
            কল অর্ডার: ${CONTACT.phone}
          </a>
        </div>

        <ul class="pd-meta">
          <li><span>ক্যাটাগরি:</span> <a href="${categoryUrl(cat.slug)}">${esc(cat.name)}</a></li>
          <li><span>স্টক:</span> ${stock ? `<b class="ok">স্টকে আছে</b>` : `<b class="no">স্টক শেষ</b>`}</li>
        </ul>

        <ul class="pd-trust">
          <li>${ICON.truck} চট্টগ্রাম বিভাগে ২৪-৪৮ ঘণ্টায় ডেলিভারি</li>
          <li><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg> ক্যাশ অন ডেলিভারি</li>
          <li><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 1 3 6.2L4 20l1-3.5"/></svg> ৭ দিনের সহজ রিটার্ন</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="container pd-desc">
    <h2 class="pd-desc-title">${esc(p.bn)}</h2>
    <p class="pd-lead">${esc(p.intro)}</p>

    <div class="pd-desc-grid">
      <div class="pd-block">
        <h3>উপকারিতা</h3>
        <ul class="ticks">${copy.benefits.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
      </div>
      <div class="pd-block">
        <h3>মূল উপাদান</h3>
        <p>${esc(p.ingredients)}</p>
        <h3>ব্যবহার বিধি</h3>
        <ul class="ticks">${copy.usage.map(u => `<li>${esc(u)}</li>`).join("")}</ul>
      </div>
      <div class="pd-block">
        <h3>কেন বারাকাহ থেকে কিনবেন?</h3>
        <ul class="ticks">
          <li>সরাসরি উৎস থেকে সংগৃহীত খাঁটি পণ্য</li>
          <li>কোনো কেমিক্যাল, রং বা প্রিজারভেটিভ নেই</li>
          <li>প্রতিটি ব্যাচ মান যাচাই করা</li>
          <li>স্বাস্থ্যসম্মত ও নিরাপদ প্যাকেজিং</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="container">
    <div class="pd-banner">
      <img src="${cat.banner}" alt="" loading="lazy">
      <div class="pd-banner-copy">
        <span class="pd-banner-kicker">প্রাকৃতিক উৎস থেকে সংগৃহীত</span>
        <h2>${esc(p.bn)}</h2>
        <span class="pd-banner-tag">১০০% খাঁটি ও প্রাকৃতিক</span>
      </div>
    </div>
  </section>

  <section class="pd-highlights">
    <div class="container">
      <h2>কেন খাবেন ${esc(p.bn)}?</h2>
      <div class="pd-highlight-grid">
        ${copy.highlights.map((h, i) => `
          <div class="pd-highlight">
            <span class="pd-highlight-ic">${HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]}</span>
            <h3>${esc(h[0])}<br>${esc(h[1])}</h3>
          </div>`).join("")}
      </div>
    </div>
  </section>

  <section class="container section related">
    <div class="section-head">
      <h2 class="section-title">আরও দেখুন</h2>
      <a class="btn btn-outline" href="${categoryUrl(cat.slug)}">View all ${esc(cat.name)}</a>
    </div>
    <div class="products" id="related"></div>
  </section>

  <div class="pd-sticky" id="pdSticky">
    <div><b id="stickyPrice"></b><small id="stickyVariant"></small></div>
    <button type="button" class="btn btn-primary" id="stickyOrder"${stock ? "" : " disabled"}>অর্ডার করুন</button>
  </div>`;

  // related: same category first, then fill from featured products
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id);
  for (const x of PRODUCTS) if (related.length < 4 && x.featured && x.id !== p.id && !related.includes(x)) related.push(x);
  $("#related").innerHTML = related.slice(0, 4).map(productCard).join("");

  // ---------- Interactions ----------
  let vi = 0;
  const qtyEl = $("#qty");
  const qty = () => Math.max(1, Math.min(99, parseInt(qtyEl.value, 10) || 1));

  function update() {
    const v = p.variants[vi];
    $("#pdPrice").innerHTML = discount(v) ? `<s>${tk(v[2])}</s><b>${tk(v[1])}</b><span class="save">${discount(v)}% ছাড়</span>` : `<b>${tk(v[1])}</b><span class="per">/ ${esc(v[0])}</span>`;
    $("#stickyPrice").textContent = tk(v[1]);
    $("#stickyVariant").textContent = v[0];
    const msg = `আসসালামু আলাইকুম, আমি অর্ডার করতে চাই:\n${p.bn} | ${p.name}\nসাইজ: ${v[0]}\nপরিমাণ: ${bnNum(qty())}\nমূল্য: ${tk(v[1] * qty())}`;
    $("#waBtn").href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  $("#variantChips").addEventListener("click", e => {
    const c = e.target.closest("[data-vi]");
    if (!c) return;
    $$("#variantChips .chip").forEach(x => x.classList.remove("on"));
    c.classList.add("on");
    vi = +c.dataset.vi;
    update();
  });
  $("#qtyDec").addEventListener("click", () => { qtyEl.value = Math.max(1, qty() - 1); update(); });
  $("#qtyInc").addEventListener("click", () => { qtyEl.value = Math.min(99, qty() + 1); update(); });
  qtyEl.addEventListener("change", () => { qtyEl.value = qty(); update(); });

  $(".pd-thumbs").addEventListener("click", e => {
    const b = e.target.closest("[data-img]");
    if (!b) return;
    $$(".pd-thumbs button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    $("#mainImg").src = b.dataset.img;
  });

  // Buy/Order goes straight to checkout for this item only; Add to Cart opens the side cart
  const order = () => buyNow(`${p.id}:${vi}`, qty());
  $("#addBtn").addEventListener("click", () => addToCart(`${p.id}:${vi}`, qty()));
  $("#orderBtn").addEventListener("click", order);
  $("#stickyOrder").addEventListener("click", order);

  // show the mobile sticky bar once the main buy buttons scroll out of view
  new IntersectionObserver(([entry]) => $("#pdSticky").classList.toggle("show", !entry.isIntersecting))
    .observe($(".pd-actions"));

  update();
}
