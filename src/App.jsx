import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  LayoutDashboard, ShoppingCart, Package, TrendingUp, Wallet, Megaphone, Undo2,
  Warehouse, ClipboardList, Activity, Tag, Target, ShoppingBag, Users, Headphones,
  Bell, FileText, Zap, Bot, Settings, Search, Moon, SunMedium, Menu, X, Send,
  Sparkles, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronRight, MapPin,
  Percent, RefreshCw, Star, Clock, CheckCircle2, AlertTriangle, Info, TrendingDown,
  Store, Filter, CalendarDays, IndianRupee, PlugZap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* THEME + HELPERS                                                            */
/* -------------------------------------------------------------------------- */

function useTheme(dark) {
  return useMemo(() => ({
    dark,
    page: dark ? "bg-slate-950" : "bg-slate-50",
    surface: dark ? "bg-slate-900/70" : "bg-white/80",
    surfaceSolid: dark ? "bg-slate-900" : "bg-white",
    surfaceAlt: dark ? "bg-slate-800/60" : "bg-slate-100",
    border: dark ? "border-slate-800" : "border-slate-200",
    text: dark ? "text-slate-100" : "text-slate-900",
    muted: dark ? "text-slate-400" : "text-slate-500",
    mutedSoft: dark ? "text-slate-500" : "text-slate-400",
    hoverSurface: dark ? "hover:bg-slate-800/70" : "hover:bg-slate-100",
    ring: dark ? "ring-slate-800" : "ring-slate-200",
    chartGrid: dark ? "#1e293b" : "#e2e8f0",
    chartMuted: dark ? "#64748b" : "#94a3b8",
    chartAxis: dark ? "#94a3b8" : "#64748b",
    tooltipBg: dark ? "#0f172a" : "#ffffff",
    tooltipBorder: dark ? "#1e293b" : "#e2e8f0",
    tooltipText: dark ? "#e2e8f0" : "#0f172a",
  }), [dark]);
}

const cx = (...a) => a.filter(Boolean).join(" ");

const COLORS = {
  amber: "#f59e0b", amberSoft: "#fbbf24",
  teal: "#14b8a6", tealSoft: "#2dd4bf",
  rose: "#f43f5e", roseSoft: "#fb7185",
  violet: "#8b5cf6", violetSoft: "#a78bfa",
  sky: "#0ea5e9", slate: "#64748b",
};

function formatINR(v, opts = {}) {
  const sign = v < 0 ? "-" : "";
  v = Math.abs(v);
  let out;
  if (v >= 1e7) out = (v / 1e7).toFixed(opts.dp ?? 2) + " Cr";
  else if (v >= 1e5) out = (v / 1e5).toFixed(opts.dp ?? 2) + " L";
  else if (v >= 1e3) out = (v / 1e3).toFixed(opts.dp ?? 1) + "K";
  else out = v.toFixed(0);
  return sign + "\u20b9" + out;
}

function formatNum(v) {
  return new Intl.NumberFormat("en-IN").format(Math.round(v));
}

/* -------------------------------------------------------------------------- */
/* MOCK DATA                                                                  */
/* -------------------------------------------------------------------------- */

const MARKETPLACES = [
  { name: "Amazon", value: 36, color: COLORS.amber },
  { name: "Flipkart", value: 24, color: COLORS.sky },
  { name: "Meesho", value: 13, color: COLORS.violet },
  { name: "Myntra", value: 8, color: COLORS.rose },
  { name: "Quick Commerce", value: 11, color: COLORS.teal },
  { name: "D2C + Others", value: 8, color: COLORS.slate },
];

function genTrend(days, base, amp, growth) {
  return Array.from({ length: days }, (_, i) => {
    const noise = Math.sin(i * 1.3) * amp * 0.4 + Math.cos(i * 0.7) * amp * 0.3;
    const val = base + growth * i + noise + (Math.random() - 0.5) * amp * 0.3;
    return {
      day: `${i + 1}`,
      label: new Date(2026, 5, i + 1).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      revenue: Math.max(0, Math.round(val)),
      lastPeriod: Math.max(0, Math.round(val * 0.82 - amp * 0.2)),
    };
  });
}
const REVENUE_TREND = genTrend(14, 480000, 60000, 6000);

const KPIS = [
  { id: "rev", label: "Revenue (MTD)", value: 8420000, delta: 12.4, positive: true, fmt: "inr", spark: REVENUE_TREND.map(d => d.revenue), icon: IndianRupee },
  { id: "orders", label: "Orders (MTD)", value: 18640, delta: 8.1, positive: true, fmt: "num", spark: genTrend(10, 1200, 200, 30).map(d => d.revenue), icon: ShoppingCart },
  { id: "profit", label: "Net Profit", value: 1310000, delta: -3.2, positive: false, fmt: "inr", spark: genTrend(10, 90000, 15000, -800).map(d => d.revenue), icon: Wallet },
  { id: "roas", label: "ROAS (Blended)", value: 4.6, delta: 5.6, positive: true, fmt: "x", spark: genTrend(10, 4, 0.6, 0.05).map(d => d.revenue / 100000), icon: Target },
  { id: "acos", label: "ACOS", value: 18.2, delta: 2.1, positive: false, fmt: "pct", spark: genTrend(10, 18, 2, 0.2).map(d => d.revenue / 30000), icon: Percent },
  { id: "buybox", label: "Buy Box %", value: 87.4, delta: 1.8, positive: true, fmt: "pct", spark: genTrend(10, 85, 3, 0.3).map(d => d.revenue / 15000), icon: Star },
  { id: "inv", label: "Inventory Value", value: 21600000, delta: 4.5, positive: true, fmt: "inr", spark: genTrend(10, 2000000, 100000, 20000).map(d => d.revenue), icon: Package },
  { id: "repeat", label: "Repeat Customers", value: 34.8, delta: 6.9, positive: true, fmt: "pct", spark: genTrend(10, 32, 3, 0.4).map(d => d.revenue / 15000), icon: Users },
];

const TOP_PRODUCTS = [
  { name: "Milton Thermosteel Flip Lid Flask 1L", sku: "MLT-TS-1000", units: 3120, revenue: 1870000, trend: 14.2 },
  { name: "Milton Pro Elfin Lunch Box 3pc", sku: "MLT-PE-300", units: 2440, revenue: 1460000, trend: 9.8 },
  { name: "Milton Kool Slider Water Bottle 750ml", sku: "MLT-KS-750", units: 2105, revenue: 980000, trend: -4.1 },
  { name: "Milton Thermo Casserole 1.5L", sku: "MLT-TC-1500", units: 1680, revenue: 1210000, trend: 21.5 },
  { name: "Milton Steel Insulated Jug 2.5L", sku: "MLT-SJ-2500", units: 1240, revenue: 870000, trend: 3.4 },
];

