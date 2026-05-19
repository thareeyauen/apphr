import { useMemo, useState } from 'react';
import {
  MdAccessTime,
  MdArrowBack,
  MdCalendarToday,
  MdHourglassEmpty,
  MdSend,
  MdSupervisorAccount
} from 'react-icons/md';
import BottomNav from './Components/BottomNav';
import './Overtime.css';

const HOLIDAYS = {
  '2026-01-01': 'New Year Day',
  '2026-04-13': 'Songkran Festival',
  '2026-04-14': 'Songkran Festival',
  '2026-04-15': 'Songkran Festival',
  '2026-05-01': 'National Labour Day',
  '2026-06-03': 'Queen Suthida Birthday',
  '2026-07-28': 'King Vajiralongkorn Birthday',
  '2026-08-12': 'Mother Day',
  '2026-10-13': 'King Bhumibol Memorial Day',
  '2026-12-05': 'Father Day',
  '2026-12-10': 'Constitution Day',
  '2026-12-31': 'New Year Eve'
};

const APPROVER = 'คุณวิชัย ส.';

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isWeekend = (dateValue) => {
  if (!dateValue) return false;
  const day = new Date(`${dateValue}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

const getAllowedDateReason = (dateValue) => {
  if (!dateValue) return '';
  if (HOLIDAYS[dateValue]) return HOLIDAYS[dateValue];
  if (isWeekend(dateValue)) return 'Weekend';
  return '';
};

const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];

  const dates = [];
  for (const current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    dates.push(getDateKey(current));
  }
  return dates;
};

const getDateRangeValidation = (startDate, endDate) => {
  const dates = getDateRange(startDate, endDate);
  const invalidDates = dates.filter((date) => !getAllowedDateReason(date));
  return {
    dates,
    invalidDates,
    isAllowed: dates.length > 0 && invalidDates.length === 0
  };
};

const formatInputDate = (dateValue) => {
  if (!dateValue) return '-';
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const calculateHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const diff = end - start;

  if (diff <= 0) return 0;
  return Math.round((diff / 60) * 100) / 100;
};

export default function Overtime({
  onSubmitRequest,
  currentUser,
  onGoBack,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn,
  isCheckInDisabled = false
}) {
  const isExemptFromCheckIn = isCheckInDisabled || currentUser?.profile?.job?.employeeLevel === 'Board Level' || currentUser?.profile?.job?.employeeLevel === 'Director Level';
  const [unavailableOpen] = useState(true);
  const today = getDateKey(new Date());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');

  const rangeValidation = useMemo(
    () => getDateRangeValidation(startDate, endDate),
    [startDate, endDate]
  );
  const dateCount = rangeValidation.dates.length;
  const firstAllowedReason = rangeValidation.dates
    .map((date) => getAllowedDateReason(date))
    .filter(Boolean)[0];
  const hoursPerDay = useMemo(() => calculateHours(startTime, endTime), [startTime, endTime]);
  const totalHours = Math.round(hoursPerDay * dateCount * 100) / 100;
  const canSubmit = rangeValidation.isAllowed && hoursPerDay > 0 && reason.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmitRequest?.({
      type: 'Overtime',
      detail: `${formatInputDate(startDate)} - ${formatInputDate(endDate)} · ${startTime}-${endTime} (${totalHours} ชั่วโมง) · ${reason.trim()}`,
      approver: APPROVER
    });
    onGoRequest?.();
  };

  return (
    <div className="ot-page">
      {unavailableOpen && (
        <div className="ot-unavail-overlay">
          <div className="ot-unavail-modal">
            <span className="ot-unavail-icon"><MdHourglassEmpty /></span>
            <h2>ยังไม่เปิดใช้งาน</h2>
            <p>ฟังก์ชันคำขอทำงานล่วงเวลายังไม่พร้อมให้บริการในขณะนี้<br />กรุณาติดต่อฝ่าย HR เพื่อข้อมูลเพิ่มเติม</p>
            <button className="ot-unavail-btn" onClick={onGoBack}>
              ย้อนกลับ
            </button>
          </div>
        </div>
      )}

      <header className="ot-header">
        <button type="button" className="ot-back" onClick={onGoBack} aria-label="Back to requests">
          <MdArrowBack />
        </button>
        <div>
          <p className="ot-eyebrow">Create Request</p>
          <h1>Overtime Request</h1>
          <p className="ot-subtitle">ส่งคำขอทำงานนอกเวลา เลือกได้เฉพาะวันเสาร์ อาทิตย์ และวันหยุดนักขัตฤกษ์</p>
        </div>
      </header>

      <form className="ot-form" onSubmit={handleSubmit}>
        <section className="ot-card">
          <div className="ot-card-head">
            <h2>Date Range</h2>
            <span><MdCalendarToday /> {rangeValidation.isAllowed ? `${dateCount} day(s)` : 'Not available'}</span>
          </div>
          <div className="ot-field-grid ot-field-grid--date">
            <label className="ot-field">
              <span>Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  if (endDate < event.target.value) setEndDate(event.target.value);
                }}
              />
            </label>
            <label className="ot-field">
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <label className="ot-field ot-field--summary">
              <span>Selected days</span>
              <output>{dateCount} วัน</output>
            </label>
          </div>
          {!rangeValidation.isAllowed && (
            <p className="ot-warning">เลือกได้เฉพาะวันเสาร์ อาทิตย์ หรือวันหยุดนักขัตฤกษ์เท่านั้น</p>
          )}
        </section>

        <section className="ot-card">
          <div className="ot-card-head">
            <h2>Time</h2>
            <span><MdAccessTime /> {totalHours} hour(s) total</span>
          </div>
          <div className="ot-field-grid">
            <label className="ot-field">
              <span>Start time</span>
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </label>
            <label className="ot-field">
              <span>End time</span>
              <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </label>
            <label className="ot-field ot-field--summary">
              <span>Hours per day</span>
              <output>{hoursPerDay} ชั่วโมง</output>
            </label>
          </div>
          {hoursPerDay <= 0 && (
            <p className="ot-warning">เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น</p>
          )}
        </section>

        <section className="ot-card">
          <div className="ot-card-head">
            <h2>Reason</h2>
            <span>{reason.trim().length}/200</span>
          </div>
          <label className="ot-field">
            <span>เหตุผลในการทำงาน Overtime</span>
            <textarea
              value={reason}
              maxLength={200}
              rows={5}
              onChange={(event) => setReason(event.target.value)}
              placeholder="ระบุเหตุผล เช่น ปิดงานโครงการ / support event / งานเร่งด่วน"
            />
          </label>
        </section>

        <aside className="ot-summary">
          <div>
            <span>Approver</span>
            <strong><MdSupervisorAccount /> {APPROVER}</strong>
          </div>
          <div>
            <span>Date type</span>
            <strong>{rangeValidation.isAllowed ? firstAllowedReason : '-'}</strong>
          </div>
          <div>
            <span>Selected days</span>
            <strong>{dateCount} วัน</strong>
          </div>
          <div>
            <span>Total overtime</span>
            <strong>{totalHours} ชั่วโมง</strong>
          </div>
          <button type="submit" className="ot-submit" disabled={!canSubmit}>
            <MdSend />
            Submit Request
          </button>
        </aside>
      </form>

      <BottomNav
        activePage="request"
        isExemptFromCheckIn={isExemptFromCheckIn}
        onGoHome={onGoHome}
        onGoRecord={onGoRecord}
        onOpenCheckIn={onOpenCheckIn}
        onGoRequest={onGoRequest}
        onGoAccount={onGoAccount}
      />
    </div>
  );
}
