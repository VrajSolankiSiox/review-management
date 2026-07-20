import Link from "next/link";
import { House, LogOut, Palette, Star, User, MoreVertical } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function loadUser() {
      try {
        const token = localStorage.getItem("JWT");
        if (token) {
          const payloadBase64 = token.split(".")[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          const fullName = decodedPayload.full_name || "";
          const parts = fullName.trim().split(" ");
          const firstName = parts[0] || "User";
          const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
          setUserName({ firstName, lastName, email: decodedPayload.user });
        }
      } catch (e) {
        console.error("Failed to parse JWT in sidebar");
      }
    }

    loadUser();
    window.addEventListener("jwt-updated", loadUser);
    return () => window.removeEventListener("jwt-updated", loadUser);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: House,
    },
    {
      name: "QR Codes",
      href: "/qr",
      icon: Palette,
    },
    {
      name: "Reviews",
      href: "/reviews",
      icon: Star,
    },
  ];

  return (
    <aside className="top-0 left-0 w-full max-w-[18rem] md:w-64 h-full md:h-screen fixed bg-white border-r border-gray-200 flex flex-col justify-between z-20">
      <div>
        {/* Logo Section */}
        <div className="relative flex items-center border-b border-gray-200 px-6 py-8 overflow-hidden min-h-[120px]">
          <div className="flex items-center   z-10">
            {/* <img 
              src="/WebsiteLogo.png" 
              alt="Review Management Logo" 
              className="h-10 w-10 shrink-0 object-contain" 
            /> */}
            <h1 className="text-3xl font-bold  text-slate-900  ">
              <span className="block text-2xl">Review</span>
              <span className="text-lg  font-medium text-slate-500 block">
                Management
              </span>
            </h1>
          </div>

          {/* Decorative Gradient positioned at the top right */}
          <img
            src="/gradient.png"
            alt="Gradient decoration"
            className="absolute top-0 -right-4 h-full w-32 object-contain opacity-90 select-none pointer-events-none"
          />
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-green-600" : "text-gray-400"}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer & Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50/50">
        {userName && (
          <div className="relative" ref={menuRef}>
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-gray-200/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {userName.firstName} {userName.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {userName.email}
                  </p>
                </div>
              </div>
              <MoreVertical className="h-4 w-4 text-slate-400 shrink-0" />
            </div>

            {isMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg w-full transition"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem("JWT");
                    router.replace("/login");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
