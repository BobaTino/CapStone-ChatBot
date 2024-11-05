import React from "react";
import "./PdfView.scss";

const PdfView: React.FC = () => {
  return (
    <div className="pdf-viewer">
      <div className="pdf-title">Sample PDF Title</div>
      <div className="pdf-header">This is the header of the PDF</div>
      <div className="pdf-body">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae
        purus nec ipsum elementum interdum. Donec sit amet felis quis leo
        imperdiet varius. Integer fringilla velit non orci tincidunt, nec
        vulputate eros facilisis.
      </div>
      <div className="pdf-footer">© 2024 Company Name - All Rights Reserved</div>
      <button className="pdf-button">Download PDF</button>
    </div>
  );
};

export default PdfView;
