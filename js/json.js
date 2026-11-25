// Save / Load current document as JSON.
(() => {
  const { cfg, byId, $, $$, tpl } = Invoice;

  const collect = () => {
    const data = { mode: Invoice.state.documentType, layout: Invoice.state.layout?.id };
    cfg.metaFields.forEach((f) => (data[f.key] = byId(f.key)?.value || ""));
    data.companyName = byId("companyNameInput")?.value || "";
    data.companyAddress = byId("companyAddress")?.value || "";
    data.companyContact = byId("companyContact")?.value || "";
    data.transfer = byId("transferDetails")?.value || "";
    data.rows = $$("#tableBody tr").map((tr) =>
      tr.classList.contains("category-row")
        ? { category: $(".category-input", tr).value }
        : {
            desc: $(".desc-input", tr).value,
            qty: $(".qty-input", tr).value,
            unit: $(".unit-input", tr).value,
            rate: $(".rate-input", tr).value,
            tax: $(".tax-input", tr).value,
            amount: $(".amount-input", tr).value,
          }
    );
    data.signatures = $$(".sig-block").map((b) =>
      Object.fromEntries(cfg.signatureFields.map((f) => [f.key, $(`.sig-${f.key}`, b).value]))
    );
    return data;
  };

  const fileName = (data) => {
    const name = tpl(cfg.jsonNameTemplate || "{kepada}.json", data);
    return name.replace(/[<>:"/\\|?*]/g, "").trim() || "document.json";
  };

  const save = () => {
    const data = collect();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: fileName(data) });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const apply = (data) => {
    if (data.mode && cfg.modes[data.mode]) Invoice.view.applyMode(data.mode);
    if (data.layout) {
      const sel = byId("layoutSelect");
      if ([...sel.options].some((o) => o.value === data.layout)) {
        sel.value = data.layout;
        Invoice.view.applyLayout();
      }
    }
    cfg.metaFields.forEach((f) => { const el = byId(f.key); if (el && data[f.key] != null) el.value = data[f.key]; });
    ["companyNameInput", "companyAddress", "companyContact", "transferDetails"].forEach((id) => {
      const el = byId(id);
      const key = id === "companyNameInput" ? "companyName" : id === "transferDetails" ? "transfer" : id;
      if (el && data[key] != null) el.value = data[key];
    });
    const body = byId("tableBody");
    body.innerHTML = "";
    (data.rows || []).forEach((r) => {
      if (r.category !== undefined) {
        Invoice.table.addRow(true);
        $(".category-input", body.lastElementChild).value = r.category;
      } else {
        Invoice.table.addRow();
        const tr = body.lastElementChild;
        $(".desc-input", tr).value = r.desc || "";
        $(".qty-input", tr).value = r.qty || "1";
        $(".unit-input", tr).value = r.unit || "";
        $(".rate-input", tr).value = r.rate || "";
        $(".tax-input", tr).value = r.tax || "";
        $(".amount-input", tr).value = r.amount || "";
      }
    });
    if (!data.rows?.length) Invoice.table.addRow();
    Invoice.table.calculateTotal();
    Invoice.signatures.seed();
    (data.signatures || []).forEach((s, i) => {
      const block = $$(".sig-block")[i];
      if (block) cfg.signatureFields.forEach((f) => { const el = $(`.sig-${f.key}`, block); if (el) el.value = s[f.key] || ""; });
    });
  };

  const load = () => {
    const input = Object.assign(document.createElement("input"), { type: "file", accept: ".json" });
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!cfg.jsonOverwrite && !confirm("Overwrite current document?")) return;
          apply(data);
        } catch (e) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  Invoice.json = { save, load };
})();
