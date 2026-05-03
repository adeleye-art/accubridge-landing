"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  BarChart3,
  ShieldCheck,
  UserCog,
  Landmark,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  User,
  Bell,
  Search,
} from "lucide-react";
import { useSignOutMutation } from "@/lib/accubridge/api/authApi";

// ─── Brand constants ──────────────────────────────────────────────────────────
const BRAND = {
  primary: "#0A2463",
  accent:  "#3E92CC",
  gold:    "#D4AF37",
  dark:    "#0D0D0D",
  muted:   "#6B7280",
};

const softSpring = "cubic-bezier(0.25, 1.1, 0.4, 1)";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ─── Nav data ─────────────────────────────────────────────────────────────────
const ADMIN_NAV: NavSection[] = [
  {
    title: "Main",
    items: [
      { id: "dashboard",    label: "Dashboard",      href: "/accubridge/admin/dashboard",    icon: <LayoutDashboard size={18} /> },
      { id: "clients",      label: "Clients",        href: "/accubridge/admin/clients",      icon: <Users size={18} /> },
      { id: "transactions", label: "Transactions",   href: "/accubridge/admin/transactions", icon: <ArrowLeftRight size={18} /> },
      { id: "reports",      label: "Reports",        href: "/accubridge/admin/reports",      icon: <BarChart3 size={18} /> },
      { id: "compliance",   label: "Compliance",     href: "/accubridge/admin/compliance",   icon: <ShieldCheck size={18} /> },
    ],
  },
  {
    title: "Admin",
    items: [
      { id: "staff",   label: "Staff Management", href: "/accubridge/admin/staff",   icon: <UserCog size={18} /> },
      { id: "funding", label: "Funding Queue",    href: "/accubridge/admin/funding", icon: <Landmark size={18} />, badge: "3", badgeColor: BRAND.gold },
      { id: "logs",    label: "Activity Logs",    href: "/accubridge/admin/logs",    icon: <ScrollText size={18} /> },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "settings", label: "Settings", href: "/accubridge/admin/settings", icon: <Settings size={18} /> },
    ],
  },
];

// ─── Path → item mapping ──────────────────────────────────────────────────────
const ADMIN_PATH_TO_ITEM: [string, string][] = [
  ["/accubridge/admin/clients",      "clients"],
  ["/accubridge/admin/transactions", "transactions"],
  ["/accubridge/admin/reports",      "reports"],
  ["/accubridge/admin/compliance",   "compliance"],
  ["/accubridge/admin/staff",        "staff"],
  ["/accubridge/admin/funding",      "funding"],
  ["/accubridge/admin/logs",         "logs"],
  ["/accubridge/admin/settings",     "settings"],
  ["/accubridge/admin/dashboard",    "dashboard"],
];

function adminItemFromPath(pathname: string): string {
  for (const [prefix, id] of ADMIN_PATH_TO_ITEM) {
    if (pathname.startsWith(prefix)) return id;
  }
  return "dashboard";
}

// ─── Fixed tooltip ────────────────────────────────────────────────────────────
function FixedTooltip({ label, anchorY, visible }: { label: string; anchorY: number; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none z-[9999]" style={{ position: "fixed", left: "72px", top: anchorY, transform: "translateY(-50%)" }}>
      <div className="px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl" style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}>
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: BRAND.gold }} />
      </div>
    </div>
  );
}

// ─── Icon button ──────────────────────────────────────────────────────────────
function IconButton({ item, isActive, onClick, showTooltip }: { item: NavItem; isActive: boolean; onClick: () => void; showTooltip: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [tooltipY, setTooltipY] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setTooltipY(rect.top + rect.height / 2);
    }
    setHovered(true);
  };

  return (
    <div className="relative w-full flex justify-center">
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300"
        style={{
          backgroundColor: isActive ? `${BRAND.gold}20` : hovered ? "rgba(255,255,255,0.12)" : "transparent",
          transitionTimingFunction: softSpring,
        }}
        aria-label={item.label}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full" style={{ backgroundColor: BRAND.gold }} />
        )}
        <span style={{ color: isActive ? BRAND.gold : hovered ? "#ffffff" : "rgba(255,255,255,0.5)", transform: hovered || isActive ? "scale(1.15)" : "scale(1)", transition: "color 0.2s, transform 0.2s", display: "inline-flex" }}>
          {item.icon}
        </span>
        {item.badge && (
          <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full leading-none" style={{ backgroundColor: item.badgeColor || BRAND.accent, color: BRAND.primary }}>
            {item.badge}
          </span>
        )}
      </button>
      {showTooltip && <FixedTooltip label={item.label} anchorY={tooltipY} visible={hovered} />}
    </div>
  );
}

