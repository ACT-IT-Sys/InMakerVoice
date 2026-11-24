// Items table: rows, categories, rate/tax calculation, totals display, terbilang.
(() => {
  const {
    cfg,
    $,
    $$,
    byId,
    num,
    pct,
    fmt,
    fmtPct,
    money,
    opt,
    terbilang,
    DEC,
  } = Invoice;
  const sheet = byId("invoiceSheet");
  const tableBody = byId("tableBody");
  const toggle = byId("rateTaxToggle");
  const lock = byId("terbilangLock");
  const terbilangField = byId("terbilangField");

  const affix = (body) =>
    body && opt("affixInputs") ? `${Invoice.currencySymbol()} ${body}` : body;
  const moneyText = (n) => affix(fmt(n));
  // Live text while typing: grouped integer part + the decimals typed so far (so "120," survives).
  const KEEP = new RegExp(`[\\d${DEC}]`);
  const liveText = (raw) => {
    const [int, ...rest] = raw
      .replace(new RegExp(`[^\\d${DEC}]`, "g"), "")
      .split(DEC);
    const places = Invoice.decimals();
    const head = int ? Number(int).toLocaleString(cfg.locale) : "";
    return affix(
      rest.length && places
        ? `${head || "0"}${DEC}${rest.join("").slice(0, places)}`
        : head,
    );
  };
  const taxText = (s) =>
    s.trim()
      ? `${fmtPct(pct(s))}${opt("affixInputs") ? cfg.taxSuffix : ""}`
      : "";

  const rowHtml = (n, isHeader) =>
    isHeader
      ? `<tr class="category-row"><td colspan="7"><input type="text" class="category-input" value=""></td><td class="no-print text-center"><button class="btn-delete" type="button">✕</button></td></tr>`
      : `<tr>
    <td class="text-center index-cell">${n}</td>
    <td><input type="text" class="desc-input"></td>
    <td><input type="text" inputmode="decimal" class="qty-input" value="1"></td>
    <td><input type="text" class="unit-input"></td>
    <td class="rate-col"><input type="text" inputmode="numeric" class="rate-input"></td>
    <td class="tax-col"><input type="text" inputmode="decimal" class="tax-input"></td>
    <td><input type="text" inputmode="numeric" class="amount-input" placeholder="0"></td>
    <td class="no-print text-center"><button class="btn-delete" type="button">✕</button></td>
  </tr>`;

  const recalcRow = (tr) => {
    if (tr.classList.contains("category-row")) return;
    const amountInput = $(".amount-input", tr);
    const f = Invoice.rowFigures(tr);
    if (toggle.checked && f.rate) {
      amountInput.value = moneyText(Invoice.rowAmount(f));
      amountInput.readOnly = true;
    } else {
      amountInput.readOnly = false;
    }
  };

  const calculateTotal = () => {
    const t = Invoice.totals();
    byId("totalDisplay").textContent = money(t.grand);
    byId("totalBreakdown").innerHTML = Invoice.totalLines(t)
      .slice(0, -1)
      .map(
        (l) =>
          `<span class="tb-label tb-${l.kind}">${l.label}</span><span class="tb-value tb-${l.kind}">${money(l.value)}</span>`,
      )
      .join("");
    if (lock.checked)
      terbilangField.value = `${terbilang(t.grand)} ${Invoice.currencyWord()}`;
    Invoice.fitFields();
  };

  const applyRateTaxToggle = () => {
    sheet.classList.toggle("rate-tax-on", toggle.checked);
    $$(".rate-col, .tax-col").forEach((el) => (el.hidden = !toggle.checked));
    $$("#tableBody tr").forEach(recalcRow);
    calculateTotal();
  };

  // Re-render typed values after a layout switch (currency prefix / tax suffix may differ).
  const reformat = () => {
    $$(".amount-input, .rate-input").forEach(
      (i) => i.value && (i.value = moneyText(num(i.value))),
    );
    $$(".tax-input").forEach((i) => (i.value = taxText(i.value)));
  };

  // Live thousand separators (same locale as #totalDisplay), keeping the caret next to the same digit.
  const formatMoneyInput = (input) => {
    const digitsBefore = [...input.value.slice(0, input.selectionStart)].filter(
      (c) => KEEP.test(c),
    ).length;
    input.value = liveText(input.value);
    let pos = 0;
    let seen = 0;
    while (pos < input.value.length && seen < digitsBefore) {
      if (KEEP.test(input.value[pos])) seen++;
      pos++;
    }
    input.setSelectionRange(pos, pos);
  };

  const addRow = (isHeader = false) => {
    const n = $$("#tableBody tr:not(.category-row)").length + 1;
    tableBody.insertAdjacentHTML("beforeend", rowHtml(n, isHeader));
    Invoice.view.applyPlaceholders();
    applyRateTaxToggle();
  };

  const deleteRow = (btn) => {
    btn.closest("tr").remove();
    $$("#tableBody .index-cell").forEach(
      (cell, i) => (cell.textContent = i + 1),
    );
    calculateTotal();
  };

  const bind = () => {
    toggle.addEventListener("change", applyRateTaxToggle);
    byId("addRowButton").addEventListener("click", () => addRow());
    byId("addRowButton").insertAdjacentHTML(
      "beforebegin",
      `<button class="btn no-print" id="addCategory" type="button">+ Category</button>`,
    );
    byId("addCategory").addEventListener("click", () => addRow(true));
    lock.addEventListener(
      "change",
      () => (terbilangField.readOnly = lock.checked),
    );
    terbilangField.addEventListener("input", Invoice.fitFields);
    tableBody.addEventListener(
      "click",
      (e) => e.target.closest(".btn-delete") && deleteRow(e.target),
    );
    tableBody.addEventListener("input", (e) => {
      const tr = e.target.closest("tr");
      if (!tr || tr.classList.contains("category-row")) return;
      if (e.target.matches(".amount-input, .rate-input"))
        formatMoneyInput(e.target);
      if (e.target.matches(".rate-input, .tax-input, .qty-input"))
        recalcRow(tr);
      calculateTotal();
    });
    tableBody.addEventListener(
      "change",
      (e) =>
        e.target.matches(".tax-input") &&
        (e.target.value = taxText(e.target.value)),
    );
  };

  Invoice.table = {
    addRow,
    applyRateTaxToggle,
    reformat,
    calculateTotal,
    bind,
  };
})();
