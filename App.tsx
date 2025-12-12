import React, { useState, useRef } from 'react';
import { LayoutDashboard, FileSpreadsheet, Users, Database, Shield, FileText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import VouchingWorksheet from './components/VouchingWorksheet';
import WorkflowManager from './components/WorkflowManager';
import { Transaction, RiskLevel } from './types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// --- MOCK DATA INITIALIZATION ---
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX001', date: '2023-10-01', description: 'Office Supplies', referenceNo: 'BKK-001', amount: 1500000, type: 'CREDIT', accountCode: '6-1000', counterparty: 'CV Maju Jaya' },
  { id: 'TX002', date: '2023-10-02', description: 'Sales Revenue', referenceNo: 'BKM-001', amount: 25000000, type: 'DEBIT', accountCode: '4-1000', counterparty: 'PT Clients Indo' },
  { id: 'TX003', date: '2023-10-05', description: 'Consulting Fee', referenceNo: 'BKK-002', amount: 55000000, type: 'CREDIT', accountCode: '6-2000', counterparty: 'Mr. Expert', riskLevel: RiskLevel.HIGH, riskScore: 85, anomalyFlag: true },
  { id: 'TX004', date: '2023-10-06', description: 'Utility Bill', referenceNo: 'BKK-003', amount: 2500000, type: 'CREDIT', accountCode: '6-3000', counterparty: 'PLN' },
  { id: 'TX005', date: '2023-10-07', description: 'Unknown Payment', referenceNo: 'BKK-004', amount: 10000000, type: 'CREDIT', accountCode: '6-9999', counterparty: 'Unknown', riskLevel: RiskLevel.MEDIUM, riskScore: 55 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vouching' | 'workflow' | 'ingest'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      // Simulate adding more data from "API"
      const newTx: Transaction = {
        id: `TX00${transactions.length + 1}`,
        date: '2023-10-10',
        description: 'Imported Transaction from Accurate',
        referenceNo: `API-${Date.now()}`,
        amount: 5000000,
        type: 'DEBIT',
        accountCode: '4-2000',
        counterparty: 'Auto Imported'
      };
      setTransactions([...transactions, newTx]);
      setIsImporting(false);
      alert("Data Import Successful from System Integration!");
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedData(results.data);
        },
        error: (err: any) => {
          console.error(err);
          alert("Error parsing CSV file");
          setIsImporting(false);
        }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);
          processImportedData(parsedData);
        } catch (err) {
          console.error(err);
          alert("Error parsing Excel file");
          setIsImporting(false);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Unsupported file format. Please upload .csv or .xlsx");
      setIsImporting(false);
    }
    
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const processImportedData = (data: any[]) => {
    try {
      const newTransactions: Transaction[] = data.map((row, index) => {
        // Robust field mapping handling various common headers (English/Indonesian)
        const dateRaw = row['Date'] || row['date'] || row['Tanggal'] || new Date().toISOString().split('T')[0];
        const desc = row['Description'] || row['description'] || row['Keterangan'] || 'Imported Transaction';
        const ref = row['ReferenceNo'] || row['ref'] || row['No Bukti'] || row['Ref'] || `IMP-${Date.now()}-${index}`;
        
        // Amount cleaning
        const amountRaw = row['Amount'] || row['amount'] || row['Nilai'] || row['Nominal'] || '0';
        let amount = typeof amountRaw === 'string' ? parseFloat(amountRaw.replace(/[^0-9.-]+/g, "")) : Number(amountRaw);
        if (isNaN(amount)) amount = 0;

        // Type normalization
        const typeRaw = row['Type'] || row['type'] || row['Tipe'] || 'DEBIT';
        const type = String(typeRaw).toUpperCase().includes('D') || String(typeRaw).toUpperCase().includes('IN') ? 'DEBIT' : 'CREDIT';

        const counterparty = row['Counterparty'] || row['counterparty'] || row['Lawan Transaksi'] || row['Vendor'] || 'General';
        const account = row['Account'] || row['accountCode'] || row['Akun'] || '0-0000';

        return {
          id: `IMP-${Date.now()}-${index}`,
          date: String(dateRaw),
          description: String(desc),
          referenceNo: String(ref),
          amount: Math.abs(amount), // Ensure positive
          type: type as 'DEBIT' | 'CREDIT',
          accountCode: String(account),
          counterparty: String(counterparty)
        };
      });

      if (newTransactions.length === 0) {
        alert("No valid records found.");
      } else {
        setTransactions(prev => [...prev, ...newTransactions]);
        alert(`Successfully imported ${newTransactions.length} transactions.`);
      }
    } catch (error) {
      console.error(error);
      alert("Error processing data mapping.");
    } finally {
      setIsImporting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <Shield className="w-6 h-6 text-audit-500" />
            DCAS
          </h1>
          <p className="text-xs text-slate-500 mt-1">Digital Cash Audit System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'dashboard' ? 'bg-audit-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('ingest')}
            className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'ingest' ? 'bg-audit-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
          >
            <Database size={20} />
            Data Ingestion
          </button>

          <button 
            onClick={() => setActiveTab('vouching')}
            className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'vouching' ? 'bg-audit-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
          >
            <FileSpreadsheet size={20} />
            Vouching Worksheet
          </button>

          <button 
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${activeTab === 'workflow' ? 'bg-audit-600 text-white shadow-lg' : 'hover:bg-slate-800'}`}
          >
            <Users size={20} />
            Workflow & KKP
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
          <p className="flex items-center gap-1"><Shield size={12}/> GRC Compliant</p>
          <p className="mt-1">Data Retention: 10 Years</p>
          <p className="mt-1">UU PDP & POJK Ready</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold capitalize text-slate-800">
            {activeTab === 'ingest' ? 'Data Ingestion & Integration' : activeTab}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right">
               <p className="text-sm font-bold text-slate-800">Auditor User</p>
               <p className="text-xs text-slate-500">PT. Audit Sejahtera</p>
             </div>
             <div className="h-10 w-10 rounded-full bg-audit-100 flex items-center justify-center text-audit-700 font-bold border border-audit-200">
               AU
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <Dashboard transactions={transactions} />}
          
          {activeTab === 'vouching' && (
            <VouchingWorksheet 
              transactions={transactions} 
              onUpdateTransactions={setTransactions} 
            />
          )}

          {activeTab === 'workflow' && <WorkflowManager />}

          {activeTab === 'ingest' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv,.xlsx,.xls" 
                  className="hidden" 
                />

                <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200">
                   <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <FileText className="text-audit-600"/> Import Dataset (CSV/XLSX)
                   </h3>
                   <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-slate-300 rounded-lg h-48 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                   >
                      <p className="text-slate-500 font-medium">Drag & Drop Client General Ledger</p>
                      <p className="text-xs text-slate-400 mt-2">Required: Date, Ref, Description, Amount</p>
                   </div>
                   <div className="mt-4 flex justify-end">
                      <button 
                        onClick={triggerFileInput}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition"
                      >
                        Browse Files
                      </button>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-lg border border-slate-200">
                   <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <Database className="text-purple-600"/> System Integration (API)
                   </h3>
                   <p className="text-slate-600 mb-6 text-sm">
                     Connect directly to client accounting software (e.g., Accurate, Jurnal.id, Kledo) to fetch Cash Transactions securely via REST API.
                   </p>
                   
                   <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-6 font-mono text-xs text-slate-600">
                     GET /api/v1/finance/cash-bank/transactions<br/>
                     Authorization: Bearer *****************
                   </div>

                   <button 
                    onClick={simulateImport}
                    disabled={isImporting}
                    className="w-full py-3 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 transition flex justify-center items-center gap-2"
                   >
                     {isImporting ? 'Syncing...' : 'Sync Now (Simulate)'}
                   </button>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;