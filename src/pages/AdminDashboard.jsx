import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Building2,
  FileText,
  Receipt,
  StickyNote,
} from 'lucide-react';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalDocuments: 0,
    totalNotes: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    dueInvoices: 0,
    overdueInvoices: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    api.get('/admin/overview')
      .then(res => {
        if (res.data.success && res.data.stats) {
          const s = res.data.stats;
          setStats({
            totalCompanies:   s.totalCompanies   || 0,
            totalDocuments:   s.totalDocuments   || 0,
            totalNotes:       s.totalNotes       || 0,
            totalInvoices:    s.totalInvoices    || 0,
            paidInvoices:     s.countPaid        || 0,
            dueInvoices:      s.dueInvoices      || 0,
            overdueInvoices:  s.overdueInvoices  || 0,
            visibleDocuments: s.visibleDocuments || 0,
            hiddenDocuments:  s.hiddenDocuments  || 0,
          });
          if (res.data.monthlyInvoices) setMonthlyData(res.data.monthlyInvoices);
          if (res.data.topCustomers) setTopCustomers(res.data.topCustomers);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="dashboard-viewport">
      {/* Over View Section (Top 4 Stat Cards Container) */}
      <div className="overview-card-container">
        <h2 className="overview-title">Over View</h2>

        <div className="overview-grid">
          {/* Card 1: Total Customers */}
          <div className="overview-stat-box">
            <div className="stat-icon-wrapper stat-icon-mint">
              <Building2 size={22} />
            </div>
            <div className="overview-stat-info">
              <span className="stat-big-number">{stats.totalCompanies}</span>
              <span className="stat-sub-label">Total Customers</span>
            </div>
          </div>

          {/* Card 2: Total Documents */}
          <div className="overview-stat-box">
            <div className="stat-icon-wrapper stat-icon-cyan">
              <FileText size={22} />
            </div>
            <div className="overview-stat-info">
              <span className="stat-big-number">{stats.totalDocuments}</span>
              <span className="stat-sub-label">Total Documents</span>
            </div>
          </div>

          {/* Card 3: Total Invoices */}
          <div className="overview-stat-box">
            <div className="stat-icon-wrapper stat-icon-green">
              <Receipt size={22} />
            </div>
            <div className="overview-stat-info">
              <span className="stat-big-number">{stats.totalInvoices}</span>
              <span className="stat-sub-label">Total Invoices</span>
            </div>
          </div>

          {/* Card 4: Total Notes */}
          <div className="overview-stat-box">
            <div className="stat-icon-wrapper stat-icon-peach">
              <StickyNote size={20} />
            </div>
            <div className="overview-stat-info">
              <span className="stat-big-number">{stats.totalNotes}</span>
              <span className="stat-sub-label">Internal Notes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Chart) & Right Column (Top 10 Stores) */}
      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="grid-left-col">

          {/* Bottom Card: Monthly Invoice Amount Chart */}
          <div className="dash-card chart-card-wrapper">
            <div className="chart-header-row">
              <span className="dash-card-title">Invoice Amount — Last 3 Months</span>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.6875rem', fontWeight: '600', color: '#10B981' }}>
                  <span style={{ width: '10px', height: '3px', background: '#10B981', borderRadius: '2px', display: 'inline-block' }} />Paid
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.6875rem', fontWeight: '600', color: '#F59E0B' }}>
                  <span style={{ width: '10px', height: '3px', background: '#F59E0B', borderRadius: '2px', display: 'inline-block' }} />Due
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.6875rem', fontWeight: '600', color: '#EF4444' }}>
                  <span style={{ width: '10px', height: '3px', background: '#EF4444', borderRadius: '2px', display: 'inline-block' }} />Overdue
                </span>
              </div>
            </div>

            <div className="chart-svg-container">
              {(() => {
                const W = 650, H = 180, padL = 52, padB = 25, padT = 15, padR = 20;
                const chartW = W - padL - padR;
                const chartH = H - padB - padT;

                const now = new Date();
                const months = [];
                for (let i = 2; i >= 0; i--) {
                  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  const label = d.toLocaleString('default', { month: 'short' });
                  const found = monthlyData.find(m => m._id === key);
                  months.push({
                    label,
                    paid:    found?.paid    || 0,
                    due:     found?.due     || 0,
                    overdue: found?.overdue || 0,
                  });
                }

                const maxAmt = Math.max(...months.map(m => m.paid + m.due + m.overdue), 1);
                const yTicks = 4;

                const getPoints = (key) => months.map((m, i) => ({
                  x: padL + (i / (months.length - 1)) * chartW,
                  y: padT + chartH - (m[key] / maxAmt) * chartH,
                  val: m[key],
                  label: months[i].label,
                }));

                const makePath = (pts) => pts.map((p, i) => {
                  if (i === 0) return `M ${p.x} ${p.y}`;
                  const prev = pts[i - 1];
                  const cpx = (prev.x + p.x) / 2;
                  return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
                }).join(' ');

                const makeArea = (pts) => {
                  const line = makePath(pts);
                  return `${line} L ${pts[pts.length-1].x} ${padT + chartH} L ${pts[0].x} ${padT + chartH} Z`;
                };

                const paidPts    = getPoints('paid');
                const duePts     = getPoints('due');
                const overduePts = getPoints('overdue');

                return (
                  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="dueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid + Y labels */}
                    {Array.from({ length: yTicks + 1 }).map((_, i) => {
                      const y = padT + (i / yTicks) * chartH;
                      const val = Math.round(maxAmt * (1 - i / yTicks));
                      const lbl = val >= 1000 ? `£${(val/1000).toFixed(0)}k` : `£${val}`;
                      return (
                        <g key={i}>
                          <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(109,44,249,0.1)" strokeDasharray="3 3" />
                          <text x={padL - 4} y={y + 4} fill="#94A3B8" fontSize="9" textAnchor="end" fontFamily="monospace">{lbl}</text>
                        </g>
                      );
                    })}

                    {/* Areas */}
                    <path d={makeArea(paidPts)}    fill="url(#paidGrad)" />
                    <path d={makeArea(duePts)}     fill="url(#dueGrad)" />
                    <path d={makeArea(overduePts)} fill="url(#overdueGrad)" />

                    {/* Lines */}
                    <path d={makePath(paidPts)}    fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                    <path d={makePath(duePts)}     fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                    <path d={makePath(overduePts)} fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />

                    {/* Dots + X labels */}
                    {paidPts.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="3" fill="#10B981" />
                        <circle cx={duePts[i].x} cy={duePts[i].y} r="3" fill="#F59E0B" />
                        <circle cx={overduePts[i].x} cy={overduePts[i].y} r="3" fill="#EF4444" />
                        <text x={p.x} y={H - 6} fill="#94A3B8" fontSize="10" textAnchor="middle">{p.label}</text>
                      </g>
                    ))}
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* Two Donut Cards Row */}
          <div className="grid-left-top-row">

            {/* Invoice Breakdown */}
            <div className="dash-card">
              <div className="dash-card-header">
                <span className="dash-card-title">Invoice Breakdown</span>
              </div>
              <div className="donut-card-content">
                <div className="donut-svg-wrapper">
                  {(() => {
                    const total = stats.paidInvoices + stats.dueInvoices + stats.overdueInvoices || 1;
                    const circ = 2 * Math.PI * 36;
                    const paidDash    = (stats.paidInvoices / total) * circ;
                    const dueDash     = (stats.dueInvoices / total) * circ;
                    const overdueDash = (stats.overdueInvoices / total) * circ;
                    return (
                      <svg viewBox="0 0 100 100" width="100%" height="100%">
                        {total === 1
                          ? <circle cx="50" cy="50" r="36" fill="transparent" stroke="#E2E8F0" strokeWidth="18" strokeDasharray={`${circ} 0`} transform="rotate(-90 50 50)" />
                          : <>
                            <circle cx="50" cy="50" r="36" fill="transparent" stroke="#10B981" strokeWidth="18" strokeDasharray={`${paidDash} ${circ}`} strokeDashoffset={0} transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="36" fill="transparent" stroke="#F59E0B" strokeWidth="18" strokeDasharray={`${dueDash} ${circ}`} strokeDashoffset={-paidDash} transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="36" fill="transparent" stroke="#EF4444" strokeWidth="18" strokeDasharray={`${overdueDash} ${circ}`} strokeDashoffset={-(paidDash + dueDash)} transform="rotate(-90 50 50)" />
                          </>
                        }
                        <text x="50" y="47" fill="#0F071D" fontSize="11" fontWeight="800" textAnchor="middle">{stats.totalInvoices}</text>
                        <text x="50" y="58" fill="#94A3B8" fontSize="7" textAnchor="middle">Total</text>
                      </svg>
                    );
                  })()}
                </div>
                <div className="donut-legend">
                  <div className="legend-item">
                    <div className="legend-color-box" style={{ background: '#10B981' }} />
                    <div className="legend-text">Paid</div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color-box" style={{ background: '#F59E0B' }} />
                    <div className="legend-text">Due</div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color-box" style={{ background: '#EF4444' }} />
                    <div className="legend-text">Overdue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Visibility */}
            <div className="dash-card">
              <div className="dash-card-header">
                <span className="dash-card-title">Document Visibility</span>
              </div>
              <div className="donut-card-content">
                <div className="donut-svg-wrapper">
                  {(() => {
                    const total = (stats.visibleDocuments + stats.hiddenDocuments) || 1;
                    const circ = 2 * Math.PI * 36;
                    const visDash = (stats.visibleDocuments / total) * circ;
                    const hidDash = (stats.hiddenDocuments / total) * circ;
                    return (
                      <svg viewBox="0 0 100 100" width="100%" height="100%">
                        {total === 1
                          ? <circle cx="50" cy="50" r="36" fill="transparent" stroke="#E2E8F0" strokeWidth="18" strokeDasharray={`${circ} 0`} transform="rotate(-90 50 50)" />
                          : <>
                            <circle cx="50" cy="50" r="36" fill="transparent" stroke="#6D2CF9" strokeWidth="18" strokeDasharray={`${visDash} ${circ}`} strokeDashoffset={0} transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="36" fill="transparent" stroke="#E2E8F0" strokeWidth="18" strokeDasharray={`${hidDash} ${circ}`} strokeDashoffset={-visDash} transform="rotate(-90 50 50)" />
                          </>
                        }
                        <text x="50" y="47" fill="#0F071D" fontSize="11" fontWeight="800" textAnchor="middle">{stats.totalDocuments}</text>
                        <text x="50" y="58" fill="#94A3B8" fontSize="7" textAnchor="middle">Total</text>
                      </svg>
                    );
                  })()}
                </div>
                <div className="donut-legend">
                  <div className="legend-item">
                    <div className="legend-color-box" style={{ background: '#6D2CF9' }} />
                    <div className="legend-text">Visible</div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color-box" style={{ background: '#E2E8F0', border: '1px solid #CBD5E1' }} />
                    <div className="legend-text">Hidden</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Tall Column: Top Customers by Invoice Amount */}
        <div className="dash-card top-stores-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Top Customers by Invoice Amount</span>
          </div>

          <div className="stores-list">
            {topCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No data yet
              </div>
            ) : (() => {
              const max = Math.max(...topCustomers.map(c => c.totalAmount), 1);
              return topCustomers.map((c, i) => {
                const pct = Math.round((c.totalAmount / max) * 100);
                const amt = c.totalAmount >= 1000
                  ? `£${(c.totalAmount / 1000).toFixed(1)}k`
                  : `£${c.totalAmount}`;
                const name = c.primaryUserName || c.companyName || `Account ${c.accountNumber}`;
                return (
                  <div key={i} className="store-row">
                    <span className="store-name" title={name}>{name}</span>
                    <div className="store-bar-track">
                      <div className="store-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="store-value">{amt}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
