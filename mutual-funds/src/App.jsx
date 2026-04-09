import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FundProvider } from './contexts/FundContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Public pages (only accessible when not logged in)
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Private pages (require login)
import FundExplorer from './pages/public/FundExplorer';
import FundDetail from './pages/public/FundDetail';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Invest from './pages/public/Invest';

// Investor pages
import InvestorLayout from './components/layout/InvestorLayout';
import InvestorDashboard from './pages/investor/Dashboard';
import Portfolio from './pages/investor/Portfolio';
import Compare from './pages/investor/Compare';
import SIPCalculator from './pages/investor/SIPCalculator';

// Advisor pages
import AdvisorLayout from './components/layout/AdvisorLayout';
import AdvisorDashboard from './pages/advisor/Dashboard';
import ContentManager from './pages/advisor/ContentManager';
import ClientQueries from './pages/advisor/ClientQueries';

// Analyst pages
import AnalystLayout from './components/layout/AnalystLayout';
import AnalystDashboard from './pages/analyst/Dashboard';
import PerformanceUpdater from './pages/analyst/PerformanceUpdater';
import Reports from './pages/analyst/Reports';

// Admin pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UserManager from './pages/admin/UserManager';
import FundManagement from './pages/admin/FundManagement';

// Other
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FundProvider>
          <Routes>
            {/* Public only routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes (require login, any role) */}
            <Route path="/" element={<ProtectedRoute><FundExplorer /></ProtectedRoute>} />
            <Route path="/funds" element={<ProtectedRoute><FundExplorer /></ProtectedRoute>} />
            <Route path="/funds/:id" element={<ProtectedRoute><FundDetail /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="/invest/:fundId" element={<ProtectedRoute><Invest /></ProtectedRoute>} />

            {/* Investor routes */}
            <Route path="/investor" element={
              <PrivateRoute allowedRoles={['investor']}>
                <InvestorLayout />
              </PrivateRoute>
            }>
              <Route index element={<InvestorDashboard />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="compare" element={<Compare />} />
              <Route path="calculator" element={<SIPCalculator />} />
            </Route>

            {/* Advisor routes */}
            <Route path="/advisor" element={
              <PrivateRoute allowedRoles={['advisor']}>
                <AdvisorLayout />
              </PrivateRoute>
            }>
              <Route index element={<AdvisorDashboard />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="clients" element={<ClientQueries />} />
            </Route>

            {/* Analyst routes */}
            <Route path="/analyst" element={
              <PrivateRoute allowedRoles={['analyst']}>
                <AnalystLayout />
              </PrivateRoute>
            }>
              <Route index element={<AnalystDashboard />} />
              <Route path="update-funds" element={<PerformanceUpdater />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManager />} />
              <Route path="funds" element={<FundManagement />} />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </FundProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;