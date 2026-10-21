import React from 'react';
import { IndianRupee } from 'lucide-react';

interface RupeeProps {
  className?: string;
  size?: number;
}

export const Rupee: React.FC<RupeeProps> = ({ className = 'w-3.5 h-3.5 inline-block mr-0.5', size = 14 }) => {
  return (
    <IndianRupee
      size={size}
      className={`inline-block shrink-0 ${className}`}
      aria-label="INR"
    />
  );
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-IN');
};
