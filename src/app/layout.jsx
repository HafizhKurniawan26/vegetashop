import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/_utils/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VegetaShop",
  description: "Fresh Groceries Delivered",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <main>{children}</main>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
