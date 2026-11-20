// Entry point: build, first render, event wiring. Logic lives in the modules it calls.
(() => {
  const { byId, $$, exporters, view, table, signatures, logo } = Invoice;
  const logoSelect = byId("logoSelect");
  const layoutSelect = byId("layoutSelect");

  view.build();
  table.addRow();
  logo.apply();
  view.applyLayout();
  view.applyMode();

  table.bind();
  signatures.bind();
  logo.bind();
  view.bind();

  byId("randomizeBtn").addEventListener("click", () => {
    [logoSelect, layoutSelect].forEach((s) => (s.selectedIndex = Math.floor(Math.random() * s.options.length)));
    logo.apply();
    view.applyLayout();
  });
  $$("[data-export]").forEach((btn) => btn.addEventListener("click", exporters[btn.dataset.export]));
})();
