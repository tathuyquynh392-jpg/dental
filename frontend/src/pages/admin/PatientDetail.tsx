import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Patient } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  HeartPulse,
  AlertCircle,
  FileText,
  Activity,
  Receipt,
  ArrowLeft,
  Stethoscope,
  Clock,
  Sparkles,
} from 'lucide-react';

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'treatments' | 'invoices' | 'appointments'>('records');

  useEffect(() => {
    if (id) fetchPatientDetail(id);
  }, [id]);

  const fetchPatientDetail = async (patientId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${patientId}`);
      if (res.data.success) {
        setPatient(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={6} />;
  if (!patient) return <EmptyState title="Không tìm thấy thông tin bệnh nhân" />;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/admin/patients"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-dental-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bệnh nhân
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900">Hồ Sơ Bệnh Nhân #{patient.id}</h1>
      </div>

      {/* Top Grid: Personal Details & Dental Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-dental-100 text-dental-700 font-extrabold text-xl flex items-center justify-center uppercase shadow-xs">
              {patient.user?.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{patient.user?.name}</h3>
              <Badge status={patient.user?.status || 'ACTIVE'} type="user" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3 text-xs">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-semibold text-slate-800">{patient.user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-semibold text-slate-800">{patient.user?.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Ngày sinh: <strong className="text-slate-800">{patient.dateOfBirth}</strong> ({patient.gender})</span>
            </div>
            <div className="flex items-start gap-3 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>Địa chỉ: <strong className="text-slate-800">{patient.address}</strong></span>
            </div>
          </div>
        </div>

        {/* Dental Health Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            Sức Khỏe Răng Miệng & Tiền Sử Bệnh Lý
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="font-bold text-amber-800 uppercase block mb-1 text-[11px]">Tiền sử bệnh lý</span>
              <p className="text-slate-700 font-medium">{patient.medicalHistory || 'Không có tiền sử bệnh lý nghiêm trọng'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="font-bold text-rose-800 uppercase block mb-1 text-[11px]">Dị ứng thuốc</span>
              <p className="text-slate-700 font-medium">{patient.allergy || 'Không phát hiện dị ứng'}</p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-600 uppercase block mb-1 text-[11px]">Ghi chú nha sĩ</span>
              <p className="text-slate-700 font-medium">{patient.notes || 'Chưa có ghi chú bổ sung'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-6 py-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'records'
                ? 'border-dental-600 text-dental-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Lịch sử khám ({patient.medicalRecords?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('treatments')}
            className={`px-6 py-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'treatments'
                ? 'border-dental-600 text-dental-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Quá trình điều trị ({patient.treatments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'invoices'
                ? 'border-dental-600 text-dental-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Hóa đơn thanh toán ({patient.invoices?.length || 0})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              {!patient.medicalRecords || patient.medicalRecords.length === 0 ? (
                <EmptyState title="Chưa có hồ sơ khám bệnh" />
              ) : (
                patient.medicalRecords.map((mr) => (
                  <div key={mr.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-dental-600" />
                        <span className="font-extrabold text-slate-900 text-sm">{mr.doctor?.name}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">Ngày khám: {mr.createdAt?.substring(0, 10)}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block mb-0.5">Triệu chứng:</span>
                        <p className="text-slate-800 font-semibold">{mr.symptoms}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-0.5">Chẩn đoán:</span>
                        <p className="text-slate-800 font-semibold">{mr.diagnosis}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-0.5">Phương pháp điều trị:</span>
                        <p className="text-emerald-700 font-bold">{mr.treatment}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-0.5">Đơn thuốc:</span>
                        <p className="text-slate-800 font-semibold">{mr.prescription || 'Không có'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Treatments Tab */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              {!patient.treatments || patient.treatments.length === 0 ? (
                <EmptyState title="Chưa có ca điều trị nào" />
              ) : (
                patient.treatments.map((tr) => (
                  <div key={tr.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-dental-600" />
                        <h4 className="font-extrabold text-slate-900 text-sm">{tr.service?.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Bác sĩ phụ trách: {tr.doctor?.name}</p>
                      <p className="text-xs text-slate-500 font-medium">Thời gian: {tr.startDate} → {tr.endDate || 'Đang thực hiện'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase">Chi phí</p>
                        <p className="text-base font-extrabold text-slate-900">{formatVND(tr.cost)}</p>
                      </div>
                      <Badge status={tr.status} type="treatment" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {!patient.invoices || patient.invoices.length === 0 ? (
                <EmptyState title="Chưa có hóa đơn thanh toán" />
              ) : (
                patient.invoices.map((inv) => (
                  <div key={inv.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-dental-600" />
                        <h4 className="font-extrabold text-slate-900 text-sm">{inv.invoiceCode}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Ngày lập: {inv.invoiceDate}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right text-xs">
                        <p className="text-slate-400 font-bold">Tổng tiền: <span className="text-slate-900 font-extrabold">{formatVND(inv.total)}</span></p>
                        <p className="text-slate-400 font-bold">Đã trả: <span className="text-emerald-600 font-extrabold">{formatVND(inv.paidAmount)}</span></p>
                      </div>
                      <Badge status={inv.status} type="invoice" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
