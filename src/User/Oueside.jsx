import { useMemo, useState } from 'react';
import {
  MdAccessTime,
  MdAssignment,
  MdArrowBack,
  MdCalendarToday,
  MdHome,
  MdPerson,
  MdSchedule,
  MdSend,
  MdSupervisorAccount
} from 'react-icons/md';
import './Outside.css';

const OUTSIDE_TYPES = [
  { id: 'wfh', label: 'WFH', detail: 'Work from home' },
  { id: 'other', label: 'Other', detail: 'Other offsite location' }
];

const APPROVER = 'คุณวิชัย ส.';

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getDateDiffInclusive = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((end - start) / oneDay) + 1;
};

const calculateHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const diff = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (diff <= 0) return 0;
  return Math.round((diff / 60) * 100) / 100;
};

export default function Outside({
  onGoBack,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn
}) {
  const today = getTodayKey();
  const [outsideType, setOutsideType] = useState('wfh');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');

  const selectedType = OUTSIDE_TYPES.find((type) => type.id === outsideType) || OUTSIDE_TYPES[0];
  const dayCount = useMemo(() => getDateDiffInclusive(startDate, endDate), [startDate, endDate]);
  const hoursPerDay = useMemo(() => calculateHours(startTime, endTime), [startTime, endTime]);
  const totalHours = Math.round(dayCount * hoursPerDay * 100) / 100;
  const needsLocation = outsideType === 'other';
  const canSubmit =
    dayCount > 0 &&
    hoursPerDay > 0 &&
    reason.trim().length > 0 &&
    (!needsLocation || location.trim().length > 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onGoRequest?.();
  };

  return (
    <div className="outside-page">
      <header className="outside-header">
        <button type="button" className="outside-back" onClick={onGoBack} aria-label="Back to requests">
          <MdArrowBack />
        </button>
        <div>
          <p className="outside-eyebrow">Create Request</p>
          <h1>Work Outside Request</h1>
          <p className="outside-subtitle">ส่งคำขอทำงานนอกสถานที่ เลือกประเภท ช่วงวันที่ เวลา และเหตุผลประกอบการอนุมัติ</p>
        </div>
      </header>

      <form className="outside-form" onSubmit={handleSubmit}>
        <section className="outside-card">
          <div className="outside-card-head">
            <h2>Type</h2>
            <span>{selectedType.detail}</span>
          </div>
          <div className="outside-type-options">
            {OUTSIDE_TYPES.map((type) => (
              <button
                type="button"
                key={type.id}
                className={`outside-type-option ${outsideType === type.id ? 'is-selected' : ''}`}
                onClick={() => setOutsideType(type.id)}
              >
                <strong>{type.label}</strong>
                <small>{type.detail}</small>
              </button>
            ))}
          </div>
          {needsLocation && (
            <label className="outside-field outside-location">
              <span>Location</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="ระบุสถานที่ เช่น Co-working space / หน่วยงานภายนอก"
              />
            </label>
          )}
        </section>

        <section className="outside-card">
          <div className="outside-card-head">
            <h2>Date Range</h2>
            <span><MdCalendarToday /> {dayCount} day(s)</span>
          </div>
          <div className="outside-field-grid">
            <label className="outside-field">
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
            <label className="outside-field">
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <label className="outside-field outside-field--summary">
              <span>Selected days</span>
              <output>{dayCount} วัน</output>
            </label>
          </div>
        </section>

        <section className="outside-card">
          <div className="outside-card-head">
            <h2>Time</h2>
            <span><MdAccessTime /> {totalHours} hour(s) total</span>
          </div>
          <div className="outside-field-grid">
            <label className="outside-field">
              <span>Start time</span>
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </label>
            <label className="outside-field">
              <span>End time</span>
              <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </label>
            <label className="outside-field outside-field--summary">
              <span>Hours per day</span>
              <output>{hoursPerDay} ชั่วโมง</output>
            </label>
          </div>
          {hoursPerDay <= 0 && (
            <p className="outside-warning">เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น</p>
          )}
        </section>

        <section className="outside-card">
          <div className="outside-card-head">
            <h2>Reason</h2>
            <span>{reason.trim().length}/200</span>
          </div>
          <label className="outside-field">
            <span>เหตุผลในการทำงานนอกสถานที่</span>
            <textarea
              value={reason}
              maxLength={200}
              rows={5}
              onChange={(event) => setReason(event.target.value)}
              placeholder="ระบุเหตุผล เช่น ทำงานจากบ้าน / ประชุมกับหน่วยงานภายนอก / ลงพื้นที่โครงการ"
            />
          </label>
        </section>

        <aside className="outside-summary">
          <div>
            <span>Approver</span>
            <strong><MdSupervisorAccount /> {APPROVER}</strong>
          </div>
          <div>
            <span>Type</span>
            <strong>{selectedType.label}</strong>
          </div>
          <div>
            <span>Selected days</span>
            <strong>{dayCount} วัน</strong>
          </div>
          <div>
            <span>Total time</span>
            <strong>{totalHours} ชั่วโมง</strong>
          </div>
          <button type="submit" className="outside-submit" disabled={!canSubmit}>
            <MdSend />
            Submit Request
          </button>
        </aside>
      </form>

      <div className="bottom-nav">
        <button className="nav-item" onClick={onGoHome}>
          <span className="nav-icon"><MdHome /></span>
          <span className="nav-label">Home</span>
        </button>
        <button className="nav-item" onClick={onGoRecord}>
          <span className="nav-icon"><MdAccessTime /></span>
          <span className="nav-label">Record</span>
        </button>
        <button className="nav-item center" onClick={onOpenCheckIn} aria-label="Open check in">
          <span className="nav-icon large"><MdSchedule /></span>
        </button>
        <button className="nav-item active" onClick={onGoRequest}>
          <span className="nav-icon"><MdAssignment /></span>
          <span className="nav-label">Requests</span>
        </button>
        <button className="nav-item" onClick={onGoAccount}>
          <span className="nav-icon"><MdPerson /></span>
          <span className="nav-label">My Account</span>
        </button>
      </div>
    </div>
  );
}
