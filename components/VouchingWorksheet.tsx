import React, { useState } from 'react';
import { Transaction, RiskLevel, VouchingResult } from '../types';
import { CheckCircle, XCircle, FileText, Sparkles, Upload } from 'lucide-react';
import { analyzeTransactionsRisk } from '../services/geminiService';

interface VouchingProps {
  transactions: Transaction[];
  onUpdateTransactions: (txs: Transaction[]) => void;
}

const VouchingWorksheet: React.FC<VouchingProps> = ({ transactions, onUpdateTransactions }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  const handleRunCAAT = async () => {
    setAnalyzing(true);
    const results = await analyzeTransactionsRisk(transactions);
    
    // Merge results back into transactions
    const updated = transactions.map(tx => {
      const res = results.find(r => r.transactionId === tx.id);
      if (res) {
        return { ...tx, riskScore: res.riskScore, riskLevel: res.riskLevel, anomalyFlag: res.isAnomaly };
      }
      return tx;
    });
    
    onUpdateTransactions(updated);
    setAnalyzing(false);
  };

  const getRiskColor = (level?: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return 'bg-red-100 text-red-800 border-red-200';
      case RiskLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case RiskLevel.LOW: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Vouching Worksheet (T_Transaksi_Kas)</h2>
          <p className="text-sm text-slate-500">Low-level management view - verify mutations against evidence.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleRunCAAT}
            disabled={analyzing}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? 'Running AI Analysis...' : 'Run CAAT (Python/AI)'}
          </button>
        </div>
      </div>

      {/* Excel-like Table Container */}
      <div className="bg-white border rounded shadow overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="border p-2 min-w-[100px]">Date</th>
              <th className="border p-2 min-w-[120px]">Ref No.</th>
              <th className="border p-2 min-w-[200px]">Description</th>
              <th className="border p-2 min-w-[150px]">Counterparty</th>
              <th className="border p-2 text-right">Amount (IDR)</th>
              <th className="border p-2 text-center">Type</th>
              <th className="border p-2 text-center bg-purple-50">Risk Score</th>
              <th className="border p-2 text-center">Evidence</th>
              <th className="border p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-blue-50 group">
                <td className="border p-2 font-mono text-slate-600">{tx.date}</td>
                <td className="border p-2 font-mono text-slate-600">{tx.referenceNo}</td>
                <td className="border p-2">{tx.description}</td>
                <td className="border p-2">{tx.counterparty}</td>
                <td className="border p-2 text-right font-mono">
                  {tx.amount.toLocaleString('id-ID')}
                </td>
                <td className="border p-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${tx.type === 'DEBIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="border p-2 text-center bg-purple-50">
                  {tx.riskLevel ? (
                    <span className={`px-2 py-1 rounded border text-xs font-bold ${getRiskColor(tx.riskLevel)}`}>
                      {tx.riskScore} - {tx.riskLevel}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Pending</span>
                  )}
                </td>
                <td className="border p-2 text-center">
                   <button 
                     className="text-blue-600 hover:text-blue-800"
                     onClick={() => setSelectedTx(tx.id)}
                   >
                     <Upload className="w-4 h-4 mx-auto" />
                   </button>
                </td>
                <td className="border p-2 text-center">
                   {/* Mock Status */}
                   {tx.riskLevel === RiskLevel.HIGH ? (
                     <span className="flex items-center justify-center gap-1 text-red-600 font-medium text-xs">
                       <XCircle className="w-3 h-3" /> Inspect
                     </span>
                   ) : (
                     <span className="flex items-center justify-center gap-1 text-green-600 font-medium text-xs">
                       <CheckCircle className="w-3 h-3" /> OK
                     </span>
                   )}
                </td>
              </tr>
            ))}
             {/* Empty Row Simulator for Data Entry */}
            <tr className="bg-slate-50">
               <td className="border p-2"><input placeholder="YYYY-MM-DD" className="w-full bg-transparent outline-none" /></td>
               <td className="border p-2"><input placeholder="Ref..." className="w-full bg-transparent outline-none" /></td>
               <td className="border p-2" colSpan={7}>
                 <span className="text-gray-400 text-xs italic">Add new transaction (Manual Input)...</span>
               </td>
            </tr>
          </tbody>
        </table>
      </div>

      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
             <h3 className="font-bold mb-4">Upload Evidence (T_Bukti)</h3>
             <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Drag & Drop Invoice/Receipt</p>
                <p className="text-xs text-gray-400 mt-1">Supports PNG, PDF (OCR Enabled)</p>
             </div>
             <div className="mt-4 flex justify-end gap-2">
               <button onClick={() => setSelectedTx(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
               <button onClick={() => setSelectedTx(null)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Simulate Upload</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VouchingWorksheet;
