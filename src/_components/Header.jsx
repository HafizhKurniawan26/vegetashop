"use client";
import React, { useEffect, useState } from "react";
import SearchInput from "./SearchInput";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu, X, History, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartDetail } from "./CartDetail";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const Header = ({ searchQuery, setSearchQuery }) => {
  const [jwt, setJwt] = useState(null);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    const userData = sessionStorage.getItem("user");
    setJwt(token);
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setJwt(null);
    setUser(null);
    window.dispatchEvent(new Event("storage"));
    router.push("/");
    setMobileMenuOpen(false);
  };

  const handleOrderHistory = () => {
    router.push("/orders");
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100"
          : "bg-gradient-to-r from-green-600 to-emerald-700"
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                scrolled
                  ? "bg-gradient-to-r from-green-600 to-emerald-600"
                  : "bg-white/20 backdrop-blur-sm"
              }`}
            >
              <span
                className={`font-bold text-lg ${
                  scrolled ? "text-white" : "text-white"
                }`}
              >
                V
              </span>
            </div>
            <div>
              <h1
                className={`text-2xl font-bold transition-colors duration-300 ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
              >
                <span className="text-green-400">VEGE</span>
                <span className={scrolled ? "text-gray-900" : "text-white"}>
                  SHOP
                </span>
              </h1>
              <p
                className={`text-xs transition-colors duration-300 ${
                  scrolled ? "text-gray-500" : "text-green-100"
                }`}
              >
                Fresh Groceries Delivered
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <SearchInput
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              variant={scrolled ? "default" : "light"}
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <CartDetail variant={scrolled ? "default" : "light"} />

            {/* User Actions */}
            {!jwt ? (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant={scrolled ? "outline" : "secondary"}
                  className="rounded-xl border-2 font-semibold"
                >
                  <Link href={"/register"}>Daftar</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-xl bg-white text-green-700 hover:bg-green-50 border-2 border-white font-semibold shadow-lg"
                >
                  <Link href={"/login"}>
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={scrolled ? "outline" : "ghost"}
                      className={`rounded-xl transition-colors duration-300 ${
                        scrolled
                          ? "border-green-200 text-green-800 hover:bg-green-50 hover:text-green-700"
                          : "text-white hover:bg-white/20 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 ">
                        <div className=" w-9 h-9 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-sm ">
                          Hi, {user?.username}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-xl shadow-lg border border-gray-200"
                  >
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Order History */}
                    <DropdownMenuItem
                      onClick={handleOrderHistory}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer rounded-lg mx-2 my-1"
                    >
                      <History className="w-4 h-4" />
                      Riwayat Pesanan
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Logout */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer rounded-lg mx-2 my-1"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <LogOut className="w-5 h-5" />
                            Konfirmasi Logout
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Apakah Anda yakin ingin keluar dari akun Anda?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl border-2">
                            Batal
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleLogout}
                            className="rounded-xl bg-red-600 hover:bg-red-700"
                          >
                            Ya, Logout
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center justify-between py-3">
          {/* Logo Mobile */}
          <Link href="/" className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                scrolled
                  ? "bg-gradient-to-r from-green-600 to-emerald-600"
                  : "bg-white/20"
              }`}
            >
              <span className="font-bold text-white text-sm">V</span>
            </div>
            <div className="flex flex-col">
              <h1
                className={`text-lg font-bold leading-tight ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
              >
                VEGETA
                <span className={scrolled ? "text-gray-900" : "text-white"}>
                  SHOP
                </span>
              </h1>
              <p
                className={`text-[10px] leading-tight ${
                  scrolled ? "text-gray-500" : "text-green-100"
                }`}
              >
                Fresh Groceries
              </p>
            </div>
          </Link>

          {/* Right Side - Cart dan Menu */}
          <div className="flex items-center gap-2">
            {/* Cart Mobile */}
            <CartDetail variant={scrolled ? "default" : "light"} />

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant={scrolled ? "outline" : "ghost"}
                  size="icon"
                  className={`rounded-xl ${
                    scrolled
                      ? "border-gray-300 text-gray-700"
                      : "text-white hover:bg-white/20 border-transparent"
                  }`}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 rounded-l-2xl">
                {/* Tambahkan SheetTitle yang tersembunyi untuk aksesibilitas */}
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>

                <div className="flex flex-col h-full">
                  {/* Header Mobile Menu */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">V</span>
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">VEGETASHOP</h2>
                        <p className="text-xs text-gray-500">Fresh Groceries</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* User Info Mobile */}
                  {jwt && user && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user?.username}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order History Mobile */}
                  {jwt && (
                    <div className="p-4 border-b border-gray-200">
                      <button
                        onClick={handleOrderHistory}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full text-left transition-all duration-200"
                      >
                        <History className="w-5 h-5 text-gray-500" />
                        <span className="text-sm">Riwayat Pesanan</span>
                      </button>
                    </div>
                  )}

                  {/* Auth Buttons Mobile */}
                  <div className="p-4 border-t border-gray-200 space-y-3 mt-auto">
                    {!jwt ? (
                      <>
                        <Button
                          asChild
                          className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                          <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-center"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Login
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                        >
                          <Link
                            href="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-center"
                          >
                            Daftar Akun
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl max-w-[90vw]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                              <LogOut className="w-5 h-5" />
                              Konfirmasi Logout
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Apakah Anda yakin ingin keluar dari akun Anda?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="rounded-xl border-2 flex-1 order-2 sm:order-1">
                              Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleLogout}
                              className="rounded-xl bg-red-600 hover:bg-red-700 flex-1 order-1 sm:order-2"
                            >
                              Ya, Logout
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar Mobile */}
        <div className="lg:hidden pb-3">
          <SearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            variant={scrolled ? "default" : "light"}
            size="sm"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
