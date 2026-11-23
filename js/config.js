// Core settings. Structured lists live in their own files:
//   fields.config.js (meta/signature fields) · modes.config.js (invoice/quotation) · layouts.config.js
window.InvoiceConfig = {
  locale: "id-ID",
  currency: "Rp",
  currencyWord: "Rupiah",
  filePrefix: "Invoice",
  // Flexible filename template. Placeholders: {mode} {serial} {weightVolume} {incoterms} {company} {date}
  fileNameTemplate: "{mode} - {serial} - ({weightVolume} - {incoterms})",
  // When tax is blank and qty === 1, export shows only amount (config-tunable)
  exportSimpleWhenNoTax: true,
  signatureCity: "Lembar",
  defaultCompany: "PT. ACT GLOBAL FREIGHT SERVICES",
  defaultCompanyAddress:
    "Jalan Perak Timur No. 248, Tg. Perak, Surabaya - Indonesia 60165",
  pdf: { margin: 0.5, format: "letter", scale: 2 },

  // Scalar options below can be overridden per layout (see layouts.config.js).
  //   taxMode     : "inclusive" = amount = qty × rate × (1 + tax); "exclusive" = amount = qty × rate,
  //                 tax is summarised per rate in the totals block.
  //   affixInputs : rate/amount inputs show the currency prefix, tax shows the suffix.
  //   dateFormat  : "long" (20 November 2026) | "short" (20/11/2026)
  taxMode: "inclusive",
  affixInputs: false,
  taxSuffix: "%",
  dateFormat: "long",

  // Textareas that grow with their content.
  autosizeFields: ["terbilangField", "transferDetails"],

  // Toolbar buttons. Missing key = visible; false = hidden.
  exports: { print: true, pdf: true, doc: true, xlsx: false },

  // Content visibility (global). Missing key = visible; false = hidden.
  // Hideable keys are the [data-section] values in index.html, meta field keys and signature fields.
  // "items" and "total" are protected (not hideable); unknown keys are ignored with a console warning.
  // Precedence: global < layout < mode < layout's entry for that mode.
  sections: {
    logo: true,
    companyName: true,
    companyAddress: false,
    companyContact: false,
    title: true,
    perihal: true,
    tanggal: true,
    kepada: true,
    attn: false,
    email: false,
    jatuhTempo: true,
    berlakuHingga: true,
    rateRef: false,
    salesExec: false,
    serviceType: false,
    portLoading: false,
    portDischarge: false,
    commodity: false,
    terbilang: true,
    transfer: true,
    signatureDate: true,
    signatureParty: false,
    signatureName: true,
    signatureRole: false,
  },

  // Base labels. Meta row labels use `meta_<key>`, group headings use `group_<group>`.
  labels: {
    title: "INVOICE",
    no: "NO",
    description: "KETERANGAN",
    amount: "JUMLAH (Rp)",
    qty: "QTY",
    unit: "UNIT",
    rate: "RATE",
    tax: "TAX",
    total: "TOTAL:",
    subtotal: "Subtotal:",
    taxLine: "PPN {pct}%:",
    terbilang: "Terbilang :",
    lock: "Kunci Edit",
    transfer: "Please Transfer details :",
    addRow: "+ Add Row",
    logoPick: "Klik untuk memilih logo dari komputer",
    group_shipment: "",
    meta_perihal: "Perihal",
    meta_tanggal: "Tanggal",
    meta_kepada: "Kepada Yth",
    meta_attn: "Attn",
    meta_email: "Email",
    meta_jatuhTempo: "Jatuh Tempo",
    meta_berlakuHingga: "Berlaku Hingga",
    meta_rateRef: "Rate Ref.",
    meta_salesExec: "Sales Executive",
    meta_serial: "No.",
    meta_serviceType: "Service Type",
    meta_incoterms: "Incoterms",
    meta_portLoading: "Port of Loading",
    meta_portDischarge: "Port of Discharge",
    meta_commodity: "Commodity",
    meta_weightVolume: "Weight / Volume",
  },

  // Placeholder text. {city} and {date} are filled in where used.
  placeholders: {
    company: "CV. atau PT. Nama",
    companyAddress: "Alamat perusahaan",
    companyContact: "Phone: ... | Email: ...",
    item: "Isi keterangan item...",
    category: "FREIGHT CHARGES",
    qty: "1",
    unit: "Cntr.",
    rate: "0",
    tax: "%",
    transfer: "Masukkan detail instruksi transfer bank di sini...",
    signatureLead: "{city}, {date}",
    signatureParty: "Nama Perusahaan",
    signatureName: "( Nama Jelas & Tanda Tangan )",
    signatureRole: "Jabatan",
  },

  monthNames: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],

  logos: [
    { file: "img/L1.webp", name: "Logo 1" },
    { file: "img/L2.webp", name: "Logo 2" },
    { file: "img/L3.webp", name: "Logo 3" },
    { file: "img/L4.webp", name: "Logo 4" },
  ],
  defaultLogoFile: "img/L1.webp",
  defaultDocumentType: "quotation",
};
