// DOM wiring: view + fields panel + logo + signatures
(() => {
  const { cfg, $$, byId, state, today, tpl, fillSelect, layered } = Invoice;
  const sheet = byId("invoiceSheet");
  const layoutSelect = byId("layoutSelect");
  const modeToggle = byId("modeToggle");
  const logoSelect = byId("logoSelect");
  const transferInput = byId("transferDetails");
  const panel = byId("fieldsPanel");
  const list = byId("fieldsList");
  const btn = byId("fieldsBtn");

  // ----- placeholders & labels -----
  const applyPlaceholders = () => {
    const P = Invoice.placeholders();
    const vars = { city: cfg.signatureCity, date: today() };
    const targets = {
      ...cfg.placeholderTargets,
      ...Object.fromEntries(
        cfg.signatureFields.map((f) => [`.sig-${f.key}`, f.placeholder]),
      ),
    };
    Object.entries(targets).forEach(([selector, key]) =>
      $$(selector).forEach((el) => (el.placeholder = tpl(P[key], vars))),
    );
    cfg.metaFields.forEach(
      (f) => (byId(f.key).placeholder = f.placeholder ?? today()),
    );
  };
  const updateLabels = () => {
    const L = Invoice.labels();
    $$("[data-label]").forEach(
      (el) => (el.textContent = L[el.dataset.label] ?? ""),
    );
    byId("invoiceTitle").textContent = L.title;
    byId("logoPreview").title = L.logoPick;
    applyPlaceholders();
  };

  // ----- build -----
  const metaRowHtml = (f) => `<div class="meta-row" data-section="${f.key}">
      <span class="meta-label" data-label="meta_${f.key}"></span>
      <span class="meta-value"><input type="text" id="${f.key}" class="editable"></span>
    </div>`;
  const build = () => {
    byId("metaZone").innerHTML = cfg.metaGroups
      .map(
        (g) =>
          `<div class="meta-group" data-group="${g}"><div class="group-title" data-label="group_${g}"></div>${cfg.metaFields
            .filter((f) => f.group === g)
            .map(metaRowHtml)
            .join("")}</div>`,
      )
      .join("");
    byId("companyNameInput").value = cfg.defaultCompany;
    Invoice.logo.fill();
    fillSelect(layoutSelect, cfg.layouts, "id", cfg.defaultLayoutId);
    $$("[data-export]").forEach(
      (btn) => (btn.hidden = cfg.exports[btn.dataset.export] === false),
    );
    updateLabels();
  };

  // ----- visibility -----
  const resolveSections = () => {
    const keys = [
      ...new Set([
        ...$$("[data-section]").map((el) => el.dataset.section),
        ...cfg.signatureFields.map((f) => f.section),
      ]),
    ];
    const merged = Invoice.merged("sections", cfg.sections);
    return Object.fromEntries(keys.map((k) => [k, merged[k] !== false]));
  };
  const applyVisibility = () => {
    $$("[data-section]").forEach(
      (el) => (el.hidden = !state.sections[el.dataset.section]),
    );
    $$("[data-zone], [data-group]").forEach((box) => {
      const kids = $$("[data-section]", box);
      if (kids.length) box.hidden = kids.every((k) => k.hidden);
    });
    logoSelect.closest(".control-item").hidden = !state.sections.logo;
    Invoice.fitFields();
  };
  const applyDefaults = () => {
    const defs = layered("default", {});
    const map = {
      companyNameInput: defs.company,
      companyAddress: defs.companyAddress,
      companyContact: defs.companyContact,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = byId(id);
      if (el && val && !el.value.trim()) el.value = val;
    });
  };
  const refresh = () => {
    state.sections = resolveSections();
    updateLabels();
    Invoice.signatures.seed();
    applyDefaults();
    applyVisibility();
    Invoice.table.reformat();
    Invoice.table.applyRateTaxToggle();
  };
  const applyLayout = () => {
    state.layout =
      cfg.layouts.find((l) => l.id === layoutSelect.value) || cfg.layouts[0];
    Object.assign(sheet.dataset, {
      layout: state.layout.id,
      skin: state.layout.skin,
    });
    refresh();
  };
  let currentType = cfg.defaultDocumentType;
  const notes = {};
  const nextMode = () => {
    const ids = Object.keys(cfg.modes);
    return ids[(ids.indexOf(currentType) + 1) % ids.length];
  };
  // applyMode() re-applies the current mode (used on load); applyMode(type) switches to it.
  const applyMode = (type = currentType) => {
    notes[currentType] = transferInput.value;
    currentType = type;
    modeToggle.textContent =
      currentType.charAt(0).toUpperCase() + currentType.slice(1);
    transferInput.value = notes[currentType] ?? "";
    state.documentType = currentType;
    refresh();
  };

  // ----- fields panel -----
  const sections = () => [
    ...cfg.metaFields.map((f) => ({
      key: f.key,
      label: Invoice.labels()["meta_" + f.key] || f.key,
    })),
    { key: "companyAddress", label: "Company address" },
    { key: "companyContact", label: "Company contact" },
    { key: "terbilang", label: "Terbilang" },
    { key: "transfer", label: "Transfer / Terms" },
    ...cfg.signatureFields.map((f) => ({ key: f.section, label: f.key })),
  ];
  const renderPanel = () => {
    list.innerHTML = sections()
      .map(
        (s) =>
          `<label class="field-item"><input type="checkbox" data-field="${s.key}" ${state.sections[s.key] !== false ? "checked" : ""}> ${s.label}</label>`,
      )
      .join("");
  };
  const bindPanel = () => {
    btn.addEventListener("click", () => {
      panel.classList.toggle("open");
      if (panel.classList.contains("open")) renderPanel();
    });
    list.addEventListener("change", (e) => {
      const key = e.target.dataset.field;
      if (key) state.sections[key] = e.target.checked;
      applyVisibility();
    });
    byId("fieldsReset").addEventListener("click", () => {
      applyLayout();
      renderPanel();
    });
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && e.target !== btn)
        panel.classList.remove("open");
    });
  };

  // ----- logo -----
  const logoPreview = byId("logoPreview");
  const logoFile = byId("logoFile");
  const applyLogo = () => (logoPreview.src = logoSelect.value);
  const pickLogo = () => logoFile.click();
  const loadLogo = () => {
    const f = logoFile.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      [...logoSelect.options]
        .filter((o) => o.dataset.custom)
        .forEach((o) => o.remove());
      const opt = new Option(f.name, reader.result, true, true);
      opt.dataset.custom = "1";
      logoSelect.add(opt);
      applyLogo();
    };
    reader.readAsDataURL(f);
    logoFile.value = "";
  };
  const bindLogo = () => {
    logoSelect.addEventListener("change", applyLogo);
    logoPreview.addEventListener("click", pickLogo);
    logoPreview.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pickLogo();
      }
    });
    logoFile.addEventListener("change", loadLogo);
  };
  Invoice.logo = {
    apply: applyLogo,
    bind: bindLogo,
    fill: () => fillSelect(logoSelect, cfg.logos, "file", cfg.defaultLogoFile),
  };

  // ----- signatures -----
  const sigContainer = byId("signatureBlocks");
  const addSignature = (values = {}) => {
    const block = document.createElement("div");
    block.className = "sig-block";
    block.innerHTML =
      cfg.signatureFields
        .map(
          (f) =>
            `<input type="text" class="editable sig-${f.key}" data-section="${f.section}">`,
        )
        .join("") +
      `<button type="button" class="btn-delete no-print">✕</button>`;
    cfg.signatureFields.forEach(
      (f) => (block.querySelector(`.sig-${f.key}`).value = values[f.key] ?? ""),
    );
    sigContainer.appendChild(block);
    applyPlaceholders();
    applyVisibility();
    return block;
  };
  const seedSignatures = () => {
    const blocks = $$(".sig-block");
    if (blocks.some((b) => b.dataset.edited)) return;
    blocks.forEach((b) => b.remove());
    layered("signatures", cfg.defaultSignatures).forEach(addSignature);
  };
  const bindSignatures = () => {
    byId("addSignature").addEventListener(
      "click",
      () => (addSignature().dataset.edited = "1"),
    );
    sigContainer.addEventListener(
      "input",
      (e) => (e.target.closest(".sig-block").dataset.edited = "1"),
    );
    sigContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-delete");
      if (btn) btn.closest(".sig-block").remove();
    });
  };
  Invoice.signatures = { seed: seedSignatures, bind: bindSignatures };

  // ----- bind all -----
  const bind = () => {
    layoutSelect.addEventListener("change", applyLayout);
    modeToggle.addEventListener("click", () => applyMode(nextMode()));
    transferInput.addEventListener("input", Invoice.fitFields);
    window.addEventListener("resize", Invoice.fitFields);
    window.addEventListener("beforeprint", Invoice.fitFields);
    bindPanel();
    bindLogo();
    bindSignatures();
  };

  Invoice.view = {
    build,
    bind,
    applyLayout,
    applyMode,
    applyPlaceholders,
    applyVisibility,
  };
  Invoice.fieldsPanel = { bind: bindPanel, render: renderPanel };
})();
