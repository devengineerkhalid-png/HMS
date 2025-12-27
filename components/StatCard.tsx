
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border border-slate-100">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} text-white text-xl`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
