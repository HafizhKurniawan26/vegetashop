import React from "react";
import { Package2, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sidebar = ({
  user,
  navItems,
  activeTab,
  handleNavigation,
  handleLogout,
  mobileSidebarOpen,
  sidebarOpen,
  setMobileSidebarOpen,
}) => (
  <>
    {/* Mobile Overlay */}
    {mobileSidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={() => setMobileSidebarOpen(false)}
      />
    )}

    {/* Sidebar */}
    <div
      className={`
        fixed inset-y-0 left-0 z-50
        bg-white shadow-lg border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        flex flex-col
        h-dvh lg:h-screen
        ${
          mobileSidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0 lg:w-64"
        }
        ${sidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full lg:w-0"}
      `}
    >
      {/* Header Sidebar dengan Close Button untuk Mobile */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex items-center justify-between p-4 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Package2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Store</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          {/* Close Button untuk Mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Items - Scrollable Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 lg:p-4 space-y-1 lg:space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item.id);
                    // Tutup sidebar mobile setelah memilih item
                    if (window.innerWidth < 1024) {
                      setMobileSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer Sidebar - Fixed */}
      <div className="flex-shrink-0 border-t border-gray-200 p-3 lg:p-4">
        {/* User Info untuk Mobile */}
        <div className="lg:hidden mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">
                {user?.username}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 text-sm"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
          Logout
        </Button>
      </div>
    </div>
  </>
);

export default Sidebar;
