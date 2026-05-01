import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

/**
 * AttendanceCalendar — displays a monthly attendance grid for a staff member.
 * Props:
 *   staffId: string
 *   staffName: string (optional, for heading)
 *   editable: boolean (admin can mark attendance)
 */
export default function AttendanceCalendar({ staffId, staffName, editable = false }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/staff/${staffId}/attendance?month=${month}&year=${year}`);
      setAttendance(data.attendance || []);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, [staffId, month, year]);

  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const getFirstDay = (m, y) => new Date(y, m - 1, 1).getDay();

  const totalDays = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);
  const attendanceMap = {};
  attendance.forEach(a => {
    const d = new Date(a.date).getDate();
    attendanceMap[d] = a;
  });

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const markAttendance = async (day, present) => {
    if (!editable) return;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      await api.post(`/staff/${staffId}/attendance`, { date, present });
      fetchAttendance();
      toast.success(`Marked ${present ? 'Present' : 'Absent'} for ${date}`);
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const presentCount = attendance.filter(a => a.present).length;
  const absentCount = attendance.filter(a => !a.present).length;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <div>
          <h3 className="font-bold text-lg">{staffName ? `${staffName} — ` : ''}Attendance</h3>
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 4 }}>
            <span className="badge badge-success"><HiOutlineCheck /> {presentCount} Present</span>
            <span className="badge badge-danger"><HiOutlineX /> {absentCount} Absent</span>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <button className="btn btn-ghost btn-icon" onClick={prevMonth}><HiOutlineChevronLeft /></button>
          <span className="font-semibold" style={{ minWidth: 100, textAlign: 'center' }}>
            {monthNames[month - 1]} {year}
          </span>
          <button className="btn btn-ghost btn-icon" onClick={nextMonth}><HiOutlineChevronRight /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}><div className="spinner" /></div>
      ) : (
        <div>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {days.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const record = attendanceMap[day];
              const isToday = day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();
              const isWeekend = new Date(year, month - 1, day).getDay() === 0 || new Date(year, month - 1, day).getDay() === 6;

              return (
                <div
                  key={day}
                  onClick={() => editable && !isWeekend && markAttendance(day, !record?.present)}
                  title={editable ? 'Click to toggle' : ''}
                  style={{
                    textAlign: 'center',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 2px',
                    fontSize: '0.8125rem',
                    fontWeight: isToday ? 700 : 400,
                    cursor: editable && !isWeekend ? 'pointer' : 'default',
                    border: isToday ? '2px solid var(--primary)' : '2px solid transparent',
                    background: record?.present
                      ? 'rgba(16, 185, 129, 0.15)'
                      : record && !record.present
                        ? 'rgba(239, 68, 68, 0.12)'
                        : isWeekend
                          ? 'var(--bg-secondary)'
                          : 'transparent',
                    color: record?.present
                      ? 'var(--success)'
                      : record && !record.present
                        ? 'var(--danger)'
                        : isWeekend
                          ? 'var(--text-muted)'
                          : 'var(--text-primary)',
                    transition: 'background 0.15s',
                  }}
                >
                  {day}
                  {record?.present && <div style={{ fontSize: '0.6rem', marginTop: 1 }}><HiOutlineCheck /></div>}
                  {record && !record.present && <div style={{ fontSize: '0.6rem', marginTop: 1 }}><HiOutlineX /></div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
