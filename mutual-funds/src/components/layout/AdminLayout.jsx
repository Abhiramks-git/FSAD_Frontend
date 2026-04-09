import RoleLayout from './RoleLayout';
import { LayoutDashboard, Users, Database } from 'lucide-react';

const navItems = [
  { to: '/admin',        label: 'Dashboard',    icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/users',  label: 'User Manager', icon: <Users size={18} /> },
  { to: '/admin/funds',  label: 'Fund Manager', icon: <Database size={18} /> },
];

export default function AdminLayout() {
  return <RoleLayout title="Admin Panel" role="Admin" navItems={navItems} accentColor="var(--slate-800)" />;
}
