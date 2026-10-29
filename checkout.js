// ---------- Checkout settings (edit these) ----------
const DELIVERY_ZONES = [
  { id: "inside", label: "চট্টগ্রাম বিভাগের ভিতরে", note: "1-2 দিনে ডেলিভারি", fee: 60 },
  { id: "outside", label: "চট্টগ্রাম বিভাগের বাইরে", note: "2-4 দিনে ডেলিভারি", fee: 120 },
];
const BKASH_NUMBER = "01XXXXXXXXX"; // personal/merchant bKash number for Send Money
// Google Sheet that receives every order: paste the Web App URL from setup/google-sheet-orders.gs here
const ORDER_SHEET_URL = "";
// Every order is also emailed to the shop through FormSubmit (free). The first order sends an
// "Activate" email to this address; click it once and all later orders arrive in the inbox.
const ORDER_EMAIL = "israfilsupol836@gmail.com";

// ---------- Which items are being checked out ----------
// ?buy=<productId:variantIndex>&qty=n  -> Buy Now: only that item, cart untouched
// no params                             -> everything in the cart
const buyKey = params.get("buy");
const directMode = !!(buyKey && cartLine(buyKey));
const items = new Map(directMode
  ? [[buyKey, Math.max(1, Math.min(99, parseInt(params.get("qty"), 10) || 1))]]
  : [...cart]);

const form = $("#coForm");
let zone = DELIVERY_ZONES[0];

function init() {
  $("#zones").innerHTML = DELIVERY_ZONES.map((z, i) => `
    <label class="pay-opt zone">
      <input type="radio" name="zone" value="${z.id}"${i ? "" : " checked"}>
      <span class="pay-box"><b>${esc(z.label)} <i>${tk(z.fee)}</i></b><small>${esc(z.note)}</small></span>
    </label>`).join("");
  $("#bkNum").textContent = BKASH_NUMBER;

  form.addEventListener("change", e => {
    if (e.target.name === "zone") { zone = DELIVERY_ZONES.find(z => z.id === e.target.value); renderSummary(); }
    if (e.target.name === "pay") $("#bkashPanel").hidden = e.target.value !== "bkash";
  });
  $("#coItems").addEventListener("click", e => {
    const b = e.target.closest("[data-co]");
    if (!b) return;
    const [act, key] = b.dataset.co.split("|");
    const q = items.get(key) + (act === "inc" ? 1 : act === "dec" ? -1 : -999);
    q > 0 ? items.set(key, Math.min(99, q)) : items.delete(key);
    if (!directMode) { cart.clear(); items.forEach((v, k) => cart.set(k, v)); renderCart(); }
    if (!items.size) return location.reload();
    renderSummary();
  });
  form.addEventListener("input", e => e.target.closest(".field")?.classList.remove("has-err"));
  form.addEventListener("submit", submit);
  renderSummary();
}

const subtotal = () => [...items].reduce((s, [k, q]) => s + cartLine(k).v[1] * q, 0);

function renderSummary() {
  $("#coItems").innerHTML = [...items].map(([key, q]) => {
    const { p, v } = cartLine(key);
    return `
    <div class="co-item">
      <div class="co-thumb">${photo(p.img, "")}<span>${bnNum(q)}</span></div>
      <div class="co-info">
        <b>${esc(p.bn)}</b>
        <small>${esc(p.name)} · ${esc(v[0])}</small>
        <div class="qty">
          <button type="button" data-co="dec|${key}" aria-label="Decrease">−</button><span>${q}</span><button type="button" data-co="inc|${key}" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="co-price">${tk(v[1] * q)}<button type="button" class="remove" data-co="rm|${key}" aria-label="Remove">✕</button></div>
    </div>`;
  }).join("");
  const sub = subtotal(), total = sub + zone.fee;
  $("#coSub").textContent = tk(sub);
  $("#coShip").textContent = tk(zone.fee);
  $("#coTotal").textContent = tk(total);
  $("#bkAmt").textContent = tk(total);
  $("#coSubmit").textContent = `Confirm Order · ${tk(total)}`;
}

