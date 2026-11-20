// Signature blocks. Field set comes from config.signatureFields; defaults can differ per layout/mode.
(() => {
  const { cfg, $, $$, byId, layered } = Invoice;
  const container = byId("signatureBlocks");

  const addSignature = (values = {}) => {
    const block = document.createElement("div");
    block.className = "sig-block";
    block.innerHTML =
      cfg.signatureFields.map((f) => `<input type="text" class="editable sig-${f.key}" data-section="${f.section}">`).join("") +
      `<button type="button" class="btn-delete no-print">✕</button>`;
    cfg.signatureFields.forEach((f) => ($(`.sig-${f.key}`, block).value = values[f.key] ?? ""));
    container.appendChild(block);
    Invoice.view.applyPlaceholders();
    Invoice.view.applyVisibility();
    return block;
  };

  // Rebuild the default blocks for the active layout/mode, unless the user has touched any block.
  const seed = () => {
    const blocks = $$(".sig-block");
    if (blocks.some((b) => b.dataset.edited)) return;
    blocks.forEach((b) => b.remove());
    layered("signatures", cfg.defaultSignatures).forEach(addSignature);
  };

  const bind = () => {
    byId("addSignature").addEventListener("click", () => (addSignature().dataset.edited = "1"));
    container.addEventListener("input", (e) => (e.target.closest(".sig-block").dataset.edited = "1"));
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-delete");
      if (btn) btn.closest(".sig-block").remove();
    });
  };

  Invoice.signatures = { seed, bind };
})();
