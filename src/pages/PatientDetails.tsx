import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Droplet,
  ShieldAlert,
  User,
  HeartPulse,
  Activity,
  PlusCircle,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { medicalRecordService } from '../services/medicalRecordService';
import { billingService } from '../services/billingService';
import { Patient, Appointment, MedicalRecord, Invoice } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCurrency } from '../utils/formatters';

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'records' | 'billing'>('overview');

  useEffect(() => {
    if (id) {
      loadAllPatientData(id);
    }
  }, [id]);

  const loadAllPatientData = async (patientId: string) => {
    setLoading(true);
    try {
      const [pat, apts, recs, invs] = await Promise.all([
        patientService.getById(patientId),
        appointmentService.getByPatientId(patientId),
        medicalRecordService.getByPatientId(patientId),
        billingService.getByPatientId(patientId),
      ]);
      setPatient(pat || null);
      setAppointments(apts);
      setRecords(recs);
      setInvoices(invs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (role === 'patient') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return <LoadingState message="Loading patient profile & clinical history..." />;
  }

  if (!patient) {
    return (
      <EmptyState
        title="Patient Record Not Found"
        description="The requested patient ID does not exist in the local records registry."
        actionLabel="Return to Patients Directory"
        onAction={() => navigate('/patients')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with back button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => navigate('/patients')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {role === 'doctor' ? 'My Patients' : 'Patients Directory'}
        </button>
        <div className="flex items-center gap-2">
          <Badge status={patient.status}>{patient.status}</Badge>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-tealbrand-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
              {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {patient.name}
                </h1>
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200/80 dark:border-brand-800">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>{patient.age} Years Old</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                  <Droplet className="w-3 h-3 fill-rose-500" /> Blood Group: {patient.bloodGroup}
                </span>
                <span>•</span>
                <span>Last Encounter: {formatDate(patient.lastVisit)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => navigate('/appointments')}
            >
              Book Appointment
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/billing')}
            >
              Generate Bill
            </Button>
          </div>
        </div>

        {/* Contact & Demographics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{patient.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5 truncate">{patient.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Address</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1">{patient.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
            <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emergency Contact</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
              </p>
              <p className="text-slate-400">{patient.emergencyContact.phone}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Overview & Timeline
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'records'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Medical Records ({records.length})
        </button>

        {role === 'admin' && (
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'billing'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Billing & Invoices ({invoices.length})
          </button>
        )}
      </div>

      {/* Tab 1: Overview & Timeline */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medical History Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-brand-600" /> Clinical History Timeline
            </h3>

            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                {patient.medicalHistory.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-brand-600 dark:bg-brand-500 border-2 border-white dark:border-slate-900 ring-2 ring-brand-100 dark:ring-brand-950" />

                    <Card className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                          {formatDate(item.date)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Attended by {item.doctor}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.diagnosis}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.treatment}
                      </p>
                      {item.notes && (
                        <p className="text-xs italic text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                          Note: {item.notes}
                        </p>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No timeline entries logged yet" description="History entries will appear as clinical encounters occur." />
            )}
          </div>

          {/* Known Allergies & Clinical Alerts */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Allergies & Alerts
            </h3>
            <Card className="p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Documented Allergies
              </p>
              <div className="flex flex-wrap gap-2">
                {patient.allergies && patient.allergies.length > 0 ? (
                  patient.allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                    >
                      {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No allergies on record</span>
                )}
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quick Clinical Actions
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => navigate('/appointments')}
                >
                  Schedule Next Follow-Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => navigate('/medical-records')}
                >
                  Upload New Diagnostic Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Patient Consultation History
            </h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/appointments')}
            >
              Book Appointment
            </Button>
          </div>

          <Table
            columns={[
              { header: 'Appt ID', accessor: 'id' },
              { header: 'Doctor', accessor: 'doctorName' },
              { header: 'Department', accessor: 'department' },
              { header: 'Date', accessor: (row: Appointment) => formatDate(row.date) },
              { header: 'Time', accessor: 'time' },
              { header: 'Type', accessor: 'type' },
              { header: 'Status', accessor: (row: Appointment) => <Badge status={row.status}>{row.status}</Badge> },
            ]}
            data={appointments}
            keyExtractor={(a) => a.id}
            emptyMessage="No appointments scheduled for this patient."
          />
        </div>
      )}

      {/* Tab 3: Medical Records */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Diagnostic & Medical Records
            </h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/medical-records')}
            >
              Add Record
            </Button>
          </div>

          <Table
            columns={[
              { header: 'Record ID', accessor: 'id' },
              { header: 'Type', accessor: (row: MedicalRecord) => <Badge variant="neutral">{row.recordType}</Badge> },
              { header: 'Title', accessor: 'title' },
              { header: 'Attending Doctor', accessor: 'doctorName' },
              { header: 'Date', accessor: (row: MedicalRecord) => formatDate(row.date) },
              { header: 'Status', accessor: (row: MedicalRecord) => <Badge status={row.status}>{row.status}</Badge> },
            ]}
            data={records}
            keyExtractor={(r) => r.id}
            emptyMessage="No diagnostic records filed for this patient."
          />
        </div>
      )}

      {/* Tab 4: Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Billing Ledger & Invoices
            </h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/billing')}
            >
              Create Invoice
            </Button>
          </div>

          <Table
            columns={[
              { header: 'Invoice ID', accessor: 'id' },
              { header: 'Date', accessor: (row: Invoice) => formatDate(row.date) },
              { header: 'Amount', accessor: (row: Invoice) => <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(row.totalAmount)}</span> },
              { header: 'Payment Method', accessor: 'paymentMethod' },
              { header: 'Status', accessor: (row: Invoice) => <Badge status={row.status}>{row.status}</Badge> },
            ]}
            data={invoices}
            keyExtractor={(inv) => inv.id}
            emptyMessage="No invoices generated for this patient."
          />
        </div>
      )}
    </div>
  );
};
