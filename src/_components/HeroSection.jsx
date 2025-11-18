import React from "react";
import { Truck, Shield, Star } from "lucide-react";

const HeroSection = () => (
  <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl overflow-hidden mb-12">
    <div className="absolute inset-0 bg-black/10"></div>
    <div className="relative px-8 py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Fresh Groceries
        <br />
        <span className="text-green-200">Delivered to Your Door</span>
      </h1>
      <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
        Temukan sayuran dan buah-buahan segar berkualitas premium dengan harga
        terbaik
      </p>
      <div className="flex items-center justify-center gap-4 text-green-100">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          <span>Gratis Ongkir</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span>Garansi Segar</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          <span>Kualitas Premium</span>
        </div>
      </div>
    </div>
  </div>
);

export default HeroSection;
