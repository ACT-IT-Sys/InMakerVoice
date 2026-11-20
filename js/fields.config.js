// Field registry: meta rows (grouped), company lines, signature fields, and which element gets which placeholder.
Object.assign(window.InvoiceConfig, {
  // Meta rows are rendered group by group, in this order. Group heading label key = `group_<group>`.
  metaGroups: ["info", "customer", "serial", "shipment"],
  // Omitted placeholder = today's date. Which rows actually show is decided by `sections`.
  metaFields: [
    { key: "perihal", group: "info", placeholder: "Contoh: Tagihan Ocean" },
    { key: "tanggal", group: "info" },
    { key: "jatuhTempo", group: "info", placeholder: "Contoh: 14 hari setelah invoice" },
    { key: "berlakuHingga", group: "info", placeholder: "Contoh: 30 hari sejak tanggal penawaran" },
    { key: "rateRef", group: "info", placeholder: "DW00001" },
    { key: "salesExec", group: "info", placeholder: "Contoh: Dino Widiono" },
    { key: "kepada", group: "customer", placeholder: "Contoh: INDOREX di Tempat" },
    { key: "attn", group: "customer", placeholder: "Contoh: Bu Silvy" },
    { key: "email", group: "customer", placeholder: "nama@perusahaan.co.id" },
    { key: "serial", group: "serial", placeholder: "QT-2026-DW00001" },
    { key: "serviceType", group: "shipment", placeholder: "FCL Import" },
    { key: "incoterms", group: "shipment", placeholder: "FOB Tianjin" },
    { key: "portLoading", group: "shipment", placeholder: "Xingang, Tianjin, China (CNTXG)" },
    { key: "portDischarge", group: "shipment", placeholder: "Tanjung Perak, Surabaya, Indonesia (IDSUB)" },
    { key: "commodity", group: "shipment", placeholder: "general commodity" },
    { key: "weightVolume", group: "shipment", placeholder: "1x40HC" },
  ],

  // Input ids printed under the company name (each is also a hideable section).
  companyLines: ["companyAddress", "companyContact"],

  // One signature block = these fields, in this order (class `sig-<key>`, section key, placeholder key).
  signatureFields: [
    { key: "date", section: "signatureDate", placeholder: "signatureLead" },
    { key: "party", section: "signatureParty", placeholder: "signatureParty" },
    { key: "name", section: "signatureName", placeholder: "signatureName" },
    { key: "role", section: "signatureRole", placeholder: "signatureRole" },
  ],
  // Blocks created on load / when the layout or mode changes (until the user edits a block).
  defaultSignatures: [{}],

  // selector -> placeholders key; keeps every placeholder in config instead of markup.
  placeholderTargets: {
    "#companyNameInput": "company",
    "#companyAddress": "companyAddress",
    "#companyContact": "companyContact",
    "#transferDetails": "transfer",
    ".desc-input": "item",
    ".category-input": "category",
    ".qty-input": "qty",
    ".unit-input": "unit",
    ".rate-input": "rate",
    ".tax-input": "tax",
  },
});