const TOP_CITIES = [
  { city: "Bengaluru", state: "KA", orders: 2840, revenue: 1620000 },
  { city: "Delhi NCR", state: "DL", orders: 2610, revenue: 1510000 },
  { city: "Mumbai", state: "MH", orders: 2340, revenue: 1380000 },
  { city: "Hyderabad", state: "TG", orders: 1780, revenue: 980000 },
  { city: "Pune", state: "MH", orders: 1520, revenue: 840000 },
  { city: "Chennai", state: "TN", orders: 1310, revenue: 720000 },
];

const AI_INSIGHTS = [
  { id: 1, sev: "critical", icon: AlertTriangle, title: "Revenue dip on Flipkart, Bengaluru cluster", body: "Sales fell 18% over 3 days due to a stock-out on MLT-KS-750 across 2 fulfilment centres.", cta: "Create transfer order" },
  { id: 2, sev: "warning", icon: TrendingDown, title: "ACOS rising on \u201csteel lunch box\u201d keyword", body: "CPC increased 22% week-on-week while conversion held flat. Budget efficiency is dropping.", cta: "Review campaign" },
  { id: 3, sev: "info", icon: Info, title: "Reorder recommended for 4 fast-moving SKUs", body: "Coverage will fall below 7 days within 5 days at the current sell-through rate.", cta: "View purchase plan" },
  { id: 4, sev: "positive", icon: CheckCircle2, title: "Casserole 1.5L outperforming forecast by 21%", body: "Consider a lightning deal on Amazon to capture peak demand before competitors react.", cta: "Plan a deal" },
  { id: 5, sev: "warning", icon: AlertTriangle, title: "Buy Box share slipping on 3 Myntra listings", body: "A competitor priced 6 percent below your listings for two consecutive days.", cta: "Review pricing" },
  { id: 6, sev: "info", icon: Sparkles, title: "30-day forecast: demand up 9% pre-festive season", body: "Historical patterns plus current velocity suggest building safety stock by mid next week.", cta: "Open forecast" },
];

const TICKER_ITEMS = [
  "Amazon revenue up 14% vs last 7 days",
  "3 SKUs projected to stock out within 5 days",
  "ACOS on Flipkart campaigns trending above target",
  "Buy Box share recovered to 87.4% after price sync",
  "Meesho returns rate down 2.1 points this week",
  "Recommended reorder: 4,200 units across 6 SKUs",
  "Festive season demand forecast: +9% over baseline",
];

const ORDERS = [
  { id: "OD-88213", customer: "R. Sharma", mp: "Amazon", item: "Thermosteel Flask 1L", amount: 649, status: "Delivered", date: "3 Jul" },
  { id: "OD-88214", customer: "A. Iyer", mp: "Flipkart", item: "Lunch Box 3pc", amount: 899, status: "Shipped", date: "3 Jul" },
  { id: "OD-88215", customer: "P. Verma", mp: "Meesho", item: "Water Bottle 750ml", amount: 349, status: "Pending", date: "4 Jul" },
  { id: "OD-88216", customer: "S. Nair", mp: "Myntra", item: "Casserole 1.5L", amount: 1099, status: "Packed", date: "4 Jul" },
  { id: "OD-88217", customer: "K. Das", mp: "Amazon", item: "Insulated Jug 2.5L", amount: 1249, status: "Cancelled", date: "4 Jul" },
  { id: "OD-88218", customer: "M. Khan", mp: "Blinkit", item: "Water Bottle 750ml", amount: 349, status: "Delivered", date: "4 Jul" },
  { id: "OD-88219", customer: "T. Roy", mp: "Flipkart", item: "Thermosteel Flask 1L", amount: 649, status: "RTO", date: "2 Jul" },
];

const INVENTORY = [
  { sku: "MLT-TS-1000", name: "Thermosteel Flask 1L", cls: "A", coverage: 6, drr: 220, status: "Low" },
  { sku: "MLT-PE-300", name: "Lunch Box 3pc", cls: "A", coverage: 18, drr: 175, status: "Healthy" },
  { sku: "MLT-KS-750", name: "Water Bottle 750ml", cls: "A", coverage: 2, drr: 195, status: "Critical" },
  { sku: "MLT-TC-1500", name: "Casserole 1.5L", cls: "B", coverage: 24, drr: 96, status: "Healthy" },
  { sku: "MLT-SJ-2500", name: "Insulated Jug 2.5L", cls: "B", coverage: 41, drr: 58, status: "Overstock" },
  { sku: "MLT-CX-450", name: "Coffee Mug 450ml", cls: "C", coverage: 88, drr: 12, status: "Dead Stock" },
];

const FINANCE_WATERFALL = [
  { stage: "Gross Sales", value: 8420000 },
  { stage: "Marketplace Fees", value: -1180000 },
  { stage: "Ad Spend", value: -640000 },
  { stage: "Shipping", value: -510000 },
  { stage: "Refunds", value: -390000 },
  { stage: "Storage + Other", value: -230000 },
  { stage: "Net Profit", value: 1310000 },
];

const CAMPAIGNS = [
  { name: "Amazon - Brand Defense", mp: "Amazon", spend: 84000, sales: 512000, acos: 16.4, roas: 6.1, status: "Healthy" },
  { name: "Flipkart - Category Push", mp: "Flipkart", spend: 61000, sales: 268000, acos: 22.8, roas: 4.4, status: "Watch" },
  { name: "Amazon - Lunch Box Launch", mp: "Amazon", spend: 39000, sales: 121000, acos: 32.2, roas: 3.1, status: "Underperforming" },
  { name: "Myntra - Festive Sale", mp: "Myntra", spend: 22000, sales: 143000, acos: 15.4, roas: 6.5, status: "Healthy" },
];

const RETURN_REASONS = [
  { reason: "Size / fit mismatch", value: 28, color: COLORS.rose },
  { reason: "Damaged in transit", value: 22, color: COLORS.amber },
  { reason: "Changed mind", value: 19, color: COLORS.violet },
  { reason: "Wrong item delivered", value: 16, color: COLORS.sky },
  { reason: "Quality concern", value: 15, color: COLORS.teal },
];

const CUSTOMER_SEGMENTS = [
  { segment: "New", count: 12400, share: 41, color: COLORS.sky },
  { segment: "Repeat (2-4 orders)", count: 9800, share: 33, color: COLORS.teal },
  { segment: "Loyal (5+ orders)", count: 5100, share: 17, color: COLORS.amber },
  { segment: "At risk / lapsed", count: 2700, share: 9, color: COLORS.rose },
];

