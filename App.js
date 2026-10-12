import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ── Simulated API fetch (replace with real endpoint) ──────────────────────────
const fetchSalesData = async () => {
  await new Promise(r => setTimeout(r, 600));
  return [
    { month: 'Jan', revenue: 42000, orders: 310, returns: 18 },
    { month: 'Feb', revenue: 53000, orders: 398, returns: 22 },
    { month: 'Mar', revenue: 61000, orders: 450, returns: 15 },
    { month: 'Apr', revenue: 48000, orders: 371, returns: 30 },
    { month: 'May', revenue: 72000, orders: 520, returns: 12 },
    { month: 'Jun', revenue: 68000, orders: 489, returns: 20 },
    { month: 'Jul', revenue: 85000, orders: 601, returns: 9  },
    { month: 'Aug', revenue: 91000, orders: 645, returns: 14 },
    { month: 'Sep', revenue: 78000, orders: 558, returns: 17 },
    { month: 'Oct', revenue: 95000, orders: 700, returns: 11 },
    { month: 'Nov', revenue: 110000, orders: 812, returns: 8 },
    { month: 'Dec', revenue: 130000, orders: 950, returns: 6 },
  ];
};

const fetchOrders = async () => {
  await new Promise(r => setTimeout(r, 400));
  return [
    { id: 'ORD-001', customer: 'Acme Corp',     product: 'Enterprise Plan', amount: 4200, status: 'Completed', date: '2026-10-01' },
    { id: 'ORD-002', customer: 'Globex Inc',    product: 'Pro Plan',        amount: 1800, status: 'Pending',   date: '2026-10-03' },
    { id: 'ORD-003', customer: 'Initech',       product: 'Starter Plan',    amount:  600, status: 'Completed', date: '2026-10-04' },
    { id: 'ORD-004', customer: 'Umbrella Ltd',  product: 'Enterprise Plan', amount: 4200, status: 'Failed',    date: '2026-10-05' },
    { id: 'ORD-005', customer: 'Hooli',         product: 'Pro Plan',        amount: 1800, status: 'Completed', date: '2026-10-06' },
    { id: 'ORD-006', customer: 'Pied Piper',    product: 'Starter Plan',    amount:  600, status: 'Pending',   date: '2026-10-07' },
    { id: 'ORD-007', customer: 'Raviga Capital', product: 'Enterprise Plan', amount: 4200, status: 'Completed', date: '2026-10-08' },
    { id: 'ORD-008', customer: 'Nucleus Corp',  product: 'Pro Plan',        amount: 1800, status: 'Completed', date: '2026-10-09' },
    { id: 'ORD-009', customer: 'Endframe',      product: 'Starter Plan',    amount:  600, status: 'Failed',    date: '2026-10-10' },
    { id: 'ORD-010', customer: 'Belson Inc',    product: 'Enterprise Plan', amount: 4200, status: 'Pending',   date: '2026-10-11' },
    { id: 'ORD-011', customer: 'Big Head LLC',  product: 'Pro Plan',        amount: 1800, status: 'Completed', date: '2026-10-12' },
    { id: 'ORD-012', customer: 'Intersite',     product: 'Starter Plan',    amount:  600, status: 'Completed', date: '2026-10-13' },
  ];
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, color }) => (
  <div style={{
    background: '#1e293b', borderRadius: 12, padding: '20px 24px',
    borderLeft: `4px solid ${color}`, flex: 1, minWidth: 180
  }}>
    <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 700, color }}>{value}</p>
    {sub && <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sub}</p>}
  </div>
);

const STATUS_COLOR = { Completed: '#22c55e', Pending: '#f59e0b', Failed: '#ef4444' };

const ITEMS_PER_PAGE = 5;

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('All');
  const [page, setPage]         = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir]   = useState('desc');

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: fetchSalesData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 5 * 60 * 1000,
  });

  // ── Derived / filtered data ──────────────────────────────────────────────────
  const totalRevenue = sales ? sales.reduce((s, r) => s + r.revenue, 0) : 0;
  const totalOrders  = orders ? orders.length : 0;
  const completed    = orders ? orders.filter(o => o.status === 'Completed').length : 0;

  const filtered = (orders || [])
    .filter(o =>
      (statusFilter === 'All' || o.status === statusFilter) &&
      (o.customer.toLowerCase().includes(search.toLowerCase()) ||
       o.id.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const va = sortField === 'amount' ? a.amount : a[sortField];
      const vb = sortField === 'amount' ? b.amount : b[sortField];
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const TH = ({ label, field }) => (
    <th onClick={() => toggleSort(field)} style={{
      padding: '10px 14px', textAlign: 'left', fontSize: 12,
      color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1,
      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap'
    }}>
      {label} {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Sales Analytics Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>FY 2026 · Live data via React Query</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <KPI label="Total Revenue"  value={salesLoading ? '…' : `$${(totalRevenue/1000).toFixed(0)}K`} sub="FY 2026"          color="#6366f1" />
        <KPI label="Total Orders"   value={ordersLoading ? '…' : totalOrders}  sub="All time"           color="#22c55e" />
        <KPI label="Completed"      value={ordersLoading ? '…' : completed}    sub={`${Math.round(completed/totalOrders*100)||0}% success rate`} color="#f59e0b" />
        <KPI label="Avg Order Value" value={salesLoading ? '…' : `$${(totalRevenue/(orders?.length||1)/1000).toFixed(1)}K`} sub="Per order" color="#ec4899" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#e2e8f0' }}>Monthly Revenue</h2>
          {salesLoading ? <p style={{ color: '#64748b' }}>Loading…</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v/1000}K`} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#e2e8f0' }}>Orders vs Returns</h2>
          {salesLoading ? <p style={{ color: '#64748b' }}>Loading…</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Bar dataKey="orders"  fill="#22c55e" radius={[4,4,0,0]} />
                <Bar dataKey="returns" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', flex: 1 }}>Order Details</h2>
          <input
            placeholder="Search customer or order ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
              padding: '7px 12px', color: '#e2e8f0', fontSize: 13, width: 240
            }}
          />
          {['All','Completed','Pending','Failed'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none',
              background: statusFilter === s ? '#6366f1' : '#0f172a',
              color: statusFilter === s ? '#fff' : '#94a3b8'
            }}>{s}</button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <TH label="Order ID"  field="id" />
                <TH label="Customer"  field="customer" />
                <TH label="Product"   field="product" />
                <TH label="Amount"    field="amount" />
                <TH label="Status"    field="status" />
                <TH label="Date"      field="date" />
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr><td colSpan={6} style={{ padding: 20, color: '#64748b', textAlign: 'center' }}>Loading orders…</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 20, color: '#64748b', textAlign: 'center' }}>No results found.</td></tr>
              ) : paginated.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #1e293b' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{o.id}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13 }}>{o.customer}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{o.product}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600 }}>${o.amount.toLocaleString()}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      background: STATUS_COLOR[o.status] + '22',
                      color: STATUS_COLOR[o.status],
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                    }}>{o.status}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#94a3b8' }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Showing {Math.min((page-1)*ITEMS_PER_PAGE+1, filtered.length)}–{Math.min(page*ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              style={{ padding: '6px 14px', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: page===1?'#334155':'#e2e8f0', cursor: page===1?'not-allowed':'pointer' }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: page===n ? '#6366f1' : '#0f172a', color: page===n ? '#fff' : '#94a3b8' }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              style={{ padding: '6px 14px', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: page===totalPages?'#334155':'#e2e8f0', cursor: page===totalPages?'not-allowed':'pointer' }}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
