import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  Stethoscope,
  User,
  MapPin,
} from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { Appointment, Patient, Doctor, AppointmentStatus, AppointmentType } from '../types';
import { Button } from '../components/common/Button';
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
import { formatDate } from '../utils/formatters';

export const Appointments: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Add / Book Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [aptDate, setAptDate] = useState('2026-10-08');
  const [aptTime, setAptTime] = useState('10:00 AM');
  const [aptType, setAptType] = useState<AppointmentType>('Consultation');
  const [aptReason, setAptReason] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // View Details Modal
  const [inspectAppointment, setInspectAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadData();
  }, [user, role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apts, pats, docs] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
        doctorService.getAll(),
      ]);

      // Filter role-specifically
      let filteredRoleApts = apts;
      if (role === 'doctor') {
        const currentDocId = user?.id || 'DOC-201';
        filteredRoleApts = apts.filter(
          (a) => a.doctorId === currentDocId || a.doctorName.toLowerCase().includes('rahul')
        );
      } else if (role === 'patient') {
        const currentPatId = user?.id || 'PAT-1001';
        filteredRoleApts = apts.filter(
          (a) => a.patientId === currentPatId || a.patientName.toLowerCase().includes('aarav')
        );
      }

      setAppointments(filteredRoleApts);
      setPatients(pats);
      setDoctors(docs);

      if (role === 'patient') {
        setSelectedPatientId(user?.id || 'PAT-1001');
      } else if (pats.length > 0) {
        setSelectedPatientId(pats[0].id);
      }

      if (role === 'doctor') {
        setSelectedDoctorId(user?.id || 'DOC-201');
      } else if (docs.length > 0) {
        setSelectedDoctorId(docs[0].id);
      }
    } catch {
      showToast('Failed to load appointments data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        apt.department.toLowerCase().includes(search.toLowerCase()) ||
        apt.id.toLowerCase().includes(search.toLowerCase()) ||
        apt.reason.toLowerCase().includes(search.toLowerCase());

      const matchesDoc =
        role !== 'admin' || doctorFilter === 'ALL' || apt.doctorId === doctorFilter;

      const matchesStatus =
        statusFilter === 'ALL' || apt.status === statusFilter;

      const matchesDate = !dateFilter || apt.date === dateFilter;

      return matchesSearch && matchesDoc && matchesStatus && matchesDate;
    });
  }, [appointments, search, doctorFilter, statusFilter, dateFilter, role]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      showToast(`Appointment status updated to ${newStatus}`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleOpenAdd = () => {
    if (role === 'patient') {
      setSelectedPatientId(user?.id || 'PAT-1001');
    } else if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }

    if (role === 'doctor') {
      setSelectedDoctorId(user?.id || 'DOC-201');
    } else if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }

    setAptDate('2026-10-08');
    setAptTime('10:00 AM');
    setAptType('Consultation');
    setAptReason('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!selectedPatientId && role !== 'patient') err.patient = 'Select a patient';
    if (!selectedDoctorId) err.doctor = 'Select a doctor';
    if (!aptDate) err.date = 'Select appointment date';
    if (!aptReason.trim()) err.reason = 'Clinical reason is required';
    setFormErrors(err);
    if (Object.keys(err).length > 0) return;

    const patientIdToUse = role === 'patient' ? (user?.id || 'PAT-1001') : selectedPatientId;
    const patientObj = patients.find((p) => p.id === patientIdToUse) || {
      id: patientIdToUse,
      name: user?.name || 'Aarav Mehta',
    };
    const doctorObj = doctors.find((d) => d.id === selectedDoctorId);

    if (!doctorObj) return;

    try {
      await appointmentService.create({
        patientId: patientObj.id,
        patientName: patientObj.name,
        doctorId: doctorObj.id,
        doctorName: doctorObj.name,
        department: doctorObj.department,
        date: aptDate,
        time: aptTime,
        type: aptType,
        status: 'Scheduled',
        reason: aptReason,
      });
      showToast(`Appointment scheduled with ${doctorObj.name}`, 'success');
      setIsModalOpen(false);
      loadData();
    } catch {
      showToast('Failed to schedule appointment', 'error');
    }
  };

  // Columns definition based on role
  const columns = useMemo(() => {
    if (role === 'patient') {
      return [
        {
          header: 'Doctor & Department',
          accessor: (row: Appointment) => (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100">{row.doctorName}</span>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{row.department}</span>
            </div>
          ),
        },
        {
          header: 'Date & Time',
          accessor: (row: Appointment) => (
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(row.date)}</span>
              <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" /> {row.time}
              </span>
            </div>
          ),
        },
        {
          header: 'Appointment Type',
          accessor: (row: Appointment) => (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300">
              {row.type}
            </span>
          ),
        },
        {
          header: 'Reason',
          accessor: (row: Appointment) => (
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-xs block" title={row.reason}>
              {row.reason}
            </span>
          ),
        },
        {
          header: 'Status',
          accessor: (row: Appointment) => <Badge status={row.status}>{row.status}</Badge>,
        },
        {
          header: 'Actions',
          accessor: (row: Appointment) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInspectAppointment(row)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View
              </button>
              {(row.status === 'Scheduled' || row.status === 'Pending') && (
                <button
                  onClick={() => handleStatusChange(row.id, 'Cancelled')}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          ),
        },
      ];
    }

    // Doctor & Admin Table Columns
    return [
      {
        header: 'Patient',
        accessor: (row: Appointment) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">{row.patientName}</span>
            <span className="text-xs text-slate-400 font-mono">{row.patientId}</span>
          </div>
        ),
      },
      ...(role === 'admin'
        ? [
            {
              header: 'Doctor & Dept',
              accessor: (row: Appointment) => (
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{row.doctorName}</span>
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{row.department}</span>
                </div>
              ),
            },
          ]
        : []),
      {
        header: 'Date & Time',
        accessor: (row: Appointment) => (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(row.date)}</span>
            <span className="text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" /> {row.time}
            </span>
          </div>
        ),
      },
      {
        header: 'Type',
        accessor: (row: Appointment) => (
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {row.type}
          </span>
        ),
      },
      {
        header: 'Reason',
        accessor: (row: Appointment) => (
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs block" title={row.reason}>
            {row.reason}
          </span>
        ),
      },
      {
        header: 'Status',
        accessor: (row: Appointment) => <Badge status={row.status}>{row.status}</Badge>,
      },
      {
        header: 'Actions',
        accessor: (row: Appointment) => (
          <div className="flex items-center gap-2">
            {row.status === 'Pending' && (
              <button
                onClick={() => handleStatusChange(row.id, 'Scheduled')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400"
              >
                Confirm
              </button>
            )}
            {row.status === 'Scheduled' && (
              <button
                onClick={() => handleStatusChange(row.id, 'Completed')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
              >
                Complete
              </button>
            )}
            {row.status !== 'Cancelled' && row.status !== 'Completed' && (
              <button
                onClick={() => handleStatusChange(row.id, 'Cancelled')}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => setInspectAppointment(row)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Details
            </button>
          </div>
        ),
      },
    ];
  }, [role]);

  const pageTitle = role === 'admin' ? 'Appointments Schedule' : 'My Appointments';
  const pageSubtitle =
    role === 'patient'
      ? 'Your scheduled outpatient consultations and booking history'
      : role === 'doctor'
      ? `Assigned clinical consultation schedule for ${user?.name || 'Dr. Rahul Sharma'}`
      : 'Outpatient consultation schedules and booking ledger across all departments';

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
              {appointments.length} Total
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {pageSubtitle}
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          {role === 'patient' ? 'Book New Appointment' : 'Schedule Appointment'}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder={
            role === 'patient'
              ? 'Search by doctor, department, or reason...'
              : 'Search by patient, doctor, department, or ID...'
          }
        />

        <div className="flex items-center gap-2 flex-wrap">
          {/* Doctor filter (Admin only) */}
          {role === 'admin' && (
            <select
              value={doctorFilter}
              onChange={(e) => {
                setDoctorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="ALL">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-rose-500 hover:underline px-1"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {filteredAppointments.length === 0 && !loading ? (
        <EmptyState
          title="No appointments found"
          description="Try selecting different filters or clearing search terms."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSearch('');
            setDoctorFilter('ALL');
            setStatusFilter('ALL');
            setDateFilter('');
          }}
        />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={currentData}
            keyExtractor={(a) => a.id}
            emptyMessage={loading ? 'Loading appointments...' : 'No appointments scheduled.'}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAppointments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Add / Book Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={role === 'patient' ? 'Book Clinical Appointment' : 'Schedule Clinical Appointment'}
        subtitle={
          role === 'patient'
            ? 'Select a specialist doctor and preferred consultation slot'
            : 'Book an outpatient consultation slot for an active patient'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {role !== 'patient' ? (
              <Select
                label="Select Patient"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                options={patients.map((p) => ({
                  value: p.id,
                  label: `${p.name} (${p.id})`,
                }))}
                error={formErrors.patient}
              />
            ) : (
              <Input
                label="Patient"
                value={`${user?.name || 'Aarav Mehta'} (${user?.id || 'PAT-1001'})`}
                disabled
              />
            )}

            {role !== 'doctor' ? (
              <Select
                label="Select Attending Doctor"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                options={doctors.map((d) => ({
                  value: d.id,
                  label: `${d.name} — ${d.department}`,
                }))}
                error={formErrors.doctor}
              />
            ) : (
              <Input
                label="Attending Doctor"
                value={`${user?.name || 'Dr. Rahul Sharma'} (Cardiology)`}
                disabled
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Appointment Date"
              type="date"
              value={aptDate}
              onChange={(e) => setAptDate(e.target.value)}
              error={formErrors.date}
              required
            />
            <Select
              label="Time Slot"
              value={aptTime}
              onChange={(e) => setAptTime(e.target.value)}
              options={[
                { value: '09:00 AM', label: '09:00 AM' },
                { value: '09:30 AM', label: '09:30 AM' },
                { value: '10:00 AM', label: '10:00 AM' },
                { value: '10:30 AM', label: '10:30 AM' },
                { value: '11:00 AM', label: '11:00 AM' },
                { value: '11:30 AM', label: '11:30 AM' },
                { value: '02:00 PM', label: '02:00 PM' },
                { value: '02:30 PM', label: '02:30 PM' },
                { value: '03:00 PM', label: '03:00 PM' },
                { value: '04:00 PM', label: '04:00 PM' },
              ]}
            />
            <Select
              label="Consultation Type"
              value={aptType}
              onChange={(e) => setAptType(e.target.value as AppointmentType)}
              options={[
                { value: 'Consultation', label: 'Consultation' },
                { value: 'Follow-up', label: 'Follow-up' },
                { value: 'General Checkup', label: 'General Checkup' },
                { value: 'Emergency', label: 'Emergency' },
                { value: 'Specialist Review', label: 'Specialist Review' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-1.5">
              Reason for Visit / Health Concern
            </label>
            <textarea
              rows={3}
              value={aptReason}
              onChange={(e) => setAptReason(e.target.value)}
              placeholder="e.g. Regular cardiovascular follow-up and review of medication tolerance"
              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {formErrors.reason && <p className="text-xs text-rose-500 mt-1">{formErrors.reason}</p>}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {role === 'patient' ? 'Confirm Booking' : 'Confirm Appointment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Inspect Appointment Modal */}
      {inspectAppointment && (
        <Modal
          isOpen={!!inspectAppointment}
          onClose={() => setInspectAppointment(null)}
          title="Appointment Encounter Details"
          subtitle={`Reference ID: ${inspectAppointment.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Patient Name</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{inspectAppointment.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Attending Doctor</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{inspectAppointment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Department</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{inspectAppointment.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Date & Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(inspectAppointment.date)} at {inspectAppointment.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Consultation Type</span>
                <span className="font-semibold">{inspectAppointment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase">Status</span>
                <Badge status={inspectAppointment.status}>{inspectAppointment.status}</Badge>
              </div>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Clinical Reason & Remarks
              </span>
              <p className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {inspectAppointment.reason}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setInspectAppointment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