const NAV_SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview", built: true },
  { id: "orders", label: "Orders", icon: ShoppingCart, group: "Operations", built: true },
  { id: "inventory", label: "Inventory", icon: Package, group: "Operations", built: true },
  { id: "sales", label: "Sales", icon: TrendingUp, group: "Overview", built: true },
  { id: "finance", label: "Finance", icon: Wallet, group: "Overview", built: true },
  { id: "advertising", label: "Advertising", icon: Megaphone, group: "Growth", built: true },
  { id: "returns", label: "Returns", icon: Undo2, group: "Operations", built: true },
  { id: "warehouse", label: "Warehouse", icon: Warehouse, group: "Operations", built: false },
  { id: "purchase", label: "Purchase Planning", icon: ClipboardList, group: "Operations", built: false },
  { id: "forecasting", label: "Forecasting", icon: Activity, group: "Growth", built: false },
  { id: "pricing", label: "Pricing", icon: Tag, group: "Growth", built: false },
  { id: "competition", label: "Competition", icon: Target, group: "Growth", built: false },
  { id: "products", label: "Products", icon: ShoppingBag, group: "Growth", built: false },
  { id: "customers", label: "Customer Analytics", icon: Users, group: "Growth", built: true },
  { id: "support", label: "Support Tickets", icon: Headphones, group: "Operations", built: false },
  { id: "alerts", label: "Alerts", icon: Bell, group: "Overview", built: false },
  { id: "reports", label: "Reports", icon: FileText, group: "Overview", built: false },
  { id: "automation", label: "Automation", icon: Zap, group: "Growth", built: false },
  { id: "ai", label: "AI Assistant", icon: Bot, group: "AI", built: true },
  { id: "settings", label: "Settings", icon: Settings, group: "AI", built: true },
];

const NAV_GROUPS = ["Overview", "Operations", "Growth", "AI"];

/* -------------------------------------------------------------------------- */
/* SMALL UI PRIMITIVES                                                        */
/* -------------------------------------------------------------------------- */

function Sparkline({ data, color, T }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={points} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function formatKpi(v, fmt) {
  if (fmt === "inr") return formatINR(v);
  if (fmt === "num") return formatNum(v);
  if (fmt === "pct") return v.toFixed(1) + "%";
  if (fmt === "x") return v.toFixed(1) + "x";
  return v;
}

function KpiCard({ k, T }) {
  const Icon = k.icon;
  const color = k.positive ? COLORS.teal : COLORS.rose;
  return (
    <div className={cx("rounded-2xl border p-4 flex flex-col gap-3 transition-colors", T.surface, T.border, T.hoverSurface)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cx("text-xs font-medium", T.muted)}>{k.label}</p>
          <p className="text-xl font-semibold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatKpi(k.value, k.fmt)}
          </p>
        </div>
        <div className={cx("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", T.surfaceAlt)}>
          <Icon size={16} className={T.muted} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={cx("inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
          k.positive ? "bg-teal-500/10 text-teal-500" : "bg-rose-500/10 text-rose-500")}>
          {k.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(k.delta)}%
        </span>
        <div className="w-20">
          <Sparkline data={k.spark} color={color} T={T} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, action, children, T, className }) {
  return (
    <div className={cx("rounded-2xl border p-5", T.surface, T.border, className)}>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className={cx("text-sm font-semibold", T.text)}>{title}</h3>
          {subtitle && <p className={cx("text-xs mt-0.5", T.muted)}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label, T, fmt = "inr" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{ background: T.tooltipBg, borderColor: T.tooltipBorder, color: T.tooltipText }}>
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.stroke || p.fill }}>
          {p.name}: {fmt === "inr" ? formatINR(p.value) : formatNum(p.value)}
        </p>
      ))}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Delivered: "bg-teal-500/10 text-teal-500",
    Shipped: "bg-sky-500/10 text-sky-500",
    Packed: "bg-violet-500/10 text-violet-500",
    Pending: "bg-amber-500/10 text-amber-500",
    Cancelled: "bg-rose-500/10 text-rose-500",
    RTO: "bg-rose-500/10 text-rose-500",
    Healthy: "bg-teal-500/10 text-teal-500",
    Watch: "bg-amber-500/10 text-amber-500",
    Underperforming: "bg-rose-500/10 text-rose-500",
    Low: "bg-amber-500/10 text-amber-500",
    Critical: "bg-rose-500/10 text-rose-500",
    Overstock: "bg-sky-500/10 text-sky-500",
    "Dead Stock": "bg-slate-500/10 text-slate-400",
  };
  return (
    <span className={cx("text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap", map[status] || "bg-slate-500/10 text-slate-400")}>
      {status}
    </span>
  );
}

function AiInsightCard({ insight, T }) {
  const Icon = insight.icon;
  const colorMap = { critical: COLORS.rose, warning: COLORS.amber, info: COLORS.sky, positive: COLORS.teal };
  const c = colorMap[insight.sev];
  return (
    <div className={cx("rounded-xl border p-4 flex gap-3", T.surfaceAlt, T.border)}>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c + "1a" }}>
        <Icon size={16} style={{ color: c }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cx("text-sm font-medium leading-snug", T.text)}>{insight.title}</p>
        <p className={cx("text-xs mt-1 leading-relaxed", T.muted)}>{insight.body}</p>
        <button className={cx("text-xs font-medium mt-2 inline-flex items-center gap-1", T.dark ? "text-amber-400" : "text-amber-600")}>
          {insight.cta} <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD PAGE                                                             */
/* -------------------------------------------------------------------------- */

