import { createContext, useContext, useState, useEffect } from 'react';
import FundAPI from '../api/funds';

const FundContext = createContext();

export const FundProvider = ({ children }) => {
  const [funds,       setFundsState] = useState([]);
  const [filters,     setFilters]    = useState({ search: '', category: '', risk: '' });
  const [compareList, setCompareList] = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState(null);

  // ── Load all funds from DB on mount ───────────────────────────────────────
  useEffect(() => {
    FundAPI.getAll()
      .then(res => {
        // Map DB shape → frontend shape (flatten nested fields)
        const mapped = res.data.map(mapFund);
        setFundsState(mapped);
      })
      .catch(err => {
        console.error('Failed to load funds:', err);
        setError('Could not connect to the server. Is the Spring Boot backend running?');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── setFunds: saves to DB via API (admin/analyst) ─────────────────────────
  // Accepts the full updated array (same signature as before)
  const setFunds = async (updatedFunds) => {
    setFundsState(updatedFunds);
    // The individual save calls are done inside FundManagement/PerformanceUpdater
    // via FundAPI directly — this keeps the local state in sync
  };

  // ── Compare helpers ───────────────────────────────────────────────────────
  const addToCompare = (fund) => {
    if (compareList.length < 4 && !compareList.find(f => f.id === fund.id)) {
      setCompareList(prev => [...prev, fund]);
    }
  };
  const removeFromCompare = (id) => setCompareList(prev => prev.filter(f => f.id !== id));

  return (
    <FundContext.Provider value={{
      funds, setFunds, loading, error,
      filters, setFilters,
      compareList, addToCompare, removeFromCompare,
    }}>
      {children}
    </FundContext.Provider>
  );
};

export const useFunds = () => useContext(FundContext);

// ── Map DB entity → frontend fund object ─────────────────────────────────────
export function mapFund(f) {
  return {
    id:           f.id,
    name:         f.name,
    amc:          f.amc,
    category:     f.category,
    subCategory:  f.subCategory,
    nav:          f.nav,
    aum:          f.aum,
    expenseRatio: { regular: f.expenseRatioRegular, direct: f.expenseRatioDirect },
    minSIP:       f.minSip,
    risk:         f.risk,
    returns: {
      '1Y':           f.return1y,
      '3Y':           f.return3y,
      '5Y':           f.return5y,
      sinceInception: f.returnSinceInception,
    },
    inceptionDate:       f.inceptionDate,
    exitLoad:            f.exitLoad,
    benchmark:           { tier1: f.benchmarkTier1, tier2: f.benchmarkTier2 },
    about:               f.about,
    idealFor:            f.idealFor,
    investmentObjective: f.investmentObjective,
    fundManager: {
      name:        f.fundManagerName,
      designation: f.fundManagerDesignation,
      about:       f.fundManagerAbout,
    },
    productLabel: { risk: f.risk, benchmarkRisk: f.risk },
    holdings:     [],  // load separately if needed
  };
}
