import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Calendar,
  Award,
  DoorOpen,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { Doctor, Appointment } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Table } from '../components/common/Table';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

export const DoctorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDoctorInfo(id);
    }
  }, [id]);

  const loadDoctorInfo = async (docId: string) => {
    setLoading(true);
    try {
      const [doc, apts] = await Promise.all([
        doctorService.getById(docId),
        appointmentService.getByDoctorId(docId),
      ]);
      setDoctor(doc || null);
      setAppointments(apts);
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
    return <LoadingState message="Loading doctor schedule & credentials..." />;
  }

  if (!doctor) {
    return (
      <EmptyState
        title="Doctor Not Found"
        description="The physician record requested does not exist."
        actionLabel="Back to Doctors List"
        onAction={() => navigate('/doctors')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => navigate('/doctors')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doctors Directory
        </button>
        <Badge status={doctor.status}>{doctor.status}</Badge>
      </div>

      {/* Main Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar name={doctor.name} size="xl" src={doctor.avatarUrl} />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {doctor.name}
                </h1>
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200/80 dark:border-brand-800">
                  {doctor.id}
                </span>
              </div>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                {doctor.specialization} • {doctor.department}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {doctor.qualification} • {doctor.experienceYears} Years of Clinical Practice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => navigate('/appointments')}
            >
              Book with {doctor.name.split(' ')[1]}
            </Button>
          </div>
        </div>

        {/* Contact info bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
            <DoorOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outpatient Clinic</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{doctor.roomNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Standard OPD Hours</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{doctor.availability}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Direct Ext / Mobile</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{doctor.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hospital Email</p>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5 truncate">{doctor.email}</p>
            </div>
          </div>
        </div>

        {doctor.bio && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-slate-100">Clinical Focus: </strong> {doctor.bio}
          </div>
        )}
      </Card>

      {/* Grid: Weekly Availability + Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Availability Schedule */}
        <div className="space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-brand-600" /> Weekly Availability
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">Regular Roster</span>
          </div>

          <Card className="p-4 space-y-2.5">
            {doctor.schedule.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{slot.day}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{slot.slots}</p>
                </div>
                <Badge
                  variant={
                    slot.status === 'OPD' || slot.status === 'Available'
                      ? 'status'
                      : slot.status === 'Surgery'
                      ? 'primary'
                      : 'neutral'
                  }
                  status={slot.status === 'OPD' ? 'Active' : slot.status}
                >
                  {slot.status}
                </Badge>
              </div>
            ))}
          </Card>
        </div>

        {/* Doctor's Appointments Table */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Scheduled Consultations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Outpatients registered with {doctor.name}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/appointments')}
            >
              All Appointments
            </Button>
          </div>

          <Table
            columns={[
              {
                header: 'Patient',
                accessor: (row: Appointment) => (
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{row.patientName}</span>
                    <span className="text-xs text-slate-400 font-mono">{row.patientId}</span>
                  </div>
                ),
              },
              {
                header: 'Date & Time',
                accessor: (row: Appointment) => (
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    {formatDate(row.date)} at <strong>{row.time}</strong>
                  </span>
                ),
              },
              {
                header: 'Consultation Type',
                accessor: 'type',
              },
              {
                header: 'Status',
                accessor: (row: Appointment) => <Badge status={row.status}>{row.status}</Badge>,
              },
            ]}
            data={appointments}
            keyExtractor={(a) => a.id}
            emptyMessage={`No appointments currently scheduled for ${doctor.name}.`}
          />
        </div>
      </div>
    </div>
  );
};
