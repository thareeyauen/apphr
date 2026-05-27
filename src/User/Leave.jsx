import { useEffect, useMemo, useState } from 'react';
import {
  MdArrowBack,
  MdAttachFile,
  MdCalendarToday,
  MdInfoOutline,
  MdSend
} from 'react-icons/md';
import BottomNav from './Components/BottomNav';
import {
  LEAVE_TYPES,
  LEAVE_TYPES_BY_ID,
  computeTenureYears,
  annualQuotaForTenure,
  daysBetween,
  parseFlexibleDate,
  computeEffectiveLeaveDays,
  summarizeRange,
} from '../leaveTypes';
import './Leave.css';

const DAY_TYPES = [
  { id: 'full', label: 'Full Day', multiplier: 1 },
  { id: 'half-morning', label: 'Half-day 09.00-12.00', multiplier: 0.5 },
  { id: 'half-afternoon', label: 'Half-day 12.00-17.00', multiplier: 0.5 },
  { id: 'period', label: 'Period', multiplier: 1 }
];

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const getDateDiffInclusive = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
};

const formatInputDate = (dateValue) => {
  if (!dateValue) return '-';
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const shiftDays = (dateKey, deltaDays) => {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return toDateKey(d);
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

const getQuotaForUser = (cfg, currentUser, overrides) => {
  if (overrides && Object.prototype.hasOwnProperty.call(overrides, cfg.id)) {
    return overrides[cfg.id];
  }
  if (cfg.id !== 'annual') return cfg.quota ?? 0;
  const tenure = computeTenureYears(currentUser?.profile?.job?.startDate || currentUser?.startDate);
  return annualQuotaForTenure(tenure);
};

export default function Leave({
  onSubmitRequest,
  currentUser,
  entitlements,
  requests = [],
  holidays = [],
  onGoBack,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn,
  isCheckInDisabled = false
}) {
  const holidaySet = useMemo(
    () => new Set((holidays || []).map((h) => h.holiday_date || h)),
    [holidays]
  );
  const holidayLookup = useMemo(() => {
    const m = {};
    for (const h of holidays || []) {
      const date = h.holiday_date || h;
      if (date) m[date] = h.name || '';
    }
    return m;
  }, [holidays]);
  const isExemptFromCheckIn = isCheckInDisabled || currentUser?.profile?.job?.employeeLevel === 'Board Level' || currentUser?.profile?.job?.employeeLevel === 'Director Level';
  const userOwnerKey = currentUser?.employeeId || currentUser?.email || currentUser?.userType || '';
  const today = new Date().toISOString().slice(0, 10);

  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0].id);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [dayType, setDayType] = useState(DAY_TYPES[0].id);
  const [periodStart, setPeriodStart] = useState('09:00');
  const [periodEnd, setPeriodEnd] = useState('17:00');
  const [reason, setReason] = useState('');
  const [holidayWorkDate, setHolidayWorkDate] = useState('');
  const [childBirthDate, setChildBirthDate] = useState('');
  const [supervisorAcknowledged, setSupervisorAcknowledged] = useState(false);
  const [medicalCertificate, setMedicalCertificate] = useState(null); // { name, dataUrl, size }
  const [attachmentError, setAttachmentError] = useState('');

  const selectedLeave = LEAVE_TYPES_BY_ID[leaveType] || LEAVE_TYPES[0];
  const selectedDayType = DAY_TYPES.find((type) => type.id === dayType) || DAY_TYPES[0];

  // Clear conditional fields when leave type changes.
  useEffect(() => {
    setHolidayWorkDate('');
    setChildBirthDate('');
    setSupervisorAcknowledged(false);
    setMedicalCertificate(null);
    setAttachmentError('');
  }, [leaveType]);

  // Compute min/max selectable dates per type. Sick allows backdate; others lock to today+.
  const minStartDate = useMemo(() => {
    const backdate = selectedLeave.backdateDays || 0;
    const advance = selectedLeave.advanceDays || 0;
    if (backdate > 0) return shiftDays(today, -backdate);
    if (advance > 0) return shiftDays(today, advance);
    return today;
  }, [selectedLeave, today]);

  const usedDaysByLabel = useMemo(() => {
    if (!requests.length || !userOwnerKey) return {};
    const yearPrefix = String(new Date().getFullYear());
    return requests.reduce((acc, req) => {
      if (!['approved', 'pending'].includes(req.status)) return acc;
      const reqKey = req?.ownerKey || req?.employeeId || req?.email || req?.userId || '';
      if (reqKey !== userOwnerKey) return acc;
      if (!(req.startDateKey || '').startsWith(yearPrefix)) return acc;
      const days = req.days ?? getDateDiffInclusive(req.startDateKey, req.endDateKey);
      acc[req.type] = (acc[req.type] || 0) + days;
      return acc;
    }, {});
  }, [requests, userOwnerKey]);

  const getRemainingForType = (cfg) => {
    const quota = getQuotaForUser(cfg, currentUser, entitlements);
    if (!quota) return 0;
    return Math.max(quota - (usedDaysByLabel[cfg.label] || 0), 0);
  };

  // Breakdown of the chosen date range (used by the preview card and submit logic).
  const rangeSummary = useMemo(
    () => summarizeRange(startDate, endDate, holidaySet),
    [startDate, endDate, holidaySet]
  );

  // Effective leave days = what actually counts against the quota.
  // For working-day leave types (annual, personal, sick, etc.) this excludes
  // weekends + company holidays. For calendar-day types (maternity, paternity,
  // ordination, unpaid, military) every day counts.
  const requestedDays = useMemo(
    () => computeEffectiveLeaveDays(selectedLeave, startDate, endDate, selectedDayType.id, holidaySet),
    [selectedLeave, startDate, endDate, selectedDayType, holidaySet]
  );

  const remainingAfterRequest = Math.max(getRemainingForType(selectedLeave) - requestedDays, 0);

  // Centralized validation — single source of truth for "can submit" + error message.
  const validationError = useMemo(() => {
    const rangeCount = getDateDiffInclusive(startDate, endDate);
    if (!rangeCount) return 'กรุณาเลือกช่วงวันที่ให้ถูกต้อง';
    if (requestedDays <= 0) {
      return !selectedLeave.countCalendarDays
        ? `${selectedLeave.labelTh}: ช่วงวันที่เลือกตรงกับวันหยุดทั้งหมด — ไม่สามารถใช้สิทธิลาได้`
        : 'กรุณาเลือกช่วงวันที่ให้ถูกต้อง';
    }
    if (!reason.trim()) return 'กรุณาระบุเหตุผลในการลา';

    const start = parseFlexibleDate(startDate);
    if (!start) return 'วันที่ไม่ถูกต้อง';
    const todayDate = new Date();
    const lead = daysBetween(todayDate, start);

    if (selectedLeave.advanceDays > 0 && lead < selectedLeave.advanceDays) {
      return `${selectedLeave.labelTh}: ต้องขอล่วงหน้าอย่างน้อย ${selectedLeave.advanceDays} วัน`;
    }
    if (lead < 0) {
      const allowedBack = selectedLeave.backdateDays || 0;
      if (-lead > allowedBack) {
        return allowedBack > 0
          ? `${selectedLeave.labelTh}: ลาย้อนหลังได้ไม่เกิน ${allowedBack} วัน`
          : `${selectedLeave.labelTh}: ไม่อนุญาตให้ลาย้อนหลัง`;
      }
    }

    if (selectedLeave.id === 'annual') {
      const tenure = computeTenureYears(currentUser?.profile?.job?.startDate || currentUser?.startDate);
      if (tenure < (selectedLeave.minTenureYears || 1)) {
        return 'ลาพักร้อน: ใช้สิทธิได้เมื่ออายุงานครบ 1 ปี';
      }
    }

    if (selectedLeave.id === 'sick' && selectedLeave.certificateAfterDays && requestedDays >= selectedLeave.certificateAfterDays) {
      if (!medicalCertificate?.dataUrl) {
        return `ลาป่วยติดต่อกัน ${selectedLeave.certificateAfterDays} วันขึ้นไป ต้องแนบหนังสือรับรองแพทย์`;
      }
    }

    if (selectedLeave.requiresHolidayWorkDate && !holidayWorkDate) {
      return 'ลาชดเชยทำงานวันหยุด: ต้องระบุวันที่ทำงานในวันหยุด';
    }
    if (selectedLeave.requiresSupervisorPreApproval && !supervisorAcknowledged) {
      return 'ลาชดเชยทำงานวันหยุด: ต้องยืนยันว่าหัวหน้างานอนุมัติแล้ว';
    }

    if (selectedLeave.requiresChildBirthDate) {
      const birth = parseFlexibleDate(childBirthDate);
      if (!birth) return 'ลาคลอด (พนักงานชาย): ต้องระบุวันที่บุตรคลอด';
      const sinceBirth = daysBetween(birth, start);
      if (sinceBirth < 0) return 'ลาคลอด (พนักงานชาย): วันเริ่มลาต้องไม่ก่อนวันที่บุตรคลอด';
      if (sinceBirth > selectedLeave.useWithinDaysFromChildBirth) {
        return `ลาคลอด (พนักงานชาย): ต้องใช้สิทธิภายใน ${selectedLeave.useWithinDaysFromChildBirth} วันนับจากวันที่บุตรคลอด`;
      }
    }

    const quota = getQuotaForUser(selectedLeave, currentUser, entitlements);
    if (quota > 0) {
      const used = usedDaysByLabel[selectedLeave.label] || 0;
      if (used + requestedDays > quota) {
        return `${selectedLeave.labelTh}: เกินสิทธิ (คงเหลือ ${Math.max(quota - used, 0)} วัน)`;
      }
    }
    return '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedDays, reason, startDate, selectedLeave, currentUser, entitlements, medicalCertificate, holidayWorkDate, supervisorAcknowledged, childBirthDate, usedDaysByLabel]);

  const canSubmit = !validationError;

  // Auto-clamp start/end when the leave type's allowed window changes.
  useEffect(() => {
    if (startDate < minStartDate) setStartDate(minStartDate);
    if (endDate < minStartDate) setEndDate(minStartDate);
  }, [minStartDate, startDate, endDate]);

  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];
    setAttachmentError('');
    if (!file) {
      setMedicalCertificate(null);
      return;
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setAttachmentError('รองรับเฉพาะไฟล์รูปภาพหรือ PDF');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError('ไฟล์ต้องมีขนาดไม่เกิน 5 MB');
      event.target.value = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setMedicalCertificate({ name: file.name, size: file.size, type: file.type, dataUrl });
    } catch {
      setAttachmentError('อ่านไฟล์ไม่สำเร็จ');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    const timeLabel =
      selectedDayType.id === 'period'
        ? `${periodStart}-${periodEnd}`
        : selectedDayType.label;
    const detail = `${formatInputDate(startDate)} - ${formatInputDate(endDate)} (${requestedDays} วัน) · ${selectedDayType.label} · ${reason.trim()}`;
    onSubmitRequest?.({
      type: selectedLeave.label,
      detail,
      startDateKey: startDate,
      endDateKey: endDate,
      days: requestedDays,
      dayTypeId: selectedDayType.id,
      time: timeLabel,
      reason: reason.trim(),
      ...(selectedLeave.id === 'sick' && medicalCertificate ? { medicalCertificate } : {}),
      ...(selectedLeave.requiresHolidayWorkDate ? { holidayWorkDate } : {}),
      ...(selectedLeave.requiresChildBirthDate ? { childBirthDate } : {}),
      ...(selectedLeave.requiresSupervisorPreApproval ? { supervisorAcknowledged: true } : {}),
    });
    onGoRequest?.();
  };

  const showCertificateField = selectedLeave.id === 'sick'
    && selectedLeave.certificateAfterDays
    && requestedDays >= selectedLeave.certificateAfterDays;

  const tenureYears = useMemo(
    () => computeTenureYears(currentUser?.profile?.job?.startDate || currentUser?.startDate),
    [currentUser]
  );

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
            <span>{getRemainingForType(selectedLeave)} days left</span>
          </div>
          <label className="leave-field leave-type-select">
            <span>ประเภทการลา</span>
            <select value={leaveType} onChange={(event) => setLeaveType(event.target.value)}>
              {LEAVE_TYPES.map((type) => {
                const quota = getQuotaForUser(type, currentUser, entitlements);
                const remaining = getRemainingForType(type);
                return (
                  <option key={type.id} value={type.id}>
                    {type.labelTh} ({type.label}) · คงเหลือ {remaining}/{quota || '-'} วัน
                  </option>
                );
              })}
            </select>
            <small>
              {selectedLeave.labelTh} · คงเหลือ {getRemainingForType(selectedLeave)} วัน
              {selectedLeave.id === 'annual' && (
                <> · อายุงาน {tenureYears.toFixed(1)} ปี</>
              )}
            </small>
          </label>

          <div className="leave-rule-list">
            {selectedLeave.advanceDays > 0 && (
              <p className="leave-rule"><MdInfoOutline /> ต้องขอล่วงหน้าอย่างน้อย {selectedLeave.advanceDays} วัน</p>
            )}
            {selectedLeave.backdateDays > 0 && (
              <p className="leave-rule"><MdInfoOutline /> ลาย้อนหลังได้ไม่เกิน {selectedLeave.backdateDays} วัน</p>
            )}
            {selectedLeave.id === 'annual' && (
              <>
                <p className="leave-rule"><MdInfoOutline /> ใช้สิทธิได้เมื่ออายุงานครบ 1 ปี · 1–3 ปี: 7 วัน · 3–5 ปี: 10 วัน · 5+ ปี: 15 วัน</p>
                <p className="leave-rule"><MdInfoOutline /> ยกไปสะสมได้ไม่เกิน {selectedLeave.carryOverMax} วัน · ส่วนเหลือจ่ายคืนเป็นเงินรอบปี</p>
              </>
            )}
            {selectedLeave.id === 'sick' && (
              <p className="leave-rule"><MdInfoOutline /> ลาติดต่อกัน {selectedLeave.certificateAfterDays} วันขึ้นไป ต้องแนบหนังสือรับรองแพทย์</p>
            )}
            {selectedLeave.requiresSupervisorPreApproval && (
              <p className="leave-rule"><MdInfoOutline /> ต้องได้รับอนุมัติจากหัวหน้างานก่อนใช้สิทธิ และใช้ได้เฉพาะกรณีที่ทำงานในวันหยุดเท่านั้น</p>
            )}
            {selectedLeave.requiresChildBirthDate && (
              <p className="leave-rule"><MdInfoOutline /> ต้องใช้สิทธิภายใน {selectedLeave.useWithinDaysFromChildBirth} วันนับจากวันที่บุตรคลอด</p>
            )}
          </div>
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
                min={minStartDate}
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

          {rangeSummary.calendar > 0 && (
            <div className="leave-range-preview">
              <div className="leave-range-preview__row">
                <span>วันในช่วงที่เลือก (ปฏิทิน)</span>
                <strong>{rangeSummary.calendar} วัน</strong>
              </div>
              {!selectedLeave.countCalendarDays && rangeSummary.weekendDates.length > 0 && (
                <div className="leave-range-preview__row leave-range-preview__row--muted">
                  <span>หัก เสาร์-อาทิตย์</span>
                  <strong>−{rangeSummary.weekendDates.length} วัน</strong>
                </div>
              )}
              {!selectedLeave.countCalendarDays && rangeSummary.holidayDates.length > 0 && (
                <div className="leave-range-preview__row leave-range-preview__row--muted">
                  <span>หัก วันหยุดบริษัท</span>
                  <strong>−{rangeSummary.holidayDates.length} วัน</strong>
                </div>
              )}
              {!selectedLeave.countCalendarDays && rangeSummary.holidayDates.length > 0 && (
                <ul className="leave-range-preview__holidays">
                  {rangeSummary.holidayDates.map((d) => (
                    <li key={d}>{formatInputDate(d)} — {holidayLookup[d] || 'วันหยุด'}</li>
                  ))}
                </ul>
              )}
              <div className="leave-range-preview__row leave-range-preview__row--total">
                <span>นับเป็นวันลาจริง</span>
                <strong>{requestedDays} วัน</strong>
              </div>
              {selectedLeave.countCalendarDays && (
                <p className="leave-rule"><MdInfoOutline /> ลาประเภทนี้นับตามปฏิทิน (รวมเสาร์-อาทิตย์และวันหยุดบริษัท)</p>
              )}
            </div>
          )}
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

        {selectedLeave.requiresHolidayWorkDate && (
          <section className="leave-card">
            <div className="leave-card-head">
              <h2>วันที่ทำงานในวันหยุด</h2>
            </div>
            <label className="leave-field">
              <span>ระบุวันที่คุณทำงานในวันหยุดที่จะใช้ลาชดเชย</span>
              <input
                type="date"
                value={holidayWorkDate}
                max={today}
                onChange={(event) => setHolidayWorkDate(event.target.value)}
              />
            </label>
            <label className="leave-field leave-field--checkbox">
              <input
                type="checkbox"
                checked={supervisorAcknowledged}
                onChange={(event) => setSupervisorAcknowledged(event.target.checked)}
              />
              <span>ยืนยันว่าหัวหน้างานอนุมัติให้ใช้สิทธิลาชดเชยแล้ว</span>
            </label>
          </section>
        )}

        {selectedLeave.requiresChildBirthDate && (
          <section className="leave-card">
            <div className="leave-card-head">
              <h2>วันที่บุตรคลอด</h2>
            </div>
            <label className="leave-field">
              <span>ระบุวันที่บุตรคลอด (ใช้สิทธิภายใน {selectedLeave.useWithinDaysFromChildBirth} วัน)</span>
              <input
                type="date"
                value={childBirthDate}
                max={today}
                onChange={(event) => setChildBirthDate(event.target.value)}
              />
            </label>
          </section>
        )}

        {showCertificateField && (
          <section className="leave-card">
            <div className="leave-card-head">
              <h2>หนังสือรับรองแพทย์</h2>
              <span>{medicalCertificate ? '1 ไฟล์' : 'ยังไม่ได้แนบ'}</span>
            </div>
            <label className="leave-field leave-field--file">
              <span><MdAttachFile /> แนบรูปถ่ายหรือ PDF (ไม่เกิน 5 MB)</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleAttachmentChange}
              />
            </label>
            {medicalCertificate && (
              <p className="leave-rule">แนบแล้ว: {medicalCertificate.name} ({Math.round(medicalCertificate.size / 1024)} KB)</p>
            )}
            {attachmentError && <p className="leave-warning">{attachmentError}</p>}
          </section>
        )}

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
          {validationError && <p className="leave-warning">{validationError}</p>}
          <button type="submit" className="leave-submit" disabled={!canSubmit}>
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
