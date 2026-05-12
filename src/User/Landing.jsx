import { useEffect, useState } from 'react';
import {
  MdAccessTime,
  MdHome,
  MdDateRange,
  MdSchedule,
  MdAssignment,
  MdPerson,
  MdBusiness,
  MdWorkOutline,
  MdClose,
  MdCheckCircle,
  MdWarningAmber,
  MdLogin,
  MdLogout
} from 'react-icons/md';
import './Landing.css';
import Account from './Account';
import Record from './Record';
import Request from './Request';

const CHECK_IN_RECORDS_KEY = 'apphr-checkin-records';
const DEMO_SEED_KEY = 'apphr-demo-seeded';
const today = new Date();

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getUserRecordOwnerKey = (user) =>
  user?.employeeId || user?.email || user?.userType || '';

const getRecordOwnerKey = (record) =>
  record?.ownerKey || record?.employeeId || record?.email || record?.userId || '';

export default function Landing({ user: currentUser, requests = [], onGoRecord, onGoRequest, onGoAccount }) {
  const [activePage, setActivePage] = useState('home');
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);
  const [selectedCheckInLocation, setSelectedCheckInLocation] = useState('');
  const [offsiteAddress, setOffsiteAddress] = useState('');
  const [backdateTarget, setBackdateTarget] = useState(null);
  const [popupMode, setPopupMode] = useState('checkin');
  const [checkOutTarget, setCheckOutTarget] = useState(null);
  const [manualCheckOutTime, setManualCheckOutTime] = useState('17:00');
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInRecords, setCheckInRecords] = useState(() => {
    const savedRecords = localStorage.getItem(CHECK_IN_RECORDS_KEY);
    return savedRecords ? JSON.parse(savedRecords) : [];
  });

  useEffect(() => {
    localStorage.setItem(CHECK_IN_RECORDS_KEY, JSON.stringify(checkInRecords));
  }, [checkInRecords]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== CHECK_IN_RECORDS_KEY) return;
      setCheckInRecords(event.newValue ? JSON.parse(event.newValue) : []);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(DEMO_SEED_KEY)) return;
    const ownerKey = currentUser?.employeeId || currentUser?.email || currentUser?.userType;
    if (!ownerKey) return;

    const buildPastWeekday = (weekdaysAgo, hour, minute) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      let count = 0;
      while (count < weekdaysAgo) {
        d.setDate(d.getDate() - 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) count += 1;
      }
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    const buildRecord = (date, location, checkOutTime) => ({
      id: date.toISOString(),
      dateKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      date: date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      checkOutTime,
      status: checkOutTime ? 'Checked out' : 'Checked in',
      ownerKey,
      employeeId: currentUser?.employeeId,
      userId: currentUser?.userType,
      email: currentUser?.email,
      userName: currentUser?.name,
      userType: currentUser?.userType,
      userTypeLabel: currentUser?.userTypeLabel,
      location
    });

    const demoRecords = [
      buildRecord(buildPastWeekday(1, 9, 5), 'HAND SE Thonglor', undefined), // forgot checkout — most recent weekday
      buildRecord(buildPastWeekday(2, 9, 30), 'WFH', '17:30'), // complete record (check-in + check-out)
      buildRecord(buildPastWeekday(4, 8, 50), 'KRAC Chulalongkorn University', undefined), // another forgot checkout
      buildRecord(buildPastWeekday(6, 9, 15), 'HAND SE Thonglor', '18:00') // complete record (older)
    ];

    setCheckInRecords((current) => {
      const existingKeys = new Set(current.map((r) => r.id));
      const merged = [...demoRecords.filter((r) => !existingKeys.has(r.id)), ...current];
      return merged;
    });
    localStorage.setItem(DEMO_SEED_KEY, '1');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock user data
  const user = {
    name: 'Thareeya Uentrakul',
    position: 'Project Coordinator',
    employeeId: 'HAND23',
    company: 'บริษัท แฮนด์ วิสาหกิจเพื่อสังคม จำกัด',
    language: 'English',
    leaveQuota: '5 days',
    leaveQuotas: [
      { type: 'Annual Leave', detail: 'ลาพักร้อน', remaining: '5 days' },
      { type: 'Sick Leave', detail: 'ลาป่วย', remaining: '30 days' },
      { type: 'Personal Leave', detail: 'ลากิจ', remaining: '3 days' },
      { type: 'Maternity Leave', detail: 'ลาคลอด', remaining: '98 days' }
    ],
    ...currentUser
  };
  const userDate = today.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const userInitials = user.name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('');
  const userOwnerKey = getUserRecordOwnerKey(user);
  const isCurrentUserRecord = (record) => {
    return Boolean(userOwnerKey) && getRecordOwnerKey(record) === userOwnerKey;
  };
  const userCheckInRecords = checkInRecords.filter(isCurrentUserRecord);

  const checkInLocations = [
    { icon: <MdBusiness />, name: 'HAND SE Thonglor', detail: 'Office' },
    { icon: <MdBusiness />, name: 'KRAC Chulalongkorn University', detail: 'Office' },
    { icon: <MdHome />, name: 'WFH', detail: 'Work from home' },
    { icon: <MdWorkOutline />, name: 'Offsite', detail: 'Set address' }
  ];

  const todayKey = getDateKey(today);
  const userCheckInDateKeys = new Set(
    userCheckInRecords.map((record) => record.dateKey).filter(Boolean)
  );
  const expandRequestDateKeys = (request) => {
    const startKey = request.startDateKey || request.dateKey;
    const endKey = request.endDateKey || startKey;
    if (!startKey) return [];
    const start = new Date(`${startKey}T00:00:00`);
    const end = new Date(`${endKey}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return [startKey];
    }
    const keys = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      keys.push(`${y}-${m}-${d}`);
      cursor.setDate(cursor.getDate() + 1);
    }
    return keys;
  };
  const requestDateKeys = new Set(
    requests
      .filter((request) => request.type !== 'Request Documents')
      .flatMap(expandRequestDateKeys)
  );
  const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

  const formatDateLabel = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  const dateFromKey = (dateKey) => {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const notCheckedInDays = (() => {
    const items = [];
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const cursor = new Date(startOfYear);
    while (cursor <= yesterday) {
      if (!isWeekend(cursor)) {
        const cursorKey = getDateKey(cursor);
        if (!userCheckInDateKeys.has(cursorKey) && !requestDateKeys.has(cursorKey)) {
          items.push({
            kind: 'absent',
            dateKey: cursorKey,
            label: formatDateLabel(cursor)
          });
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return items;
  })();

  const forgotCheckOutItems = userCheckInRecords
    .filter((record) => record.dateKey && record.dateKey < todayKey && !record.checkOutTime)
    .map((record) => ({
      kind: 'forgot-checkout',
      dateKey: record.dateKey,
      label: formatDateLabel(dateFromKey(record.dateKey)),
      record
    }));

  const pendingItems = [...notCheckedInDays, ...forgotCheckOutItems].sort((a, b) =>
    a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0
  );

  const todayCheckIn = userCheckInRecords.find((record) => record.dateKey === todayKey);

  const getStatusInfo = (location) => {
    if (!location) return { label: 'ยังไม่เช็คอิน', tone: 'idle' };
    const lower = String(location).toLowerCase();
    if (lower === 'wfh') return { label: 'Work from home', tone: 'wfh' };
    if (lower.includes('hand') || lower.includes('krac')) return { label: 'ในสำนักงาน', tone: 'office' };
    return { label: 'นอกสำนักงาน', tone: 'offsite' };
  };

  const selfNickname = user.nickname || 'เพ้นท์';
  const selfRole = user.role || user.position || 'Junior Analyst';
  const selfInitial = (selfNickname || user.name || '?').trim().charAt(0).toUpperCase();
  const selfStatus = todayCheckIn?.checkOutTime
    ? { label: 'เช็คเอาท์แล้ว', tone: 'done' }
    : getStatusInfo(todayCheckIn?.location);

  const teamMembers = [
    {
      id: 'self',
      nickname: selfNickname,
      role: selfRole,
      initial: selfInitial,
      accent: '#C4895A',
      status: selfStatus,
      checkInTime: todayCheckIn?.time,
      checkOutTime: todayCheckIn?.checkOutTime,
      location: todayCheckIn?.location,
      note: todayCheckIn?.note,
      isSelf: true
    },
    {
      id: 'tm-jen',
      nickname: 'เจน',
      role: 'Project Manager',
      initial: 'J',
      accent: '#9ec5d8',
      status: { label: 'ในสำนักงาน', tone: 'office' },
      checkInTime: '08:42',
      location: 'HAND SE Thonglor'
    },
    {
      id: 'tm-boss',
      nickname: 'บอส',
      role: 'Senior Designer',
      initial: 'B',
      accent: '#a3d4a7',
      status: { label: 'Work from home', tone: 'wfh' },
      checkInTime: '09:10',
      checkOutTime: '17:30',
      location: 'WFH',
      note: 'ปิดงาน design system ถึง 18:00'
    },
    {
      id: 'tm-mim',
      nickname: 'มิ้ม',
      role: 'Researcher',
      initial: 'M',
      accent: '#d9b0e3',
      status: { label: 'ลาพักร้อน', tone: 'leave' },
      note: 'ลาพักร้อน 12 - 13 พ.ค.'
    }
  ];

  const activeCheckIn = userCheckInRecords.find(
    (record) => record.dateKey === todayKey && !record.checkOutTime
  );

  const closeCheckInPopup = () => {
    setShowCheckInPopup(false);
    setSelectedCheckInLocation('');
    setOffsiteAddress('');
    setBackdateTarget(null);
    setCheckOutTarget(null);
    setManualCheckOutTime('17:00');
    setCheckInNote('');
    setPopupMode('checkin');
  };

  const openCheckInPopup = () => {
    if (activeCheckIn) {
      setPopupMode('checkout');
    } else {
      setPopupMode('checkin');
    }
    setShowCheckInPopup(true);
  };

  const openManualCheckOut = (record) => {
    setCheckOutTarget(record);
    setManualCheckOutTime('17:00');
    setPopupMode('manual-checkout');
    setShowCheckInPopup(true);
  };

  const openBackdatedCheckIn = (day) => {
    const [year, month, dayOfMonth] = day.dateKey.split('-').map(Number);
    const targetDate = new Date(year, month - 1, dayOfMonth, 9, 0, 0);
    setBackdateTarget({ ...day, date: targetDate });
    setSelectedCheckInLocation('');
    setOffsiteAddress('');
    setCheckInNote('');
    setPopupMode('checkin');
    setShowCheckInPopup(true);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const handleSubmitCheckIn = () => {
    const checkedInAt = backdateTarget?.date || new Date();
    const location =
      selectedCheckInLocation === 'Offsite'
        ? offsiteAddress.trim()
        : selectedCheckInLocation;

    const isBackdated = Boolean(backdateTarget);
    const autoCheckOutAt = isBackdated
      ? new Date(checkedInAt.getFullYear(), checkedInAt.getMonth(), checkedInAt.getDate(), 17, 0, 0)
      : null;

    setCheckInRecords((currentRecords) => [
      {
        id: checkedInAt.toISOString(),
        dateKey: getDateKey(checkedInAt),
        date: checkedInAt.toLocaleDateString('th-TH', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        time: formatTime(checkedInAt),
        checkOutTime: autoCheckOutAt ? formatTime(autoCheckOutAt) : undefined,
        status: autoCheckOutAt ? 'Checked out' : 'Checked in',
        ownerKey: userOwnerKey,
        employeeId: user.employeeId,
        userId: user.userType,
        email: user.email,
        userName: user.name,
        userType: user.userType,
        userTypeLabel: user.userTypeLabel,
        location,
        note: checkInNote.trim() || undefined
      },
      ...currentRecords
    ]);
    closeCheckInPopup();
  };

  const handleSubmitCheckOut = () => {
    if (popupMode === 'manual-checkout') {
      if (!checkOutTarget || !manualCheckOutTime) return;
      setCheckInRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.id === checkOutTarget.id
            ? {
                ...record,
                checkOutTime: manualCheckOutTime,
                status: 'Checked out'
              }
            : record
        )
      );
    } else {
      if (!activeCheckIn) return;
      const checkedOutAt = new Date();
      setCheckInRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.id === activeCheckIn.id
            ? {
                ...record,
                checkOutTime: formatTime(checkedOutAt),
                status: 'Checked out'
              }
            : record
        )
      );
    }
    closeCheckInPopup();
  };

  const handleDeleteCheckInRecord = (recordId) => {
    setCheckInRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId)
    );
  };

  if (activePage === 'record') {
    return (
      <Record
        records={userCheckInRecords}
        onDeleteRecord={handleDeleteCheckInRecord}
        onGoHome={() => setActivePage('home')}
        onGoAccount={onGoAccount || (() => setActivePage('account'))}
        onOpenCheckIn={() => {
          setActivePage('home');
          setShowCheckInPopup(true);
        }}
      />
    );
  }

  if (activePage === 'account') {
    return (
      <Account
        user={user}
        onGoHome={() => setActivePage('home')}
        onGoRecord={onGoRecord || (() => setActivePage('record'))}
        onGoRequest={onGoRequest || (() => setActivePage('request'))}
        onOpenCheckIn={() => {
          setActivePage('home');
          setShowCheckInPopup(true);
        }}
      />
    );
  }

  if (activePage === 'request') {
    return (
      <Request
        onCreateNew={(requestType) => {
          if (requestType === 'leave') {
            // Keep local fallback navigation working when Landing owns the page state.
            window.history.pushState({}, '', '/leave');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
          if (requestType === 'overtime') {
            window.history.pushState({}, '', '/overtime');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
          if (requestType === 'work-outsides') {
            window.history.pushState({}, '', '/outside');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }
        }}
        onGoHome={() => setActivePage('home')}
        onGoRecord={onGoRecord || (() => setActivePage('record'))}
        onGoAccount={onGoAccount || (() => setActivePage('account'))}
        onOpenCheckIn={() => {
          setActivePage('home');
          setShowCheckInPopup(true);
        }}
      />
    );
  }

  return (
    <div className="landing-container">
      {/* Dashboard */}
      <div className="dashboard">
        {/* Welcome + Today's status (combined) */}
        <section className="dashboard-card welcome-card">
          <div className="welcome-card__head">
            <div className="welcome-card__user">
              <div className="welcome-card__avatar" aria-label={user.name}>
                {userInitials}
              </div>
              <div className="welcome-card__info">
                <h2 className="welcome-card__name">{user.name}</h2>
                <p className="welcome-card__type">{user.userTypeLabel}</p>
              </div>
            </div>
            <div className="welcome-card__date">
              <MdDateRange />
              <span>{userDate}</span>
            </div>
          </div>

          <div className="welcome-card__divider" />

          {todayCheckIn ? (
            <div className="dashboard-today dashboard-today--in">
              <div className="dashboard-today-status">
                <MdCheckCircle />
                <strong>
                  {todayCheckIn.checkOutTime ? 'เช็คเอาท์แล้ว' : 'เช็คอินแล้ว'}
                </strong>
              </div>
              <dl className="dashboard-today-meta">
                <div>
                  <dt>Check in</dt>
                  <dd>{todayCheckIn.time || '-'}</dd>
                </div>
                {todayCheckIn.checkOutTime && (
                  <div>
                    <dt>Check out</dt>
                    <dd>{todayCheckIn.checkOutTime}</dd>
                  </div>
                )}
                <div>
                  <dt>Location</dt>
                  <dd>{todayCheckIn.location || '-'}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="dashboard-today dashboard-today--out">
              <div className="dashboard-today-status">
                <MdWarningAmber />
                <strong>ยังไม่ได้เช็คอินวันนี้</strong>
              </div>
            </div>
          )}
          {!todayCheckIn?.checkOutTime && (
            <button
              type="button"
              className={`dashboard-primary-btn ${activeCheckIn ? 'dashboard-primary-btn--out' : 'dashboard-primary-btn--in'}`}
              onClick={openCheckInPopup}
            >
              {activeCheckIn ? <MdLogout /> : <MdLogin />}
              <span>{activeCheckIn ? 'Check out' : 'Check in'}</span>
            </button>
          )}
        </section>

        {/* Team status */}
        <section className="dashboard-card">
          <div className="dashboard-card__head">
            <h3>สถานะทีม</h3>
            <span className="dashboard-card__sub">วันนี้</span>
          </div>
          <div className="team-status-list">
            {teamMembers.map((member) => (
              <article
                key={member.id}
                className={`team-card${member.isSelf ? ' team-card--self' : ''}`}
              >
                <header className="team-card__head">
                  <div className="team-card__person">
                    <div className="team-card__avatar">
                      {member.initial}
                    </div>
                    <div className="team-card__id">
                      <strong>{member.nickname}{member.isSelf && <small>คุณ</small>}</strong>
                      <span>{member.role}</span>
                    </div>
                  </div>
                  <div className={`team-card__status team-card__status--${member.status.tone}`}>
                    <span className="team-card__dot" />
                    {member.status.label}
                  </div>
                </header>
                {(member.checkInTime || member.checkOutTime || member.location) && (
                  <dl className="team-card__meta">
                    {member.checkInTime && (
                      <div>
                        <dt>Check-in</dt>
                        <dd>{member.checkInTime}</dd>
                      </div>
                    )}
                    {member.checkOutTime && (
                      <div>
                        <dt>Check-out</dt>
                        <dd>{member.checkOutTime}</dd>
                      </div>
                    )}
                    {member.location && (
                      <div>
                        <dt>Where</dt>
                        <dd>{member.location}</dd>
                      </div>
                    )}
                  </dl>
                )}
                {member.note && <p className="team-card__note">{member.note}</p>}
              </article>
            ))}
          </div>
        </section>

      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item active">
          <span className="nav-icon"><MdHome /></span>
          <span className="nav-label">Home</span>
          <span className="nav-badge">9</span>
        </button>
        <button className="nav-item" onClick={onGoRecord || (() => setActivePage('record'))}>
          <span className="nav-icon"><MdAccessTime /></span>
          <span className="nav-label">Record</span>
        </button>
        <button
          className="nav-item center"
          onClick={openCheckInPopup}
          aria-label={activeCheckIn ? 'Open check out' : 'Open check in'}
        >
          <span className="nav-icon large"><MdSchedule /></span>
        </button>
        <button className="nav-item" onClick={onGoRequest || (() => setActivePage('request'))}>
          <span className="nav-icon"><MdAssignment /></span>
          <span className="nav-label">Requests</span>
        </button>
        <button className="nav-item" onClick={onGoAccount || (() => setActivePage('account'))}>
          <span className="nav-icon"><MdPerson /></span>
          <span className="nav-label">My Account</span>
        </button>
      </div>

      {showCheckInPopup && (
        <div className="checkin-overlay" onClick={closeCheckInPopup}>
          <div className="checkin-popup" onClick={(event) => event.stopPropagation()}>
            <div className="checkin-header">
              <div>
                <h3>
                  {popupMode === 'checkout' || popupMode === 'manual-checkout'
                    ? 'CHECK OUT?'
                    : 'WHERE ARE YOU WORKING?'}
                </h3>
                {backdateTarget && (
                  <p className="checkin-backdate-label">Check in for {backdateTarget.label}</p>
                )}
                {popupMode === 'manual-checkout' && checkOutTarget && (
                  <p className="checkin-backdate-label">
                    Check out for {formatDateLabel(dateFromKey(checkOutTarget.dateKey))}
                  </p>
                )}
              </div>
              <button className="checkin-close" onClick={closeCheckInPopup} aria-label="Close">
                <MdClose />
              </button>
            </div>
            {popupMode === 'manual-checkout' ? (
              <>
                <div className="checkout-summary">
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-key">Location</span>
                    <span className="checkout-summary-val">{checkOutTarget?.location || '-'}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-key">Check in</span>
                    <span className="checkout-summary-val">{checkOutTarget?.time || '-'}</span>
                  </div>
                </div>
                <label className="manual-checkout-field">
                  <span>Check out time</span>
                  <input
                    type="time"
                    value={manualCheckOutTime}
                    onChange={(event) => setManualCheckOutTime(event.target.value)}
                  />
                </label>
                <button
                  className="checkin-submit"
                  disabled={!manualCheckOutTime}
                  onClick={handleSubmitCheckOut}
                >
                  Save check out time
                </button>
              </>
            ) : popupMode === 'checkout' ? (
              <>
                <div className="checkout-summary">
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-key">Location</span>
                    <span className="checkout-summary-val">{activeCheckIn?.location || '-'}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-key">Check in</span>
                    <span className="checkout-summary-val">{activeCheckIn?.time || '-'}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span className="checkout-summary-key">Check out</span>
                    <span className="checkout-summary-val">{formatTime(new Date())}</span>
                  </div>
                </div>
                <button className="checkin-submit" onClick={handleSubmitCheckOut}>
                  Confirm check out
                </button>
              </>
            ) : (
              <>
                <div className="checkin-options">
                  {checkInLocations.map((location) => (
                    <button
                      key={location.name}
                      className={`checkin-option ${selectedCheckInLocation === location.name ? 'selected' : ''}`}
                      onClick={() => setSelectedCheckInLocation(location.name)}
                    >
                      <span className="checkin-option-icon">{location.icon}</span>
                      <span className="checkin-option-text">
                        <strong>{location.name}</strong>
                        <small>{location.detail}</small>
                      </span>
                    </button>
                  ))}
                </div>
                {selectedCheckInLocation === 'Offsite' && (
                  <label className="offsite-field">
                    <span>Offsite location</span>
                    <textarea
                      value={offsiteAddress}
                      onChange={(event) => setOffsiteAddress(event.target.value)}
                      placeholder="ระบุสถานที่"
                      rows="3"
                    />
                  </label>
                )}
                {selectedCheckInLocation && (
                  <label className="offsite-field">
                    <span>Note (ไม่บังคับ)</span>
                    <textarea
                      value={checkInNote}
                      onChange={(event) => setCheckInNote(event.target.value)}
                      placeholder="เช่น ประชุมกับ TCDC ถึง 16:00"
                      rows="2"
                      maxLength={120}
                    />
                  </label>
                )}
                <button
                  className="checkin-submit"
                  disabled={!selectedCheckInLocation || (selectedCheckInLocation === 'Offsite' && !offsiteAddress.trim())}
                  onClick={handleSubmitCheckIn}
                >
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
