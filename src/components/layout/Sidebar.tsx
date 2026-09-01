"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, BrainCircuit, BarChart3, LogOut, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Interview Arena", href: "/generator", icon: BrainCircuit },
    { name: "Performance Insights", href: "/analytics", icon: BarChart3 },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="flex h-16 items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-md md:hidden fixed top-0 left-0 right-0 z-40">
        <Link href="/" className="flex items-center space-x-2" onClick={closeSidebar}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            IQ
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-violet-200 bg-clip-text text-transparent">
            InterviewIQ AI
          </span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed bottom-0 top-16 md:top-0 left-0 z-35 flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-md px-4 py-6 transition-transform duration-300 md:translate-x-0 md:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo (Desktop Only) */}
        <div className="hidden md:flex items-center space-x-3 px-2 pb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl glow-indigo">
            IQ
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-violet-200 bg-clip-text text-transparent">
            InterviewIQ
          </span>
        </div>

        {/* User Info Card */}
        {session?.user && (
          <div className="flex items-center space-x-3 rounded-xl bg-muted/30 border border-border/50 p-3 mb-6">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                className="h-9 w-9 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/25 border border-primary/20 text-primary">
                <User className="h-4.5 w-4.5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">
                {session.user.name || "User"}
              </p>
              <p className="text-xs truncate text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 space-y-1.5 px-1" aria-label="Main Navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-indigo-500/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-1 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-red-500"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;
