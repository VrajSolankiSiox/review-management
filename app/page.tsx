import Link from "next/link";
import {
  ArrowRight,
  MessageSquareText,
  Plus,
  QrCode,
  Star,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const stats = [
  {
    label: "QR destinations",
    value: "Review pages",
    detail: "Create short links for each location",
    icon: QrCode,
  },
  {
    label: "Customer feedback",
    value: "Internal reviews",
    detail: "Low ratings stay private for follow-up",
    icon: MessageSquareText,
  },
  {
    label: "Google growth",
    value: "Happy guests",
    detail: "Send strong reviews to your public profile",
    icon: TrendingUp,
  },
];

const actions = [
  {
    title: "Create a QR code",
    description:
      "Build a branded QR code and connect it to a Google review page.",
    href: "/qr/create",
    icon: Plus,
    primary: true,
  },
  {
    title: "Manage QR codes",
    description:
      "View saved QR codes, export SVGs, or edit an existing destination.",
    href: "/qr",
    icon: QrCode,
  },
  {
    title: "Review feedback",
    description:
      "Read customer submissions collected from your QR review pages.",
    href: "/reviews",
    icon: Star,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 text-slate-900 font-sans">
      <div className="  max-w-6xl space-y-8">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
          {/* Subtle green gradient matching the sidebar's top-right blob */}
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-100/50 to-emerald-50/20 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Left Content */}
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <Sparkles size={14} />
                Overview
              </div>
              <h1 className="mt-6 max-w-xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl leading-[1.15]">
                Turn guest feedback into a cleaner workflow.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-slate-600">
                Create QR codes for review collection, route happy guests to
                Google, and keep private feedback organized for your team.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/qr/create"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#008f5d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#00784e] hover:shadow-md active:scale-95"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Create QR Code
                </Link>
                <Link
                  href="/reviews"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                >
                  <Star size={18} className="text-slate-400" />
                  View Reviews
                </Link>
              </div>
            </div>

            {/* Right Stats */}
            <div className="flex flex-col justify-center bg-slate-50/50 p-8 sm:p-10 lg:p-12">
              <div className="grid gap-6">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="group flex items-start gap-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#008f5d] ring-1 ring-inset ring-emerald-600/20 transition-colors group-hover:bg-[#008f5d] group-hover:text-white">
                        <Icon size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {item.label}
                          </p>
                        </div>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {item.value}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="grid gap-5 md:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`group relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                  action.primary
                    ? "bg-[#008f5d] text-white shadow-md hover:shadow-lg hover:bg-[#00784e]"
                    : "bg-white text-slate-900 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                      action.primary
                        ? "bg-white/20 text-white ring-1 ring-inset ring-white/20"
                        : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-100 group-hover:bg-emerald-50 group-hover:text-[#008f5d]"
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  <ArrowRight
                    size={20}
                    className={`transition-transform duration-300 group-hover:translate-x-1 ${
                      action.primary
                        ? "text-white/70 group-hover:text-white"
                        : "text-slate-300 group-hover:text-[#008f5d]"
                    }`}
                  />
                </div>
                <h2 className="text-lg font-bold tracking-tight">
                  {action.title}
                </h2>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    action.primary ? "text-emerald-100" : "text-slate-500"
                  }`}
                >
                  {action.description}
                </p>
              </Link>
            );
          })}
        </section>

        {/* RECOMMENDED FLOW */}
        <section className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Recommended flow
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Set up a consistent review collection process across all your
                locations.
              </p>
            </div>
            <Link
              href="/qr/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Start setup
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[2px] bg-slate-100" />

            <div className="grid gap-6 md:grid-cols-3 relative">
              {[
                "Create a short QR code",
                "Display it at check-out",
                "Review private feedback",
              ].map((step, index) => (
                <div
                  key={step}
                  className="relative group flex flex-col items-center text-center bg-white p-2"
                >
                  <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm ring-4 ring-slate-50 transition-all group-hover:scale-110 group-hover:text-[#008f5d] group-hover:ring-emerald-50 border border-slate-200">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-slate-900">
                    {step}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 max-w-[180px]">
                    {index === 0 && "Takes 2 minutes to generate."}
                    {index === 1 && "Place on counters or receipts."}
                    {index === 2 && "Action the negative reviews."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
