import React from "react";
import { Package2, LogOut } from "lucide-react";
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
}) => (
  <div
    className={`
    fixed inset-y-0 left-0 z-50
    bg-white shadow-lg border-r border-gray-200
    transform transition-transform duration-200 ease-in-out
    ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"}
    lg:relative lg:translate-x-0 lg:w-64
    ${mobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"}
    lg:sticky lg:top-0 lg:h-screen
  `}
  >
    <div className="flex flex-col h-full">
      {/* Header Sidebar - Fixed */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Package2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Store</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer Sidebar - Fixed */}
      <div className="flex-shrink-0 border-t border-gray-200">
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default Sidebar;
