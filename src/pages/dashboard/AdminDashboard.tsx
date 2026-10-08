import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarDays,
  IndianRupee,
  HeartPulse,
  Stethoscope,
  Bone,
  Baby,
  Brain,
  ArrowRight,
  UserPlus,
  CalendarPlus,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { appointmentService } from '../../services/appointmentService';
import { departmentService } from '../../services/departmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { billingService } from '../../services/billingService';
import { Appointment, Department } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patientCount, setPatientCount] = useState<number>(0);
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [revenueStats, setRevenueStats] = useState<{ totalRevenue: number; paid: number; pending: number }>({
    totalRevenue: 0,
    paid: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [apts, deps, pats, docs, stats] = await Promise.all([
          appointmentService.getToday(),
          departmentService.getAll(),
          patientService.getAll(),
          doctorService.getAll(),
          billingService.getStats(),
        ]);
        setAppointments(apts);
        setDepartments(deps);
        setPatientCount(pats.length);
        setDoctorCount(docs.length);
        setRevenueStats(stats);
      } catch (err) {
        console.error('Failed loading admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
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

  const getDepartmentIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-brand-500" />;
      case 'Bone':
        return <Bone className="w-5 h-5 text-amber-500" />;
      case 'Baby':
        return <Baby className="w-5 h-5 text-tealbrand-500" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-500" />;
      default:
        return <HeartPulse className="w-5 h-5 text-brand-500" />;
    }
  };

  const appointmentColumns = [
    {
      header: 'Patient',
      accessor: (row: Appointment) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {row.patientName}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {row.patientId}
          </span>
        </div>
      ),
    },
    {
      header: 'Doctor',
      accessor: (row: Appointment) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {row.doctorName}
          </span>
          <span className="text-xs text-slate-400">
            {row.department}
          </span>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row: Appointment) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {row.department}
        </span>
      ),
    },
    {
      header: 'Time',
      accessor: (row: Appointment) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{row.time}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Appointment) => (
        <Badge status={row.status}>{row.status}</Badge>
      ),
    },
    {
      header: 'Action',
      accessor: (row: Appointment) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'Scheduled')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400 hover:underline"
            >
              Confirm
            </button>
          )}
          {row.status === 'Scheduled' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'Completed')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 hover:underline"
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

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Good morning, {user?.name || 'Healthlink Admin'}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening across the hospital today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
            onClick={() => navigate('/patients')}
          >
            Add Patient
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CalendarDays className="w-4 h-4" />}
            onClick={() => navigate('/appointments')}
          >
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Admin Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card
          hoverable
          onClick={() => navigate('/patients')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Add Patient</p>
            <p className="text-[11px] text-slate-400">Register in-patient</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/doctors')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Add Doctor</p>
            <p className="text-[11px] text-slate-400">Staff onboarding</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/appointments')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <CalendarPlus className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Schedule Appointment</p>
            <p className="text-[11px] text-slate-400">OPD consultation</p>
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/billing')}
          className="p-3.5 flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-900 hover:border-brand-500/50 transition-all"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Create Invoice</p>
            <p className="text-[11px] text-slate-400">Hospital billing desk</p>
          </div>
        </Card>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={patientCount > 0 ? patientCount.toLocaleString() : '8'}
          change="+8.2%"
          isPositiveChange={true}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/50"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Total Doctors"
          value={doctorCount > 0 ? doctorCount.toString() : '7'}
          subtitle={`${departments.length || 5} departments`}
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="bg-teal-50 dark:bg-teal-950/50"
          iconColor="text-teal-600 dark:text-teal-400"
        />

        <StatCard
          title="Today's Appointments"
          value={appointments.length > 0 ? appointments.length.toString() : '16'}
          subtitle={`${appointments.filter((a) => a.status === 'Pending').length} pending`}
          icon={<CalendarDays className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
        />

        <StatCard
          title="Total Revenue"
          value={`₹${(revenueStats.paid || 48600).toLocaleString('en-IN')}`}
          change="+12.5%"
          isPositiveChange={true}
          icon={<IndianRupee className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Today's Appointments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Today's Appointments
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Management overview across all clinical departments for today
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/appointments')}
          >
            View All ({appointments.length})
          </Button>
        </div>

        <Table
          columns={appointmentColumns}
          data={appointments}
          keyExtractor={(item) => item.id}
          emptyMessage={loading ? 'Loading today appointments...' : 'No appointments scheduled for today.'}
        />
      </div>

      {/* Department Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Department Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Capacity, staffing, and active patient volume across clinical units
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/doctors')}
          >
            Doctors Directory
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {departments.map((dept) => (
            <Card
              key={dept.id}
              className="p-4 space-y-3 cursor-pointer hover:border-brand-500/50 transition-all"
              onClick={() => navigate('/doctors')}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {getDepartmentIcon(dept.iconName)}
                </div>
                <Badge variant="neutral" showDot={false}>
                  {dept.todayAppointments} Today
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Lead: {dept.headOfDepartment}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Staff: <strong>{dept.doctorCount} Doctors</strong></span>
                <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                  {dept.occupiedBeds}/{dept.totalBeds} Beds
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
