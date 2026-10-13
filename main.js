// UI orchestration: builds config-driven content, applies layout/visibility, wires events.
(() => {
  const { cfg, $$, byId, money, today, state, terbilang, exporters } = Invoice;
  const { labels: L, placeholders: P } = cfg;
  const sheet = byId("invoiceSheet");
  const tableBody = byId("tableBody");
  const logoSelect = byId("logoSelect");
  const layoutSelect = byId("layoutSelect");
  const lock = byId("terbilangLock");
  const terbilangField = byId("terbilangField");

  const fillSelect = (el, items, key, selected) => {
    el.innerHTML = items.map((i) => `<option value="${i[key]}"${i[key] === selected ? " selected" : ""}>${i.name}</option>`).join("");
  };

  const buildContent = () => {
    $$("[data-label]").forEach((el) => (el.textContent = L[el.dataset.label]));
    byId("metaZone").innerHTML = cfg.metaFields
      .map(
        (f) => `<div class="meta-row" data-section="${f.key}">
          <span class="meta-label">${f.label}</span>
          <span class="meta-value"><input type="text" id="${f.key}" class="editable" placeholder="${f.placeholder ?? today()}"></span>
        </div>`,
      )
      .join("");
    byId("invoiceTitle").textContent = L.title;
    byId("companyNameInput").value = cfg.defaultCompany;
    Object.entries({
      companyNameInput: P.company,
      transferDetails: P.transfer,
      signatureName: P.signatureName,
      signatureLocationDate: `${cfg.signatureCity}, ${today()}`,
    }).forEach(([id, text]) => (byId(id).placeholder = text));
    fillSelect(logoSelect, cfg.logos, "file", cfg.defaultLogoFile);
    fillSelect(layoutSelect, cfg.layouts, "id", cfg.defaultLayoutId);
    $$("[data-export]").forEach((btn) => (btn.hidden = cfg.exports[btn.dataset.export] === false));
  };

  // ---- visibility: global config < layout override < runtime toggles (state.sections) ----
  const resolveSections = (layout) => {
    const keys = $$("[data-section]").map((el) => el.dataset.section);
    const merged = { ...cfg.sections, ...layout.sections };
    Object.keys(merged)
      .filter((k) => !keys.includes(k))
      .forEach((k) => console.warn(`Invoice: section "${k}" is protected or unknown; flag ignored.`));
    return Object.fromEntries(keys.map((k) => [k, merged[k] !== false]));
  };

  const applyVisibility = () => {
    $$("[data-section]").forEach((el) => (el.hidden = !state.sections[el.dataset.section]));
    // A zone that only wraps sections disappears when all of them are hidden.
    $$("[data-zone]").forEach((zone) => {
      const kids = $$("[data-section]", zone);
      if (kids.length) zone.hidden = kids.every((k) => k.hidden);
    });
    logoSelect.closest(".control-item").hidden = !state.sections.logo;
  };

  const applyLayout = () => {
    state.layout = cfg.layouts.find((l) => l.id === layoutSelect.value) || cfg.layouts[0];
    Object.assign(sheet.dataset, { layout: state.layout.id, skin: state.layout.skin });
    state.sections = resolveSections(state.layout);
    applyVisibility();
  };

  const applyLogo = () => (byId("logoPreview").src = logoSelect.value);

  const randomize = () => {
    [logoSelect, layoutSelect].forEach((s) => (s.selectedIndex = Math.floor(Math.random() * s.options.length)));
    applyLogo();
    applyLayout();
  };

  // ---- table ----
  const rowHtml = (n) => `<tr>
    <td class="text-center index-cell">${n}</td>
    <td><input type="text" placeholder="${P.item}"></td>
    <td><input type="number" class="amount-input" placeholder="0"></td>
    <td class="no-print text-center"><button class="btn-delete" type="button">✕</button></td>
  </tr>`;

  const calculateTotal = () => {
    const total = $$(".amount-input").reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
    byId("totalDisplay").textContent = money(total);
    if (lock.checked) terbilangField.value = `${terbilang(total)} ${cfg.currencyWord}`;
  };

  const addRow = () => {
    tableBody.insertAdjacentHTML("beforeend", rowHtml(tableBody.rows.length + 1));
    calculateTotal();
  };

  const deleteRow = (btn) => {
    btn.closest("tr").remove();
    $$("#tableBody .index-cell").forEach((cell, i) => (cell.textContent = i + 1));
    calculateTotal();
  };

  // ---- init ----
  buildContent();
  addRow();
  applyLogo();
  applyLayout();

  logoSelect.addEventListener("change", applyLogo);
  layoutSelect.addEventListener("change", applyLayout);
  byId("randomizeBtn").addEventListener("click", randomize);
  byId("addRowButton").addEventListener("click", addRow);
  lock.addEventListener("change", () => (terbilangField.readOnly = lock.checked));
  tableBody.addEventListener("click", (e) => e.target.closest(".btn-delete") && deleteRow(e.target));
  tableBody.addEventListener("input", (e) => e.target.matches(".amount-input") && calculateTotal());
  $$("[data-export]").forEach((btn) => btn.addEventListener("click", exporters[btn.dataset.export]));
})();
