"use client";
import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Truck,
  Heart,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  <span className="text-green-400">VEGETA</span>SHOP
                </h3>
                <p className="text-green-200 text-sm">Fresh Groceries</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Menyediakan sayuran dan buah-buahan segar berkualitas premium
              langsung dari petani terpercaya. Segar, sehat, dan terjangkau
              untuk keluarga Indonesia.
            </p>

            {/* Social Media */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg bg-gray-800 border-gray-700 hover:bg-green-600 hover:border-green-600"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg bg-gray-800 border-gray-700 hover:bg-blue-400 hover:border-blue-400"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg bg-gray-800 border-gray-700 hover:bg-pink-600 hover:border-pink-600"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg bg-gray-800 border-gray-700 hover:bg-red-500 hover:border-red-500"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">Kategori</h4>
            <div className="space-y-2">
              <Link
                href="/category/sayuran"
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors duration-200 py-1"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Sayuran Segar
              </Link>
              <Link
                href="/category/buah"
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors duration-200 py-1"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Buah-buahan
              </Link>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">
              Kontak & Newsletter
            </h4>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-4 h-4 text-green-400" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-4 h-4 text-green-400" />
                <span>vegetashop@email.com</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-4 h-4 text-green-400 mt-1" />
                <span>
                  Jl. Sayuran Segar No. 123
                  <br />
                  Jakarta, Indonesia
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Buka 24/7</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                Berlangganan newsletter untuk promo spesial:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Email Anda"
                  className="bg-gray-800 border-gray-700 text-white rounded-lg focus:border-green-500"
                />
                <Button className="bg-green-600 hover:bg-green-700 rounded-lg">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h5 className="font-semibold text-green-300">Gratis Ongkir</h5>
              <p className="text-gray-400 text-sm">Min. belanja Rp 50.000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h5 className="font-semibold text-green-300">Garansi Segar</h5>
              <p className="text-gray-400 text-sm">Uang kembali 100%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h5 className="font-semibold text-green-300">Pembayaran Aman</h5>
              <p className="text-gray-400 text-sm">Berbagai metode</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h5 className="font-semibold text-green-300">Pengiriman Cepat</h5>
              <p className="text-gray-400 text-sm">1-2 jam sampai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <span>
                &copy; 2025 Kelompok 6 - Hafizh Kurniawan, Nurya Qiswah, Rendi
                Nanda Wibisana
              </span>
              <Badge
                variant="outline"
                className="bg-green-900/30 text-green-300 border-green-800 text-xs"
              >
                v1.0.0
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for fresh groceries</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
