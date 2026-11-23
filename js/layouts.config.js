// Layout registry. Adding a layout = one entry here + one css/layouts/<id>.css file (+ <link> in index.html).
//   skin      : table skin (classic | band | boxed | minimal | editorial | ledger)
//   docOrder  : optional .doc zone order (falls back to the global docOrder)
//   sections / labels / placeholders / signatures : optional overrides for this layout
//   modes     : same keys, applied only in that document mode (highest precedence)
//   taxMode, affixInputs, dateFormat : scalar overrides of the global options in config.js
//   precedence: global < layout < mode < layout's entry for that mode
Object.assign(window.InvoiceConfig, {
  defaultLayoutId: "modern-plus",
  docOrder: [
    "brand",
    "title",
    "meta",
    "items",
    "total",
    "terbilang",
    "transfer",
    "signature",
  ],
  layouts: [
    {
      id: "modern-plus",
      name: "Modern+",
      skin: "ledger",
      taxMode: "exclusive",
      affixInputs: true,
      dateFormat: "short",
      sections: {
        terbilang: false,
        companyAddress: true,
        companyContact: true,
        attn: true,
        email: true,
        rateRef: true,
        salesExec: true,
        serviceType: true,
        portLoading: true,
        portDischarge: true,
        commodity: true,
        signatureParty: true,
        signatureRole: true,
      },
      placeholders: { qty: "-", unit: "-", rate: "-", tax: "-" },
      modes: {
        quotation: {
          sections: { perihal: false, logo: false },
          labels: {
            title: "SALES QUOTATION",
            description: "CHARGE DESCRIPTION",
            rate: "RATE (IDR)",
            amount: "AMOUNT (IDR)",
            total: "Grand Total:",
            transfer: "TERMS & CONDITIONS",
            group_shipment: "SHIPMENT DETAILS",
            meta_kepada: "TO (CUSTOMER):",
            meta_tanggal: "Quotation Date",
            meta_berlakuHingga: "Validity Until",
          },
          default: {
            company: "PT. ACT GLOBAL FREIGHT SERVICES",
            companyAddress:
              "Jalan Perak Timur No. 248, Tg. Perak, Surabaya - Indonesia 60165",
          },
          placeholders: {
            signatureLead: "Sincerely Yours,",
            transfer:
              "1. Rates quoted are in Indonesian Rupiah (IDR) and valid until the specified date above.\n2. Rates exclude Demurrage, Detention, Storage and Customs Inspection.",
          },
          signatures: [
            { date: "Sincerely Yours," },
            {
              date: "Accepted & Confirmed By,",
              role: "Authorized Signature & Stamp",
            },
          ],
        },
      },
    },
    { id: "standard", name: "Standard Classic", skin: "classic" },
    { id: "fit-two-bar", name: "Fit Two Bar", skin: "band" },
    {
      id: "modern-corporate",
      name: "Modern Corporate",
      skin: "minimal",
      docOrder: [
        "title",
        "brand",
        "meta",
        "items",
        "total",
        "terbilang",
        "signature",
        "transfer",
      ],
    },
    { id: "bold-border", name: "Bold Border", skin: "boxed" },
    { id: "compact-clean", name: "Compact Clean", skin: "classic" },
    { id: "elegant-serif", name: "Elegant Serif", skin: "editorial" },
  ],
});
