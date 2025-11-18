import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  ArrowLeft,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";

const OrderDetailView = ({ order, getStatusBadge, onBack }) => {
  const parseJSONField = (field) => {
    try {
      if (!field) return null;

      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          return parsed;
        } catch (e) {
          return field;
        }
      }

      if (typeof field === "object") {
        return field;
      }

      return null;
    } catch (error) {
      console.error("Error parsing JSON field:", error);
      return null;
    }
  };

  const statusBadge = getStatusBadge(order.order_status);
  const shippingAddress = parseJSONField(order.shipping_address);
  const items = parseJSONField(order.items);

  // Fungsi untuk membuat tabel manual
  const addTableToPDF = (doc, items, startY) => {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const tableWidth = pageWidth - margin * 2;

    // Column widths
    const col1 = tableWidth * 0.45; // Produk
    const col2 = tableWidth * 0.15; // Qty
    const col3 = tableWidth * 0.2; // Harga
    const col4 = tableWidth * 0.2; // Subtotal

    let currentY = startY;

    // Table header
    doc.setFillColor(66, 139, 202);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");

    doc.rect(margin, currentY, tableWidth, 10, "F");
    doc.text("Produk", margin + 5, currentY + 7);
    doc.text("Qty", margin + col1 + 5, currentY + 7);
    doc.text("Harga", margin + col1 + col2 + 5, currentY + 7);
    doc.text("Subtotal", margin + col1 + col2 + col3 + 5, currentY + 7);

    currentY += 12;

    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");

    if (Array.isArray(items) && items.length > 0) {
      items.forEach((item, index) => {
        // Check if we need a new page
        if (currentY > doc.internal.pageSize.height - 50) {
          doc.addPage();
          currentY = 20;
        }

        const itemName = item.name || `Item ${index + 1}`;
        const quantity = item.quantity || 1;
        const price = parseFloat(item.price || 0);
        const subtotal = price * quantity;

        // Wrap long product names
        const lines = doc.splitTextToSize(itemName, col1 - 10);

        lines.forEach((line, lineIndex) => {
          if (lineIndex === 0) {
            doc.text(line, margin + 5, currentY + 7);
            doc.text(quantity.toString(), margin + col1 + 5, currentY + 7);
            doc.text(
              `Rp ${price.toLocaleString("id-ID")}`,
              margin + col1 + col2 + 5,
              currentY + 7
            );
            doc.text(
              `Rp ${subtotal.toLocaleString("id-ID")}`,
              margin + col1 + col2 + col3 + 5,
              currentY + 7
            );
          } else {
            doc.text(line, margin + 5, currentY + 7);
          }
          currentY += 6;
        });

        // Add some space between rows
        currentY += 4;

        // Add horizontal line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, margin + tableWidth, currentY);
        currentY += 8;
      });
    } else {
      doc.text("Tidak ada items", margin + 5, currentY + 7);
      currentY += 15;
    }

    return currentY;
  };

  // Fungsi utama untuk download PDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: `Invoice - ${order.order_id}`,
        subject: "Order Invoice",
        author: "VegetaShop - Toko Online",
      });

      // Add header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("INVOICE", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("VegetaShop - Toko Online", 105, 28, { align: "center" });
      doc.text("Jl. Raya Puspitek, Kota Tangerang Selatan", 105, 34, {
        align: "center",
      });

      // Add order information
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);

      let yPosition = 50;

      // Order Info Left Column
      doc.setFont(undefined, "bold");
      doc.text("INFORMASI ORDER", 20, yPosition);
      doc.setFont(undefined, "normal");
      doc.text(`Order ID: ${order.order_id}`, 20, yPosition + 7);
      doc.text(
        `Tanggal: ${new Date(order.createdAt).toLocaleDateString("id-ID")}`,
        20,
        yPosition + 14
      );
      doc.text(`Status: ${statusBadge.label}`, 20, yPosition + 21);

      // Customer Info Right Column
      doc.setFont(undefined, "bold");
      doc.text("INFORMASI CUSTOMER", 105, yPosition);
      doc.setFont(undefined, "normal");
      doc.text(`Nama: ${order.customer_name}`, 105, yPosition + 7);
      doc.text(`Email: ${order.customer_email}`, 105, yPosition + 14);
      if (order.customer_phone) {
        doc.text(`Telepon: ${order.customer_phone}`, 105, yPosition + 21);
        yPosition += 7;
      }

      yPosition += 28;

      // Add items table
      doc.setFont(undefined, "bold");
      doc.text("ITEMS PESANAN", 20, yPosition);
      yPosition += 8;

      const finalY = addTableToPDF(doc, items, yPosition);

      // Add total amount
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(
        `TOTAL: Rp ${parseFloat(order.total_amount || 0).toLocaleString(
          "id-ID"
        )}`,
        180,
        finalY + 10,
        { align: "right" }
      );

      // Add footer
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Terima kasih telah berbelanja di toko kami. Invoice ini sah dan dapat digunakan sebagai bukti pembayaran.",
        105,
        finalY + 25,
        { align: "center", maxWidth: 170 }
      );

      // Save the PDF
      doc.save(`invoice-${order.order_id}.pdf`);
      toast.success("PDF berhasil diunduh!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengunduh PDF");
    }
  };

  // Helper function untuk render alamat
  const renderShippingAddress = () => {
    if (!shippingAddress && !order.shipping_address) {
      return (
        <div className="space-y-2">
          <p className="text-gray-500">Alamat Pengiriman</p>
          <p className="text-gray-500 italic">
            Informasi alamat tidak tersedia. Customer mungkin menggunakan pickup
            langsung.
          </p>
        </div>
      );
    }

    if (typeof shippingAddress === "string") {
      return (
        <div className="space-y-2">
          <p className="text-gray-500">Alamat Pengiriman</p>
          <p className="font-medium">{shippingAddress}</p>
        </div>
      );
    }

    if (typeof shippingAddress === "object" && shippingAddress !== null) {
      const addressFields = [
        { key: "nama", label: "Nama Penerima", value: shippingAddress.nama },
        { key: "name", label: "Nama Penerima", value: shippingAddress.name },
        {
          key: "recipient_name",
          label: "Nama Penerima",
          value: shippingAddress.recipient_name,
        },
        {
          key: "alamat",
          label: "Alamat Lengkap",
          value: shippingAddress.alamat,
        },
        {
          key: "address",
          label: "Alamat Lengkap",
          value: shippingAddress.address,
        },
        {
          key: "street",
          label: "Alamat Lengkap",
          value: shippingAddress.street,
        },
        { key: "kota", label: "Kota", value: shippingAddress.kota },
        { key: "city", label: "Kota", value: shippingAddress.city },
        {
          key: "kecamatan",
          label: "Kecamatan",
          value: shippingAddress.kecamatan,
        },
        { key: "provinsi", label: "Provinsi", value: shippingAddress.provinsi },
        { key: "province", label: "Provinsi", value: shippingAddress.province },
        { key: "state", label: "Provinsi", value: shippingAddress.state },
        { key: "kode_pos", label: "Kode Pos", value: shippingAddress.kode_pos },
        {
          key: "postal_code",
          label: "Kode Pos",
          value: shippingAddress.postal_code,
        },
        { key: "zip_code", label: "Kode Pos", value: shippingAddress.zip_code },
        { key: "telepon", label: "Telepon", value: shippingAddress.telepon },
        { key: "phone", label: "Telepon", value: shippingAddress.phone },
      ];

      const validFields = addressFields.filter((field) => field.value);

      if (validFields.length === 0) {
        return (
          <div className="space-y-2">
            <p className="text-gray-500">Alamat Pengiriman</p>
            <p className="text-gray-500 italic">
              Format alamat tidak dikenali.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-3">
          <p className="text-gray-500 font-medium">Alamat Pengiriman</p>
          {validFields.map((field, index) => (
            <div key={index}>
              <p className="text-sm text-gray-500">{field.label}</p>
              <p className="font-medium">{field.value}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-gray-500">Alamat Pengiriman</p>
        <p className="text-gray-500 italic">Format alamat tidak dikenali</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Informasi Utama */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Ringkasan Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{order.order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant="outline" className={statusBadge.color}>
                    {statusBadge.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Order</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-green-600 text-lg">
                    Rp{" "}
                    {parseFloat(order.total_amount || 0).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>
              {order.midtrans_transaction_id && (
                <div>
                  <p className="text-sm text-gray-500">
                    Midtrans Transaction ID
                  </p>
                  <p className="font-medium">{order.midtrans_transaction_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Items Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(items) && items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.name || `Item ${index + 1}`}
                        </p>
                        {item.category && (
                          <p className="text-sm text-gray-500">
                            {item.category}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          Rp{" "}
                          {parseFloat(item.price || 0).toLocaleString("id-ID")}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity || 1}
                        </p>
                        <p className="font-semibold text-green-600">
                          Rp{" "}
                          {parseFloat(
                            (item.price || 0) * (item.quantity || 1)
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Tidak ada items</p>
                  </div>
                )}

                {/* Total Summary */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-green-600">
                      Rp{" "}
                      {parseFloat(order.total_amount || 0).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan - Informasi Tambahan */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-blue-600" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">
                    {order.customer_email}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{order.customer_email}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{order.customer_phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-green-600" />
                Alamat Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent>{renderShippingAddress()}</CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-purple-600" />
                Informasi Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Metode Pembayaran</p>
                <p className="font-medium">Midtrans</p>
              </div>
              {order.midtrans_transaction_id && (
                <div>
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-medium">{order.midtrans_transaction_id}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Status Pembayaran</p>
                <Badge variant="outline" className={statusBadge.color}>
                  {statusBadge.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailView;
