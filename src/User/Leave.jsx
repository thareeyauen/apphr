import { useMemo, useState } from 'react';
import {
  MdAccessTime,
  MdAssignment,
  MdArrowBack,
  MdCalendarToday,
  MdHome,
  MdPerson,
  MdSchedule,
  MdSend
} from 'react-icons/md';
import './Leave.css';

const LEAVE_TYPES = [
  { id: 'annual', label: 'Annual Leave', detail: 'ลาพักร้อน', remaining: 5 },
  { id: 'sick', label: 'Sick Leave', detail: 'ลาป่วย', remaining: 30 },
  { id: 'personal', label: 'Personal Leave', detail: 'ลากิจ', remaining: 6 },
  { id: 'maternity', label: 'Maternity Leave', detail: 'ลาคลอด', remaining: 98 }
];

const DAY_TYPES = [
  { id: 'full', label: 'Full Day', multiplier: 1 },
  { id: 'half-morning', label: 'Half-day 09.00-12.00', multiplier: 0.5 },
  { id: 'half-afternoon', label: 'Half-day 12.00-17.00', multiplier: 0.5 },
  { id: 'period', label: 'Period', multiplier: 1 }
];

const getDateDiffInclusive = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((end - start) / oneDay) + 1;
};

const formatInputDate = (dateValue) => {
  if (!dateValue) return '-';
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function Leave({
  onSubmitRequest,
  currentUser,
  requests = [],
  onGoBack,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn
}) {
  const isExemptFromCheckIn = currentUser?.profile?.job?.employeeLevel === 'Board Level' || currentUser?.profile?.job?.employeeLevel === 'Director Level';
  const userOwnerKey = currentUser?.employeeId || currentUser?.email || currentUser?.userType || '';
  const today = new Date().toISOString().slice(0, 10);
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0].id);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [dayType, setDayType] = useState(DAY_TYPES[0].id);
  const [periodStart, setPeriodStart] = useState('09:00');
  const [periodEnd, setPeriodEnd] = useState('17:00');
  const [reason, setReason] = useState('');

  const selectedLeave = LEAVE_TYPES.find((type) => type.id === leaveType) || LEAVE_TYPES[0];
  const selectedDayType = DAY_TYPES.find((type) => type.id === dayType) || DAY_TYPES[0];

  const usedDaysByType = useMemo(() => {
    if (!requests.length || !userOwnerKey) return {};
    return requests.reduce((acc, req) => {
      if (req.status !== 'approved') return acc;
      const reqKey = req?.ownerKey || req?.employeeId || req?.email || req?.userId || '';
      if (reqKey !== userOwnerKey) return acc;
      const lt = LEAVE_TYPES.find((t) => t.label === req.type);
      if (!lt) return acc;
      const days = req.days ?? getDateDiffInclusive(req.startDateKey, req.endDateKey);
      acc[lt.id] = (acc[lt.id] || 0) + days;
      return acc;
    }, {});
  }, [requests, userOwnerKey]);

  const getActualRemaining = (leaveTypeId) => {
    const lt = LEAVE_TYPES.find((t) => t.id === leaveTypeId);
    if (!lt) return 0;
    return Math.max(lt.remaining - (usedDaysByType[leaveTypeId] || 0), 0);
  };

  const requestedDays = useMemo(() => {
    const dateCount = getDateDiffInclusive(startDate, endDate);
    if (!dateCount) return 0;
    if (selectedDayType.id === 'period') return dateCount;
    return dateCount * selectedDayType.multiplier;
  }, [startDate, endDate, selectedDayType]);

  const remainingAfterRequest = Math.max(getActualRemaining(selectedLeave.id) - requestedDays, 0);
  const canSubmit = requestedDays > 0 && reason.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    const timeLabel =
      selectedDayType.id === 'period'
        ? `${periodStart}-${periodEnd}`
        : selectedDayType.label;
    onSubmitRequest?.({
      type: selectedLeave.label,
      detail: `${formatInputDate(startDate)} - ${formatInputDate(endDate)} (${requestedDays} วัน) · ${selectedDayType.label} · ${reason.trim()}`,
      startDateKey: startDate,
      endDateKey: endDate,
      days: requestedDays,
      time: timeLabel
    });
    onGoRequest?.();
  };

  return (
    <div className="leave-page">
      <header className="leave-header">
        <button type="button" className="leave-back" onClick={onGoBack} aria-label="Back to requests">
          <MdArrowBack />
        </button>
        <div>
          <p className="leave-eyebrow">Create Request</p>
          <h1>Leave Request</h1>
          <p className="leave-subtitle">เลือกประเภทการลา ช่วงวันที่ และเหตุผลเพื่อส่งคำขออนุมัติ</p>
        </div>
      </header>

      <form className="leave-form" onSubmit={handleSubmit}>
        <section className="leave-card">
          <div className="leave-card-head">
            <h2>Leave Type</h2>
            <span>{getActualRemaining(selectedLeave.id)} days left</span>
          </div>
          <label className="leave-field leave-type-select">
            <span>ประเภทการลา</span>
            <select value={leaveType} onChange={(event) => setLeaveType(event.target.value)}>
              {LEAVE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} - {type.detail} ({getActualRemaining(type.id)} วันคงเหลือ)
                </option>
              ))}
            </select>
            <small>
              {selectedLeave.detail} · คงเหลือ {getActualRemaining(selectedLeave.id)} วัน
            </small>
          </label>
        </section>

        <section className="leave-card">
          <div className="leave-card-head">
            <h2>Date Range</h2>
            <span><MdCalendarToday /> {requestedDays || 0} day(s)</span>
          </div>
          <div className="leave-field-grid">
            <label className="leave-field">
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
            <label className="leave-field">
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <label className="leave-field leave-field--summary">
              <span>Requested days</span>
              <output>{requestedDays || 0} วัน</output>
            </label>
          </div>
        </section>

        <section className="leave-card">
          <div className="leave-card-head">
            <h2>Type</h2>
            <span>{selectedDayType.label}</span>
          </div>
          <div className="leave-day-options">
            {DAY_TYPES.map((type) => (
              <button
                type="button"
                key={type.id}
                className={`leave-day-option ${dayType === type.id ? 'is-selected' : ''}`}
                onClick={() => setDayType(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>

          {dayType === 'period' && (
            <div className="leave-field-grid leave-field-grid--period">
              <label className="leave-field">
                <span>Start time</span>
                <input
                  type="time"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                />
              </label>
              <label className="leave-field">
                <span>End time</span>
                <input
                  type="time"
                  value={periodEnd}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                />
              </label>
            </div>
          )}
        </section>

        <section className="leave-card">
          <div className="leave-card-head">
            <h2>Reason</h2>
            <span>{reason.trim().length}/200</span>
          </div>
          <label className="leave-field">
            <span>เหตุผลในการลา</span>
            <textarea
              value={reason}
              maxLength={200}
              rows={5}
              onChange={(event) => setReason(event.target.value)}
              placeholder="ระบุเหตุผล เช่น มีธุระส่วนตัว / พบแพทย์ / พักผ่อนประจำปี"
            />
          </label>
        </section>

        <aside className="leave-summary">
          <div>
            <span>Leave balance after request</span>
            <strong>{remainingAfterRequest} วัน</strong>
          </div>
          <div>
            <span>Total request</span>
            <strong>{requestedDays || 0} วัน</strong>
          </div>
          <button type="submit" className="leave-submit" disabled={!canSubmit}>
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
        {!isExemptFromCheckIn && (
          <button className="nav-item" onClick={onGoRecord}>
            <span className="nav-icon"><MdAccessTime /></span>
            <span className="nav-label">Record</span>
          </button>
        )}
        {!isExemptFromCheckIn && (
          <button className="nav-item center" onClick={onOpenCheckIn} aria-label="Open check in">
            <span className="nav-icon large"><MdSchedule /></span>
          </button>
        )}
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
