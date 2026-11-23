// Fields visibility panel. Generates checkboxes from known sections; Rate+Tax lives here.
(() => {
  const { cfg, $$, byId, state } = Invoice;
  const panel = byId("fieldsPanel");
  const list = byId("fieldsList");
  const btn = byId("fieldsBtn");

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

  const render = () => {
    list.innerHTML = sections()
      .map(
        (s) =>
          `<label class="field-item"><input type="checkbox" data-field="${s.key}" ${state.sections[s.key] !== false ? "checked" : ""}> ${s.label}</label>`,
      )
      .join("");
  };

  const bind = () => {
    btn.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) render();
    });
    list.addEventListener("change", (e) => {
      const key = e.target.dataset.field;
      if (key) state.sections[key] = e.target.checked;
      Invoice.view.applyVisibility();
    });
    byId("fieldsReset").addEventListener("click", () => {
      Invoice.view.applyLayout();
      render();
    });
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && e.target !== btn) panel.hidden = true;
    });
  };

  Invoice.fieldsPanel = { bind, render };
})();
