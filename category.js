// ---------- Which products this page lists ----------
const cat = catBySlug(params.get("c"));
const query = (params.get("q") || "").trim();
const searchHits = query ? searchProducts(query) : [];
// search results keep best-match order
const base = (query ? searchHits : PRODUCTS).filter(p => !cat || p.cat === cat.slug);

const title = cat ? cat.bn : query ? `“${query}” এর ফলাফল` : "সকল পণ্য";
document.title = `${cat ? cat.name : "Shop"} | Barakah`;
$("#pageTitle").textContent = title;
$("#pageSub").textContent = cat ? cat.name : query ? "" : "All Products";
$("#breadcrumb").innerHTML = `<a href="index.html">Home</a><span>/</span>` +
  (cat ? `<a href="category.html">Categories</a><span>/</span><span aria-current="page">${esc(cat.name)}</span>`
       : `<span aria-current="page">${esc(query ? "Search" : "All Products")}</span>`);

// ---------- Filter controls ----------
$("#filterCats").innerHTML = `<a href="category.html"${!cat ? ` class="active"` : ""}>All Products <span>${bnNum(PRODUCTS.length)}</span></a>` +
  CATEGORIES.map(c => `<a href="${categoryUrl(c.slug)}"${cat && cat.slug === c.slug ? ` class="active"` : ""}>${esc(c.name)} <span>${bnNum(PRODUCTS.filter(p => p.cat === c.slug).length)}</span></a>`).join("");

// weight chips come from the variant sizes of the products on this page
const weightOrder = l => {
  const n = parseFloat(l.replace(/[০-৯]/g, d => BN_DIGITS.indexOf(d))) || 0;
  return /kg|কেজি|\bL\b|লিটার/i.test(l) ? n * 1000 : /pack|প্যাক/i.test(l) ? 1e6 + n : n;
};
const weights = [...new Set(base.flatMap(p => p.variants.map(v => v[0])))].sort((a, b) => weightOrder(a) - weightOrder(b));
$("#weightChips").innerHTML = weights.map(w => `<button type="button" class="chip" data-weight="${esc(w)}">${esc(w)}</button>`).join("")
  || `<span class="muted">—</span>`;

const prices = base.flatMap(p => p.variants.map(v => v[1]));
const lo = prices.length ? Math.min(...prices) : 0, hi = prices.length ? Math.max(...prices) : 0;
const minEl = $("#priceMin"), maxEl = $("#priceMax");
for (const el of [minEl, maxEl]) { el.min = lo; el.max = hi; el.step = 10; }
minEl.value = lo; maxEl.value = hi;

const state = { weights: new Set(), min: lo, max: hi, avail: new Set(), sort: "default" };

function syncRange() {
  let a = +minEl.value, b = +maxEl.value;
  if (a > b) [a, b] = [b, a];
  state.min = a; state.max = b;
  $("#priceMinLabel").textContent = tk(a);
  $("#priceMaxLabel").textContent = tk(b);
  const span = hi - lo || 1;
  $("#rangeFill").style.left = ((a - lo) / span * 100) + "%";
  $("#rangeFill").style.right = (100 - (b - lo) / span * 100) + "%";
}

// ---------- Render ----------
function render() {
  let list = base.filter(p => {
    const vs = p.variants.filter(v =>
      (!state.weights.size || state.weights.has(v[0])) && v[1] >= state.min && v[1] <= state.max);
    if (!vs.length) return false;
    if (state.avail.size === 1) return state.avail.has("in") ? inStock(p) : !inStock(p);
    return true;
  });
  const sorters = {
    "price-asc": (a, b) => minPrice(a) - minPrice(b),
    "price-desc": (a, b) => minPrice(b) - minPrice(a),
    "discount": (a, b) => discount(b.variants[0]) - discount(a.variants[0]),
    "name": (a, b) => a.name.localeCompare(b.name),
  };
  if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
  // out-of-stock items always sink to the bottom
  list = [...list].sort((a, b) => inStock(b) - inStock(a));

  $("#resultCount").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
  $("#applyFilters").textContent = `Show Results (${list.length})`;
  $("#grid").innerHTML = list.length ? list.map(productCard).join("")
    : `<div class="empty-state"><p>No products match these filters.</p><button class="btn btn-primary" type="button" data-reset>Reset filters</button></div>`;
}

// ---------- Events ----------
$("#weightChips").addEventListener("click", e => {
  const c = e.target.closest("[data-weight]");
  if (!c) return;
  const w = c.dataset.weight;
  state.weights.has(w) ? state.weights.delete(w) : state.weights.add(w);
  c.classList.toggle("on");
  render();
});
for (const el of [minEl, maxEl]) el.addEventListener("input", () => { syncRange(); render(); });
$$("#filters .check input").forEach(cb => cb.addEventListener("change", () => {
  cb.checked ? state.avail.add(cb.value) : state.avail.delete(cb.value);
  render();
}));
$("#sort").addEventListener("change", e => { state.sort = e.target.value; render(); });

function resetFilters() {
  state.weights.clear(); state.avail.clear();
  $$("#weightChips .chip").forEach(c => c.classList.remove("on"));
  $$("#filters .check input").forEach(c => c.checked = false);
  minEl.value = lo; maxEl.value = hi; syncRange();
  render();
}
$("#resetFilters").addEventListener("click", resetFilters);
$("#grid").addEventListener("click", e => { if (e.target.closest("[data-reset]")) resetFilters(); });

// mobile / tablet: filters open as a slide-in panel
const filtersEl = $("#filters");
const panelMode = matchMedia("(max-width: 1023px)");
const syncFilterInert = () => { filtersEl.inert = panelMode.matches && !filtersEl.classList.contains("open"); };
function openFilters() {
  filtersEl.classList.add("open"); syncFilterInert();
  $("#overlay").classList.add("show");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#closeFilters").focus({ preventScroll: true }), 50);
}
function closeFilters() {
  if (!filtersEl.classList.contains("open")) return;
  filtersEl.classList.remove("open"); syncFilterInert();
  $("#overlay").classList.remove("show");
  document.body.style.overflow = "";
  $("#openFilters").focus({ preventScroll: true });
}
$("#openFilters").addEventListener("click", openFilters);
$("#closeFilters").addEventListener("click", closeFilters);
$("#applyFilters").addEventListener("click", () => { closeFilters(); $(".shop-main").scrollIntoView({ behavior: "smooth", block: "start" }); });
$("#overlay").addEventListener("click", closeFilters);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeFilters(); });
panelMode.addEventListener("change", syncFilterInert);
syncFilterInert();

syncRange();
render();
