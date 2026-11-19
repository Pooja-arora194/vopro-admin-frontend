import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileCheck
} from 'lucide-react';

const StatusBadge = ({ status, type = 'general' }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  const dot = <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0, marginRight: '5px' }} />;

  if (['active', 'paid', 'clean', 'signed'].includes(normalized)) {
    return <span className="badge badge-paid" style={{ whiteSpace: 'nowrap' }}>{dot}{status}</span>;
  }

  if (['due', 'pending', 'scanning', 'under review', 'pending verification'].includes(normalized)) {
    return <span className="badge badge-due" style={{ whiteSpace: 'nowrap' }}>
      {normalized === 'scanning' ? <Loader2 size={11} className="spin-icon" style={{ marginRight: '5px' }} /> : dot}
      {status}
    </span>;
  }

  if (['overdue', 'suspended', 'quarantined', 'cancelled', 'inactive'].includes(normalized)) {
    return <span className="badge badge-overdue" style={{ whiteSpace: 'nowrap' }}>{dot}{status}</span>;
  }

  return <span className="badge badge-neutral" style={{ whiteSpace: 'nowrap' }}>{dot}{status}</span>;
};

export default StatusBadge;
