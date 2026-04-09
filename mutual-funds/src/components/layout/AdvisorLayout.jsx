import RoleLayout from './RoleLayout';
import { LayoutDashboard, FileText, Users } from 'lucide-react';

const navItems = [
  { to: '/advisor',         label: 'Dashboard',       icon: <LayoutDashboard size={18} />, end: true },
  { to: '/advisor/content', label: 'Content Manager', icon: <FileText size={18} /> },
  { to: '/advisor/clients', label: 'Client Queries',  icon: <Users size={18} /> },
];

export default function AdvisorLayout() {
  return <RoleLayout title="Advisor Portal" role="Advisor" navItems={navItems} accentColor="var(--green-600)" />;
}
