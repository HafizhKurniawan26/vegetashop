import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchInput = ({ searchQuery, setSearchQuery, variant = "default" }) => {
  const isLight = variant === "light";

  return (
    <div className="relative w-full">
      <Search
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
          isLight ? "text-green-200" : "text-gray-400"
        }`}
      />
      <Input
        placeholder="Cari sayuran, buah-buahan..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all duration-300 ${
          isLight
            ? "bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-green-200 focus:bg-white focus:text-gray-900 focus:border-white"
            : "bg-white border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
        }`}
      />
    </div>
  );
};

export default SearchInput;
