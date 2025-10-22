'use client';

import { Download, ExternalLink } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: string;
  protocol: string;
  amount: string;
  fee: string;
  status: 'success' | 'failed';
  txHash: string;
}

export function LastTransactions({ transactions }: { transactions: Transaction[] }) {
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const headers = ['Date', 'Type', 'Protocol', 'Amount', 'Fee', 'Status', 'TxHash'];
    const rows = transactions.map(tx => [
      tx.date,
      tx.type,
      tx.protocol,
      tx.amount,
      tx.fee,
      tx.status,
      tx.txHash
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <article className="glass-card p-6">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm uppercase tracking-widest text-slate-400">
          Last Transactions
        </h3>
        <button
          onClick={handleExportCSV}
          disabled={transactions.length === 0}
          title="Download transaction history as CSV for accounting"
          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-primary-400/40 bg-primary-500/10 text-primary-200 hover:bg-primary-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3 h-3" />
          Export CSV
        </button>
      </header>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No transactions yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr className="border-b border-white/10">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Protocol</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Fee</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Tx</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5">
                  <td className="py-2 text-slate-300">{tx.date}</td>
                  <td className="py-2 text-slate-300">{tx.type}</td>
                  <td className="py-2 text-slate-300">{tx.protocol}</td>
                  <td className="py-2 text-white font-medium">{tx.amount}</td>
                  <td className="py-2 text-slate-400">{tx.fee}</td>
                  <td className="py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
                        tx.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-2">
                    {tx.status === 'failed' || !tx.txHash || tx.txHash === '0x' ? (
                      // ✅ FIXED: No link for failed transactions without txHash
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-400" title="Transaction failed">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    ) : (
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 transition"
                        title="View on explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
