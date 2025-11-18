import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductList from "@/_components/ProductList";

const CategoryTabs = ({
  activeCategory,
  setActiveCategory,
  allProducts,
  vegetables,
  fruits,
  productsLoading,
  vegetablesLoading,
  fruitsLoading,
  handleBuy,
}) => (
  <div className="mb-8">
    <Tabs
      value={activeCategory}
      onValueChange={setActiveCategory}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-2xl">
        <TabsTrigger
          value="all"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl"
        >
          Semua
        </TabsTrigger>
        <TabsTrigger
          value="sayuran"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl"
        >
          Sayuran
        </TabsTrigger>
        <TabsTrigger
          value="buah"
          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl"
        >
          Buah-buahan
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-8">
        <ProductList
          title="Produk Terpopuler"
          products={allProducts?.slice(0, 10)}
          handleBuy={handleBuy}
          loading={productsLoading}
        />
        <ProductList
          title="Aneka Sayuran Segar"
          products={vegetables}
          handleBuy={handleBuy}
          loading={vegetablesLoading}
        />
        <ProductList
          title="Aneka Buah-buahan"
          products={fruits}
          handleBuy={handleBuy}
          loading={fruitsLoading}
        />
      </TabsContent>

      <TabsContent value="sayuran">
        <ProductList
          title="Aneka Sayuran Segar"
          products={vegetables}
          handleBuy={handleBuy}
          loading={vegetablesLoading}
        />
      </TabsContent>

      <TabsContent value="buah">
        <ProductList
          title="Aneka Buah-buahan"
          products={fruits}
          handleBuy={handleBuy}
          loading={fruitsLoading}
        />
      </TabsContent>
    </Tabs>
  </div>
);

export default CategoryTabs;
