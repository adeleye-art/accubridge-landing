export default function StaffDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2463] to-[#0D0D0D] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-block border border-white/10 rounded-lg px-3 py-1 text-xs text-[#6B7280] mb-3">Staff Dashboard</div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Staff Workspace</h1>
          <p className="text-[#6B7280]">Manage your assigned client accounts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Assigned Clients",  value: "0", icon: "👥", color: "text-[#3E92CC]" },
            { label: "Pending Reviews",   value: "0", icon: "⏳", color: "text-[#D4AF37]" },
            { label: "Reports Generated", value: "0", icon: "📊", color: "text-[#06D6A0]" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col gap-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[#6B7280] text-sm">{stat.label}</span>
              <span className={`font-bold text-xl ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "View Clients",        href: "/staff/clients",      icon: "🤝" },
            { label: "Review Transactions", href: "/staff/transactions", icon: "💳" },
            { label: "Generate Reports",    href: "/staff/reports",      icon: "📊" },
            { label: "Update Compliance",   href: "/staff/compliance",   icon: "🛡️" },
            { label: "Add Notes",           href: "/staff/notes",        icon: "📝" },
            { label: "Request Documents",   href: "/staff/documents",    icon: "📁" },
          ].map((action) => (
            <a key={action.label} href={action.href} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 flex flex-col gap-2 transition text-center group">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-white text-sm font-medium group-hover:text-[#D4AF37] transition">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
