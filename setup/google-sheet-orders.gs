/**
 * Barakah – receive website orders in a Google Sheet
 * ---------------------------------------------------
 * 1. Create a new Google Sheet (sheets.new) and name it "Barakah Orders".
 * 2. Extensions → Apps Script. Delete what is there and paste this whole file.
 * 3. Change NOTIFY_EMAIL below to the email that should get a message for every order
 *    (leave it "" for no emails). Click Save.
 * 4. Deploy → New deployment → type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy, allow the permissions, and copy the "Web app URL".
 * 5. Paste that URL into ORDER_SHEET_URL at the top of checkout.js.
 *
 * If you change this script later: Deploy → Manage deployments → Edit (pencil) →
 * Version "New version" → Deploy. The URL stays the same.
 */

const NOTIFY_EMAIL = "israfilsupol836@gmail.com";   // order alerts go here
const SHEET_NAME = "Orders";

const HEADERS = [
  "Time", "Order ID", "Status", "Name", "Phone", "Address", "Delivery zone",
  "Items", "Subtotal", "Delivery", "Total", "Payment", "bKash from", "TrxID", "Note",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const o = JSON.parse(e.postData.contents);

    // basic checks so random requests don't fill the sheet
    const phone = String(o.phone || "").replace(/\D/g, "");
    if (!o.id || !o.name || !/^(88)?01[3-9]\d{8}$/.test(phone) || !o.items) {
      return text("rejected");
    }

    const sheet = getSheet();
    // ignore accidental double submits of the same order
    const last = sheet.getLastRow();
    if (last > 1) {
      const ids = sheet.getRange(Math.max(2, last - 50), 2, Math.min(51, last - 1), 1).getValues().flat();
      if (ids.includes(o.id)) return text("duplicate");
    }

    sheet.appendRow([
      Utilities.formatDate(new Date(), "Asia/Dhaka", "dd/MM/yyyy hh:mm a"),
      o.id, "New", clean(o.name), "'" + phone, clean(o.address), clean(o.zone),
      clean(o.items), num(o.subtotal), num(o.delivery), num(o.total),
      clean(o.payment), o.bkashFrom ? "'" + clean(o.bkashFrom) : "", clean(o.trxid), clean(o.note),
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: `🛒 নতুন অর্ডার #${o.id} – ৳${num(o.total)} (${clean(o.payment)})`,
        body: [
          `অর্ডার: #${o.id}`, `নাম: ${o.name}`, `মোবাইল: ${phone}`, `ঠিকানা: ${o.address}`,
          `ডেলিভারি: ${o.zone}`, ``, o.items, ``,
          `সাবটোটাল: ৳${num(o.subtotal)}`, `ডেলিভারি চার্জ: ৳${num(o.delivery)}`, `সর্বমোট: ৳${num(o.total)}`,
          `পেমেন্ট: ${o.payment}${o.trxid ? ` (${o.bkashFrom}, TrxID ${o.trxid})` : ""}`,
          o.note ? `নোট: ${o.note}` : "",
          ``, `Sheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`,
        ].join("\n"),
      });
    }
    return text("ok");
  } catch (err) {
    return text("error: " + err);
  } finally {
    lock.releaseLock();
  }
}

// open the Web app URL in a browser to check it is working
function doGet() {
  return text("Barakah order receiver is running ✔");
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#0f2410").setFontColor("#e2b42f");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(8, 320);
    sheet.getRange("H:H").setWrap(true);
    // Status drop-down so you can track each order
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New", "Confirmed", "Shipped", "Delivered", "Cancelled"], true).build();
    sheet.getRange("C2:C").setDataValidation(rule);
  }
  return sheet;
}

// stop formulas being injected through form fields
const clean = v => { const s = String(v == null ? "" : v).slice(0, 2000); return /^[=+\-@]/.test(s) ? "'" + s : s; };
const num = v => Number(v) || 0;
const text = s => ContentService.createTextOutput(s);
