import Link from "next/link";
import {
  ArrowRight,
  MessageSquareText,
  Plus,
  QrCode,
  Star,
  TrendingUp,
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
    description: "Build a branded QR code and connect it to a Google review page.",
    href: "/qr/create",
    icon: Plus,
    primary: true,
  },
  {
    title: "Manage QR codes",
    description: "View saved QR codes, export SVGs, or edit an existing destination.",
    href: "/qr",
    icon: QrCode,
  },
  {
    title: "Review feedback",
    description: "Read customer submissions collected from your QR review pages.",
    href: "/reviews",
    icon: Star,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 sm:p-8">
              <p className="text-sm font-medium text-emerald-700">
                Review Management
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                Turn guest feedback into a cleaner review workflow.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Create QR codes for review collection, route happy guests to
                Google, and keep private feedback organized for your team.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/qr/create"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  <Plus size={16} />
                  Create QR
                </Link>
                <Link
                  href="/reviews"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  <Star size={16} />
                  View Reviews
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-100 p-6 lg:border-l lg:border-t-0">
              <div className="grid h-full content-center gap-3">
                {stats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Icon size={19} />
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-400">
                            {item.label}
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {item.value}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className={`group rounded-xl border p-5 shadow-sm transition ${
                  action.primary
                    ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                    : "border-slate-200 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                      action.primary
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <ArrowRight
                    size={18}
                    className={
                      action.primary
                        ? "text-white/60 transition group-hover:text-white"
                        : "text-slate-300 transition group-hover:text-emerald-700"
                    }
                  />
                </div>
                <h2 className="mt-5 text-lg font-semibold">{action.title}</h2>
                <p
                  className={`mt-2 text-sm leading-6 ${
                    action.primary ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {action.description}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recommended flow</h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep review collection consistent across every location.
              </p>
            </div>
            <Link
              href="/qr/create"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Start
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {["Create a short QR code", "Display it at check-out", "Review private feedback"].map(
              (step, index) => (
                <div
                  key={step}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                    {index + 1}
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-800">
                    {step}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
