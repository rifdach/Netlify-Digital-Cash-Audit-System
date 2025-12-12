import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Wallet, Bell } from 'lucide-react';
import { Transaction, RiskLevel } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  // Aggregate data for charts
  const monthlyData = [
    { name: 'Jan', inflow: 4000, outflow: 2400 },
    { name: 'Feb', inflow: 3000, outflow: 1398 },
    { name: 'Mar', inflow: 2000, outflow: 9800 }, // Anomaly spike
    { name: 'Apr', inflow: 2780, outflow: 3908 },
    { name: 'May', inflow: 1890, outflow: 4800 },
    { name: 'Jun', inflow: 2390, outflow: 3800 },
  ];

  const totalCash = transactions.reduce((acc, t) => t.type === 'DEBIT' ? acc + t.amount : acc - t.amount, 150000000); // Starting balance
  const highRiskCount = transactions.filter(t => t.riskLevel === RiskLevel.HIGH).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Executive Dashboard: Cash Position</h2>
        <span className="text-sm text-slate-500">Last updated: Just now</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-audit-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Current Cash Balance</p>
              <p className="text-2xl font-bold text-slate-800">
                IDR {totalCash.toLocaleString('id-ID')}
              </p>
            </div>
            <Wallet className="text-audit-500 w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">High Risk Tx</p>
              <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
            </div>
            <AlertTriangle className="text-red-500 w-8 h-8" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Inflow (MTD)</p>
              <p className="text-2xl font-bold text-emerald-600">IDR 1.2M</p>
            </div>
            <TrendingUp className="text-emerald-500 w-8 h-8" />
          </div>
        </div>
         <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Outflow (MTD)</p>
              <p className="text-2xl font-bold text-amber-600">IDR 850K</p>
            </div>
            <TrendingDown className="text-amber-500 w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Cash Flow Movements</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(value) => `IDR ${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="inflow" fill="#10b981" name="Inflow" />
                <Bar dataKey="outflow" fill="#ef4444" name="Outflow" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Balance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="inflow" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sticky Notification for Anomalies (Right Bottom) */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white border border-red-200 shadow-xl rounded-lg p-4 w-80 animate-bounce-in">
          <div className="flex items-start gap-3">
             <div className="bg-red-100 p-2 rounded-full">
                <Bell className="w-5 h-5 text-red-600" />
             </div>
             <div>
               <h4 className="font-semibold text-slate-800">Audit Alerts</h4>
               <p className="text-sm text-slate-600 mt-1">
                 {highRiskCount} Transactions flagged as High Risk requiring immediate vouching.
               </p>
               <div className="mt-2 text-xs text-blue-600 hover:underline cursor-pointer">
                 View Vouching Worksheet &rarr;
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
