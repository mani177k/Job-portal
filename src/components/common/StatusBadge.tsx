import React from 'react';
import type { ApplicationStatus } from '../../types';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar, 
  Award, 
  XCircle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const normalized = status?.toLowerCase();

  let label = 'Applied';
  let badgeClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  let Icon = FileText;

  switch (normalized) {
    case 'under_review':
      label = 'Under Review';
      badgeClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Clock;
      break;
    case 'shortlisted':
      label = 'Shortlisted';
      badgeClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = Award;
      break;
    case 'interview_scheduled':
      label = 'Interview Scheduled';
      badgeClasses = 'bg-teal-50 text-teal-700 border-teal-200';
      Icon = Calendar;
      break;
    case 'selected':
      label = 'Selected / Offer';
      badgeClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle;
      break;
    case 'rejected':
      label = 'Not Selected';
      badgeClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;
    default:
      label = 'Applied';
      badgeClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = FileText;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${badgeClasses} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {label}
    </span>
  );
};
