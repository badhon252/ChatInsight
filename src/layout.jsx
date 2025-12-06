import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, BarChart3, Lightbulb, Hash, Shield } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const navItems = [
    { name: "Upload", icon: Upload, path: "Upload" },
    { name: "Dashboard", icon: BarChart3, path: "Dashboard" },
    { name: "Topics", icon: Hash, path: "Topics" },
    { name: "Insights", icon: Lightbulb, path: "Insights" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Neo-Brutalism Header */}
      <header className="bg-[#FFD600] border-b-4 border-black sticky top-0 z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl("Upload")} className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[#FF006E] border-4 border-black rotate-3 group-hover:rotate-6 transition-transform flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-black leading-none tracking-tight">
                  CHAT ANALYZER
                </h1>
                <p className="text-xs font-bold text-black/70 uppercase tracking-wider">
                  Privacy First
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === createPageUrl(item.path);
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    className={`
                      px-6 py-3 border-3 border-black font-bold uppercase text-sm
                      transition-all duration-150 flex items-center gap-2
                      ${
                        isActive
                          ? "bg-[#0066FF] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                          : "bg-white text-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px]"
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" strokeWidth={3} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden px-4 py-3 bg-black text-white border-3 border-black font-bold">
              MENU
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-4 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === createPageUrl(item.path);
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.path)}
                  className={`
                    px-4 py-2 border-3 border-black font-bold uppercase text-xs
                    flex items-center gap-2
                    ${
                      isActive
                        ? "bg-[#0066FF] text-white"
                        : "bg-white text-black"
                    }
                  `}
                >
                  <item.icon className="w-3 h-3" strokeWidth={3} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-black text-white border-t-4 border-black py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold uppercase tracking-wider">
            🔒 All analysis happens in your browser. No data is sent to servers.
          </p>
          <p className="text-sm mt-2 text-white/70 font-mono">
            Your privacy is our priority.
          </p>
        </div>
      </footer>
    </div>
  );
}