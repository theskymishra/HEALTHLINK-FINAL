import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  UserCheck,
  Search,
  Plus,
  LayoutGrid,
  List,
  Clock,
  Phone,
  Mail,
  Award,
  ChevronRight,
  DoorOpen,
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { Doctor, DoctorStatus } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Doctors: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { showToast } = useToast();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Add Doctor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    department: 'Cardiology',
    experienceYears: '',
    qualification: '',
    phone: '',
    email: '',
    availability: 'Mon - Fri, 09:00 AM - 03:00 PM',
    roomNumber: 'OPD-101',
    status: 'Active' as DoctorStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch {
      showToast('Failed to load doctors list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(search.toLowerCase()) ||
        doc.department.toLowerCase().includes(search.toLowerCase()) ||
        doc.email.toLowerCase().includes(search.toLowerCase());

      const matchesDept =
        departmentFilter === 'ALL' || doc.department === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [doctors, search, departmentFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      specialization: '',
      department: 'Cardiology',
      experienceYears: '',
      qualification: 'MBBS, MD',
      phone: '+91 98200 ',
      email: '',
      availability: 'Mon - Fri, 09:00 AM - 03:00 PM',
      roomNumber: 'OPD-101',
      status: 'Active',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = 'Doctor name is required';
    if (!formData.specialization.trim()) err.specialization = 'Specialization is required';
    if (!formData.experienceYears || isNaN(Number(formData.experienceYears))) {
      err.experienceYears = 'Valid experience years required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      err.email = 'Valid hospital email is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      err.phone = 'Contact number is required';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await doctorService.create({
        name: formData.name.startsWith('Dr.') ? formData.name : `Dr. ${formData.name}`,
        specialization: formData.specialization,
        department: formData.department,
        experienceYears: Number(formData.experienceYears),
        qualification: formData.qualification,
        phone: formData.phone,
        email: formData.email,
        availability: formData.availability,
        roomNumber: formData.roomNumber,
        status: formData.status,
        bio: `${formData.specialization} serving with ${formData.experienceYears} years of medical experience.`,
        schedule: [
          { day: 'Monday', slots: formData.availability, status: 'OPD' },
          { day: 'Wednesday', slots: formData.availability, status: 'OPD' },
          { day: 'Friday', slots: formData.availability, status: 'OPD' },
        ],
      });
      showToast('Doctor registered successfully', 'success');
      setIsModalOpen(false);
      loadDoctors();
    } catch {
      showToast('Failed to add doctor', 'error');
    }
  };

  const tableColumns = [
    {
      header: 'Doctor Name',
      accessor: (row: Doctor) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" src={row.avatarUrl} />
          <div>
            <span
              className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 cursor-pointer"
              onClick={() => navigate(`/doctors/${row.id}`)}
            >
              {row.name}
            </span>
            <p className="text-xs text-slate-400">{row.qualification}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row: Doctor) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.department}
        </span>
      ),
    },
    {
      header: 'Specialization',
      accessor: (row: Doctor) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.specialization}
        </span>
      ),
    },
    {
      header: 'Experience',
      accessor: (row: Doctor) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {row.experienceYears} yrs
        </span>
      ),
    },
    {
      header: 'Availability',
      accessor: (row: Doctor) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.availability}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Doctor) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Action',
      accessor: (row: Doctor) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/doctors/${row.id}`)}
        >
          View Profile
        </Button>
      ),
    },
  ];

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Doctors & Specialists
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {doctors.length} Physicians
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Medical specialists directory and consultation rosters
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAddModal}
        >
          Add Doctor
        </Button>
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Search by doctor name, specialization, or department..."
        />

        <div className="flex items-center gap-2.5">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Cardiology">Cardiology</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Neurology">Neurology</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {filteredDoctors.length === 0 && !loading ? (
        <EmptyState
          title="No doctors matched your criteria"
          description="Try selecting a different department filter or clearing search text."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setDepartmentFilter('ALL');
          }}
        />
      ) : viewMode === 'table' ? (
        <Table
          columns={tableColumns}
          data={filteredDoctors}
          keyExtractor={(d) => d.id}
          emptyMessage="No doctors listed."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <Card
              key={doc.id}
              className="p-5 flex flex-col justify-between group hover:border-brand-500/50 transition-all duration-200"
              hoverable
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={doc.name} size="lg" src={doc.avatarUrl} />
                    <div>
                      <h3
                        className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors cursor-pointer"
                        onClick={() => navigate(`/doctors/${doc.id}`)}
                      >
                        {doc.name}
                      </h3>
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {doc.department}
                      </p>
                      <p className="text-[11px] text-slate-400">{doc.qualification}</p>
                    </div>
                  </div>
                  <Badge status={doc.status}>{doc.status}</Badge>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Award className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium">{doc.specialization}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <DoorOpen className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{doc.roomNumber} ({doc.experienceYears} yrs exp.)</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.availability}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {doc.id}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/doctors/${doc.id}`)}
                >
                  Schedule & Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Hospital Medical Specialist"
        subtitle="Register credentials and consultation availability"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Doctor Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Ritu Saxena"
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={[
                { value: 'Cardiology', label: 'Cardiology' },
                { value: 'General Medicine', label: 'General Medicine' },
                { value: 'Orthopedics', label: 'Orthopedics' },
                { value: 'Pediatrics', label: 'Pediatrics' },
                { value: 'Neurology', label: 'Neurology' },
              ]}
            />
            <Input
              label="Specialization / Designation"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Senior Pediatrician"
              error={errors.specialization}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Experience (Years)"
              type="number"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
              placeholder="e.g. 12"
              error={errors.experienceYears}
              required
            />
            <Input
              label="Qualifications"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="MBBS, MD, DM"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Direct Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98XXX XXXXX"
              error={errors.phone}
              required
            />
            <Input
              label="Hospital Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="doctor@healthlink.org"
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Room / Cabin Number"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="OPD-204 (Block A)"
            />
            <Input
              label="Regular Consultation Timings"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              placeholder="Mon - Fri, 09:00 AM - 02:00 PM"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Specialist
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
