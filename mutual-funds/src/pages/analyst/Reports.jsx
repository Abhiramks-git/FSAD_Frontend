import { useState } from 'react';
import { useFunds } from '../../contexts/FundContext';
import { toast } from 'react-toastify';
import { FileText, BarChart2, TrendingUp, ShieldAlert, Download, CheckCircle, Table } from 'lucide-react';

// ── Download helpers ──────────────────────────────────────────────────────────
function downloadCSV(rows, filename) {
  if (!rows.length) { toast.error('No data to export'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  toast.success(`${filename} downloaded`);
}

function downloadPDF(title, subtitle, rows) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;font-size:12px;}
    .header{border-bottom:3px solid #1e3a8a;padding-bottom:16px;margin-bottom:20px;}
    .logo{font-size:22px;font-weight:800;color:#1e3a8a;}
    .report-title{font-size:17px;font-weight:700;margin-top:6px;}
    .report-sub{font-size:11px;color:#64748b;margin-top:3px;}
    .meta{display:flex;gap:20px;margin-bottom:20px;padding:10px 14px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;}
    .meta-item{display:flex;flex-direction:column;}
    .meta-label{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;}
    .meta-value{font-size:13px;font-weight:700;color:#1e293b;margin-top:2px;}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;}
    th{background:#1e3a8a;color:white;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.04em;}
    td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;}
    tr:nth-child(even) td{background:#f8fafc;}
    .green{color:#15803d;font-weight:700;}
    .red{color:#dc2626;font-weight:700;}
    .footer{margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;}
    @media print{body{padding:16px;}@page{margin:0.75cm;}}
  </style></head><body>
  <div class="header">
    <div class="logo">FinVest</div>
    <div class="report-title">${title}</div>
    <div class="report-sub">${subtitle}</div>
  </div>
  <div class="meta">
    <div class="meta-item"><span class="meta-label">Generated</span><span class="meta-value">${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span></div>
    <div class="meta-item"><span class="meta-label">Time</span><span class="meta-value">${new Date().toLocaleTimeString('en-IN')}</span></div>
    <div class="meta-item"><span class="meta-label">Records</span><span class="meta-value">${rows.length}</span></div>
    <div class="meta-item"><span class="meta-label">Platform</span><span class="meta-value">FinVest Analytics</span></div>
  </div>
  <table>
    <thead><tr>${Object.keys(rows[0]).map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${Object.values(r).map(v=>{
      const s=String(v);
      const cls = s.includes('+')&&s.includes('%')?'green': s.includes('-')&&s.includes('%')?'red':'';
      return `<td class="${cls}">${s}</td>`;
    }).join('')}</tr>`).join('')}</tbody>
  </table>
  <div class="footer">
    FinVest Mutual Fund Analytics Platform · AMFI Registered · ARN-XXXXXX<br/>
    Disclaimer: Past performance is not indicative of future results. Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.
  </div>
  <script>window.onload=()=>{window.print();}</script>
  </body></html>`;
  const w = window.open('', '_blank');
  if (!w) { toast.error('Pop-up blocked. Allow pop-ups to download PDF.'); return; }
  w.document.write(html); w.document.close();
  toast.success('PDF opened — use Ctrl+P / Cmd+P to save as PDF');
}

export default function Reports() {
  const { funds }     = useFunds();
  const [done, setDone] = useState({});

  const mark = (id) => setDone(d => ({ ...d, [id]: true }));

  const reports = [
    {
      id: 'monthly_pdf',
      icon: <TrendingUp size={22} />, color: 'var(--blue-600)', bg: 'var(--blue-50)',
      title: 'Monthly Performance Report', format: 'PDF',
      desc: 'NAV, AUM, 1Y/3Y/5Y returns, expense ratio for all funds.',
      action: () => {
        const rows = funds.map(f => ({
          'Fund Name': f.name, AMC: f.amc, Category: f.category, Risk: f.risk,
          'NAV (₹)': f.nav, 'AUM (₹ Cr)': f.aum,
          '1Y Return': `+${f.returns?.['1Y']||0}%`,
          '3Y Return': `+${f.returns?.['3Y']||0}%`,
          '5Y Return': `+${f.returns?.['5Y']||0}%`,
          'Expense (Reg)': `${f.expenseRatio?.regular||0}%`,
          'Min SIP (₹)': f.minSIP,
        }));
        downloadPDF('Monthly Fund Performance Report', 'Comprehensive NAV, returns and expense data for all listed funds', rows);
        mark('monthly_pdf');
      },
    },
    {
      id: 'aum_csv',
      icon: <BarChart2 size={22} />, color: '#16a34a', bg: '#f0fdf4',
      title: 'Category-wise AUM', format: 'CSV',
      desc: 'AUM breakdown by fund category and AMC with counts.',
      action: () => {
        const catMap = new Map();
        funds.forEach(f => {
          const key = `${f.category}||${f.amc}`;
          if (!catMap.has(key)) catMap.set(key, { Category: f.category, AMC: f.amc, Count: 0, 'Total AUM (₹ Cr)': 0 });
          const v = catMap.get(key); v.Count++; v['Total AUM (₹ Cr)'] += f.aum;
        });
        const rows = [...catMap.values()].map(r => ({ ...r, 'Total AUM (₹ Cr)': r['Total AUM (₹ Cr)'].toFixed(2) }));
        downloadCSV(rows, `finvest_aum_by_category_${Date.now()}.csv`);
        mark('aum_csv');
      },
    },
    {
      id: 'top10_pdf',
      icon: <FileText size={22} />, color: '#d97706', bg: '#fffbeb',
      title: 'Top 10 Funds by Returns', format: 'PDF',
      desc: 'Ranked list of best-performing funds (3Y CAGR) with full metrics.',
      action: () => {
        const rows = [...funds].sort((a,b)=>(b.returns?.['3Y']||0)-(a.returns?.['3Y']||0)).slice(0,10)
          .map((f,i) => ({
            Rank: i+1, 'Fund Name': f.name, Category: f.category, Risk: f.risk,
            '1Y Return': `+${f.returns?.['1Y']||0}%`,
            '3Y Return (CAGR)': `+${f.returns?.['3Y']||0}%`,
            '5Y Return (CAGR)': `+${f.returns?.['5Y']||0}%`,
            'AUM (₹ Cr)': f.aum, 'NAV (₹)': f.nav,
          }));
        downloadPDF('Top 10 Funds by 3-Year CAGR', 'Ranked by 3-year compounded annual growth rate', rows);
        mark('top10_pdf');
      },
    },
    {
      id: 'returns_csv',
      icon: <BarChart2 size={22} />, color: '#2563eb', bg: 'var(--blue-50)',
      title: 'All Fund Returns', format: 'CSV',
      desc: 'Complete 1Y, 3Y, 5Y and since-inception returns for every fund.',
      action: () => {
        const rows = funds.map(f => ({
          'Fund Name': f.name, AMC: f.amc, Category: f.category, 'Sub-Category': f.subCategory,
          '1Y Return %': f.returns?.['1Y']||0,
          '3Y Return %': f.returns?.['3Y']||0,
          '5Y Return %': f.returns?.['5Y']||0,
          'Since Inception %': f.returns?.sinceInception||0,
          'Inception Date': f.inceptionDate||'—',
        }));
        downloadCSV(rows, `finvest_all_returns_${Date.now()}.csv`);
        mark('returns_csv');
      },
    },
    {
      id: 'risk_pdf',
      icon: <ShieldAlert size={22} />, color: '#7c3aed', bg: '#f5f3ff',
      title: 'Risk Analysis Report', format: 'PDF',
      desc: 'Fund-wise risk level, expense ratio, exit load and benchmark data.',
      action: () => {
        const rows = funds.map(f => ({
          'Fund Name': f.name, Category: f.category, 'Risk Level': f.risk,
          'Expense Ratio (Reg)': `${f.expenseRatio?.regular||0}%`,
          'Expense Ratio (Dir)': `${f.expenseRatio?.direct||0}%`,
          'Exit Load': f.exitLoad||'—',
          'Benchmark T1': f.benchmark?.tier1||'—',
          'AUM (₹ Cr)': f.aum,
        }));
        downloadPDF('Fund Risk Analysis Report', 'Risk categorization, expense ratios and benchmark details', rows);
        mark('risk_pdf');
      },
    },
    {
      id: 'expense_csv',
      icon: <Table size={22} />, color: '#0891b2', bg: '#f0f9ff',
      title: 'Expense Ratio Export', format: 'CSV',
      desc: 'Regular vs direct plan expense ratios for all funds.',
      action: () => {
        const rows = funds.map(f => ({
          'Fund Name': f.name, AMC: f.amc, Category: f.category,
          'Regular Plan %': f.expenseRatio?.regular||0,
          'Direct Plan %':  f.expenseRatio?.direct||0,
          'Difference %':   +((f.expenseRatio?.regular||0) - (f.expenseRatio?.direct||0)).toFixed(2),
          'Min SIP (₹)': f.minSIP,
        }));
        downloadCSV(rows, `finvest_expense_ratios_${Date.now()}.csv`);
        mark('expense_csv');
      },
    },
  ];

  const fmtColor = { PDF: 'badge-high', CSV: 'badge-low' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Generate Reports</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Download real fund data as CSV files or print-ready PDFs directly to your device.
        </p>
      </div>

      <div className="alert alert-info">
        <FileText size={16} style={{ flexShrink: 0 }} />
        <span><strong>PDF reports</strong> open in a new tab — press <strong>Ctrl+P</strong> (or Cmd+P on Mac) and choose "Save as PDF" to download. <strong>CSV files</strong> download directly to your device.</span>
      </div>

      <div className="grid-3">
        {reports.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, background: r.bg, color: r.color, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {r.icon}
              </div>
              <span className={`badge ${fmtColor[r.format] || 'badge-slate'}`}>{r.format}</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.35 }}>{r.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.6 }}>{r.desc}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.375rem' }}>{funds.length} funds · {new Date().toLocaleDateString('en-IN')}</p>
            </div>
            <button onClick={r.action} className={`btn btn-sm btn-block ${done[r.id] ? '' : 'btn-primary'}`}
              style={done[r.id] ? { color: 'var(--green-600)', background: '#f0fdf4', border: '1px solid #bbf7d0' } : {}}>
              {done[r.id]
                ? <><CheckCircle size={14} /> Downloaded</>
                : <><Download size={14} /> Download {r.format}</>
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
