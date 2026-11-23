// Modern+ layout configuration.
// Owns: sections, labels, placeholders, taxMode, dateFormat, signatures, and mode-specific defaults.
// Override precedence remains: global < layout < mode < layout's mode entry.
Object.assign((window.InvoiceConfig.layouts ??= []), {
  // placeholder so the file can be loaded independently
});

window.InvoiceLayouts = window.InvoiceLayouts || {};
window.InvoiceLayouts["modern-plus"] = {
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
        title: "QUOTATION",
        description: "CHARGE DESCRIPTION",
        rate: "RATE (USD)",
        amount: "AMOUNT (USD)",
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
          "1. Rates quoted are in Indonesian Rupiah (USD) and valid until the specified date above.\n2. Rates exclude Demurrage, Detention, Storage and Customs Inspection.",
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
};
