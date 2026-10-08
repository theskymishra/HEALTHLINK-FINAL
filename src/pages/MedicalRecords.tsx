import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  Eye,
  Plus,
  CloudDownload,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { medicalRecordService } from '../services/medicalRecordService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { MedicalRecord, Patient, Doctor, RecordType } from '../types';
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

export const MedicalRecords: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [patientFilter, setPatientFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // View Record Details Modal
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Add Record Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPatientId, setNewPatientId] = useState('');
  const [newDoctorId, setNewDoctorId] = useState('');
  const [newRecordType, setNewRecordType] = useState<RecordType>('Consultation');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadRecords();
  }, [user, role]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const [recs, pats, docs] = await Promise.all([
        medicalRecordService.getAll(),
        patientService.getAll(),
        doctorService.getAll(),
      ]);

      // Role filtering
      let roleFilteredRecs = recs;
      if (role === 'patient') {
        const patId = user?.id || 'PAT-1001';
        roleFilteredRecs = recs.filter(
          (r) => r.patientId === patId || r.patientName.toLowerCase().includes('aarav')
        );
      } else if (role === 'doctor') {
        const docId = user?.id || 'DOC-201';
        roleFilteredRecs = recs.filter(
          (r) =>
            r.doctorId === docId ||
            r.doctorName.toLowerCase().includes('rahul') ||
            ['PAT-1001', 'PAT-1002', 'PAT-1003', 'PAT-1005', 'PAT-1006'].includes(r.patientId)
        );
      }

      setRecords(roleFilteredRecs);
      setPatients(pats);
      setDoctors(docs);

      if (pats.length > 0) setNewPatientId(pats[0].id);
      if (role === 'doctor') {
        setNewDoctorId(user?.id || 'DOC-201');
      } else if (docs.length > 0) {
        setNewDoctorId(docs[0].id);
      }
    } catch {
      showToast('Failed to load medical records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        (r.diagnosis && r.diagnosis.toLowerCase().includes(search.toLowerCase()));

      const matchesType = typeFilter === 'ALL' || r.recordType === typeFilter;
      const matchesPatient =
        role === 'patient' || patientFilter === 'ALL' || r.patientId === patientFilter;

      return matchesSearch && matchesType && matchesPatient;
    });
  }, [records, search, typeFilter, patientFilter, role]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const handleDownload = (record: MedicalRecord) => {
    showToast(
      `Downloading ${record.id} (${record.fileSize || 'PDF'}). Secure patient document ready.`,
      'info'
    );
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Record title is required', 'error');
      return;
    }
    const patientObj = patients.find((p) => p.id === newPatientId);
    const doctorObj =
      role === 'doctor'
        ? { id: user?.id || 'DOC-201', name: user?.name || 'Dr. Rahul Sharma' }
        : doctors.find((d) => d.id === newDoctorId);

    if (!patientObj || !doctorObj) return;

    try {
      await medicalRecordService.create({
        patientId: patientObj.id,
        patientName: patientObj.name,
        recordType: newRecordType,
        doctorId: doctorObj.id,
        doctorName: doctorObj.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        title: newTitle,
        description: newDescription || 'Diagnostic assessment logged into clinical portal.',
        diagnosis: newDiagnosis || undefined,
        fileSize: '1.2 MB PDF',
      });
      showToast('Medical record archived successfully', 'success');
      setIsAddOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewDiagnosis('');
      loadRecords();
    } catch {
      showToast('Failed to save medical record', 'error');
    }
  };

  // Role-specific columns
  const columns = useMemo(() => {
    if (role === 'patient') {
      return [
        {
          header: 'Date',
          accessor: (row: MedicalRecord) => (
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {formatDate(row.date)}
            </span>
          ),
        },
        {
          header: 'Doctor',
          accessor: (row: MedicalRecord) => (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100">{row.doctorName}</span>
              <span className="text-[11px] text-slate-400 font-mono">{row.doctorId}</span>
            </div>
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
          header: 'Department',
          accessor: (row: MedicalRecord) => {
            const docObj = doctors.find((d) => d.id === row.doctorId);
            return (
              <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                {docObj?.department || (row.doctorName.includes('Rahul') ? 'Cardiology' : 'General Medicine')}
              </span>
            );
          },
        },
        {
          header: 'Document Title',
          accessor: (row: MedicalRecord) => (
            <div className="flex flex-col">
              <span className="font-medium text-slate-800 dark:text-slate-200">{row.title}</span>
              <span className="text-[11px] text-slate-400">{row.fileSize || 'PDF'}</span>
            </div>
          ),
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
                className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Download E-Record"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ),
        },
      ];
    }

    // Doctor & Admin Table Columns
    return [
      {
        header: 'Patient',
        accessor: (row: MedicalRecord) => (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">{row.patientName}</span>
            <span className="text-xs text-slate-400 font-mono">{row.patientId}</span>
          </div>
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
        header: 'Document / Title',
        accessor: (row: MedicalRecord) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 dark:text-slate-200">{row.title}</span>
            <span className="text-xs text-slate-400">{row.fileSize}</span>
          </div>
        ),
      },
      {
        header: 'Attending Doctor',
        accessor: 'doctorName',
      },
      {
        header: 'Date',
        accessor: (row: MedicalRecord) => formatDate(row.date),
      },
      {
        header: 'Status',
        accessor: (row: MedicalRecord) => <Badge status={row.status}>{row.status}</Badge>,
      },
      {
        header: 'Actions',
        accessor: (row: MedicalRecord) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedRecord(row)}
              className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Inspect Record"
              aria-label="View record"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(row)}
              className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Download Document"
              aria-label="Download record"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [role, doctors]);

  const pageTitle =
    role === 'patient'
      ? 'My Medical Records'
      : role === 'doctor'
      ? 'Medical Records'
      : 'Medical Records & Diagnostic Files';

  const pageSubtitle =
    role === 'patient'
      ? 'Your verified clinical notes, lab reports, prescriptions, and scans'
      : role === 'doctor'
      ? `Diagnostic files, consultation summaries, and prescriptions for patients under ${user?.name || 'Dr. Rahul Sharma'}`
      : 'Electronic health records, diagnostic tests, and clinical documentation';

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
              {records.length} Documents
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {pageSubtitle}
          </p>
        </div>

        {role !== 'patient' && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddOpen(true)}
          >
            {role === 'doctor' ? 'Add Consultation Note / Rx' : 'Add Medical Record'}
          </Button>
        )}
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
              ? 'Search by document title, doctor, diagnosis...'
              : 'Search by title, patient, doctor, or ID...'
          }
        />

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="ALL">All Document Types</option>
            <option value="Consultation">Consultation</option>
            <option value="Lab Report">Lab Report</option>
            <option value="Prescription">Prescription</option>
            <option value="Scan">Scan</option>
          </select>

          {role !== 'patient' && (
            <select
              value={patientFilter}
              onChange={(e) => {
                setPatientFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer max-w-[180px]"
            >
              <option value="ALL">All Patients</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table & Pagination */}
      {filteredRecords.length === 0 && !loading ? (
        <EmptyState
          title="No medical records match your criteria"
          description="Try resetting your record type or search filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setTypeFilter('ALL');
            setPatientFilter('ALL');
          }}
        />
      ) : (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={currentData}
            keyExtractor={(r) => r.id}
            emptyMessage={loading ? 'Loading records...' : 'No medical records found.'}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRecords.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={selectedRecord.title}
          subtitle={`${selectedRecord.recordType} • ${selectedRecord.id}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Patient</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedRecord.patientName}</span>
                <span className="text-slate-400 block font-mono">{selectedRecord.patientId}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Authorizing Physician</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedRecord.doctorName}</span>
                <span className="text-slate-400 block">{formatDate(selectedRecord.date)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Clinical Summary / Observations
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                {selectedRecord.description}
              </p>
            </div>

            {selectedRecord.diagnosis && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Primary Diagnosis
                </h4>
                <div className="p-2.5 rounded-lg bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 text-xs font-semibold border border-brand-200 dark:border-brand-900">
                  {selectedRecord.diagnosis}
                </div>
              </div>
            )}

            {/* If lab results */}
            {selectedRecord.labResults && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Laboratory Test Parameters
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2 text-slate-500 font-semibold">Test Item</th>
                        <th className="p-2 text-slate-500 font-semibold">Observed Value</th>
                        <th className="p-2 text-slate-500 font-semibold">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedRecord.labResults.map((t, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{t.test}</td>
                          <td className="p-2 font-bold">{t.result}</td>
                          <td className="p-2 text-slate-400">{t.normalRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* If medications */}
            {selectedRecord.medications && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prescription Regimen
                </h4>
                <div className="space-y-1.5">
                  {selectedRecord.medications.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex justify-between">
                      <div>
                        <strong className="text-slate-900 dark:text-slate-100">{m.name}</strong> ({m.dosage})
                        <p className="text-slate-400 text-[11px]">{m.frequency}</p>
                      </div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{m.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Format: {selectedRecord.fileSize || 'Standard PDF'}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CloudDownload className="w-4 h-4" />}
                  onClick={() => handleDownload(selectedRecord)}
                >
                  Download E-Record
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Record Modal (Doctor & Admin) */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={role === 'doctor' ? 'Add Clinical Consultation Note' : 'Add Medical Record'}
        subtitle="Catalog a new clinical note, lab report, or scan document"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <Input
            label="Document Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Echocardiogram Report / Routine Blood Panel"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Record Type"
              value={newRecordType}
              onChange={(e) => setNewRecordType(e.target.value as RecordType)}
              options={[
                { value: 'Consultation', label: 'Consultation' },
                { value: 'Lab Report', label: 'Lab Report' },
                { value: 'Prescription', label: 'Prescription' },
                { value: 'Scan', label: 'Scan' },
              ]}
            />
            <Select
              label="Patient"
              value={newPatientId}
              onChange={(e) => setNewPatientId(e.target.value)}
              options={patients.map((p) => ({ value: p.id, label: p.name }))}
            />
            {role === 'doctor' ? (
              <Input
                label="Attending Doctor"
                value={user?.name || 'Dr. Rahul Sharma'}
                disabled
              />
            ) : (
              <Select
                label="Doctor"
                value={newDoctorId}
                onChange={(e) => setNewDoctorId(e.target.value)}
                options={doctors.map((d) => ({ value: d.id, label: d.name }))}
              />
            )}
          </div>

          <Input
            label="Clinical Diagnosis (Optional)"
            value={newDiagnosis}
            onChange={(e) => setNewDiagnosis(e.target.value)}
            placeholder="e.g. Essential Stage 1 Hypertension (Controlled)"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase mb-1.5">
              Clinical Findings / Observations / Treatment Notes
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Enter clinical examination notes, diagnostic interpretations, or laboratory notes..."
              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Archive Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
