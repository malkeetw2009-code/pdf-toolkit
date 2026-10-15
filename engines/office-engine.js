// engines/office-engine.js (Office Conversion Notice)
export default {
  name: "Office Conversion Engine",
  version: "1.0.0",
  tools: ["pdf-to-word", "word-to-pdf", "pdf-to-excel", "excel-to-pdf", "pdf-to-ppt", "ppt-to-pdf"],
  async process({ toolId }) {
    throw new Error(`टूल '${toolId}' के लिए उच्च-सटीकता रूपांतरण हेतु सर्वर-साइड LibreOffice प्रोसेसिंग इंजन आवश्यक है। GitHub Pages केवल स्टैटिक होस्टिंग प्रदान करता है।`);
  }
};
