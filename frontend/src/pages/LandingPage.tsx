import React from 'react';
import { Link } from 'react-router-dom';
import { ToothIcon } from '../components/common/ToothIcon';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  HeartHandshake,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const services = [
    { title: 'Khám tổng quát', desc: 'Kiểm tra toàn diện sức khỏe răng miệng, chụp phim X-quang kỹ thuật số.', icon: Stethoscope },
    { title: 'Lấy cao răng', desc: 'Cạo vôi răng bằng sóng siêu âm không đau, mang lại hơi thở thơm mát.', icon: Sparkles },
    { title: 'Trám răng thẩm mỹ', desc: 'Phục hình răng sứt vỡ, răng sâu với vật liệu Composite chuẩn màu răng thật.', icon: ShieldCheck },
    { title: 'Nhổ răng khôn', desc: 'Nhổ răng khôn mọc lệch nhẹ nhàng với công nghệ siêu âm Piezotome.', icon: ToothIcon },
    { title: 'Điều trị tủy', desc: 'Chữa tủy răng bảo tồn răng thật, chấm dứt hoàn toàn cơn đau nhức.', icon: Award },
    { title: 'Tẩy trắng răng', desc: 'Tẩy trắng Laser Whitening bật tông trắng sáng an toàn chỉ trong 60 phút.', icon: Sparkles },
    { title: 'Niềng răng nắn chỉnh', desc: 'Hệ thống mắc cài cao cấp mang lại nụ cười đều đặn và khớp cắn chuẩn.', icon: HeartHandshake },
    { title: 'Bọc răng sứ', desc: 'Bọc răng sứ toàn sứ Zirconia chính hãng, chịu lực cao, đẹp tự nhiên.', icon: Award },
    { title: 'Trồng răng Implant', desc: 'Cấy ghép trụ Implant Thụy Sĩ phục hồi răng đã mất vĩnh viễn.', icon: ShieldCheck },
  ];

  const doctors = [
    { name: 'BS. CKII Nguyễn Văn Hùng', role: 'Phục Hình & Implant', exp: '15 năm kinh nghiệm', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' },
    { name: 'BS. CKI Trần Thị Mai', role: 'Chỉnh Hình Răng Mặt', exp: '10 năm kinh nghiệm', image: 'https://images.unsplash.com/photo-1594824813571-24a69c100424?auto=format&fit=crop&q=80&w=400' },
    { name: 'ThS. BS Lê Hoàng Nam', role: 'Nha Khoa Nội Nha', exp: '8 năm kinh nghiệm', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400' },
    { name: 'BS. Phạm Thu Thảo', role: 'Nha Khoa Thẩm Mỹ', exp: '6 năm kinh nghiệm', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400' },
  ];

  const processSteps = [
    { step: '01', title: 'Đặt lịch hẹn', desc: 'Chọn bác sĩ, dịch vụ và khung giờ thuận tiện trực tuyến.' },
    { step: '02', title: 'Khám tổng quát', desc: 'Bác sĩ kiểm tra chi tiết và chụp phim X-quang chuyên sâu.' },
    { step: '03', title: 'Tư vấn phác đồ', desc: 'Lập kế hoạch điều trị minh bạch chi phí và thời gian.' },
    { step: '04', title: 'Điều trị chuẩn y khoa', desc: 'Thực hiện với công nghệ hiện đại, vô trùng tuyệt đối.' },
    { step: '05', title: 'Theo dõi & Tái khám', desc: 'Chăm sóc sau điều trị và nhắc lịch tái khám định kỳ.' },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-dental-50/80 via-sky-50/30 to-white py-20 lg:py-32 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dental-100 text-dental-700 text-xs font-extrabold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-4 h-4 text-dental-600" />
              Nha Khoa Thẩm Mỹ & Phục Hình Hàng Đầu
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Chăm sóc nụ cười – <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-dental-600 via-dental-500 to-sky-400 bg-clip-text text-transparent">
                Kiến tạo tự tin
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium">
              Lucky Dental tự hào sở hữu đội ngũ chuyên gia nha khoa hàng đầu, trang thiết bị nhập khẩu Châu Âu và quy trình điều trị không đau chuẩn quốc tế.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/patient/appointments/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-dental-600 to-dental-500 hover:from-dental-700 hover:to-dental-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-dental-200 hover:shadow-xl hover:scale-105 transition-all"
              >
                <Calendar className="w-5 h-5" />
                Đặt lịch khám ngay
              </Link>
              <a
                href="#services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all"
              >
                Tìm hiểu dịch vụ
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-slate-500 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                100% Vô trùng
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Bảo hành dài hạn
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Bác sĩ CKII
              </div>
            </div>
          </div>

          <div className="relative flex justify-center z-10">
            <div className="w-full max-w-md lg:max-w-none relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-dental-400 to-sky-300 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800"
                alt="Lucky Dental Clinic"
                className="relative rounded-3xl shadow-2xl border-4 border-white object-cover w-full h-[420px]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-dental-500 text-white flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-slate-900">10,000+</p>
                  <p className="text-xs text-slate-500 font-medium">Bệnh nhân tin tưởng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs font-bold text-dental-600 uppercase tracking-widest">Về Lucky Dental</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Phòng khám Nha khoa Chất lượng & Tận tâm Hàng đầu
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Được thành lập từ năm 2015, Lucky Dental không ngừng cải tiến công nghệ nha khoa tiên tiến nhất thế giới như máy scan 3D iTero, cấy ghép Implant Piezotome, tẩy trắng răng Laser Whitening nhằm mang lại trải nghiệm khám chữa nhẹ nhàng, an toàn tuyệt đối.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-2xl font-extrabold text-dental-600">15+</h4>
                <p className="text-xs font-medium text-slate-600">Năm uy tín ngành nha</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-2xl font-extrabold text-dental-600">99.8%</h4>
                <p className="text-xs font-medium text-slate-600">Bệnh nhân hài lòng</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400" alt="Clinic equipment" className="rounded-2xl shadow-lg object-cover h-64 w-full" />
            <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=400" alt="Doctor consulting" className="rounded-2xl shadow-lg object-cover h-64 w-full mt-6" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-bold text-dental-600 uppercase tracking-widest">Dịch vụ nổi bật</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Giải Pháp Nha Khoa Toàn Diện
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Từ chăm sóc răng miệng định kỳ đến nắn chỉnh thẩm mỹ chuyên sâu, chúng tôi cam kết chất lượng tốt nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-dental-50 text-dental-600 flex items-center justify-center mb-6 group-hover:bg-dental-600 group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium mb-6">{s.desc}</p>
                  <Link
                    to="/patient/appointments/create"
                    className="inline-flex items-center gap-1 text-xs font-bold text-dental-600 hover:text-dental-700"
                  >
                    Đặt lịch khám <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctors Team Section */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-bold text-dental-600 uppercase tracking-widest">Đội ngũ chuyên gia</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Bác Sĩ Giàu Kinh Nghiệm & Tận Tâm
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc, idx) => (
              <div key={idx} className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all text-center p-6">
                <img src={doc.image} alt={doc.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md" />
                <h4 className="text-base font-extrabold text-slate-900">{doc.name}</h4>
                <p className="text-xs font-semibold text-dental-600 mt-1">{doc.role}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-2">{doc.exp}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 sm:px-8 bg-gradient-to-br from-slate-900 to-dental-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-bold text-dental-400 uppercase tracking-widest">Quy trình điều trị</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              5 Bước Chuẩn Y Khoa Tại Lucky Dental
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {processSteps.map((p, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 relative">
                <span className="text-3xl font-extrabold text-dental-400 opacity-80 block mb-2">{p.step}</span>
                <h4 className="text-lg font-bold mb-2">{p.title}</h4>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-dental-600 flex items-center justify-center">
                <ToothIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">Lucky Dental</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              Chăm sóc nụ cười – Kiến tạo tự tin. Hệ thống nha khoa tiêu chuẩn quốc tế hàng đầu Việt Nam.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Liên hệ</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-dental-500 flex-shrink-0 mt-0.5" />
                <span>123 Đường Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-dental-500 flex-shrink-0" />
                <span>Hotline: 1900 6868 - 0901 234 567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-dental-500 flex-shrink-0" />
                <span>contact@luckydental.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Giờ làm việc</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-dental-500" />
                <span>Thứ 2 - Thứ 7: 08:00 - 19:00</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-dental-500" />
                <span>Chủ Nhật: 08:30 - 17:00</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2 text-xs">
              <Link to="/login" className="hover:text-white transition-colors">Đăng nhập tài khoản</Link>
              <Link to="/register" className="hover:text-white transition-colors">Đăng ký người dùng</Link>
              <Link to="/patient/appointments/create" className="hover:text-white transition-colors">Đặt lịch khám online</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 Lucky Dental System. All Rights Reserved. Designed for Excellence.
        </div>
      </footer>
    </div>
  );
};
