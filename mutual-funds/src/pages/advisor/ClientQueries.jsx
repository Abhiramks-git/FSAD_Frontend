import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Clock, CheckCircle2, Loader, RefreshCw, X, User } from 'lucide-react';
import { toast } from 'react-toastify';
import QueryAPI from '../../api/queries';

export default function ClientQueries() {
  const [queries,   setQueries]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [replyId,   setReplyId]   = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending,   setSending]   = useState(false);
  const [filter,    setFilter]    = useState('all'); // all | pending | answered

  const load = useCallback(() => {
    setLoading(true);
    QueryAPI.allQueries()
      .then(res => setQueries(res.data))
      .catch(() => toast.error('Could not load queries'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReply = async (id) => {
    if (!replyText.trim()) { toast.error('Reply cannot be empty'); return; }
    setSending(true);
    try {
      const res = await QueryAPI.replyToQuery(id, replyText.trim());
      setQueries(prev => prev.map(q => q.id === id ? res.data : q));
      setReplyId(null);
      setReplyText('');
      toast.success('Reply sent to investor!');
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const displayed = queries.filter(q =>
    filter === 'all' ? true : q.status === filter
  );

  const pending  = queries.filter(q => q.status === 'pending').length;
  const answered = queries.filter(q => q.status === 'answered').length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.375rem', fontWeight:700 }}>Client Queries</h1>
          <p style={{ color:'var(--slate-500)', fontSize:'0.875rem', marginTop:'0.25rem' }}>
            Questions from investors — reply to provide guidance.
          </p>
        </div>
        <button onClick={load} className="btn btn-outline btn-sm">
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid-3">
        {[
          { label:'Total Queries', value: queries.length, color:'var(--slate-800)' },
          { label:'Pending',       value: pending,         color:'#d97706' },
          { label:'Answered',      value: answered,        color:'var(--green-600)' },
        ].map((s,i) => (
          <div key={i} className="card" style={{ padding:'1rem 1.25rem', textAlign:'center' }}>
            <p style={{ fontSize:'2rem', fontWeight:800, color:s.color }}>{s.value}</p>
            <p style={{ fontSize:'0.8125rem', color:'var(--slate-500)', marginTop:'0.25rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'0.5rem' }}>
        {[['all','All'],['pending','Pending'],['answered','Answered']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className="btn btn-sm"
            style={{
              background: filter===v ? 'var(--blue-600)' : 'var(--slate-100)',
              color:      filter===v ? 'white' : 'var(--slate-600)',
              border: 'none'
            }}>
            {l} {v==='all' ? `(${queries.length})` : v==='pending' ? `(${pending})` : `(${answered})`}
          </button>
        ))}
      </div>

      {/* Query list */}
      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem', gap:'0.75rem', color:'var(--slate-400)' }}>
          <Loader size={18} style={{ animation:'spin 1s linear infinite' }}/> Loading queries…
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty-state card" style={{ padding:'4rem 2rem' }}>
          <MessageCircle size={48}/>
          <h3>No {filter === 'all' ? '' : filter} queries</h3>
          <p>When investors submit questions, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {displayed.map(q => (
            <div key={q.id} className="card" style={{ borderLeft:`4px solid ${q.status==='pending'?'#f59e0b':'var(--green-500)'}` }}>
              {/* Question header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.75rem', marginBottom:'0.875rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--blue-100)', color:'var(--blue-700)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.875rem', flexShrink:0 }}>
                    {q.investorName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight:700, color:'var(--slate-800)', fontSize:'0.9rem' }}>{q.investorName}</p>
                    <p style={{ fontSize:'0.75rem', color:'var(--slate-400)' }}>{q.investorEmail}</p>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:'0.3rem',
                    padding:'0.2rem 0.625rem', borderRadius:99, fontSize:'0.75rem', fontWeight:700,
                    background: q.status==='pending' ? '#fffbeb' : '#dcfce7',
                    color:      q.status==='pending' ? '#92400e' : '#15803d',
                  }}>
                    {q.status==='pending'
                      ? <><Clock size={11}/> Pending</>
                      : <><CheckCircle2 size={11}/> Answered</>
                    }
                  </span>
                  <span style={{ fontSize:'0.75rem', color:'var(--slate-400)' }}>
                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : ''}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div style={{ background:'var(--slate-50)', borderRadius:'var(--radius-md)', padding:'0.875rem 1rem', marginBottom:'0.875rem' }}>
                <p style={{ fontSize:'0.8125rem', color:'var(--slate-400)', fontWeight:600, marginBottom:'0.375rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Question</p>
                <p style={{ color:'var(--slate-700)', lineHeight:1.6, fontSize:'0.9375rem' }}>{q.question}</p>
              </div>

              {/* Existing answer */}
              {q.answer && (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'var(--radius-md)', padding:'0.875rem 1rem', marginBottom:'0.875rem' }}>
                  <p style={{ fontSize:'0.8125rem', color:'#15803d', fontWeight:600, marginBottom:'0.375rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    Your Answer
                    {q.answeredAt && (
                      <span style={{ fontWeight:400, color:'#16a34a', marginLeft:'0.5rem' }}>
                        · {new Date(q.answeredAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </span>
                    )}
                  </p>
                  <p style={{ color:'#166534', lineHeight:1.6 }}>{q.answer}</p>
                </div>
              )}

              {/* Reply form */}
              {replyId === q.id ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your advisory response here…"
                    rows={4}
                    style={{ width:'100%', padding:'0.75rem', border:'1.5px solid var(--blue-300)', borderRadius:'var(--radius-md)', fontSize:'0.9rem', resize:'vertical', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                    autoFocus
                  />
                  <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
                    <button onClick={() => { setReplyId(null); setReplyText(''); }} className="btn btn-ghost btn-sm">
                      <X size={14}/> Cancel
                    </button>
                    <button onClick={() => handleReply(q.id)} disabled={sending} className="btn btn-primary btn-sm">
                      {sending ? <Loader size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Send size={14}/>}
                      {sending ? 'Sending…' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setReplyId(q.id); setReplyText(q.answer || ''); }}
                  className="btn btn-outline btn-sm"
                  style={{ alignSelf:'flex-start' }}
                >
                  <MessageCircle size={13}/>
                  {q.status === 'answered' ? 'Update Reply' : 'Reply'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