// ─── Sub-item row ─────────────────────────────────────────────────────────────
function SubItemRow({ subItem, isActive }: { subItem: SubItem; isActive: boolean }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => router.push(subItem.href)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-lg transition-all duration-200 text-left"
      style={{ backgroundColor: isActive ? `${BRAND.gold}15` : hovered ? "rgba(255,255,255,0.06)" : "transparent" }}
    >
      <span style={{ color: isActive ? BRAND.gold : hovered ? "#fff" : BRAND.muted, transition: "color 0.15s", display: "inline-flex", flexShrink: 0 }}>
        {subItem.icon}
      </span>
      <span className="text-xs font-medium truncate" style={{ color: isActive ? BRAND.gold : hovered ? "#fff" : "rgba(255,255,255,0.6)", transition: "color 0.15s" }}>
        {subItem.label}
      </span>
      {subItem.badge && (
        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: subItem.badgeColor || BRAND.accent, color: BRAND.primary }}>
          {subItem.badge}
        </span>
      )}
    </button>
  );
}

// ─── Nav item row ─────────────────────────────────────────────────────────────
function NavItemRow({ item, isActive, isSubOpen, onToggle, pathname }: { item: NavItem; isActive: boolean; isSubOpen: boolean; onToggle: () => void; pathname: string }) {
  const router = useRouter();
  const hasSubItems = !!(item.subItems && item.subItems.length > 0);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (hasSubItems) onToggle();
    else router.push(item.href);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative"
        style={{ backgroundColor: isActive ? `${BRAND.gold}18` : hovered ? "rgba(255,255,255,0.07)" : "transparent", transitionTimingFunction: softSpring }}
      >
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full" style={{ backgroundColor: BRAND.gold }} />}
        <span style={{ color: isActive ? BRAND.gold : hovered ? "#fff" : "rgba(255,255,255,0.5)", transition: "color 0.15s", display: "inline-flex", flexShrink: 0 }}>
          {item.icon}
        </span>
        <span className="flex-1 text-sm font-medium text-left truncate" style={{ color: isActive ? BRAND.gold : hovered ? "#fff" : "rgba(255,255,255,0.85)", transition: "color 0.15s" }}>
          {item.label}
        </span>
        {item.badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.badgeColor || BRAND.accent, color: BRAND.primary }}>
            {item.badge}
          </span>
        )}
        {hasSubItems && (
          <ChevronDown size={14} className="flex-shrink-0" style={{ color: isActive ? BRAND.gold : BRAND.muted, transform: isSubOpen ? "rotate(180deg)" : "rotate(0deg)", transition: `transform 0.3s ${softSpring}` }} />
        )}
      </button>
      {hasSubItems && (
        <div className="overflow-hidden" style={{ maxHeight: isSubOpen ? `${item.subItems!.length * 40 + 8}px` : "0px", opacity: isSubOpen ? 1 : 0, transition: `max-height 0.3s ${softSpring}, opacity 0.25s ease` }}>
          <div className="pt-1 pb-2 flex flex-col gap-0.5">
            {item.subItems!.map((sub) => (
              <SubItemRow key={sub.href} subItem={sub} isActive={pathname === sub.href} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav sections ─────────────────────────────────────────────────────────────
function NavSections({ activeItem, openSubMenu, onToggle, onSetActive, pathname, searchValue, onClose }: {
  activeItem: string; openSubMenu: string | null; onToggle: (id: string) => void;
  onSetActive: (id: string) => void; pathname: string; searchValue: string; onClose?: () => void;
}) {
  return (
    <>
      {ADMIN_NAV.map((section) => {
        const items = searchValue ? section.items.filter((i) => i.label.toLowerCase().includes(searchValue.toLowerCase())) : section.items;
        if (items.length === 0) return null;
        return (
          <div key={section.title} className="flex flex-col gap-1">
            <div className="px-3 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: BRAND.accent }}>{section.title}</span>
            </div>
            {items.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                isSubOpen={openSubMenu === item.id}
                onToggle={() => { onSetActive(item.id); onToggle(item.id); if (onClose && (!item.subItems || item.subItems.length === 0)) onClose(); }}
                pathname={pathname}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

// ─── User footer ──────────────────────────────────────────────────────────────
function UserFooter() {
  const router = useRouter();
  const [signOut, { isLoading }] = useSignOutMutation();

  const handleLogout = async () => {
    try {
      await signOut().unwrap();
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      }
      router.push("/login");
    }
  };

  return (
    <div className="flex-shrink-0 mx-3 mb-4 mt-2 p-3 rounded-xl border flex items-center gap-3" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}30` }}>
        <User size={14} style={{ color: BRAND.gold }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-xs font-semibold truncate">Admin User</div>
        <div className="text-xs truncate" style={{ color: BRAND.muted }}>Super Admin</div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="flex-shrink-0 p-1.5 rounded-lg transition-colors duration-200 hover:bg-white/10 disabled:opacity-50"
        aria-label="Logout"
      >
        <LogOut size={14} style={{ color: BRAND.muted }} />
      </button>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
function DetailPanel({ isExpanded, activeItem, openSubMenu, onToggle, onSetActive }: {
  isExpanded: boolean; activeItem: string; openSubMenu: string | null;
  onToggle: (id: string) => void; onSetActive: (id: string) => void;
}) {
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex flex-col h-full overflow-hidden transition-all duration-500" style={{ width: isExpanded ? "256px" : "0px", opacity: isExpanded ? 1 : 0, transitionTimingFunction: softSpring }}>
      <div className="flex flex-col h-full" style={{ width: "256px" }}>
        <div className="flex items-center gap-3 px-4 pt-5 pb-4 flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}40` }}>
            <span className="text-sm font-bold" style={{ color: BRAND.gold }}>A</span>
          </div>
          <span className="text-white font-bold text-base tracking-tight">AccuBridge</span>
        </div>
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" }}>
            <Search size={14} style={{ color: BRAND.muted }} className="flex-shrink-0" />
            <input type="text" placeholder="Search..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#6B7280] min-w-0" />
          </div>
        </div>
        <div className="mx-3 h-px flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-5">
          <NavSections activeItem={activeItem} openSubMenu={openSubMenu} onToggle={onToggle} onSetActive={onSetActive} pathname={pathname} searchValue={searchValue} />
        </div>
        <UserFooter />
      </div>
    </div>
  );
}

// ─── Icon rail ────────────────────────────────────────────────────────────────
function IconRail({ activeItem, onItemClick, isDetailExpanded, onToggleDetail }: {
  activeItem: string; onItemClick: (id: string) => void; isDetailExpanded: boolean; onToggleDetail: () => void;
}) {
  const allItems = ADMIN_NAV.flatMap((s) => s.items);
  const mainItems = allItems.filter((i) => i.id !== "settings");
  const settingsItem = allItems.find((i) => i.id === "settings");
  const [collapseHovered, setCollapseHovered] = useState(false);

  return (
    <div className="flex flex-col items-center h-full w-16 flex-shrink-0 py-4" style={{ backgroundColor: BRAND.primary }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0 border" style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}30` }}>
        <span className="font-bold text-base" style={{ color: BRAND.gold }}>A</span>
      </div>
      <div className="flex flex-col gap-1 flex-1 w-full items-center overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {mainItems.map((item) => (
          <IconButton key={item.id} item={item} isActive={activeItem === item.id} onClick={() => onItemClick(item.id)} showTooltip={!isDetailExpanded} />
        ))}
      </div>
      <button
        type="button"
        onClick={onToggleDetail}
        onMouseEnter={() => setCollapseHovered(true)}
        onMouseLeave={() => setCollapseHovered(false)}
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 mt-1"
        style={{ color: collapseHovered ? "#ffffff" : "rgba(255,255,255,0.4)", backgroundColor: collapseHovered ? "rgba(255,255,255,0.1)" : "transparent" }}
        aria-label={isDetailExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isDetailExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
      <div className="w-8 h-px my-1.5" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
      {settingsItem && (
        <IconButton item={settingsItem} isActive={activeItem === "settings"} onClick={() => onItemClick("settings")} showTooltip={!isDetailExpanded} />
      )}
    </div>
  );
}

// ─── Mobile overlay ───────────────────────────────────────────────────────────
function MobileOverlay({ isOpen, onClose, activeItem, openSubMenu, onToggle, onSetActive }: {
  isOpen: boolean; onClose: () => void; activeItem: string; openSubMenu: string | null;
  onToggle: (id: string) => void; onSetActive: (id: string) => void;
}) {
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <div className="fixed inset-0 z-40 transition-all duration-300 lg:hidden" style={{ backgroundColor: "rgba(10,36,99,0.7)", backdropFilter: "blur(4px)", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }} onClick={onClose} />
      <div className="fixed left-0 top-0 bottom-0 z-50 flex flex-col w-72 lg:hidden transition-transform duration-500" style={{ background: `linear-gradient(to bottom, #0f1e3a, ${BRAND.dark})`, transform: isOpen ? "translateX(0)" : "translateX(-100%)", transitionTimingFunction: softSpring, boxShadow: isOpen ? "8px 0 40px rgba(0,0,0,0.5)" : "none" }}>
        <div className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}40` }}>
              <span className="text-sm font-bold" style={{ color: BRAND.gold }}>A</span>
            </div>
            <span className="text-white font-bold text-base tracking-tight">AccuBridge</span>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: BRAND.muted }} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input type="text" placeholder="Search..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#6B7280]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-5">
          <NavSections activeItem={activeItem} openSubMenu={openSubMenu} onToggle={onToggle} onSetActive={onSetActive} pathname={pathname} searchValue={searchValue} onClose={onClose} />
        </div>
        <UserFooter />
        <div className="flex-shrink-0 px-4 pb-4 flex flex-wrap gap-1.5">
          {["🔒 FCA", "✅ FIRS", "🏦 Secure"].map((b) => (
            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ color: BRAND.muted, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)" }}>{b}</span>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────
function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div className="flex lg:hidden items-center justify-between px-4 py-3 flex-shrink-0 border-b" style={{ background: `linear-gradient(to right, ${BRAND.primary}, #0f1e3a)`, borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}40` }}>
          <span className="font-bold text-sm" style={{ color: BRAND.gold }}>A</span>
        </div>
        <span className="text-white font-bold text-sm tracking-tight">AccuBridge</span>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.6)" }} aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button type="button" onClick={onMenuOpen} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.8)" }} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function AdminSidebar() {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(() => adminItemFromPath(pathname));
  const [isDetailExpanded, setIsDetailExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  useEffect(() => {
    setActiveItem(adminItemFromPath(pathname));
  }, [pathname]);

  const toggleSubMenu = (id: string) => setOpenSubMenu((prev) => (prev === id ? null : id));

  const handleIconClick = (id: string) => {
    setActiveItem(id);
    if (!isDetailExpanded) setIsDetailExpanded(true);
    setOpenSubMenu((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <MobileTopBar onMenuOpen={() => setIsMobileOpen(true)} />
      <aside className="hidden lg:flex flex-row h-screen flex-shrink-0 sticky top-0 overflow-hidden" style={{ boxShadow: "4px 0 30px rgba(10,36,99,0.4)" }}>
        <IconRail activeItem={activeItem} onItemClick={handleIconClick} isDetailExpanded={isDetailExpanded} onToggleDetail={() => setIsDetailExpanded((s) => !s)} />
        <div className="w-px flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
        <div className="overflow-hidden flex-shrink-0 transition-all duration-500" style={{ background: `linear-gradient(to bottom, #0f1e3a, ${BRAND.dark})`, transitionTimingFunction: softSpring }}>
          <DetailPanel isExpanded={isDetailExpanded} activeItem={activeItem} openSubMenu={openSubMenu} onToggle={toggleSubMenu} onSetActive={setActiveItem} />
        </div>
      </aside>
      <MobileOverlay isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} activeItem={activeItem} openSubMenu={openSubMenu} onToggle={toggleSubMenu} onSetActive={setActiveItem} />
    </>
  );
}

export default AdminSidebar;
