"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, Phone } from "lucide-react";
import Header from "@/_components/Header";
import Link from "next/link";

export default function OrderErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 border-2">
            <CardContent className="p-8">
              {/* Error Icon */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-red-50 rounded-full p-4 mb-4">
                  <AlertTriangle className="w-16 h-16 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Terjadi Kesalahan
                </h1>
                <p className="text-red-800 mb-6">
                  Maaf, terjadi kesalahan saat memproses pesanan Anda. Silakan
                  coba lagi atau hubungi customer service kami.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Apa yang bisa Anda lakukan?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Periksa koneksi internet Anda</li>
                  <li>Coba refresh halaman ini</li>
                  <li>Periksa halaman "Pesanan Saya" untuk status pesanan</li>
                  <li>Hubungi customer service jika masalah berlanjut</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  Refresh Halaman
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  asChild
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Kembali ke Beranda
                  </Link>
                </Button>
              </div>

              {/* Customer Service */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Butuh bantuan? Hubungi kami:
                </p>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">+62 123-4567-890</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
