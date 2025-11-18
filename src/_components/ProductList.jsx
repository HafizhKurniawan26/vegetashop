import { Skeleton } from "@/components/ui/skeleton";
import { Badge, Package } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductList = ({
  title,
  products,
  handleBuy,
  loading,
  gridLayout = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
}) => {
  const productList = Array.isArray(products)
    ? products
    : products?.data && Array.isArray(products.data)
    ? products.data
    : [];

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        <div className={`grid ${gridLayout} gap-4`}>
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm border"
            >
              <Skeleton className="w-full h-32 rounded-xl mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!productList || productList.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Tidak ada produk ditemukan</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        {title}
        <Badge variant="secondary" className="text-sm">
          {productList.length} produk
        </Badge>
      </h2>
      <div className={`grid ${gridLayout} gap-4`}>
        {productList.map((product) => {
          const productData = product.attributes || product;
          const productId = product.id || product.documentId;

          return (
            <ProductCard
              key={productId}
              product={{
                ...productData,
                id: productId,
                documentId: product.documentId || productId,
              }}
              onBuy={handleBuy}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ProductList;
