import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Plus,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { billingService } from '../services/billingService';
import { patientService } from '../services/patientService';
import { Invoice, Patient, InvoiceStatus, PaymentMethod } from '../types';
import { Button } from '../components/common/Button';
import { StatCard } from '../components/common/StatCard';
import { Table } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Billing: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, paid: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Invoice Details Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Create Invoice Modal State (Admin)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [invoicePatientId, setInvoicePatientId] = useState('');
  const [consultationFee, setConsultationFee] = useState<number>(1000);
  const [labFee, setLabFee] = useState<number>(0);
  const [medicineFee, setMedicineFee] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(150);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('Paid');

  // Dynamic Calculation
  const totalCalculated = useMemo(() => {
    return (
      (Number(consultationFee) || 0) +
      (Number(labFee) || 0) +
      (Number(medicineFee) || 0) +
      (Number(otherCharges) || 0)
    );
  }, [consultationFee, labFee, medicineFee, otherCharges]);

  useEffect(() => {
    loadBillingData();
  }, [user, role]);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [invs, pats, st] = await Promise.all([
        billingService.getAll(),
        patientService.getAll(),
        billingService.getStats(),
      ]);

      if (role === 'patient') {
        const patId = user?.id || 'PAT-1001';
        const myInvoices = invs.filter(
          (i) => i.patientId === patId || i.patientName.toLowerCase().includes('aarav')
        );
        setInvoices(myInvoices);
      } else {
        setInvoices(invs);
        setStats(st);
      }

      setPatients(pats);
      if (pats.length > 0) setInvoicePatientId(pats[0].id);
    } catch {
      showToast('Failed to load billing records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase()) ||
        inv.paymentMethod.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const handleOpenCreate = () => {
    if (patients.length > 0 && !invoicePatientId) setInvoicePatientId(patients[0].id);
    setConsultationFee(1000);
    setLabFee(0);
    setMedicineFee(0);
    setOtherCharges(150);
    setPaymentMethod('UPI');
    setInvoiceStatus('Paid');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find((p) => p.id === invoicePatientId);
    if (!patientObj) {
      showToast('Select a valid patient', 'error');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await billingService.create({
        patientId: patientObj.id,
        patientName: patientObj.name,
        date: today,
        dueDate: today,
        consultationFee: Number(consultationFee) || 0,
        labFee: Number(labFee) || 0,
        medicineFee: Number(medicineFee) || 0,
        otherCharges: Number(otherCharges) || 0,
        totalAmount: totalCalculated,
        paymentMethod,
        status: invoiceStatus,
        items: [
          { description: 'OPD Doctor Consultation Fee', quantity: 1, unitPrice: Number(consultationFee) || 0, total: Number(consultationFee) || 0 },
          ...(labFee > 0 ? [{ description: 'Laboratory Diagnostic Tests', quantity: 1, unitPrice: Number(labFee), total: Number(labFee) }] : []),
          ...(medicineFee > 0 ? [{ description: 'Hospital Pharmacy Dispensation', quantity: 1, unitPrice: Number(medicineFee), total: Number(medicineFee) }] : []),
          ...(otherCharges > 0 ? [{ description: 'Administrative & Facility Surcharge', quantity: 1, unitPrice: Number(otherCharges), total: Number(otherCharges) }] : []),
        ],
      });
      showToast(`Invoice generated for ${patientObj.name} (${formatCurrency(totalCalculated)})`, 'success');
      setIsCreateOpen(false);
      loadBillingData();
    } catch {
      showToast('Failed to create invoice', 'error');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await billingService.updateStatus(id, 'Paid');
      showToast('Invoice marked as Paid', 'success');
      loadBillingData();
    } catch {
      showToast('Failed to update invoice status', 'error');
    }
  };

  const handlePatientMockPay = async (id: string, amount: number) => {
    try {
      await billingService.updateStatus(id, 'Paid');
      showToast(`Payment of ${formatCurrency(amount)} processed successfully! Receipt updated.`, 'success');
      loadBillingData();
    } catch {
      showToast('Payment processing failed', 'error');
    }
  };

  // Columns definition based on role
  const columns = useMemo(() => {
    return [
      {
        header: 'Invoice ID',
        accessor: (row: Invoice) => (
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {row.id}
          </span>
        ),
      },
      ...(role === 'admin'
        ? [
            {
              header: 'Patient',
              accessor: (row: Invoice) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{row.patientName}</span>
                  <span className="text-xs text-slate-400 font-mono">{row.patientId}</span>
                </div>
              ),
            },
          ]
        : []),
      {
        header: 'Date',
        accessor: (row: Invoice) => (
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {formatDate(row.date)}
          </span>
        ),
      },
      {
        header: 'Total Amount',
        accessor: (row: Invoice) => (
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            {formatCurrency(row.totalAmount)}
          </span>
        ),
      },
      {
        header: 'Payment Method',
        accessor: (row: Invoice) => (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {row.paymentMethod}
          </span>
        ),
      },
      {
        header: 'Status',
        accessor: (row: Invoice) => <Badge status={row.status}>{row.status}</Badge>,
      },
      {
        header: 'Actions',
        accessor: (row: Invoice) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedInvoice(row)}
              className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Inspect Invoice Receipt"
              aria-label="View invoice"
            >
              <Eye className="w-4 h-4" />
            </button>
            {row.status !== 'Paid' && (
              role === 'patient' ? (
                <button
                  onClick={() => handlePatientMockPay(row.id, row.totalAmount)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60"
                >
                  Pay Now
                </button>
              ) : (
                <button
                  onClick={() => handleMarkAsPaid(row.id)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Mark Paid
                </button>
              )
            )}
          </div>
        ),
      },
    ];
  }, [role]);

  const pageTitle = role === 'patient' ? 'Billing' : 'Hospital Billing & Invoices';
  const pageSubtitle =
    role === 'patient'
      ? 'Your itemized medical invoices, payment receipts, and balance statement'
      : 'Outpatient billing ledger, itemized receipts, and payment settlements';

  if (role === 'doctor') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {pageTitle}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {invoices.length} Invoices
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {pageSubtitle}
          </p>
        </div>

        {role === 'admin' && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Create Invoice
          </Button>
        )}
      </div>

      {/* 4 Summary Stat Cards */}
      {role === 'patient' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Outstanding"
            value="₹1,500"
            subtitle="Recent invoice INV-2026-1042"
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBgColor="bg-amber-50 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
          />

          <StatCard
            title="Last Payment"
            value="₹2,800"
            subtitle="Settled on Sep 28, 2026"
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />

          <StatCard
            title="Total Settled"
            value="₹7,900"
            subtitle="Cumulative payments"
            icon={<IndianRupee className="w-5 h-5" />}
            iconBgColor="bg-sky-50 dark:bg-sky-950/50"
            iconColor="text-sky-600 dark:text-sky-400"
          />

          <StatCard
            title="Insurance Status"
            value="Verified"
            subtitle="Cashless OPD Eligible"
            icon={<ShieldCheck className="w-5 h-5" />}
            iconBgColor="bg-purple-50 dark:bg-purple-950/50"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue || 184500)}
            subtitle="Cumulative ledger"
            icon={<IndianRupee className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />

          <StatCard
            title="Paid Invoices"
            value={formatCurrency(stats.paid || 142000)}
            subtitle="Settled transactions"
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgColor="bg-sky-50 dark:bg-sky-950/50"
            iconColor="text-sky-600 dark:text-sky-400"
          />

          <StatCard
            title="Pending Payments"
            value={formatCurrency(stats.pending || 32500)}
            subtitle="Awaiting clearance"
            icon={<Clock className="w-5 h-5" />}
            iconBgColor="bg-amber-50 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
          />

          <StatCard
            title="Outstanding / Overdue"
            value={formatCurrency(stats.overdue || 10000)}
            subtitle="Past due cycle"
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBgColor="bg-rose-50 dark:bg-rose-950/50"
            iconColor="text-rose-600 dark:text-rose-400"
          />
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder={
            role === 'patient'
              ? 'Search by invoice ID or payment method...'
              : 'Search by invoice ID, patient name, payment mode...'
          }
        />

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table & Pagination */}
      {filteredInvoices.length === 0 && !loading ? (
        <EmptyState
          title="No invoices found"
          description="Adjust keyword search or status filter to see billing records."
          actionLabel="Reset Search"
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={currentData}
            keyExtractor={(i) => i.id}
            emptyMessage={loading ? 'Loading invoices...' : 'No invoices generated.'}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInvoices.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Create Invoice Modal with Dynamic Calculation (Admin only) */}
      {role === 'admin' && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Generate Clinical Invoice"
          subtitle="Automatic dynamic calculation across itemized charges"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <Select
              label="Select Patient"
              value={invoicePatientId}
              onChange={(e) => setInvoicePatientId(e.target.value)}
              options={patients.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.id})`,
              }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Consultation Fee (₹)"
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                placeholder="1000"
                required
              />
              <Input
                label="Laboratory Tests Fee (₹)"
                type="number"
                value={labFee}
                onChange={(e) => setLabFee(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pharmacy / Medicine Fee (₹)"
                type="number"
                value={medicineFee}
                onChange={(e) => setMedicineFee(Number(e.target.value))}
                placeholder="0"
              />
              <Input
                label="Facility & Other Surcharges (₹)"
                type="number"
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
                placeholder="150"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={[
                  { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
                  { value: 'Credit Card', label: 'Credit Card' },
                  { value: 'Debit Card', label: 'Debit Card' },
                  { value: 'Net Banking', label: 'Net Banking' },
                  { value: 'Cash', label: 'Cash Desk' },
                  { value: 'Insurance', label: 'Insurance TPA' },
                ]}
              />
              <Select
                label="Invoice Status"
                value={invoiceStatus}
                onChange={(e) => setInvoiceStatus(e.target.value as InvoiceStatus)}
                options={[
                  { value: 'Paid', label: 'Paid' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Overdue', label: 'Overdue' },
                ]}
              />
            </div>

            {/* Dynamic Calculation Callout */}
            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-900 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-brand-700 dark:text-brand-300">
                  Calculated Grand Total
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Includes consultation, diagnostics, medications & tax
                </p>
              </div>
              <div className="text-2xl font-black text-brand-700 dark:text-brand-300 tracking-tight">
                {formatCurrency(totalCalculated)}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Issue Invoice
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Hospital Receipt — ${selectedInvoice.id}`}
          subtitle={`Issued on ${formatDate(selectedInvoice.date)}`}
          maxWidth="md"
        >
          <div className="space-y-5">
            {/* Header branding */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  HEALTH<span className="text-brand-600">LINK</span> HOSPITAL
                </h4>
                <p className="text-[11px] text-slate-400">Clinical Outpatient Billing Desk</p>
              </div>
              <Badge status={selectedInvoice.status}>{selectedInvoice.status}</Badge>
            </div>

            {/* Bill to */}
            <div className="text-xs space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">Billed To Patient</span>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedInvoice.patientName}</p>
              <p className="text-slate-400 font-mono">Patient Code: {selectedInvoice.patientId}</p>
              <p className="text-slate-500">Payment Mode: <strong>{selectedInvoice.paymentMethod}</strong></p>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5 font-semibold text-slate-500">Service Particulars</th>
                    <th className="p-2.5 font-semibold text-slate-500 text-right">Fee (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5">Doctor Consultation</td>
                    <td className="p-2.5 text-right font-medium">{formatCurrency(selectedInvoice.consultationFee)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Diagnostic & Lab Services</td>
                    <td className="p-2.5 text-right font-medium">{formatCurrency(selectedInvoice.labFee)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Pharmacy / Medicines</td>
                    <td className="p-2.5 text-right font-medium">{formatCurrency(selectedInvoice.medicineFee)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Administrative Surcharges</td>
                    <td className="p-2.5 text-right font-medium">{formatCurrency(selectedInvoice.otherCharges)}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50/80 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    <td className="p-3 text-slate-900 dark:text-slate-100">Grand Total</td>
                    <td className="p-3 text-right text-brand-600 dark:text-brand-400 text-sm">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => showToast('Printing invoice receipt (Mock Print)', 'info')}
              >
                Print Receipt
              </Button>
              <div className="flex gap-2">
                {selectedInvoice.status !== 'Paid' && role === 'patient' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handlePatientMockPay(selectedInvoice.id, selectedInvoice.totalAmount);
                      setSelectedInvoice(null);
                    }}
                  >
                    Pay {formatCurrency(selectedInvoice.totalAmount)}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
