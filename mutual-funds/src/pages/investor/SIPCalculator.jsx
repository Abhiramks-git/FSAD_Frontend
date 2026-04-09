import { useState } from 'react';
import { TrendingUp, Calendar, DollarSign, PieChart, ArrowRight, Info } from 'lucide-react';

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [years,   setYears]   = useState(10);
  const [rate,    setRate]    = useState(12);
  const [result,  setResult]  = useState(null);

  const calculate = () => {
    const months      = years * 12;
    const mr          = rate / 12 / 100;
    const fv          = monthly * ((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr);
    const invested    = monthly * months;
    const returns     = fv - invested;
    setResult({
      futureValue:   fv.toFixed(0),
      totalInvested: invested.toFixed(0),
      totalReturns:  returns.toFixed(0),
      gainPct:       ((returns / invested) * 100).toFixed(1),
    });
  };

  const fmt = (v) => Number(v).toLocaleString('en-IN');

  const sliders = [
    {
      label: 'Monthly Investment',
      icon: <DollarSign size={16} />,
      value: monthly, set: setMonthly,
      min: 100, max: 100000, step: 100,
      display: `₹${monthly.toLocaleString('en-IN')}`,
      minLabel: '₹100', maxLabel: '₹1L',
    },
    {
      label: 'Time Period',
      icon: <Calendar size={16} />,
      value: years, set: setYears,
      min: 1, max: 40, step: 1,
      display: `${years} yr${years > 1 ? 's' : ''}`,
      minLabel: '1 yr', maxLabel: '40 yrs',
    },
    {
      label: 'Expected Return (% p.a.)',
      icon: <TrendingUp size={16} />,
      value: rate, set: setRate,
      min: 1, max: 30, step: 0.5,
      display: `${rate}%`,
      minLabel: '1%', maxLabel: '30%',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>SIP Calculator</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Estimate the future value of your Systematic Investment Plan.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="sip-grid">
        {/* Input card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} style={{ color: 'var(--blue-600)' }} />
            Investment Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {sliders.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                    <span style={{ color: 'var(--blue-500)' }}>{s.icon}</span>
                    {s.label}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--blue-700)', fontSize: '1rem' }}>{s.display}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={s.min} max={s.max} step={s.step}
                  value={s.value}
                  onChange={e => s.set(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{s.minLabel}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{s.maxLabel}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={calculate}
            className="btn btn-primary btn-lg btn-block"
            style={{ marginTop: '2rem', gap: '0.5rem' }}
          >
            Calculate <ArrowRight size={18} />
          </button>
        </div>

        {/* Result card */}
        <div className="card" style={{ padding: '1.75rem', background: result ? 'white' : 'var(--slate-50)', border: result ? '1px solid var(--blue-100)' : '1px solid var(--slate-200)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--blue-600)' }} />
            Projected Returns
          </h3>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
              {/* Future value — hero */}
              <div style={{ background: 'linear-gradient(135deg, var(--blue-700), var(--blue-600))', borderRadius: 'var(--radius-xl)', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Future Value</p>
                <p style={{ color: 'white', fontSize: '2.25rem', fontWeight: 800 }}>₹{fmt(result.futureValue)}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>after {years} year{years > 1 ? 's' : ''}</p>
              </div>

              {/* Invested vs Returns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.375rem' }}>Total Invested</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-800)' }}>₹{fmt(result.totalInvested)}</p>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.375rem' }}>Wealth Gain</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--green-600)' }}>₹{fmt(result.totalReturns)}</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Returns vs Investment</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-600)' }}>+{result.gainPct}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill progress-green"
                    style={{ width: `${Math.min(100, (Number(result.totalReturns) / Number(result.futureValue)) * 100).toFixed(1)}%` }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Invested</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Returns</span>
                </div>
              </div>

              <div className="alert alert-info" style={{ fontSize: '0.8125rem' }}>
                <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                Returns assume a constant annual rate of {rate}%. Actual returns may vary.
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <TrendingUp size={40} />
              <h3>See your projection</h3>
              <p>Adjust sliders and hit Calculate.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`@media (min-width: 768px) { .sip-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
