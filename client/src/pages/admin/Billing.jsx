import { useState } from 'react';
import { HiOutlineDownload, HiOutlinePrinter, HiOutlineSearch, HiOutlineCurrencyRupee } from 'react-icons/hi';
import toast from 'react-hot-toast';

const demoBills = [
  { _id: '1', invoiceId: 'INV-1001', customer: { name: 'Rahul Sharma' }, total: 1250, status: 'paid', type: 'restaurant', createdAt: '2026-04-27' },
  { _id: '2', invoiceId: 'INV-1002', customer: { name: 'Priya Patel' }, total: 8400, status: 'paid', type: 'room', createdAt: '2026-04-27' },
  { _id: '3', invoiceId: 'INV-1003', customer: { name: 'Amit Kumar' }, total: 450, status: 'unpaid', type: 'restaurant', createdAt: '2026-04-27' },
  { _id: '4', invoiceId: 'INV-1004', customer: { name: 'Neha Singh' }, total: 2100, status: 'paid', type: 'restaurant', createdAt: '2026-04-26' },
];

export default function Billing() {
  const [bills] = useState(demoBills);
  const [search, setSearch] = useState('');

  const filtered = bills.filter(b => 
    b.invoiceId.toLowerCase().includes(search.toLowerCase()) || 
    b.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Invoices & Billing</h1>
          <p className="text-muted">Generate and manage payments</p>
        </div>
        <div className="flex gap-md">
          <button className="btn btn-outline"><HiOutlinePrinter /> Print Daily Report</button>
          <button className="btn btn-primary"><HiOutlineCurrencyRupee /> New Transaction</button>
        </div>
      </div>

      <div className="flex items-center gap-md mb-lg">
        <div style={{ position: 'relative', flex: 1 }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search invoices by ID or customer..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(bill => (
              <tr key={bill._id}>
                <td className="font-bold">{bill.invoiceId}</td>
                <td>{bill.customer.name}</td>
                <td><span className={`badge badge-${bill.type === 'room' ? 'primary' : 'info'}`} style={{ textTransform: 'capitalize' }}>{bill.type}</span></td>
                <td>{bill.createdAt}</td>
                <td className="font-bold">₹{bill.total.toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${bill.status === 'paid' ? 'success' : 'danger'}`}>
                    {bill.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="flex gap-xs">
                    <button className="btn btn-ghost btn-sm btn-icon" title="Download PDF" onClick={() => toast.success('Downloading PDF...')}><HiOutlineDownload /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Print"><HiOutlinePrinter /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