// ---------- Validation ----------
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;
const cleanPhone = v => v.replace(/[\s-]/g, "").replace(/[০-৯]/g, d => BN_DIGITS.indexOf(d));

function setErr(name, msg) {
  const el = form.elements[name];
  const f = el.closest(".field");
  f.classList.add("has-err");
  f.querySelector(".err").textContent = msg;
  return el;
}

// Sends the order to the Google Sheet. text/plain keeps it a "simple" request, which Apps Script accepts.
async function sendToSheet(o) {
  if (!ORDER_SHEET_URL) return false;
  const row = {
    id: o.id, name: o.name, phone: o.phone, address: o.address, zone: o.zone, note: o.note,
    items: o.items.map(i => `${i.name} (${i.size}) × ${i.qty} = ${i.price * i.qty}`).join("\n"),
    subtotal: o.subtotal, delivery: o.delivery, total: o.total,
    payment: o.payMethod, bkashFrom: o.bkashFrom, trxid: o.trxid, page: location.href,
  };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    await fetch(ORDER_SHEET_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(row), signal: ctrl.signal });
    return true;
  } catch (err) {
    return false;
  } finally {
    clearTimeout(t);
  }
}

// Emails the order to the shop. Returns true when FormSubmit accepted it.
async function sendToEmail(o) {
  if (!ORDER_EMAIL) return false;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(`https://formsubmit.co/ajax/${ORDER_EMAIL}`, {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `নতুন অর্ডার #${o.id} – ${tk(o.total)} (${o.payMethod})`,
        _template: "table", _captcha: "false",
        "অর্ডার নম্বর": o.id, "নাম": o.name, "মোবাইল": o.phone, "ঠিকানা": o.address,
        "ডেলিভারি এলাকা": o.zone,
        "পণ্য": o.items.map(i => `${i.name} (${i.size}) × ${i.qty} = ${tk(i.price * i.qty)}`).join(" | "),
        "সাবটোটাল": tk(o.subtotal), "ডেলিভারি চার্জ": tk(o.delivery), "সর্বমোট": tk(o.total),
        "পেমেন্ট": o.payment, "নোট": o.note || "-",
      }),
    });
    const j = await r.json().catch(() => ({}));
    return r.ok && String(j.success) === "true";
  } catch (err) {
    return false;
  } finally {
    clearTimeout(t);
  }
}

async function submit(e) {
  e.preventDefault();
  const btn = $("#coSubmit");
  if (btn.disabled) return;
  const f = form.elements;
  const bad = [];
  if (f.name.value.trim().length < 2) bad.push(setErr("name", "আপনার নাম লিখুন"));
  if (!BD_PHONE.test(cleanPhone(f.phone.value))) bad.push(setErr("phone", "সঠিক 11 ডিজিটের মোবাইল নম্বর দিন (01XXXXXXXXX)"));
  if (f.address.value.trim().length < 8) bad.push(setErr("address", "সম্পূর্ণ ঠিকানা লিখুন"));
  const pay = f.pay.value;
  if (pay === "bkash") {
    if (!BD_PHONE.test(cleanPhone(f.bkashFrom.value))) bad.push(setErr("bkashFrom", "যে বিকাশ নম্বর থেকে পাঠিয়েছেন তা দিন"));
    if (!/^[A-Za-z0-9]{8,12}$/.test(f.trxid.value.trim())) bad.push(setErr("trxid", "সঠিক ট্রানজেকশন আইডি দিন"));
  }
  if (bad.length) { bad[0].focus(); return; }

  const sub = subtotal();
  const order = {
    id: "BRK" + Date.now().toString().slice(-6),
    date: new Date().toISOString(),
    name: f.name.value.trim(),
    phone: cleanPhone(f.phone.value),
    address: f.address.value.trim(),
    zone: zone.label,
    note: f.note.value.trim(),
    payment: pay === "bkash" ? `bKash (${cleanPhone(f.bkashFrom.value)}, TrxID ${f.trxid.value.trim().toUpperCase()})` : "Cash on Delivery",
    payMethod: pay === "bkash" ? "bKash" : "Cash on Delivery",
    bkashFrom: pay === "bkash" ? cleanPhone(f.bkashFrom.value) : "",
    trxid: pay === "bkash" ? f.trxid.value.trim().toUpperCase() : "",
    items: [...items].map(([k, q]) => { const { p, v } = cartLine(k); return { name: `${p.bn} | ${p.name}`, size: v[0], qty: q, price: v[1] }; }),
    subtotal: sub, delivery: zone.fee, total: sub + zone.fee,
  };

  // keep a local copy; empty the cart unless this was a single Buy Now
  try {
    const all = JSON.parse(localStorage.getItem("barakah-orders") || "[]");
    all.push(order);
    localStorage.setItem("barakah-orders", JSON.stringify(all));
  } catch (err) {}
  // send to the shop's Google Sheet; on a network failure the customer can still send it by WhatsApp
  btn.disabled = true;
  btn.textContent = "Placing order…";
  const [toSheet, toEmail] = await Promise.all([sendToSheet(order), sendToEmail(order)]);
  const sent = toSheet || toEmail;
  if (!directMode) { cart.clear(); renderCart(); }

  showThanks(order, sent || (!ORDER_SHEET_URL && !ORDER_EMAIL));
}

