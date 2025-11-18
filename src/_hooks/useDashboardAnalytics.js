import { useMemo } from "react";

export const useDashboardAnalytics = (orders, products, users, categories) => {
  // DATA EXPLORER - Lihat struktur data sebenarnya
  const dataExplorer = useMemo(() => {
    console.log("🔍 DATA EXPLORER - Analyzing Data Structure...");

    // Explore settlement orders
    const settlementOrders =
      orders?.filter((o) => o.order_status === "settlement") || [];
    console.log("📦 SETTLEMENT ORDERS:", settlementOrders);

    if (settlementOrders.length > 0) {
      settlementOrders.forEach((order, index) => {
        console.log(`\n--- Settlement Order ${index + 1} ---`);
        console.log("Order ID:", order.documentId);
        console.log("Items Type:", typeof order.items);
        console.log("Items Value:", order.items);

        // Try to parse items
        let parsedItems = order.items;
        if (typeof order.items === "string") {
          try {
            parsedItems = JSON.parse(order.items);
            console.log("✅ Successfully parsed JSON");
          } catch (e) {
            console.log("❌ Failed to parse JSON");
            // Try alternative parsing
            try {
              // Handle common string formats
              const cleanStr = order.items
                .replace(/(\w+):/g, '"$1":')
                .replace(/'/g, '"')
                .replace(/,(\s*[}\]])/g, "$1");
              parsedItems = JSON.parse(cleanStr);
              console.log("✅ Successfully parsed with cleanup");
            } catch (e2) {
              console.log("❌ All parsing attempts failed");
            }
          }
        }
        console.log("Parsed Items:", parsedItems);
      });
    }

    // Explore products structure
    console.log("\n🎯 PRODUCTS STRUCTURE:");
    products?.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product.documentId,
        name: product.name,
        categories: product.categories,
        price: product.price,
      });
    });

    return {
      settlementOrders,
      productsCount: products?.length,
      categoriesCount: categories?.length,
    };
  }, [orders, products, categories]);

  // Best Selling Products - SIMPLIFIED VERSION
  const bestSellingProducts = useMemo(() => {
    console.log("🔄 CALCULATING BEST SELLING PRODUCTS...");

    if (!orders?.length || !products?.length) {
      console.log("❌ No orders or products data");
      return [];
    }

    const settlementOrders = orders.filter(
      (o) => o.order_status === "settlement"
    );
    console.log(`📊 Found ${settlementOrders.length} settlement orders`);

    if (settlementOrders.length === 0) {
      console.log("❌ No settlement orders found");
      return [];
    }

    const productSales = {};

    settlementOrders.forEach((order, orderIndex) => {
      console.log(`\n--- Processing Settlement Order ${orderIndex + 1} ---`);

      let items = [];

      // Handle different item formats
      if (order.items) {
        if (typeof order.items === "string") {
          try {
            // Try direct JSON parse first
            items = JSON.parse(order.items);
          } catch (e) {
            try {
              // Try with cleanup for common issues
              const cleanStr = order.items
                .replace(/(\w+):/g, '"$1":')
                .replace(/'/g, '"')
                .replace(/,(\s*[}\]])/g, "$1");
              items = JSON.parse(cleanStr);
            } catch (e2) {
              console.log("❌ Could not parse items string:", order.items);
              // Try to extract as array if it looks like array
              if (order.items.includes("[") && order.items.includes("]")) {
                try {
                  const arrayStr = order.items.match(/\[.*\]/)?.[0];
                  if (arrayStr) {
                    items = JSON.parse(arrayStr);
                  }
                } catch (e3) {
                  console.log("❌ Array extraction also failed");
                }
              }
            }
          }
        } else if (Array.isArray(order.items)) {
          items = order.items;
        } else if (typeof order.items === "object") {
          items = [order.items];
        }
      }

      console.log("📦 Processed items:", items);

      if (!Array.isArray(items)) {
        console.log("⚠️ Items is not an array, converting to array");
        items = items ? [items] : [];
      }

      items.forEach((item, itemIndex) => {
        console.log(`  Processing item ${itemIndex + 1}:`, item);

        // Extract product information with multiple fallbacks
        let productId = null;
        let productName = null;
        let quantity = 1;
        let price = 0;

        // METHOD 1: Try to get product ID from various locations
        if (item.product?.documentId) {
          productId = item.product.documentId;
        } else if (item.product?.data?.documentId) {
          productId = item.product.data.documentId;
        } else if (item.product) {
          // If product is just an ID string
          productId = item.product;
        } else if (item.productId) {
          productId = item.productId;
        } else if (item.id) {
          productId = item.id;
        }

        // METHOD 2: Try to get product name for matching
        if (item.name) {
          productName = item.name;
        } else if (item.product?.name) {
          productName = item.product.name;
        } else if (item.product?.data?.name) {
          productName = item.product.data.name;
        } else if (item.productName) {
          productName = item.productName;
        }

        // Get quantity
        if (item.quantity) {
          quantity = parseInt(item.quantity) || 1;
        } else if (item.qty) {
          quantity = parseInt(item.qty) || 1;
        }

        // Get price
        if (item.price) {
          price = parseFloat(item.price) || 0;
        } else if (item.product?.price) {
          price = parseFloat(item.product.price) || 0;
        } else if (item.product?.data?.price) {
          price = parseFloat(item.product.data.price) || 0;
        } else if (item.amount) {
          price = parseFloat(item.amount) || 0;
        }

        console.log("  Extracted:", {
          productId,
          productName,
          quantity,
          price,
        });

        // Find matching product
        let matchedProduct = null;

        // Try by ID first
        if (productId) {
          matchedProduct = products.find((p) => p.documentId === productId);
          if (matchedProduct) {
            console.log(`  ✅ Matched by ID: ${matchedProduct.name}`);
          }
        }

        // Try by name if ID not found
        if (!matchedProduct && productName) {
          matchedProduct = products.find(
            (p) =>
              p.name.toLowerCase().includes(productName.toLowerCase()) ||
              productName.toLowerCase().includes(p.name.toLowerCase())
          );
          if (matchedProduct) {
            console.log(`  ✅ Matched by name: ${matchedProduct.name}`);
          }
        }

        // Last resort: try partial name matching
        if (!matchedProduct && productName) {
          matchedProduct = products.find(
            (p) =>
              p.name
                .toLowerCase()
                .includes(productName.toLowerCase().substring(0, 5)) ||
              productName
                .toLowerCase()
                .includes(p.name.toLowerCase().substring(0, 5))
          );
          if (matchedProduct) {
            console.log(`  ✅ Matched by partial name: ${matchedProduct.name}`);
          }
        }

        if (matchedProduct) {
          const finalProductId = matchedProduct.documentId;

          if (!productSales[finalProductId]) {
            productSales[finalProductId] = {
              product: matchedProduct,
              totalSold: 0,
              totalRevenue: 0,
              orderCount: 0,
            };
          }

          productSales[finalProductId].totalSold += quantity;
          productSales[finalProductId].totalRevenue += price * quantity;
          productSales[finalProductId].orderCount += 1;

          console.log(`  📈 Updated sales for ${matchedProduct.name}:`, {
            totalSold: productSales[finalProductId].totalSold,
            totalRevenue: productSales[finalProductId].totalRevenue,
          });
        } else {
          console.log("  ❌ NO PRODUCT MATCH FOUND");
          console.log(
            "  Available products:",
            products.map((p) => ({
              id: p.documentId,
              name: p.name,
            }))
          );
        }
      });
    });

    const result = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);

    console.log("🏆 FINAL BEST SELLING PRODUCTS:", result);
    return result;
  }, [orders, products]);

  // Category Performance - SIMPLIFIED
  const categoryPerformance = useMemo(() => {
    console.log("🔄 CALCULATING CATEGORY PERFORMANCE...");

    if (!categories?.length || !products?.length) {
      return {};
    }

    const performance = {};

    // Initialize all categories
    categories.forEach((category) => {
      performance[category.documentId] = {
        category: category,
        products: [],
        totalSold: 0,
        totalRevenue: 0,
      };
    });

    // Calculate sales from bestSellingProducts
    bestSellingProducts.forEach((productSale) => {
      const product = productSale.product;

      if (product && product.categories) {
        product.categories.forEach((cat) => {
          const categoryId = typeof cat === "object" ? cat.documentId : cat;

          if (performance[categoryId]) {
            if (
              !performance[categoryId].products.find(
                (p) => p.documentId === product.documentId
              )
            ) {
              performance[categoryId].products.push(product);
            }
            performance[categoryId].totalSold += productSale.totalSold;
            performance[categoryId].totalRevenue += productSale.totalRevenue;
          }
        });
      }
    });

    console.log("📊 CATEGORY PERFORMANCE:", performance);
    return performance;
  }, [categories, products, bestSellingProducts]);

  // Revenue Trends (tetap sama)
  const revenueTrends = useMemo(() => {
    const monthlyRevenue = {};
    orders?.forEach((order) => {
      if (order.order_status === "settlement" && order.createdAt) {
        try {
          const date = new Date(order.createdAt);
          if (!isNaN(date.getTime())) {
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
            monthlyRevenue[monthYear] =
              (monthlyRevenue[monthYear] || 0) +
              (parseFloat(order.total_amount) || 0);
          }
        } catch (error) {
          console.error("Error processing order date:", error);
        }
      }
    });
    return Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  }, [orders]);

  // User Growth (tetap sama)
  const userGrowth = useMemo(() => {
    const monthlyUsers = {};
    users?.forEach((user) => {
      if (user.createdAt) {
        try {
          const date = new Date(user.createdAt);
          if (!isNaN(date.getTime())) {
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
            monthlyUsers[monthYear] = (monthlyUsers[monthYear] || 0) + 1;
          }
        } catch (error) {
          console.error("Error processing user date:", error);
        }
      }
    });
    return Object.entries(monthlyUsers)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  }, [users]);

  // Order Statistics (tetap sama)
  const orderStats = useMemo(() => {
    const totalOrders = orders?.length || 0;
    const successfulOrders =
      orders?.filter((order) => order.order_status === "settlement").length ||
      0;
    const pendingOrders =
      orders?.filter((order) => order.order_status === "pending").length || 0;
    const failedOrders =
      orders?.filter((order) =>
        ["cancel", "deny", "expire", "failure"].includes(order.order_status)
      ).length || 0;
    const successRate =
      totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      successfulOrders,
      pendingOrders,
      failedOrders,
      successRate: successRate.toFixed(1),
    };
  }, [orders]);

  // Settlement Revenue (tetap sama)
  const settlementRevenue = useMemo(() => {
    return (
      orders
        ?.filter((order) => order.order_status === "settlement")
        .reduce(
          (total, order) => total + (parseFloat(order.total_amount) || 0),
          0
        ) || 0
    );
  }, [orders]);

  return {
    bestSellingProducts,
    categoryPerformance,
    orderStats,
    revenueTrends,
    userGrowth,
    settlementRevenue,
    dataExplorer, // Export data explorer for debugging
  };
};
