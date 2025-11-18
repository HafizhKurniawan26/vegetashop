import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Badge,
  Calendar,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";

// Component untuk Order Card
export default function OrderCard({
  order,
  getStatusVariant,
  getStatusIcon,
  formatDate,
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate total items
  const totalItems =
    order.items
      ?.filter((item) => item.category !== "shipping")
      ?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Order Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{order.order_id}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant={getStatusVariant(order.order_status)}
              className="flex items-center gap-1"
            >
              {getStatusIcon(order.order_status)}
              {order.order_status.toUpperCase()}
            </Badge>

            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                Rp {order.total_amount?.toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-gray-500">
                {totalItems} item{totalItems > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Pelanggan:</span>
              <span>{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Email:</span>
              <span>{order.customer_email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Telepon:</span>
              <span>{order.customer_phone}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="font-medium">Alamat:</span>
                <p className="text-gray-600">
                  {order.shipping_address?.address},{" "}
                  {order.shipping_address?.city}
                  {order.shipping_address?.postal_code &&
                    `, ${order.shipping_address.postal_code}`}
                </p>
                {order.shipping_address?.notes && (
                  <p className="text-sm text-gray-500 mt-1">
                    Catatan: {order.shipping_address.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Details Button */}
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? "Sembunyikan" : "Lihat"} Detail Pesanan
        </Button>

        {/* Order Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-gray-900 mb-3">Items Pesanan:</h4>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-lg">
                        {item.category === "shipping" ? "🚚" : "🥦"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.category === "shipping"
                          ? "Biaya pengiriman"
                          : `${item.quantity} x Rp ${item.price?.toLocaleString(
                              "id-ID"
                            )}`}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>

            {/* Payment Info */}
            {order.payment_data && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Info Pembayaran:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Metode Pembayaran:</p>
                    <p className="text-gray-600 capitalize">
                      {order.payment_data.payment_type || "Midtrans"}
                    </p>
                  </div>
                  {order.midtrans_transaction_id && (
                    <div>
                      <p className="font-medium">ID Transaksi:</p>
                      <p className="text-gray-600 font-mono">
                        {order.midtrans_transaction_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
