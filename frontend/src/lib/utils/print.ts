/**
 * 🛡️ Print Architecture Utility
 * Generates dynamic CSS for high-fidelity resume export.
 * Handles @page sizing, margin snap, and zoom neutralization.
 */
export const generatePrintStyles = (pageSize: string) => `
  @media print {
    @page {
      size: ${pageSize === 'A4' ? 'A4' : 'letter'} portrait;
      margin: 0 !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      height: 100% !important;
    }

    /* Hide all UI elements but preserve layout flow for centering */
    body * {
      visibility: hidden !important;
    }

    #printable-resume-mount,
    #printable-resume-mount * {
      visibility: visible !important;
    }

    /* Snap the resume to the top using Fixed positioning to bypass ghost spacing */
    #printable-resume-mount {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: white !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      z-index: 9999999 !important;
    }

    #printable-resume-mount.size-a4 {
      width: 210mm !important;
      height: 297mm !important;
      padding: 0mm 10mm 10mm 10mm !important;
    }

    #printable-resume-mount.size-letter {
      width: 215.9mm !important;
      height: 279.4mm !important;
      padding: 0mm 10mm 10mm 10mm !important;
    }

    #resume-export-target {
      margin-top: -35mm !important; /* Ultimate snap for absolute edge precision */
      position: relative !important;
      z-index: 10 !important;
    }

    /* Neutralize scaling but preserve identity */
    div[style*="transform"].print-path {
      transform: none !important;
    }
  }
  }
`;
