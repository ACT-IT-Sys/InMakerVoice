// Logo picker: preset list plus any image from disk (click the logo).
(() => {
  const { cfg, byId } = Invoice;
  const select = byId("logoSelect");
  const preview = byId("logoPreview");
  const file = byId("logoFile");

  const apply = () => (preview.src = select.value);
  const pick = () => file.click();
  const load = () => {
    const f = file.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      [...select.options].filter((o) => o.dataset.custom).forEach((o) => o.remove());
      const opt = new Option(f.name, reader.result, true, true);
      opt.dataset.custom = "1";
      select.add(opt);
      apply();
    };
    reader.readAsDataURL(f);
    file.value = "";
  };

  const bind = () => {
    select.addEventListener("change", apply);
    preview.addEventListener("click", pick);
    preview.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    });
    file.addEventListener("change", load);
  };

  Invoice.logo = { apply, bind, fill: () => Invoice.fillSelect(select, cfg.logos, "file", cfg.defaultLogoFile) };
})();