function orderMessage(o) {
  return [
    `নতুন অর্ডার #${o.id}`,
    ...o.items.map(i => `• ${i.name} (${i.size}) × ${i.qty} = ${tk(i.price * i.qty)}`),
    `সাবটোটাল: ${tk(o.subtotal)}`, `ডেলিভারি (${o.zone}): ${tk(o.delivery)}`, `সর্বমোট: ${tk(o.total)}`,
    `পেমেন্ট: ${o.payment}`, ``,
    `নাম: ${o.name}`, `মোবাইল: ${o.phone}`, `ঠিকানা: ${o.address}`, o.note ? `নোট: ${o.note}` : "",
  ].filter(Boolean).join("\n");
}

function showThanks(o, delivered = true) {
  window.scrollTo(0, 0);
  $("#checkoutPage").innerHTML = `
    <div class="co-thanks">
      <div class="co-check">✓</div>
      <h1 class="page-title">ধন্যবাদ, ${esc(o.name)}!</h1>
      <p class="co-lead">আপনার অর্ডারটি গ্রহণ করা হয়েছে। অর্ডার নম্বর: <b>#${o.id}</b></p>
      <p class="muted">শিগগিরই আমাদের প্রতিনিধি ${esc(o.phone)} নম্বরে কল করে অর্ডার কনফার্ম করবেন।</p>
      ${delivered ? "" : `<p class="co-warn">ইন্টারনেট সমস্যার কারণে অর্ডারটি আমাদের কাছে পৌঁছায়নি। নিচের হোয়াটসঅ্যাপ বাটনে চাপ দিয়ে অর্ডারটি পাঠিয়ে দিন।</p>`}
      <div class="co-card co-receipt">
        ${o.items.map(i => `<div><span>${esc(i.name)} <small>(${esc(i.size)}) × ${bnNum(i.qty)}</small></span><b>${tk(i.price * i.qty)}</b></div>`).join("")}
        <div><span>ডেলিভারি (${esc(o.zone)})</span><b>${tk(o.delivery)}</b></div>
        <div class="grand"><span>সর্বমোট</span><b>${tk(o.total)}</b></div>
        <div><span>পেমেন্ট</span><b>${esc(o.payment.startsWith("bKash") ? "বিকাশ" : "ক্যাশ অন ডেলিভারি")}</b></div>
      </div>
      <div class="co-thanks-actions">
        <a class="btn btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(orderMessage(o))}">Send Order on WhatsApp</a>
        <a class="btn btn-outline" href="index.html">Continue Shopping</a>
      </div>
    </div>`;
}

// start once every helper above is defined
if (!items.size) {
  $("#checkoutPage").innerHTML = `
    <div class="empty-state co-empty">
      ${ICON.cart}
      <h1 class="page-title">আপনার কার্ট খালি</h1>
      <p>চেকআউট করতে আগে কিছু পণ্য যোগ করুন।</p>
      <a class="btn btn-primary" href="category.html">Shop Products</a>
    </div>`;
} else {
  init();
}
