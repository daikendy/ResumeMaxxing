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
    
    #printable-resume-mount {
      display: flex !important;
      flex-direction: column !important;
      visibility: visible !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      background: white !important;
      border: none !important;
      box-shadow: none !important;
      transform: none !important;
      z-index: 999999 !important;
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
      margin-top: -10mm !important;
    }

    /* Neutralize all scaling and positioning for print */
    div[style*="transform"], .print-path {
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
    }
  }
`;
