import Link from "next/link";
import { House, Palette, Star, User } from "lucide-react";

export default function Sidebar() {
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
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-5 text-sm text-gray-500">
        © 2026
      </div>
    </aside>
  );
}
