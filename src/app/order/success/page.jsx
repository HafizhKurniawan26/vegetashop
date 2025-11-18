// "use client";
// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { CheckCircle, Home, ShoppingBag, Package } from "lucide-react";
// import Link from "next/link";

// export default function OrderSuccess() {
//   const searchParams = useSearchParams();
//   const [orderData, setOrderData] = useState(null);

//   useEffect(() => {
//     const order_id = searchParams.get("order_id");

//     if (order_id) {
//       setOrderData({
//         orderId: order_id,
//         status: "paid",
//       });

//       // Clear cart from session storage
//       sessionStorage.removeItem("cart");
//     }
//   }, [searchParams]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12">
//       <Card className="w-full max-w-md mx-4">
//         <CardContent className="pt-6">
//           <div className="text-center space-y-6">
//             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//               <CheckCircle className="w-10 h-10 text-green-600" />
//             </div>

//             <div className="space-y-2">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Pembayaran Berhasil!
//               </h1>
//               <p className="text-gray-600">
//                 Terima kasih telah berbelanja di Fresh Groceries. Pesanan Anda
//                 sedang diproses.
//               </p>
//             </div>

//             {orderData && (
//               <div className="bg-gray-50 rounded-xl p-4 space-y-2">
//                 <p className="text-sm text-gray-600">Order ID</p>
//                 <p className="font-mono font-semibold text-gray-900">
//                   {orderData.orderId}
//                 </p>
//                 <Badge className="bg-green-100 text-green-800">
//                   {orderData.status.toUpperCase()}
//                 </Badge>
//               </div>
//             )}

//             <div className="space-y-3 pt-4">
//               <Button asChild className="w-full">
//                 <Link href="/">
//                   <Home className="w-4 h-4 mr-2" />
//                   Kembali ke Beranda
//                 </Link>
//               </Button>
//               <Button asChild variant="outline" className="w-full">
//                 <Link href="/orders">
//                   <Package className="w-4 h-4 mr-2" />
//                   Lihat Pesanan Saya
//                 </Link>
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
