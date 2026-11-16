// UI orchestration: builds config-driven content, applies layout/visibility, wires events.
(() => {
  const { cfg, $$, byId, money, today, state, terbilang, exporters, num, fmt } = Invoice;
  const { placeholders: P } = cfg;
  const sheet = byId("invoiceSheet");
  const tableBody = byId("tableBody");
  const logoSelect = byId("logoSelect");
  const logoPreview = byId("logoPreview");
  const logoFile = byId("logoFile");
  const layoutSelect = byId("layoutSelect");
  const modeSelect = byId("modeSelect");
  const lock = byId("terbilangLock");
  const terbilangField = byId("terbilangField");
  const transferInput = byId("transferDetails");

  // Terbilang wraps onto as many lines as needed so the full amount in words is always visible.
  const fitTerbilang = () => {
    terbilangField.style.height = "auto";
    if (terbilangField.scrollHeight) terbilangField.style.height = `${terbilangField.scrollHeight}px`;
  };

  const fillSelect = (el, items, key, selected) => {
    el.innerHTML = items.map((i) => `<option value="${i[key]}"${i[key] === selected ? " selected" : ""}>${i.name}</option>`).join("");
  };

  const getActiveMode = () => cfg.modes[state.documentType] || cfg.modes.invoice;

  const updateLabels = () => {
    const mode = getActiveMode();
    const labels = { ...cfg.labels, ...mode.labels };
    $$("[data-label]").forEach((el) => (el.textContent = labels[el.dataset.label] ?? ""));
    byId("invoiceTitle").textContent = labels.title;
    transferInput.placeholder = { ...P, ...mode.placeholders }.transfer;
    logoPreview.title = labels.logoPick;
  };

  const buildContent = () => {
    byId("metaZone").innerHTML = cfg.metaFields
      .map(
        (f) => `<div class="meta-row" data-section="${f.key}">
          <span class="meta-label" data-label="meta_${f.key}"></span>
          <span class="meta-value"><input type="text" id="${f.key}" class="editable" placeholder="${f.placeholder ?? today()}"></span>
        </div>`,
      )
      .join("");
    byId("companyNameInput").value = cfg.defaultCompany;
    Object.entries({
      companyNameInput: P.company,
      signatureName: P.signatureName,
      signatureLocationDate: `${cfg.signatureCity}, ${today()}`,
    }).forEach(([id, text]) => (byId(id).placeholder = text));
    fillSelect(logoSelect, cfg.logos, "file", cfg.defaultLogoFile);
    fillSelect(layoutSelect, cfg.layouts, "id", cfg.defaultLayoutId);
    fillSelect(
      modeSelect,
      Object.keys(cfg.modes).map((id) => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1) })),
      "id",
      cfg.defaultDocumentType,
    );
    $$("[data-export]").forEach((btn) => (btn.hidden = cfg.exports[btn.dataset.export] === false));
    updateLabels();
  };

  // ---- visibility: global config < layout override < mode override < runtime toggles (state.sections) ----
  const resolveSections = (layout, mode) => {
    const keys = $$("[data-section]").map((el) => el.dataset.section);
    const merged = { ...cfg.sections, ...layout.sections, ...mode.sections };
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
    fitTerbilang();
  };

  const applyLayout = () => {
    state.layout = cfg.layouts.find((l) => l.id === layoutSelect.value) || cfg.layouts[0];
    Object.assign(sheet.dataset, { layout: state.layout.id, skin: state.layout.skin });
    state.sections = resolveSections(state.layout, getActiveMode());
    applyVisibility();
  };

  // The notes box holds bank details (invoice) or terms (quotation); keep one value per mode.
  let currentType = cfg.defaultDocumentType;
  const notes = {};
  const applyMode = () => {
    notes[currentType] = transferInput.value;
    currentType = modeSelect.value;
    transferInput.value = notes[currentType] ?? "";
    state.documentType = currentType;
    updateLabels();
    state.sections = resolveSections(state.layout || cfg.layouts[0], getActiveMode());
    applyVisibility();
  };

  // ---- logo ----
  const applyLogo = () => (logoPreview.src = logoSelect.value);

  // Clicking the logo opens the OS file dialog so a logo can be picked from any folder.
  const pickLogo = () => logoFile.click();
  const loadLogo = () => {
    const file = logoFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      [...logoSelect.options].filter((o) => o.dataset.custom).forEach((o) => o.remove());
      const opt = new Option(file.name, reader.result, true, true);
      opt.dataset.custom = "1";
      logoSelect.add(opt);
      applyLogo();
    };
    reader.readAsDataURL(file);
    logoFile.value = "";
  };

  const randomize = () => {
    [logoSelect, layoutSelect].forEach((s) => (s.selectedIndex = Math.floor(Math.random() * s.options.length)));
    applyLogo();
    applyLayout();
  };

  // ---- table ----
  const rowHtml = (n) => `<tr>
    <td class="text-center index-cell">${n}</td>
    <td><input type="text" placeholder="${P.item}"></td>
    <td><input type="text" inputmode="numeric" autocomplete="off" class="amount-input" placeholder="0"></td>
    <td class="no-print text-center"><button class="btn-delete" type="button">✕</button></td>
  </tr>`;

  const calculateTotal = () => {
    const total = $$(".amount-input").reduce((sum, i) => sum + num(i.value), 0);
    byId("totalDisplay").textContent = money(total);
    if (lock.checked) terbilangField.value = `${terbilang(total)} ${cfg.currencyWord}`;
    fitTerbilang();
  };

  // Live thousand separators (same locale as #totalDisplay), keeping the caret next to the same digit.
  const formatAmountInput = (input) => {
    const digitsBefore = input.value.slice(0, input.selectionStart).replace(/\D/g, "").length;
    input.value = fmt(num(input.value));
    let pos = 0;
    let seen = 0;
    while (pos < input.value.length && seen < digitsBefore) {
      if (/\d/.test(input.value[pos])) seen++;
      pos++;
    }
    input.setSelectionRange(pos, pos);
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
  applyMode();

  logoSelect.addEventListener("change", applyLogo);
  logoPreview.addEventListener("click", pickLogo);
  logoPreview.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pickLogo();
    }
  });
  logoFile.addEventListener("change", loadLogo);
  terbilangField.addEventListener("input", fitTerbilang);
  window.addEventListener("resize", fitTerbilang);
  window.addEventListener("beforeprint", fitTerbilang);
  layoutSelect.addEventListener("change", applyLayout);
  modeSelect.addEventListener("change", applyMode);
  byId("randomizeBtn").addEventListener("click", randomize);
  byId("addRowButton").addEventListener("click", addRow);
  lock.addEventListener("change", () => (terbilangField.readOnly = lock.checked));
  tableBody.addEventListener("click", (e) => e.target.closest(".btn-delete") && deleteRow(e.target));
  tableBody.addEventListener("input", (e) => {
    if (!e.target.matches(".amount-input")) return;
    formatAmountInput(e.target);
    calculateTotal();
  });
  $$("[data-export]").forEach((btn) => btn.addEventListener("click", exporters[btn.dataset.export]));
})();
