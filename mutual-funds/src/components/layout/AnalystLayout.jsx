import RoleLayout from './RoleLayout';
import { LayoutDashboard, RefreshCw, FileBarChart } from 'lucide-react';

const navItems = [
  { to: '/analyst',              label: 'Dashboard',       icon: <LayoutDashboard size={18} />, end: true },
  { to: '/analyst/update-funds', label: 'Update Funds',    icon: <RefreshCw size={18} /> },
  { to: '/analyst/reports',      label: 'Reports',         icon: <FileBarChart size={18} /> },
];

export default function AnalystLayout() {
  return <RoleLayout title="Analyst Portal" role="Analyst" navItems={navItems} accentColor="#7c3aed" />;
}
