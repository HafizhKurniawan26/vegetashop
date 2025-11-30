import React from "react";

const Copyright = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`w-full py-3 bg-white border-t ${className}`}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-600">
          &copy; {currentYear} Kelompok 6 - Hafizh Kurniawan, Nurya Qiswah,
          Rendi Nanda Wibisana
        </p>
      </div>
    </footer>
  );
};

export default Copyright;