function DashboardPage({ T }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map(k => <KpiCard key={k.id} k={k} T={T} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Revenue trend" subtitle="Last 14 days vs previous period" T={T} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={REVENUE_TREND} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={T.chartGrid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: T.chartAxis }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 11, fill: T.chartAxis }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v, { dp: 0 })} width={54} />
              <Tooltip content={<CustomTooltip T={T} />} />
              <Area type="monotone" dataKey="lastPeriod" name="Previous period" stroke={T.chartMuted} fill="transparent" strokeDasharray="4 4" strokeWidth={1.5} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.amber} fill="url(#revFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Sales by marketplace" subtitle="Share of revenue, MTD" T={T}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={MARKETPLACES} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {MARKETPLACES.map((m, i) => <Cell key={i} fill={m.color} stroke="none" />)}
              </Pie>
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div className="rounded-lg border px-3 py-2 text-xs shadow-lg" style={{ background: T.tooltipBg, borderColor: T.tooltipBorder, color: T.tooltipText }}>
                  {payload[0].name}: {payload[0].value}%
                </div>
              ) : null} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-1">
            {MARKETPLACES.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} />
                <span className={T.muted}>{m.name}</span>
                <span className={cx("ml-auto font-medium", T.text)}>{m.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="AI insights" subtitle="Generated from live order, ad and inventory signals" T={T} className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-3">
            {AI_INSIGHTS.map(ins => <AiInsightCard key={ins.id} insight={ins} T={T} />)}
          </div>
        </SectionCard>

        <div className="flex flex-col gap-5">
          <SectionCard title="Top products" subtitle="By revenue, MTD" T={T}>
            <div className="flex flex-col gap-3">
              {TOP_PRODUCTS.slice(0, 4).map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cx("h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0", T.surfaceAlt, T.muted)}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cx("text-xs font-medium truncate", T.text)}>{p.name}</p>
                    <p className={cx("text-[11px]", T.muted)}>{p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatINR(p.revenue)}</p>
                    <p className={cx("text-[11px]", p.trend >= 0 ? "text-teal-500" : "text-rose-500")}>{p.trend >= 0 ? "+" : ""}{p.trend}%</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Top cities" subtitle="By orders, MTD" T={T}>
            <div className="flex flex-col gap-2.5">
              {TOP_CITIES.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <MapPin size={13} className={T.mutedSoft} />
                  <span className={T.text}>{c.city}</span>
                  <span className={cx(T.mutedSoft, "text-[11px]")}>{c.state}</span>
                  <span className={cx("ml-auto font-medium tabular-nums", T.muted)}>{formatNum(c.orders)} orders</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ORDERS PAGE                                                                */
/* -------------------------------------------------------------------------- */

function OrdersPage({ T }) {
  const counts = [
    { label: "Live orders", value: 18640, icon: ShoppingCart, color: COLORS.sky },
    { label: "Pending", value: 412, icon: Clock, color: COLORS.amber },
    { label: "Late shipment", value: 38, icon: AlertTriangle, color: COLORS.rose },
    { label: "OTIF", value: "96.2%", icon: CheckCircle2, color: COLORS.teal },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map((c, i) => (
          <div key={i} className={cx("rounded-2xl border p-4 flex items-center gap-3", T.surface, T.border)}>
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.color + "1a" }}>
              <c.icon size={16} style={{ color: c.color }} />
            </div>
            <div>
              <p className={cx("text-xs", T.muted)}>{c.label}</p>
              <p className="text-lg font-semibold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{typeof c.value === "number" ? formatNum(c.value) : c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Live order feed" subtitle="Most recent orders across every marketplace" T={T}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className={cx("text-left border-b", T.border)}>
                {["Order ID", "Customer", "Marketplace", "Item", "Amount", "Status", "Date"].map(h => (
                  <th key={h} className={cx("px-5 py-2 font-medium", T.muted)}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o, i) => (
                <tr key={i} className={cx("border-b last:border-0", T.border, T.hoverSurface)}>
                  <td className={cx("px-5 py-2.5 font-medium", T.text)} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</td>
                  <td className={cx("px-5 py-2.5", T.muted)}>{o.customer}</td>
                  <td className={cx("px-5 py-2.5", T.muted)}>{o.mp}</td>
                  <td className={cx("px-5 py-2.5", T.muted)}>{o.item}</td>
                  <td className={cx("px-5 py-2.5 tabular-nums", T.text)}>{"\u20b9" + o.amount}</td>
                  <td className="px-5 py-2.5"><StatusPill status={o.status} /></td>
                  <td className={cx("px-5 py-2.5", T.muted)}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INVENTORY PAGE                                                             */
/* -------------------------------------------------------------------------- */

function InventoryPage({ T }) {
  const abc = [
    { cls: "A - High value", pct: 62, color: COLORS.amber },
    { cls: "B - Medium value", pct: 27, color: COLORS.sky },
    { cls: "C - Low value", pct: 11, color: COLORS.slate },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="ABC analysis" subtitle="Inventory value distribution" T={T}>
          <div className="flex flex-col gap-3 mt-1">
            {abc.map((a, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={T.muted}>{a.cls}</span>
                  <span className={cx("font-medium", T.text)}>{a.pct}%</span>
                </div>
                <div className={cx("h-2 rounded-full overflow-hidden", T.surfaceAlt)}>
                  <div className="h-full rounded-full" style={{ width: a.pct + "%", background: a.color }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Inventory value" subtitle="Across all warehouses and marketplaces" T={T}>
          <p className="text-2xl font-semibold tabular-nums mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatINR(21600000)}</p>
          <p className="text-xs text-teal-500 mt-1 flex items-center gap-1"><ArrowUpRight size={12} /> 4.5% vs last month</p>
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div><p className={T.muted}>Sell-through</p><p className={cx("font-medium mt-0.5", T.text)}>68.4%</p></div>
            <div><p className={T.muted}>Turnover ratio</p><p className={cx("font-medium mt-0.5", T.text)}>5.2x</p></div>
            <div><p className={T.muted}>Fill rate</p><p className={cx("font-medium mt-0.5", T.text)}>94.1%</p></div>
            <div><p className={T.muted}>Avg stock age</p><p className={cx("font-medium mt-0.5", T.text)}>34 days</p></div>
          </div>
        </SectionCard>
        <SectionCard title="AI recommendation" subtitle="Reorder & transfer" T={T}>
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className={cx("text-xs leading-relaxed", T.muted)}>
              Move 400 units of MLT-KS-750 from the Bhiwandi warehouse to Bengaluru FC to prevent a stock-out within 3 days, and raise a purchase order for 2,200 units against your primary vendor.
            </p>
          </div>
          <button className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-400 text-slate-900">Generate purchase order</button>
        </SectionCard>
      </div>

      <SectionCard title="SKU health" subtitle="Coverage days, classification and recommended action" T={T}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className={cx("text-left border-b", T.border)}>
                {["SKU", "Product", "Class", "Coverage (days)", "Daily run rate", "Status"].map(h => (
                  <th key={h} className={cx("px-5 py-2 font-medium", T.muted)}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map((r, i) => (
                <tr key={i} className={cx("border-b last:border-0", T.border, T.hoverSurface)}>
                  <td className={cx("px-5 py-2.5 font-medium", T.text)} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.sku}</td>
                  <td className={cx("px-5 py-2.5", T.muted)}>{r.name}</td>
                  <td className={cx("px-5 py-2.5", T.muted)}>{r.cls}</td>
                  <td className={cx("px-5 py-2.5 tabular-nums", T.text)}>{r.coverage}</td>
                  <td className={cx("px-5 py-2.5 tabular-nums", T.muted)}>{r.drr}/day</td>
                  <td className="px-5 py-2.5"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SALES PAGE                                                                 */
/* -------------------------------------------------------------------------- */

function SalesPage({ T }) {
  const hourly = Array.from({ length: 12 }, (_, i) => ({
    hour: `${(i * 2).toString().padStart(2, "0")}:00`,
    orders: Math.round(40 + 60 * Math.sin((i / 12) * Math.PI) + Math.random() * 15),
  }));
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Hourly order pattern" subtitle="Today, all marketplaces" T={T}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourly} margin={{ left: -16 }}>
              <CartesianGrid stroke={T.chartGrid} vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: T.chartAxis }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fontSize: 11, fill: T.chartAxis }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip T={T} fmt="num" />} />
              <Bar dataKey="orders" name="Orders" fill={COLORS.sky} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Weekly trend" subtitle="Revenue, this week vs last week" T={T}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={REVENUE_TREND.slice(0, 7)} margin={{ left: -16 }}>
              <CartesianGrid stroke={T.chartGrid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: T.chartAxis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.chartAxis }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v, { dp: 0 })} width={54} />
              <Tooltip content={<CustomTooltip T={T} />} />
              <Line type="monotone" dataKey="revenue" name="This week" stroke={COLORS.teal} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="lastPeriod" name="Last week" stroke={T.chartMuted} strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
      <SectionCard title="Top products by revenue" subtitle="MTD across all channels" T={T}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-xs min-w-[560px]">
            <thead>
              <tr className={cx("text-left border-b", T.border)}>
                {["Product", "SKU", "Units sold", "Revenue", "Trend"].map(h => (
                  <th key={h} className={cx("px-5 py-2 font-medium", T.muted)}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map((p, i) => (
                <tr key={i} className={cx("border-b last:border-0", T.border, T.hoverSurface)}>
                  <td className={cx("px-5 py-2.5", T.text)}>{p.name}</td>
                  <td className={cx("px-5 py-2.5", T.muted)} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.sku}</td>
                  <td className={cx("px-5 py-2.5 tabular-nums", T.muted)}>{formatNum(p.units)}</td>
                  <td className={cx("px-5 py-2.5 tabular-nums font-medium", T.text)}>{formatINR(p.revenue)}</td>
                  <td className={cx("px-5 py-2.5", p.trend >= 0 ? "text-teal-500" : "text-rose-500")}>{p.trend >= 0 ? "+" : ""}{p.trend}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FINANCE PAGE                                                               */
/* -------------------------------------------------------------------------- */

function FinancePage({ T }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross revenue", value: 8420000, color: COLORS.sky },
          { label: "Total deductions", value: -2950000, color: COLORS.rose },
          { label: "Net profit", value: 1310000, color: COLORS.teal },
          { label: "Net margin", value: "15.6%", color: COLORS.amber },
        ].map((c, i) => (
          <div key={i} className={cx("rounded-2xl border p-4", T.surface, T.border)}>
            <p className={cx("text-xs", T.muted)}>{c.label}</p>
            <p className="text-lg font-semibold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: c.color }}>
              {typeof c.value === "number" ? formatINR(c.value) : c.value}
            </p>
          </div>
        ))}
      </div>
      <SectionCard title="Profit waterfall" subtitle="Gross sales to net profit, MTD" T={T}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={FINANCE_WATERFALL} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid stroke={T.chartGrid} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: T.chartAxis }} axisLine={false} tickLine={false} tickFormatter={v => formatINR(v, { dp: 0 })} />
            <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: T.chartAxis }} axisLine={false} tickLine={false} width={120} />
            <Tooltip content={<CustomTooltip T={T} />} />
            <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]}>
              {FINANCE_WATERFALL.map((d, i) => (
                <Cell key={i} fill={d.value < 0 ? COLORS.rose : COLORS.teal} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
      <SectionCard title="Settlement status" subtitle="Pending vs received across marketplaces" T={T}>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Received", value: 6120000, color: COLORS.teal },
            { label: "Pending settlement", value: 1840000, color: COLORS.amber },
            { label: "Expected next cycle", value: 460000, color: COLORS.sky },
          ].map((s, i) => (
            <div key={i} className={cx("rounded-xl p-4", T.surfaceAlt)}>
              <p className={cx("text-xs", T.muted)}>{s.label}</p>
              <p className="text-base font-semibold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.color }}>{formatINR(s.value)}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ADVERTISING PAGE                                                           */
/* -------------------------------------------------------------------------- */

function AdvertisingPage({ T }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ad spend (MTD)", value: formatINR(640000), color: COLORS.rose },
          { label: "Ad-attributed sales", value: formatINR(3120000), color: COLORS.teal },
          { label: "Blended ROAS", value: "4.6x", color: COLORS.amber },
          { label: "Blended ACOS", value: "18.2%", color: COLORS.sky },
        ].map((c, i) => (
          <div key={i} className={cx("rounded-2xl border p-4", T.surface, T.border)}>
            <p className={cx("text-xs", T.muted)}>{c.label}</p>
            <p className="text-lg font-semibold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Campaign performance" subtitle="Spend, sales and efficiency by campaign" T={T}
        action={<button className={cx("text-xs font-medium flex items-center gap-1", T.dark ? "text-amber-400" : "text-amber-600")}><Sparkles size={12} /> AI budget suggestion</button>}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className={cx("text-left border-b", T.border)}>
                {["Campaign", "Marketplace", "Spend", "Sales", "ACOS", "ROAS", "Status"].map(h => (
                  <th key={h} className={cx("px-5 py-2 font-medium", T.muted)}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c, i) => (
                <tr key={i} className={cx("border-b last:border-0", T.border, T.hoverSurface)}>
                  <td className={cx("px-5 py-2.5", T.text)}>{c.name}</td>
                  <td className={cx("px-5 py-2.5", T.muted)}>{c.mp}</td>
                  <td className={cx("px-5 py-2.5 tabular-nums", T.muted)}>{formatINR(c.spend)}</td>
                  <td className={cx("px-5 py-2.5 tabular-nums font-medium", T.text)}>{formatINR(c.sales)}</td>
                  <td className={cx("px-5 py-2.5 tabular-nums", T.muted)}>{c.acos}%</td>
                  <td className={cx("px-5 py-2.5 tabular-nums", T.muted)}>{c.roas}x</td>
                  <td className="px-5 py-2.5"><StatusPill status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RETURNS PAGE                                                               */
/* -------------------------------------------------------------------------- */

function ReturnsPage({ T }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="grid grid-cols-2 gap-4 lg:col-span-2 content-start">
        {[
          { label: "Return rate", value: "6.8%", color: COLORS.rose },
          { label: "Refund amount (MTD)", value: formatINR(390000), color: COLORS.amber },
          { label: "Replacement rate", value: "2.1%", color: COLORS.sky },
          { label: "Fraud flags", value: "7", color: COLORS.violet },
        ].map((c, i) => (
          <div key={i} className={cx("rounded-2xl border p-4", T.surface, T.border)}>
            <p className={cx("text-xs", T.muted)}>{c.label}</p>
            <p className="text-lg font-semibold tabular-nums mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: c.color }}>{c.value}</p>
          </div>
        ))}
        <SectionCard title="AI return prediction" subtitle="Next 30 days" T={T} className="col-span-2">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className={cx("text-xs leading-relaxed", T.muted)}>
              Return rate for the Water Bottle 750ml is projected to rise to 9.1% due to a packaging change flagged in recent reviews. Consider reverting to the prior box insert.
            </p>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Top return reasons" subtitle="Share of total returns" T={T}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={RETURN_REASONS} dataKey="value" nameKey="reason" innerRadius={50} outerRadius={80} paddingAngle={3}>
              {RETURN_REASONS.map((r, i) => <Cell key={i} fill={r.color} stroke="none" />)}
            </Pie>
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="rounded-lg border px-3 py-2 text-xs shadow-lg" style={{ background: T.tooltipBg, borderColor: T.tooltipBorder, color: T.tooltipText }}>
                {payload[0].name}: {payload[0].value}%
              </div>
            ) : null} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 mt-1">
          {RETURN_REASONS.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: r.color }} />
              <span className={T.muted}>{r.reason}</span>
              <span className={cx("ml-auto font-medium", T.text)}>{r.value}%</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CUSTOMER ANALYTICS PAGE                                                    */
/* -------------------------------------------------------------------------- */

function CustomersPage({ T }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Customer segments" subtitle="By order frequency" T={T} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CUSTOMER_SEGMENTS} margin={{ left: -16 }}>
              <CartesianGrid stroke={T.chartGrid} vertical={false} />
              <XAxis dataKey="segment" tick={{ fontSize: 10, fill: T.chartAxis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.chartAxis }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip T={T} fmt="num" />} />
              <Bar dataKey="count" name="Customers" radius={[4, 4, 0, 0]}>
                {CUSTOMER_SEGMENTS.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Lifetime value" subtitle="Blended average" T={T}>
          <p className="text-2xl font-semibold tabular-nums mt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatINR(4820)}</p>
          <p className="text-xs text-teal-500 mt-1 flex items-center gap-1"><ArrowUpRight size={12} /> 6.9% vs last quarter</p>
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div><p className={T.muted}>Repeat rate</p><p className={cx("font-medium mt-0.5", T.text)}>34.8%</p></div>
            <div><p className={T.muted}>NPS</p><p className={cx("font-medium mt-0.5", T.text)}>+42</p></div>
            <div><p className={T.muted}>Avg rating</p><p className={cx("font-medium mt-0.5", T.text)}>4.3 / 5</p></div>
            <div><p className={T.muted}>Sentiment</p><p className="font-medium mt-0.5 text-teal-500">Positive</p></div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Retention cohort" subtitle="Percent of customers still ordering, by month since first order" T={T}>
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-xs min-w-[560px] text-center">
            <thead>
              <tr className={cx("border-b", T.border)}>
                <th className={cx("px-5 py-2 text-left font-medium", T.muted)}>Cohort</th>
                {["M0", "M1", "M2", "M3", "M4"].map(h => <th key={h} className={cx("px-3 py-2 font-medium", T.muted)}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {["Feb 2026", "Mar 2026", "Apr 2026", "May 2026"].map((row, ri) => (
                <tr key={ri} className={cx("border-b last:border-0", T.border)}>
                  <td className={cx("px-5 py-2 text-left", T.muted)}>{row}</td>
                  {[100, 62, 48, 41, 37].slice(0, 5 - 0).map((v, ci) => {
                    const val = Math.max(20, v - ri * 4 + (Math.random() * 4 - 2));
                    const alpha = Math.min(0.9, val / 100 + 0.1);
                    return (
                      <td key={ci} className="px-3 py-2 font-medium" style={{ background: `rgba(20,184,166,${ci === 0 ? 0.15 : alpha * 0.4})` }}>
                        {ci <= 4 - ri && ri + ci <= 4 ? Math.round(val) + "%" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SETTINGS PAGE                                                              */
/* -------------------------------------------------------------------------- */

function SettingsPage({ T, dark, setDark }) {
  const [toggles, setToggles] = useState({ lowStock: true, priceChange: true, dailySummary: true, whatsapp: false });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard title="Appearance" subtitle="Choose how SellerOS AI looks on this device" T={T}>
        <div className="flex gap-3">
          {[{ id: false, label: "Light", icon: SunMedium }, { id: true, label: "Dark", icon: Moon }].map(opt => (
            <button key={opt.label} onClick={() => setDark(opt.id)}
              className={cx("flex-1 rounded-xl border p-4 flex flex-col items-center gap-2 transition-colors",
                T.border, dark === opt.id ? "ring-2 ring-amber-400" : T.hoverSurface)}>
              <opt.icon size={18} className={T.muted} />
              <span className={cx("text-xs font-medium", T.text)}>{opt.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Connected marketplaces" subtitle="Manage sync status" T={T}>
        <div className="flex flex-col gap-2.5">
          {MARKETPLACES.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <PlugZap size={13} className="text-teal-500" />
              <span className={T.text}>{m.name}</span>
              <span className={cx("ml-auto", T.muted)}>Connected</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Automation alerts" subtitle="Choose what triggers a notification" T={T} className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: "lowStock", label: "Low stock alert", desc: "Notify when coverage falls below 5 days" },
            { key: "priceChange", label: "Competitor price change", desc: "Notify when a competitor undercuts your price" },
            { key: "dailySummary", label: "Daily executive summary", desc: "Send an AI-generated summary every morning" },
            { key: "whatsapp", label: "WhatsApp reports", desc: "Send weekly reports to your WhatsApp" },
          ].map(t => (
            <div key={t.key} className={cx("rounded-xl p-4 flex items-start justify-between gap-3", T.surfaceAlt)}>
              <div>
                <p className={cx("text-xs font-medium", T.text)}>{t.label}</p>
                <p className={cx("text-[11px] mt-0.5", T.muted)}>{t.desc}</p>
              </div>
              <button onClick={() => setToggles(s => ({ ...s, [t.key]: !s[t.key] }))}
                className={cx("h-5 w-9 rounded-full shrink-0 relative transition-colors", toggles[t.key] ? "bg-amber-400" : (dark ? "bg-slate-700" : "bg-slate-300"))}>
                <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", toggles[t.key] ? "translate-x-4" : "translate-x-0.5")} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMING SOON MODULE PLACEHOLDER                                             */
/* -------------------------------------------------------------------------- */

const MODULE_COPY = {
  warehouse: { desc: "Live capacity, pick and pack throughput, and space utilisation across every warehouse.", eta: "In build queue" },
  purchase: { desc: "Vendor scoring, purchase forecasts, MOQ and EOQ planning, and a live purchase order calendar.", eta: "In build queue" },
  forecasting: { desc: "30 and 90 day demand forecasts by SKU, with stock-out and overstock prediction.", eta: "In design" },
  pricing: { desc: "AI-recommended pricing by SKU, competitor tracking, and automated repricing rules.", eta: "In design" },
  competition: { desc: "Track competitor pricing, listings, ratings and share of Buy Box in real time.", eta: "Planned" },
  products: { desc: "SEO score, image score, review score and listing health for every SKU.", eta: "In build queue" },
  support: { desc: "Unified ticket queue across marketplace helpdesks with AI-drafted responses.", eta: "Planned" },
  alerts: { desc: "A single feed for every stock, pricing, ad and settlement alert across your business.", eta: "In design" },
  reports: { desc: "Scheduled exports to PDF, Excel, Google Sheets and Power BI, plus WhatsApp and email delivery.", eta: "Planned" },
  automation: { desc: "Auto purchase orders, auto repricing, auto invoicing and vendor reminders.", eta: "In build queue" },
};

function ComingSoonPage({ nav, T }) {
  const Icon = nav.icon;
  const copy = MODULE_COPY[nav.id] || { desc: "This module is on the SellerOS AI roadmap.", eta: "Planned" };
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className={cx("max-w-md w-full rounded-2xl border p-8 text-center", T.surface, T.border)}>
        <div className={cx("h-12 w-12 rounded-xl flex items-center justify-center mx-auto", T.surfaceAlt)}>
          <Icon size={22} className={T.muted} />
        </div>
        <h2 className={cx("text-base font-semibold mt-4", T.text)}>{nav.label}</h2>
        <p className={cx("text-sm mt-2 leading-relaxed", T.muted)}>{copy.desc}</p>
        <span className={cx("inline-block mt-4 text-xs font-medium px-3 py-1 rounded-full", "bg-amber-500/10 text-amber-500")}>
          {copy.eta}
        </span>
        <div className={cx("mt-6 rounded-xl p-4 flex flex-col gap-2", T.surfaceAlt)}>
          {[70, 45, 85].map((w, i) => (
            <div key={i} className={cx("h-2 rounded-full", T.dark ? "bg-slate-700/60" : "bg-slate-200")} style={{ width: w + "%" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AI ASSISTANT PAGE                                                          */
/* -------------------------------------------------------------------------- */

const SUGGESTED_PROMPTS = [
  "Why is my sales down this week?",
  "Which products need reorder?",
  "Where am I losing money?",
  "Show low margin SKUs",
  "Show dead inventory",
  "Show high return products",
  "Suggest pricing for Casserole 1.5L",
  "Forecast next month",
  "Create business summary",
];

const CANNED_RESPONSES = {
  "Why is my sales down this week?": "Revenue is down 4.2% week-on-week, driven mainly by a stock-out on the Water Bottle 750ml on Flipkart, which alone accounts for roughly 60% of the shortfall. Amazon and Myntra are both tracking ahead of forecast over the same period.",
  "Which products need reorder?": "Four SKUs need attention: Thermosteel Flask 1L (6 days cover), Water Bottle 750ml (2 days cover, critical), Casserole 1.5L (24 days, healthy but trending up), and Lunch Box 3pc (18 days). I would raise purchase orders for the first two today.",
  "Where am I losing money?": "The biggest drag on margin right now is ad spend on the Amazon Lunch Box Launch campaign, running at 32% ACOS against a 20% target. Refunds on the Water Bottle 750ml are the second largest leak, tied to a recent packaging change.",
  "Show low margin SKUs": "Insulated Jug 2.5L and Coffee Mug 450ml currently carry the thinnest margins, mainly due to high storage cost from slow turnover. Both are strong candidates for a bundle offer to accelerate sell-through.",
  "Show dead inventory": "Coffee Mug 450ml has 88 days of cover against a run rate of 12 units a day and no meaningful demand trend. That is roughly 1,050 units, worth about 4.7 lakh rupees, sitting idle in the Bhiwandi warehouse.",
  "Show high return products": "Water Bottle 750ml has the highest return rate at 9.1%, mostly damage-in-transit and quality complaints tied to a recent packaging change. Reverting the packaging is projected to bring this back toward the 4% category average.",
  "Suggest pricing for Casserole 1.5L": "Casserole 1.5L is outperforming forecast by 21% with stable Buy Box share. There is room to test a 4 to 6 percent price increase on Amazon while holding the current price on Flipkart, where competition is tighter.",
  "Forecast next month": "Based on current velocity and seasonal patterns, I am projecting revenue of roughly 91 lakh rupees next month, a 9% increase driven by early festive-season demand, with the steepest growth expected in the flask and lunch box categories.",
  "Create business summary": "This month: revenue of 84.2 lakh rupees, up 12.4% month-on-month, with net profit of 13.1 lakh rupees at a 15.6% margin. Amazon and Flipkart together drive 60% of sales. Key risks are a stock-out on the Water Bottle 750ml and rising ACOS on one Amazon campaign. Key opportunity is strong demand momentum on the Casserole 1.5L ahead of the festive season.",
};
const DEFAULT_RESPONSE = "Based on your live order, inventory and ad data, everything is broadly on track. Let me know which area you would like me to look into further, such as a specific SKU, marketplace or campaign.";

function AiAssistantPage({ T }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "I am your AI business analyst for SellerOS. Ask me about sales, inventory, margins or advertising, or pick a suggestion below." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  function ask(text) {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: "ai", text: CANNED_RESPONSES[text] || DEFAULT_RESPONSE }]);
      setThinking(false);
    }, 900);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className={cx("lg:col-span-2 rounded-2xl border flex flex-col", T.surface, T.border)} style={{ height: 560 }}>
        <div className={cx("px-5 py-4 border-b flex items-center gap-2", T.border)}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-violet-500/10">
            <Bot size={16} className="text-violet-400" />
          </div>
          <div>
            <p className={cx("text-sm font-semibold", T.text)}>SellerOS AI Assistant</p>
            <p className={cx("text-xs", T.muted)}>Answers using your live orders, inventory and ad data</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={cx("max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed",
              m.role === "user" ? cx("self-end", T.dark ? "bg-amber-400 text-slate-900" : "bg-amber-400 text-slate-900") : cx("self-start", T.surfaceAlt, T.text))}>
              {m.text}
            </div>
          ))}
          {thinking && (
            <div className={cx("self-start rounded-xl px-3.5 py-2.5 text-xs", T.surfaceAlt, T.muted)}>Analysing your data...</div>
          )}
          <div ref={endRef} />
        </div>
        <div className={cx("p-3 border-t flex items-center gap-2", T.border)}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && ask(input)}
            placeholder="Ask about sales, stock, margins, or ads"
            className={cx("flex-1 text-xs rounded-lg px-3 py-2 outline-none", T.surfaceAlt, T.text)} />
          <button onClick={() => ask(input)} className="h-8 w-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center shrink-0">
            <Send size={14} />
          </button>
        </div>
      </div>
      <SectionCard title="Suggested questions" subtitle="Tap to ask" T={T}>
        <div className="flex flex-col gap-2">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => ask(p)}
              className={cx("text-left text-xs px-3 py-2 rounded-lg transition-colors", T.surfaceAlt, T.muted, T.hoverSurface)}>
              {p}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SIDEBAR / TOPBAR / TICKER / CHAT WIDGET                                    */
/* -------------------------------------------------------------------------- */

function Sidebar({ T, active, onSelect, collapsed, mobileOpen, closeMobile }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobile} />}
      <aside className={cx(
        "fixed lg:sticky top-0 h-screen z-50 lg:z-0 flex flex-col border-r transition-transform duration-200",
        T.surfaceSolid, T.border,
        collapsed ? "lg:w-[76px]" : "lg:w-64",
        "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className={cx("flex items-center gap-2.5 px-5 h-16 shrink-0 border-b", T.border)}>
          <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-slate-900" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className={cx("text-sm font-semibold tracking-tight", T.text)} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SellerOS AI</p>
              <p className={cx("text-[10px] -mt-0.5", T.muted)}>Every marketplace, one command centre</p>
            </div>
          )}
          <button onClick={closeMobile} className={cx("ml-auto lg:hidden", T.muted)}><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-4">
          {NAV_GROUPS.map(group => (
            <div key={group}>
              {!collapsed && <p className={cx("text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5", T.mutedSoft)}>{group}</p>}
              <div className="flex flex-col gap-0.5">
                {NAV_SECTIONS.filter(n => n.group === group).map(n => {
                  const Icon = n.icon;
                  const isActive = active === n.id;
                  return (
                    <button key={n.id} onClick={() => { onSelect(n.id); closeMobile(); }}
                      className={cx("flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors relative",
                        isActive ? (T.dark ? "bg-amber-400/10 text-amber-400" : "bg-amber-400/15 text-amber-600") : cx(T.muted, T.hoverSurface))}>
                      <Icon size={16} className="shrink-0" />
                      {!collapsed && <span className="truncate">{n.label}</span>}
                      {!collapsed && !n.built && <span className={cx("ml-auto h-1.5 w-1.5 rounded-full shrink-0", T.dark ? "bg-slate-600" : "bg-slate-300")} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        {!collapsed && (
          <div className={cx("p-3 border-t", T.border)}>
            <div className={cx("rounded-xl p-3 flex items-center gap-2.5", T.surfaceAlt)}>
              <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-semibold text-violet-400 shrink-0">MK</div>
              <div className="min-w-0">
                <p className={cx("text-xs font-medium truncate", T.text)}>Malikk</p>
                <p className={cx("text-[10px] truncate", T.muted)}>Milton Home Appliances</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function Ticker({ T }) {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className={cx("border-b overflow-hidden relative h-9 flex items-center", T.border, T.surfaceSolid)}>
      <div className={cx("absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-3 z-10 text-[10px] font-semibold uppercase tracking-wide", T.surfaceSolid)}
        style={{ color: COLORS.amber }}>
        <Sparkles size={12} /> AI pulse
      </div>
      <div className="flex items-center gap-10 whitespace-nowrap pl-28 animate-[ticker_32s_linear_infinite]">
        {items.map((t, i) => (
          <span key={i} className={cx("text-xs flex items-center gap-2", T.muted)}>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Topbar({ T, dark, setDark, onMenu, activeLabel }) {
  return (
    <div className={cx("h-16 border-b flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-30 backdrop-blur-md", T.border, T.dark ? "bg-slate-950/80" : "bg-slate-50/80")}>
      <button onClick={onMenu} className={cx("lg:hidden", T.muted)}><Menu size={20} /></button>
      <div className="hidden lg:block">
        <p className={cx("text-sm font-semibold", T.text)}>{activeLabel}</p>
      </div>
      <div className={cx("hidden md:flex items-center gap-2 rounded-lg px-3 h-9 ml-2 w-64", T.surfaceAlt)}>
        <Search size={14} className={T.mutedSoft} />
        <input placeholder="Search orders, SKUs, campaigns" className={cx("bg-transparent outline-none text-xs w-full", T.text)} />
      </div>
      <button className={cx("hidden sm:flex items-center gap-1.5 rounded-lg px-3 h-9 text-xs font-medium", T.surfaceAlt, T.muted)}>
        <Store size={13} /> All marketplaces <ChevronDown size={13} />
      </button>
      <button className={cx("hidden sm:flex items-center gap-1.5 rounded-lg px-3 h-9 text-xs font-medium", T.surfaceAlt, T.muted)}>
        <CalendarDays size={13} /> This month <ChevronDown size={13} />
      </button>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => setDark(!dark)} className={cx("h-9 w-9 rounded-lg flex items-center justify-center", T.surfaceAlt, T.muted)}>
          {dark ? <SunMedium size={15} /> : <Moon size={15} />}
        </button>
        <button className={cx("h-9 w-9 rounded-lg flex items-center justify-center relative", T.surfaceAlt, T.muted)}>
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <div className="h-9 w-9 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-semibold text-violet-400">MK</div>
      </div>
    </div>
  );
}

function ChatWidget({ T, open, setOpen, onOpenAssistant }) {
  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 h-[52px] w-[52px] rounded-full bg-amber-400 text-slate-900 shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
        {open ? <X size={20} /> : <Bot size={22} />}
      </button>
      {open && (
        <div className={cx("fixed bottom-24 right-5 z-50 w-[320px] rounded-2xl border shadow-2xl overflow-hidden", T.surfaceSolid, T.border)}>
          <div className="bg-amber-400 text-slate-900 px-4 py-3 flex items-center gap-2">
            <Bot size={16} />
            <p className="text-sm font-semibold">Ask SellerOS AI</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <p className={cx("text-xs", T.muted)}>Quick questions:</p>
            {["Why is my sales down?", "Which products need reorder?", "Create business summary"].map((q, i) => (
              <button key={i} onClick={() => { setOpen(false); onOpenAssistant(q); }}
                className={cx("text-left text-xs px-3 py-2 rounded-lg", T.surfaceAlt, T.text, T.hoverSurface)}>
                {q}
              </button>
            ))}
            <button onClick={() => { setOpen(false); onOpenAssistant(null); }}
              className="text-xs font-medium text-amber-500 mt-1 flex items-center gap-1">
              Open full assistant <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MobileBottomNav({ T, active, onSelect }) {
  const items = NAV_SECTIONS.filter(n => ["dashboard", "orders", "inventory", "finance", "ai"].includes(n.id));
  return (
    <div className={cx("lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around h-16 backdrop-blur-md", T.border, T.dark ? "bg-slate-950/90" : "bg-white/90")}>
      {items.map(n => {
        const Icon = n.icon;
        const isActive = active === n.id;
        return (
          <button key={n.id} onClick={() => onSelect(n.id)} className="flex flex-col items-center gap-1 px-3 py-1.5">
            <Icon size={18} className={isActive ? "text-amber-500" : T.mutedSoft} />
            <span className={cx("text-[10px]", isActive ? "text-amber-500 font-medium" : T.mutedSoft)}>{n.label.split(" ")[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* APP ROOT                                                                   */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const T = useTheme(dark);
  const activeNav = NAV_SECTIONS.find(n => n.id === active) || NAV_SECTIONS[0];

  function handleOpenAssistant() {
    setActive("ai");
  }

  function renderPage() {
    switch (active) {
      case "dashboard": return <DashboardPage T={T} />;
      case "orders": return <OrdersPage T={T} />;
      case "inventory": return <InventoryPage T={T} />;
      case "sales": return <SalesPage T={T} />;
      case "finance": return <FinancePage T={T} />;
      case "advertising": return <AdvertisingPage T={T} />;
      case "returns": return <ReturnsPage T={T} />;
      case "customers": return <CustomersPage T={T} />;
      case "ai": return <AiAssistantPage T={T} />;
      case "settings": return <SettingsPage T={T} dark={dark} setDark={setDark} />;
      default: return <ComingSoonPage nav={activeNav} T={T} />;
    }
  }

  return (
    <div className={cx("min-h-screen w-full flex", T.page)} style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar T={T} active={active} onSelect={setActive} collapsed={collapsed} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col pb-16 lg:pb-0">
        <Topbar T={T} dark={dark} setDark={setDark} onMenu={() => setMobileOpen(true)} activeLabel={activeNav.label} />
        <Ticker T={T} />
        <main className="flex-1 p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>

      <ChatWidget T={T} open={chatOpen} setOpen={setChatOpen} onOpenAssistant={handleOpenAssistant} />
      <MobileBottomNav T={T} active={active} onSelect={setActive} />
    </div>
  );
}
