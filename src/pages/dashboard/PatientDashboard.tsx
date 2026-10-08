import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  History,
  FileText,
  IndianRupee,
  Clock,
  ArrowRight,
  Download,
  Eye,
  CalendarCheck2,
  Stethoscope,
  CreditCard,
  User,
  PlusCircle,
  FileCheck,
  Receipt,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { appointmentService } from '../../services/appointmentService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { billingService } from '../../services/billingService';
import { doctorService } from '../../services/doctorService';
import { Appointment, MedicalRecord, Invoice, Doctor } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Booking Form State
  const [bookDoctorId, setBookDoctorId] = useState('DOC-201');
  const [bookDate, setBookDate] = useState('2026-10-12');
  const [bookTime, setBookTime] = useState('11:00 AM');
  const [bookReason, setBookReason] = useState('Routine clinical follow-up');

  useEffect(() => {
    loadPatientData();
  }, [user]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const patientId = user?.id || 'PAT-1001';
      const [allApts, allRecs, allInvs, allDocs] = await Promise.all([
        appointmentService.getByPatientId(patientId),
        medicalRecordService.getByPatientId(patientId),
        billingService.getByPatientId(patientId),
        doctorService.getAll(),
      ]);

      setAppointments(allApts);
      setMedicalRecords(allRecs);
      setInvoices(allInvs);
      setDoctors(allDocs);
      if (allDocs.length > 0) setBookDoctorId(allDocs[0].id);
    } catch (err) {
      console.error('Failed loading patient dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  // Prominent upcoming appointment: Dr. Rahul Sharma, Tomorrow 10:30 AM
  const upcomingAppointment = appointments.find((a) => a.id === 'APT-310') || appointments.find((a) => a.status === 'Scheduled');

  // Book appointment handler
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === bookDoctorId);
    if (!doc) return;

    try {
      await appointmentService.create({
        patientId: user?.id || 'PAT-1001',
        patientName: user?.name || 'Aarav Mehta',
        doctorId: doc.id,
        doctorName: doc.name,
        department: doc.department,
        date: bookDate,
        time: bookTime,
        type: 'Consultation',
        status: 'Scheduled',
        reason: bookReason,
      });
      showToast(`Appointment booked with ${doc.name} for ${formatDate(bookDate)} at ${bookTime}`, 'success');
      setIsBookModalOpen(false);
      loadPatientData();
    } catch {
      showToast('Failed to book appointment', 'error');
    }
  };

  const handleDownload = (rec: MedicalRecord) => {
    showToast(`Downloading ${rec.title} (${rec.fileSize || 'PDF'}). Secure patient document ready.`, 'info');
  };

  // Recent Medical Records Columns
  const recordColumns = [
    {
      header: 'Date',
      accessor: (row: MedicalRecord) => (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {formatDate(row.date)}
        </span>
      ),
    },
    {
      header: 'Record Type',
      accessor: (row: MedicalRecord) => (
        <Badge
          variant={
            row.recordType === 'Consultation'
              ? 'primary'
              : row.recordType === 'Lab Report'
              ? 'secondary'
              : 'neutral'
          }
          showDot={false}
        >
          {row.recordType}
        </Badge>
      ),
    },
    {
      header: 'Doctor',
      accessor: (row: MedicalRecord) => (
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
          {row.doctorName}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: (row: MedicalRecord) => {
        const docObj = doctors.find((d) => d.id === row.doctorId);
        return (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {docObj?.department || (row.doctorName.includes('Rahul') ? 'Cardiology' : 'General Medicine')}
          </span>
        );
      },
    },
    {
      header: 'Action',
      accessor: (row: MedicalRecord) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedRecord(row)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View
          </button>
          <button
            onClick={() => handleDownload(row)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Download document"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'Aarav Mehta'}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage your appointments, medical records, and healthcare information.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            onClick={() => navigate('/billing')}
          >
            View Billing
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CalendarDays className="w-4 h-4" />}
            onClick={() => setIsBookModalOpen(true)}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Patient Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card
          hoverable
          onClick={() => setIsBookModalOpen(true)}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Book Appointment</p>
            <p className="text-[11px] text-slate-400">Find doctor & slot</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/medical-records')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Medical Records</p>
            <p className="text-[11px] text-slate-400">Labs, scans, prescriptions</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/billing')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">View Billing</p>
            <p className="text-[11px] text-slate-400">Invoices & receipts</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/settings')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Update Profile</p>
            <p className="text-[11px] text-slate-400">Personal details</p>
          </div>
        </Card>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Appointment"
          value={appointments.filter((a) => a.status === 'Scheduled').length.toString()}
          subtitle="Scheduled visits"
          icon={<CalendarDays className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Previous Visits"
          value={appointments.filter((a) => a.status === 'Completed').length.toString()}
          subtitle="Completed consultations"
          icon={<History className="w-5 h-5" />}
          iconBgColor="bg-teal-50 dark:bg-teal-950/50"
          iconColor="text-teal-600 dark:text-teal-400"
        />

        <StatCard
          title="Medical Records"
          value={medicalRecords.length.toString()}
          subtitle="Digital diagnostic files"
          icon={<FileText className="w-5 h-5" />}
          iconBgColor="bg-purple-50 dark:bg-purple-950/50"
          iconColor="text-purple-600 dark:text-purple-400"
        />

        <StatCard
          title="Outstanding Bill"
          value={formatCurrency(invoices.filter((i) => i.status === 'Pending' || i.status === 'Overdue').reduce((acc, i) => acc + i.totalAmount, 0))}
          subtitle={`${invoices.filter((i) => i.status === 'Pending').length} pending invoices`}
          icon={<IndianRupee className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Prominent Section: Upcoming Appointment & Billing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prominent Card: Upcoming Appointment (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Upcoming Appointment
            </h2>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/appointments')}
            >
              My Appointments ({appointments.length})
            </Button>
          </div>

          <Card className="p-6 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60 border-brand-200/70 dark:border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {upcomingAppointment?.doctorName || 'Dr. Rahul Sharma'}
                  </h3>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {upcomingAppointment?.department || 'Cardiology'} • OPD-302 (Block A)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={upcomingAppointment?.status || 'Scheduled'}>
                  {upcomingAppointment?.status || 'Scheduled'}
                </Badge>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200/60 dark:border-brand-900">
                  {upcomingAppointment?.type || 'Consultation'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4 text-brand-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Scheduled Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Tomorrow (Oct 08, 2026)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Time Slot</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    10:30 AM (Token #1)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Location</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Healthlink Hospital, Main OPD
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                Reason: <strong>{upcomingAppointment?.reason || 'Follow-up consultation and stress test evaluation'}</strong>
              </p>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (upcomingAppointment) setSelectedAppointment(upcomingAppointment);
                  else navigate('/appointments');
                }}
              >
                View Appointment
              </Button>
            </div>
          </Card>
        </div>

        {/* Section 7: Patient Dashboard — Billing Summary (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Billing Summary
            </h2>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/billing')}
            >
              Invoices
            </Button>
          </div>

          <Card className="p-5 space-y-4 bg-white dark:bg-slate-900">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block">
                  Outstanding Balance
                </span>
                <span className="text-2xl font-black text-amber-800 dark:text-amber-300">
                  ₹1,500
                </span>
              </div>
              <Badge status="Pending">Pending</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Last Payment</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹2,800 (Paid)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Recent Invoice</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">INV-2026-1042</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400">Payment Due Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">16 Oct 2026</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                leftIcon={<CreditCard className="w-4 h-4 text-brand-600" />}
                onClick={() => navigate('/billing')}
              >
                View Billing & Invoices
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 6: Patient Dashboard — Recent Medical Records */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Recent Medical Records
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your clinical notes, laboratory reports, scans, and verified prescriptions
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/medical-records')}
          >
            All Records ({medicalRecords.length})
          </Button>
        </div>

        <Table
          columns={recordColumns}
          data={medicalRecords.slice(0, 4)}
          keyExtractor={(item) => item.id}
          emptyMessage={loading ? 'Loading medical records...' : 'No medical records found.'}
        />
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title="Clinical Appointment Confirmation"
          subtitle={`Booking Reference: ${selectedAppointment.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Attending Doctor</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedAppointment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Department</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedAppointment.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Date & Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedAppointment.date)} at {selectedAppointment.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Consultation Type</span>
                <span className="font-semibold">{selectedAppointment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Status</span>
                <Badge status={selectedAppointment.status}>{selectedAppointment.status}</Badge>
              </div>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Clinical Reason & Remarks
              </span>
              <p className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {selectedAppointment.reason}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedAppointment(null);
                  navigate('/appointments');
                }}
              >
                Go to Appointments Schedule
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Medical Record View Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          subtitle={`${selectedRecord.recordType} • ${selectedRecord.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-semibold">Authorizing Doctor</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedRecord.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-semibold">Date of Record</span>
                <span>{formatDate(selectedRecord.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase font-semibold">Status</span>
                <Badge status={selectedRecord.status}>{selectedRecord.status}</Badge>
              </div>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Clinical Summary / Observations
              </span>
              <p className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {selectedRecord.description}
              </p>
            </div>

            {selectedRecord.diagnosis && (
              <div className="p-2.5 rounded-lg bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 font-semibold border border-brand-200 dark:border-brand-900">
                Diagnosis: {selectedRecord.diagnosis}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-400">File size: {selectedRecord.fileSize || 'PDF'}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => handleDownload(selectedRecord)}
                >
                  Download E-Record
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Doctor Appointment"
        subtitle="Book a consultation slot with a specialist"
        maxWidth="md"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <Select
            label="Select Attending Doctor"
            value={bookDoctorId}
            onChange={(e) => setBookDoctorId(e.target.value)}
            options={doctors.map((d) => ({
              value: d.id,
              label: `${d.name} (${d.department})`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred Date"
              type="date"
              value={bookDate}
              onChange={(e) => setBookDate(e.target.value)}
              required
            />
            <Select
              label="Preferred Time Slot"
              value={bookTime}
              onChange={(e) => setBookTime(e.target.value)}
              options={[
                { value: '09:00 AM', label: '09:00 AM' },
                { value: '09:30 AM', label: '09:30 AM' },
                { value: '10:00 AM', label: '10:00 AM' },
                { value: '10:30 AM', label: '10:30 AM' },
                { value: '11:00 AM', label: '11:00 AM' },
                { value: '11:30 AM', label: '11:30 AM' },
                { value: '02:00 PM', label: '02:00 PM' },
                { value: '03:00 PM', label: '03:00 PM' },
                { value: '04:00 PM', label: '04:00 PM' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-1.5">
              Reason for Consultation / Health Concerns
            </label>
            <textarea
              rows={3}
              value={bookReason}
              onChange={(e) => setBookReason(e.target.value)}
              placeholder="e.g. Follow-up consultation on blood pressure and review of test reports"
              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
