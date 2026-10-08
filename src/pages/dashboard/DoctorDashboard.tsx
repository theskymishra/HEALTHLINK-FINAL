import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck2,
  Stethoscope,
  PlusCircle,
  ArrowRight,
  ClipboardList,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { Appointment, Patient, RecordType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

interface ClinicalTask {
  id: string;
  title: string;
  category: 'Consultation' | 'Documentation' | 'Lab Review' | 'Follow-up';
  patient: string;
  dueTime: string;
  completed: boolean;
}

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Medical Record Modal state
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordPatientId, setRecordPatientId] = useState('');
  const [recordType, setRecordType] = useState<RecordType>('Consultation');
  const [recordNotes, setRecordNotes] = useState('');

  // Doctor tasks state
  const [tasks, setTasks] = useState<ClinicalTask[]>([
    {
      id: 'task-1',
      title: 'Review 12-lead ECG trace & troponin report',
      category: 'Lab Review',
      patient: 'Priya Sharma',
      dueTime: '10:00 AM',
      completed: false,
    },
    {
      id: 'task-2',
      title: 'Sign off outpatient clinical consultation note',
      category: 'Documentation',
      patient: 'Aarav Mehta',
      dueTime: '11:00 AM',
      completed: true,
    },
    {
      id: 'task-3',
      title: 'Evaluate blood pressure log & Amlodipine titration',
      category: 'Follow-up',
      patient: 'Rohan Verma',
      dueTime: '11:45 AM',
      completed: false,
    },
    {
      id: 'task-4',
      title: 'Review stress treadmill (TMT) test results',
      category: 'Consultation',
      patient: 'Vikram Singh',
      dueTime: '01:30 PM',
      completed: false,
    },
  ]);

  useEffect(() => {
    loadDoctorData();
  }, [user]);

  const loadDoctorData = async () => {
    setLoading(true);
    try {
      const currentDocId = user?.id || 'DOC-201';
      const [todayApts, allPatients] = await Promise.all([
        appointmentService.getToday(),
        patientService.getAll(),
      ]);

      // Filter appointments for the logged-in doctor
      const myTodayApts = todayApts.filter(
        (a) => a.doctorId === currentDocId || a.doctorName.toLowerCase().includes('rahul')
      );
      setAppointments(myTodayApts);

      // Associated patients for Dr. Rahul Sharma
      const myPatientsList = allPatients.filter((p) =>
        ['PAT-1001', 'PAT-1002', 'PAT-1003', 'PAT-1005', 'PAT-1006', 'PAT-1007'].includes(p.id)
      );
      setPatients(myPatientsList);
      if (myPatientsList.length > 0) setRecordPatientId(myPatientsList[0].id);
    } catch (err) {
      console.error('Failed loading doctor dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      showToast(`Appointment status marked as ${newStatus}`, 'success');
    } catch {
      showToast('Failed to update appointment status', 'error');
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    showToast('Clinical task updated', 'info');
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle.trim()) {
      showToast('Record title is required', 'error');
      return;
    }
    const patientObj = patients.find((p) => p.id === recordPatientId);
    if (!patientObj) return;

    try {
      await medicalRecordService.create({
        patientId: patientObj.id,
        patientName: patientObj.name,
        recordType,
        doctorId: user?.id || 'DOC-201',
        doctorName: user?.name || 'Dr. Rahul Sharma',
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        title: recordTitle,
        description: recordNotes || 'Clinical examination and recommendations documented.',
        fileSize: '1.2 MB PDF',
      });
      showToast(`Medical record created for ${patientObj.name}`, 'success');
      setIsAddRecordOpen(false);
      setRecordTitle('');
      setRecordNotes('');
    } catch {
      showToast('Failed to save medical record', 'error');
    }
  };

  // Schedule Table Columns
  const scheduleColumns = [
    {
      header: 'Time',
      accessor: (row: Appointment) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{row.time}</span>
        </div>
      ),
    },
    {
      header: 'Patient',
      accessor: (row: Appointment) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 cursor-pointer" onClick={() => navigate(`/patients/${row.patientId}`)}>
            {row.patientName}
          </span>
          <span className="text-xs text-slate-400 font-mono">{row.patientId}</span>
        </div>
      ),
    },
    {
      header: 'Appointment Type',
      accessor: (row: Appointment) => (
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded">
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
      header: 'Action',
      accessor: (row: Appointment) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'Scheduled')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400"
            >
              Confirm
            </button>
          )}
          {row.status === 'Scheduled' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'Completed')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
            >
              Complete
            </button>
          )}
          <button
            onClick={() => navigate('/appointments')}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Details
          </button>
        </div>
      ),
    },
  ];

  // My Patients Table Columns
  const patientColumns = [
    {
      header: 'Patient',
      accessor: (row: Patient) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 cursor-pointer" onClick={() => navigate(`/patients/${row.id}`)}>
            {row.name}
          </span>
          <span className="text-xs text-slate-400 font-mono">{row.id}</span>
        </div>
      ),
    },
    {
      header: 'Age',
      accessor: (row: Patient) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.age} yrs ({row.gender.charAt(0)})
        </span>
      ),
    },
    {
      header: 'Last Visit',
      accessor: (row: Patient) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(row.lastVisit)}
        </span>
      ),
    },
    {
      header: 'Next Appointment',
      accessor: (row: Patient) => {
        if (row.id === 'PAT-1001') {
          return <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Tomorrow, 10:30 AM</span>;
        }
        if (row.id === 'PAT-1002') {
          return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Today, 10:00 AM</span>;
        }
        if (row.id === 'PAT-1003') {
          return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Today, 11:30 AM</span>;
        }
        return <span className="text-xs text-slate-500">In 3 Weeks</span>;
      },
    },
    {
      header: 'Status',
      accessor: (row: Patient) => <Badge status={row.status}>{row.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Good morning, {user?.name || 'Dr. Rahul Sharma'}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Here's your clinical schedule for today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
            onClick={() => setIsAddRecordOpen(true)}
          >
            Add Medical Record
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CalendarDays className="w-4 h-4" />}
            onClick={() => navigate('/appointments')}
          >
            View Today's Appointments
          </Button>
        </div>
      </div>

      {/* Doctor Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card
          hoverable
          onClick={() => navigate('/appointments')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Today's Appointments</p>
            <p className="text-[11px] text-slate-400">8 active consultations</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/patients')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">View Patients</p>
            <p className="text-[11px] text-slate-400">My patient directory</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => setIsAddRecordOpen(true)}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Add Medical Record</p>
            <p className="text-[11px] text-slate-400">Consultation note / Rx</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/medical-records')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">View Medical Records</p>
            <p className="text-[11px] text-slate-400">Clinical documents</p>
          </div>
        </Card>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={appointments.length > 0 ? appointments.length.toString() : '8'}
          subtitle="Clinical slots today"
          icon={<CalendarDays className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Patients Today"
          value={patients.length > 0 ? patients.length.toString() : '6'}
          subtitle="Unique individuals"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-teal-50 dark:bg-teal-950/50"
          iconColor="text-teal-600 dark:text-teal-400"
        />

        <StatCard
          title="Pending Consultations"
          value={appointments.filter((a) => a.status === 'Pending' || a.status === 'Scheduled').length.toString()}
          subtitle="Awaiting encounter"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
        />

        <StatCard
          title="Completed Consultations"
          value={appointments.filter((a) => a.status === 'Completed').length.toString()}
          subtitle="Encounter signed off"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Today's Schedule Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Today's Schedule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assigned clinical appointments for Dr. Rahul Sharma
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/appointments')}
          >
            All Appointments ({appointments.length})
          </Button>
        </div>

        <Table
          columns={scheduleColumns}
          data={appointments}
          keyExtractor={(item) => item.id}
          emptyMessage={loading ? 'Loading clinical schedule...' : 'No appointments scheduled for today.'}
        />
      </div>

      {/* Two Columns: My Patients & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): My Patients */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                My Patients
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patients under active clinical care in Cardiology OPD
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/patients')}
            >
              View Directory
            </Button>
          </div>

          <Table
            columns={patientColumns}
            data={patients}
            keyExtractor={(item) => item.id}
            emptyMessage="No assigned patients."
          />
        </div>

        {/* Right Column (1 col): Pending Tasks */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Pending Clinical Tasks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediate action items for your clinical shift
            </p>
          </div>

          <Card className="p-4 space-y-3">
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    task.completed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60 opacity-75'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
                  }`}
                >
                  <button
                    type="button"
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-emerald-500 text-white'
                        : 'border border-slate-300 dark:border-slate-600 hover:border-brand-500'
                    }`}
                  >
                    {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        {task.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {task.dueTime}
                      </span>
                    </div>
                    <p className={`font-semibold mt-0.5 truncate text-slate-900 dark:text-slate-100 ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Patient: <strong>{task.patient}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{tasks.filter((t) => t.completed).length} of {tasks.length} Completed</span>
              <button
                type="button"
                onClick={() => showToast('All pending clinical tasks synced with hospital EHR', 'info')}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Sync EHR
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Medical Record Modal */}
      <Modal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        title="Add Clinical Consultation Record"
        subtitle="Catalog diagnostic note or prescription under Dr. Rahul Sharma"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <Input
            label="Document / Assessment Title"
            value={recordTitle}
            onChange={(e) => setRecordTitle(e.target.value)}
            placeholder="e.g. Follow-up Cardiac Assessment / Hypertension Refill"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Patient"
              value={recordPatientId}
              onChange={(e) => setRecordPatientId(e.target.value)}
              options={patients.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.id})`,
              }))}
            />

            <Select
              label="Record Type"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as RecordType)}
              options={[
                { value: 'Consultation', label: 'Consultation Note' },
                { value: 'Prescription', label: 'Prescription' },
                { value: 'Lab Report', label: 'Lab Report Review' },
                { value: 'Scan', label: 'Diagnostic Scan' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-1.5">
              Clinical Findings, Examination & Treatment Plan
            </label>
            <textarea
              rows={4}
              value={recordNotes}
              onChange={(e) => setRecordNotes(e.target.value)}
              placeholder="Enter patient vitals, systemic examination findings, diagnostic interpretations, or medication dosages..."
              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddRecordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Sign & Save Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
