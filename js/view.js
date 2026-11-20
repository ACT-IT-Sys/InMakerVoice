// View orchestration: builds config-driven content, resolves labels/placeholders/visibility for the
// active layout + mode, and re-renders when either changes.
(() => {
  const { cfg, $$, byId, state, today, tpl, fillSelect } = Invoice;
  const sheet = byId("invoiceSheet");
  const layoutSelect = byId("layoutSelect");
  const modeSelect = byId("modeSelect");
  const logoSelect = byId("logoSelect");
  const transferInput = byId("transferDetails");

  const applyPlaceholders = () => {
    const P = Invoice.placeholders();
    const vars = { city: cfg.signatureCity, date: today() };
    const targets = { ...cfg.placeholderTargets, ...Object.fromEntries(cfg.signatureFields.map((f) => [`.sig-${f.key}`, f.placeholder])) };
    Object.entries(targets).forEach(([selector, key]) => $$(selector).forEach((el) => (el.placeholder = tpl(P[key], vars))));
    cfg.metaFields.forEach((f) => (byId(f.key).placeholder = f.placeholder ?? today()));
  };

  const updateLabels = () => {
    const L = Invoice.labels();
    $$("[data-label]").forEach((el) => (el.textContent = L[el.dataset.label] ?? ""));
    byId("invoiceTitle").textContent = L.title;
    byId("logoPreview").title = L.logoPick;
    applyPlaceholders();
  };

  const metaRowHtml = (f) => `<div class="meta-row" data-section="${f.key}">
      <span class="meta-label" data-label="meta_${f.key}"></span>
      <span class="meta-value"><input type="text" id="${f.key}" class="editable"></span>
    </div>`;

  const build = () => {
    byId("metaZone").innerHTML = cfg.metaGroups
      .map(
        (g) => `<div class="meta-group" data-group="${g}"><div class="group-title" data-label="group_${g}"></div>${cfg.metaFields
          .filter((f) => f.group === g)
          .map(metaRowHtml)
          .join("")}</div>`,
      )
      .join("");
    byId("companyNameInput").value = cfg.defaultCompany;
    Invoice.logo.fill();
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

  // ---- visibility: global < layout < mode < layout's entry for that mode ----
  const resolveSections = () => {
    const keys = [...new Set([...$$("[data-section]").map((el) => el.dataset.section), ...cfg.signatureFields.map((f) => f.section)])];
    const merged = Invoice.merged("sections", cfg.sections);
    Object.keys(merged)
      .filter((k) => !keys.includes(k))
      .forEach((k) => console.warn(`Invoice: section "${k}" is protected or unknown; flag ignored.`));
    return Object.fromEntries(keys.map((k) => [k, merged[k] !== false]));
  };

  const applyVisibility = () => {
    $$("[data-section]").forEach((el) => (el.hidden = !state.sections[el.dataset.section]));
    // A zone or meta group that only wraps sections disappears when all of them are hidden.
    $$("[data-zone], [data-group]").forEach((box) => {
      const kids = $$("[data-section]", box);
      if (kids.length) box.hidden = kids.every((k) => k.hidden);
    });
    logoSelect.closest(".control-item").hidden = !state.sections.logo;
    Invoice.fitFields();
  };

  // Everything that depends on the active layout or mode.
  const refresh = () => {
    state.sections = resolveSections();
    updateLabels();
    Invoice.signatures.seed();
    applyVisibility();
    Invoice.table.reformat();
    Invoice.table.applyRateTaxToggle();
  };

  const applyLayout = () => {
    state.layout = cfg.layouts.find((l) => l.id === layoutSelect.value) || cfg.layouts[0];
    Object.assign(sheet.dataset, { layout: state.layout.id, skin: state.layout.skin });
    refresh();
  };

  // The notes box holds bank details (invoice) or terms (quotation); keep one value per mode.
  let currentType = cfg.defaultDocumentType;
  const notes = {};
  const applyMode = () => {
    notes[currentType] = transferInput.value;
    currentType = modeSelect.value;
    transferInput.value = notes[currentType] ?? "";
    state.documentType = currentType;
    refresh();
  };

  const bind = () => {
    layoutSelect.addEventListener("change", applyLayout);
    modeSelect.addEventListener("change", applyMode);
    transferInput.addEventListener("input", Invoice.fitFields);
    window.addEventListener("resize", Invoice.fitFields);
    window.addEventListener("beforeprint", Invoice.fitFields);
  };

  Invoice.view = { build, bind, applyLayout, applyMode, applyPlaceholders, applyVisibility };
})();
