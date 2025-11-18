"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Truck,
  Shield,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import globalApi from "@/_utils/globalApi";
import { toast } from "sonner";
import Header from "@/_components/Header";
import Image from "next/image";

export default function CheckoutPage() {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    postal_code: "",
    notes: "",
  });
  const [customerPhone, setCustomerPhone] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    const userData = sessionStorage.getItem("user");
    if (token) setJwt(token);
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setCustomerPhone(userObj.phone || "");

      // Set default address jika ada
      if (userObj.address) {
        setShippingAddress((prev) => ({
          ...prev,
          address: userObj.address,
        }));
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  // Query untuk cart items - Strapi v5 structure (tanpa attributes)
  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const response = await globalApi.getUserCart(jwt, user?.id);
      return response;
    },
    enabled: !!jwt && !!user,
  });

  const cartItems = cartData?.data || [];

  // Mutation untuk checkout
  const checkoutMutation = useMutation({
    mutationFn: async (checkoutData) => {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Checkout failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Redirect ke halaman pembayaran Midtrans
      window.location.href = data.redirect_url;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Calculate totals - Strapi v5 structure (tanpa attributes)
  const totalPrice = cartItems.reduce((total, item) => {
    const product = item.product;
    const price = parseFloat(product?.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + quantity * price;
  }, 0);

  const totalItems = cartItems.reduce((total, item) => {
    return total + (parseInt(item.quantity) || 0);
  }, 0);

  const shippingCost = totalPrice > 50000 ? 0 : 15000;
  const grandTotal = totalPrice + shippingCost;

  // Cek apakah ada item yang stoknya habis - Strapi v5 structure (tanpa attributes)
  const hasOutOfStockItems = cartItems.some((item) => {
    const product = item.product;
    const quantity = parseInt(item.quantity) || 0;
    return (product?.stock || 0) < quantity;
  });

  const handleCheckout = async () => {
    if (
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postal_code
    ) {
      toast.error("Harap lengkapi alamat pengiriman");
      return;
    }

    if (!customerPhone) {
      toast.error("Harap masukkan nomor telepon");
      return;
    }

    const orderId = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const items = cartItems.map((item) => {
      const product = item.product;
      const quantity = parseInt(item.quantity) || 0;

      // Gunakan documentId sebagai ID produk
      return {
        id: product.documentId, // Gunakan documentId bukan id
        name: product.name,
        price: product.price,
        quantity: quantity,
        category: product.categories[0]?.name,
      };
    });

    // Tambah shipping cost sebagai item terpisah
    if (shippingCost > 0) {
      items.push({
        id: "shipping",
        name: "Biaya Pengiriman",
        price: shippingCost,
        quantity: 1,
        category: "shipping",
      });
    }

    const customerDetails = {
      first_name:
        user?.username?.split(" ")[0] ||
        user?.email?.split("@")[0] ||
        "Customer",
      last_name: user?.username?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
      phone: customerPhone,
      billing_address: {
        first_name:
          user?.username?.split(" ")[0] ||
          user?.email?.split("@")[0] ||
          "Customer",
        last_name: user?.username?.split(" ").slice(1).join(" ") || "",
        email: user?.email || "",
        phone: customerPhone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postal_code: shippingAddress.postal_code,
        country_code: "IDN",
      },
      shipping_address: {
        first_name:
          user?.username?.split(" ")[0] ||
          user?.email?.split("@")[0] ||
          "Customer",
        last_name: user?.username?.split(" ").slice(1).join(" ") || "",
        email: user?.email || "",
        phone: customerPhone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postal_code: shippingAddress.postal_code,
        country_code: "IDN",
        notes: shippingAddress.notes,
      },
    };

    checkoutMutation.mutate({
      orderId,
      grossAmount: grandTotal,
      items,
      customerDetails,
      userId: user.id,
      jwt,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat Lengkap *</Label>
                    <Textarea
                      id="address"
                      placeholder="Jl. Contoh No. 123"
                      value={shippingAddress.address}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota *</Label>
                    <Input
                      id="city"
                      placeholder="Jakarta"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Kode Pos *</Label>
                    <Input
                      id="postal_code"
                      placeholder="12345"
                      value={shippingAddress.postal_code}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          postal_code: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      placeholder="081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Input
                    id="notes"
                    placeholder="Contoh: Tinggal di belakang rumah biru"
                    value={shippingAddress.notes}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Informasi Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama</Label>
                    <Input value={user?.username || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-white rounded border flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        Midtrans Payment Gateway
                      </p>
                      <p className="text-sm text-green-600">
                        Bank Transfer, E-wallet, Kartu Kredit, dan lainnya
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Warning untuk out of stock items */}
                {hasOutOfStockItems && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm font-medium">
                        Beberapa produk stok tidak mencukupi. Harap perbarui
                        keranjang Anda.
                      </p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item, index) => {
                    const product = item.product;
                    const quantity = parseInt(item.quantity) || 0;
                    const isOutOfStock = (product?.stock || 0) < quantity;
                    console.log("item: ", item);

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 pb-3 border-b ${
                          isOutOfStock ? "opacity-50" : ""
                        }`}
                      >
                        <div className="w-12 h-12  rounded-lg flex items-center justify-center">
                          <Image
                            src={`${
                              process.env.NEXT_PUBLIC_STRAPI_API_URL +
                                product.images?.[0]?.url || ""
                            }`}
                            width={45}
                            height={45}
                            alt={product?.name}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">
                            {product?.name}
                            {isOutOfStock && (
                              <Badge
                                variant="destructive"
                                className="ml-2 text-xs"
                              >
                                Stok Tidak Cukup
                              </Badge>
                            )}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {quantity} x Rp{" "}
                            {product?.price?.toLocaleString("id-ID")}
                          </p>
                          <p className="text-xs text-gray-500">
                            Stok tersedia: {product?.stock || 0}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">
                          Rp{" "}
                          {((product?.price || 0) * quantity).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengiriman</span>
                    <span>
                      {shippingCost === 0 ? (
                        <Badge variant="outline" className="text-green-600">
                          Gratis
                        </Badge>
                      ) : (
                        `Rp ${shippingCost.toLocaleString("id-ID")}`
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-green-600">
                        Rp {grandTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {shippingCost === 0
                        ? "Gratis Ongkir"
                        : "Gratis ongkir untuk order > Rp 50.000"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Garansi kesegaran 100%
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold shadow-lg"
                  onClick={handleCheckout}
                  disabled={
                    checkoutMutation.isPending ||
                    cartItems.length === 0 ||
                    hasOutOfStockItems ||
                    !shippingAddress.address ||
                    !shippingAddress.city ||
                    !shippingAddress.postal_code ||
                    !customerPhone
                  }
                >
                  {checkoutMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Lanjutkan Pembayaran
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
