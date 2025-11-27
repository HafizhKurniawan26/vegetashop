import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const ProductCard = ({ product, onBuy }) => {
  const productStock = product.stock || 0;
  const isOutOfStock = productStock === 0;
  const isLowStock = productStock > 0 && productStock <= 5;
  const isPopular = productStock > 20;

  const handleBuyClick = () => {
    if (isOutOfStock) return;
    onBuy(product);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl shadow-sm hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden ">
        <Image
          src={
            product?.images?.[0]?.url?.startsWith("http")
              ? product.images[0].url
              : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${product.images[0].url}`
          }
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 p-4 w-32 h-32 mx-auto"
        />

        {/* Badge stok dan popular */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isOutOfStock && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs">
              HABIS
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 text-xs">
              STOK {productStock}
            </Badge>
          )}
          {isPopular && !isOutOfStock && (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              POPULER
            </Badge>
          )}
        </div>

        {/* Rating overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            4.8
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-green-600">
            Rp{product.price.toLocaleString("id-ID")}
          </p>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            /{product.unit || "pcs"}
          </span>
        </div>

        {/* Info stok */}
        <div className="mt-2">
          <div className="flex justify-between items-center text-xs">
            <span
              className={`font-medium ${
                isOutOfStock ? "text-red-500" : "text-gray-500"
              }`}
            >
              Stok: {productStock}
            </span>
            {isLowStock && !isOutOfStock && (
              <span className="text-orange-500 font-semibold">
                Stok terbatas!
              </span>
            )}
          </div>
          {/* Progress bar stok */}
          {!isOutOfStock && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  productStock > 10
                    ? "bg-green-500"
                    : productStock > 5
                    ? "bg-yellow-500"
                    : "bg-orange-500"
                }`}
                style={{
                  width: `${Math.min((productStock / 50) * 100, 100)}%`,
                }}
              ></div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 pt-0">
        <Button
          onClick={handleBuyClick}
          className={`w-full rounded-xl font-semibold transition-all duration-300 ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed border-2 border-gray-200"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-200"
          }`}
          disabled={isOutOfStock}
          size="lg"
        >
          {isOutOfStock ? (
            "Stok Habis"
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add To Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
