import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Droplet,
  FileText,
  CalendarDays,
  History,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { Patient, Gender, BloodGroup, PatientStatus } from '../types';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

export const Patients: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bloodFilter, setBloodFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Add/Edit Patient Modal State (Admin)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male' as Gender,
    bloodGroup: 'B+' as BloodGroup,
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRel: 'Spouse',
    emergencyContactPhone: '',
    status: 'Active' as PatientStatus,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // View Medical History Modal State (Doctor)
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);

  // Delete Dialog State (Admin)
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [role, user]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await patientService.getAll();
      if (role === 'doctor') {
        // Show doctor's associated patients
        const myPatients = data.filter((p) =>
          ['PAT-1001', 'PAT-1002', 'PAT-1003', 'PAT-1005', 'PAT-1006', 'PAT-1007'].includes(p.id)
        );
        setPatients(myPatients);
      } else {
        setPatients(data);
      }
    } catch {
      showToast('Failed to load patient records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || p.status === statusFilter;

      const matchesBlood =
        bloodFilter === 'ALL' || p.bloodGroup === bloodFilter;

      return matchesSearch && matchesStatus && matchesBlood;
    });
  }, [patients, search, statusFilter, bloodFilter]);

  // Paginated records
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const handleOpenAddModal = () => {
    setEditingPatientId(null);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+91 ',
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactRel: 'Family',
      emergencyContactPhone: '+91 ',
      status: 'Active',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      emergencyContactName: patient.emergencyContact.name,
      emergencyContactRel: patient.emergencyContact.relationship,
      emergencyContactPhone: patient.emergencyContact.phone,
      status: patient.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      errors.age = 'Enter a valid age';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      errors.phone = 'Valid phone number is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Valid email is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Residential address is required';
    }
    if (!formData.emergencyContactName.trim()) {
      errors.emergencyContactName = 'Emergency contact name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingPatientId) {
        await patientService.update(editingPatientId, {
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          status: formData.status,
          emergencyContact: {
            name: formData.emergencyContactName,
            relationship: formData.emergencyContactRel,
            phone: formData.emergencyContactPhone,
          },
        });
        showToast('Patient record updated successfully', 'success');
      } else {
        await patientService.create({
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          status: formData.status,
          emergencyContact: {
            name: formData.emergencyContactName,
            relationship: formData.emergencyContactRel,
            phone: formData.emergencyContactPhone,
          },
          medicalHistory: [
            {
              date: new Date().toISOString().split('T')[0],
              diagnosis: 'Initial Clinical Registration & Triage',
              doctor: 'Dr. Rahul Sharma',
              treatment: 'Vital signs logged; outpatient profile generated.',
            },
          ],
        });
        showToast('New patient registered successfully', 'success');
      }
      setIsModalOpen(false);
      loadPatients();
    } catch {
      showToast('Error saving patient data', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await patientService.delete(deleteId);
      setDeleteId(null);
      showToast('Patient record deleted successfully', 'success');
      loadPatients();
    } catch {
      showToast('Failed to delete patient', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Patient ID',
      accessor: (row: Patient) => (
        <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-1 rounded">
          {row.id}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: (row: Patient) => (
        <div className="flex flex-col">
          <span
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 cursor-pointer"
            onClick={() => navigate(`/patients/${row.id}`)}
          >
            {row.name}
          </span>
          <span className="text-xs text-slate-400 truncate max-w-[180px]">
            {row.email}
          </span>
        </div>
      ),
    },
    {
      header: 'Age / Gender',
      accessor: (row: Patient) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.age} yrs • {row.gender}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: (row: Patient) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.phone}</span>
        </div>
      ),
    },
    {
      header: 'Blood Group',
      accessor: (row: Patient) => (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900/60">
          <Droplet className="w-3 h-3 fill-rose-500" />
          {row.bloodGroup}
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
      header: 'Status',
      accessor: (row: Patient) => (
        <Badge status={row.status}>{row.status}</Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/patients/${row.id}`)}
            className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="View Patient Profile"
            aria-label="View patient"
          >
            <Eye className="w-4 h-4" />
          </button>

          {role === 'doctor' ? (
            <>
              <button
                onClick={() => setHistoryPatient(row)}
                className="p-1.5 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="View Medical History"
                aria-label="View history"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(`/appointments`)}
                className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="View Appointments"
                aria-label="View appointments"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(`/medical-records`)}
                className="p-1.5 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="View Medical Records"
                aria-label="View medical records"
              >
                <FileText className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleOpenEditModal(row)}
                className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit Patient"
                aria-label="Edit patient"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteId(row.id)}
                className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete Record"
                aria-label="Delete patient"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (role === 'patient') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Module Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {role === 'doctor' ? 'My Patients' : 'Patients Directory'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {patients.length} Total
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {role === 'doctor'
              ? `Patients under active clinical care and outpatient consultations with ${user?.name || 'Dr. Rahul Sharma'}`
              : 'Outpatient and clinical records registry across hospital'}
          </p>
        </div>

        {role === 'admin' && (
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Add New Patient
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-subtle">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search by name, patient ID, phone, or email..."
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
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={bloodFilter}
            onChange={(e) => {
              setBloodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="ALL">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>

      {/* Table & Pagination */}
      {filteredPatients.length === 0 && !loading ? (
        <EmptyState
          title="No patients match your search criteria"
          description="Try modifying search keywords or clearing your active filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
            setBloodFilter('ALL');
          }}
        />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={currentData}
            keyExtractor={(p) => p.id}
            emptyMessage={loading ? 'Loading patient records...' : 'No patient records available.'}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPatients.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* View Medical History Modal (Doctor) */}
      {historyPatient && (
        <Modal
          isOpen={!!historyPatient}
          onClose={() => setHistoryPatient(null)}
          title={`Clinical History — ${historyPatient.name}`}
          subtitle={`${historyPatient.id} • ${historyPatient.age} yrs (${historyPatient.gender}) • Blood: ${historyPatient.bloodGroup}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {historyPatient.allergies && historyPatient.allergies.length > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900">
                <span className="font-bold text-rose-700 dark:text-rose-300 uppercase block mb-1">
                  Known Allergies
                </span>
                <p className="text-rose-800 dark:text-rose-200">
                  {historyPatient.allergies.join(', ')}
                </p>
              </div>
            )}

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Documented Encounters & Clinical Notes
              </span>
              <div className="space-y-2.5">
                {historyPatient.medicalHistory && historyPatient.medicalHistory.length > 0 ? (
                  historyPatient.medicalHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {item.diagnosis}
                        </span>
                        <span className="text-slate-400 font-mono">{formatDate(item.date)}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        {item.treatment}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span>Attending: <strong>{item.doctor}</strong></span>
                        {item.notes && <span>{item.notes}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No past clinical encounters logged.</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const patId = historyPatient.id;
                  setHistoryPatient(null);
                  navigate(`/patients/${patId}`);
                }}
              >
                Full Clinical Profile
              </Button>
              <Button variant="primary" size="sm" onClick={() => setHistoryPatient(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Patient Modal (Admin) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatientId ? 'Edit Patient Information' : 'Register New Patient'}
        subtitle="Complete the clinical intake form. Fictional Indian demographics."
        maxWidth="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              error={formErrors.name}
              required
            />
            <Input
              label="Age (Years)"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="e.g. 42"
              error={formErrors.age}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Select
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientStatus })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98XXX XXXXX"
              error={formErrors.phone}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="patient@example.com"
              error={formErrors.email}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-1.5">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 102 Green Heights, Baner, Pune, MH 411045"
              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            {formErrors.address && <p className="text-xs text-rose-500 mt-1">{formErrors.address}</p>}
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Emergency Contact Person
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Contact Name"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Name"
                error={formErrors.emergencyContactName}
                required
              />
              <Input
                label="Relationship"
                value={formData.emergencyContactRel}
                onChange={(e) => setFormData({ ...formData, emergencyContactRel: e.target.value })}
                placeholder="Spouse / Parent / Sibling"
              />
              <Input
                label="Contact Phone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="+91 98XXX XXXXX"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingPatientId ? 'Save Changes' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Deletion (Admin) */}
      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Record"
        message="Are you sure you want to delete this patient record? Associated consultations and history references will be removed from local storage."
        isLoading={isDeleting}
      />
    </div>
  );
};
