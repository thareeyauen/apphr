import { useEffect, useState } from 'react';
import {
  MdAccessTime,
  MdHome,
  MdDateRange,
  MdSchedule,
  MdAssignment,
  MdPerson,
  MdPieChart,
  MdNavigateBefore,
  MdNavigateNext,
  MdBusiness,
  MdWorkOutline,
  MdClose
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

const getCalendarDays = (calendarDate) => {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const visibleCells = Math.ceil((firstDayOfMonth.getDay() + daysInMonth) / 7) * 7;

  return Array.from({ length: visibleCells }, (_, index) => {
    const dayOffset = index - firstDayOfMonth.getDay() + 1;
    const date = new Date(year, month, dayOffset);

    return {
      date,
      dateKey: getDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month
    };
  });
};

const getUserRecordOwnerKey = (user) =>
  user?.employeeId || user?.email || user?.userType || '';

const getRecordOwnerKey = (record) =>
  record?.ownerKey || record?.employeeId || record?.email || record?.userId || '';

export default function Landing({ user: currentUser, requests = [], onGoRecord, onGoRequest, onGoAccount }) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [activePage, setActivePage] = useState('home');
  const [calendarDate, setCalendarDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);
  const [showLeaveQuotaPopup, setShowLeaveQuotaPopup] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [selectedDayTab, setSelectedDayTab] = useState('checkin');
  const [selectedCheckInLocation, setSelectedCheckInLocation] = useState('');
  const [offsiteAddress, setOffsiteAddress] = useState('');
  const [backdateTarget, setBackdateTarget] = useState(null);
  const [popupMode, setPopupMode] = useState('checkin');
  const [checkOutTarget, setCheckOutTarget] = useState(null);
  const [manualCheckOutTime, setManualCheckOutTime] = useState('17:00');
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

  const calendarDays = getCalendarDays(calendarDate);
  const todayKey = getDateKey(today);
  const userCheckInDateKeys = new Set(
    userCheckInRecords.map((record) => record.dateKey).filter(Boolean)
  );
  const checkInRecordsByDate = checkInRecords.reduce((recordsByDate, record) => {
    if (!record.dateKey) return recordsByDate;
    return {
      ...recordsByDate,
      [record.dateKey]: [...(recordsByDate[record.dateKey] || []), record]
    };
  }, {});
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
  const isRequestOnDay = (request, dateKey) =>
    expandRequestDateKeys(request).includes(dateKey);
  const requestDateKeys = new Set(
    requests
      .filter((request) => request.type !== 'Request Documents')
      .flatMap(expandRequestDateKeys)
  );
  const calendarTitle = calendarDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

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

  const getDayMark = (calendarDay) => {
    if (!calendarDay.isCurrentMonth) return '';
    if (userCheckInDateKeys.has(calendarDay.dateKey)) return 'checkined';
    if (requestDateKeys.has(calendarDay.dateKey)) return 'request';
    if (isWeekend(calendarDay.date)) return 'holiday';
    if (calendarDay.dateKey >= todayKey) return '';
    return 'absent';
  };

  const getDayClass = (calendarDay) => {
    const dayMark = getDayMark(calendarDay);
    const monthClass = calendarDay.isCurrentMonth ? '' : 'other-month';
    const todayClass = calendarDay.dateKey === todayKey ? 'today' : '';
    const checkInClass = userCheckInDateKeys.has(calendarDay.dateKey) ? 'has-checkin' : '';
    return `${monthClass} ${todayClass} ${dayMark || 'no-mark'} ${checkInClass}`.trim();
  };

  const getDayCheckIns = (calendarDay) => checkInRecordsByDate[calendarDay.dateKey] || [];
  const selectedDayCheckIns = selectedCalendarDay ? getDayCheckIns(selectedCalendarDay) : [];
  const selectedDayRequests = selectedCalendarDay
    ? requests.filter(
        (request) =>
          typeof request.type === 'string' &&
          request.type.toLowerCase().includes('leave') &&
          isRequestOnDay(request, selectedCalendarDay.dateKey)
      )
    : [];
  const selectedDayOutsideRequests = selectedCalendarDay
    ? requests.filter(
        (request) =>
          request.type === 'Work Outside' &&
          isRequestOnDay(request, selectedCalendarDay.dateKey)
      )
    : [];
  const LEAVE_TYPE_THAI_LABEL = {
    'Sick Leave': 'ลาป่วย',
    'Personal Leave': 'ลากิจ',
    'Annual Leave': 'ลาพักร้อน'
  };
  const getOutsideSubType = (request) => {
    if (request?.subType) return request.subType;
    const first = request?.detail?.split(' · ')[0]?.trim();
    return first || 'Work Outside';
  };
  const selectedDayTitle = selectedCalendarDay?.date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const goToPreviousMonth = () => {
    setCalendarDate(
      (currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCalendarDate(
      (currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

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
    setSelectedCalendarDay(null);
    setShowCheckInPopup(true);
  };

  const openBackdatedCheckIn = (day) => {
    const [year, month, dayOfMonth] = day.dateKey.split('-').map(Number);
    const targetDate = new Date(year, month - 1, dayOfMonth, 9, 0, 0);
    setBackdateTarget({ ...day, date: targetDate });
    setSelectedCheckInLocation('');
    setOffsiteAddress('');
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
        location
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
      {/* Header Card */}
      <div className="header-card">
        <div className="header-content">
          <div className="user-info">
            <div className="user-photo" aria-label={user.name}>
              {userInitials}
            </div>
            <div className="user-details">
              <h2>Welcome!</h2>
              <p className="user-name">{user.name}</p>
              <p className="user-type">{user.userTypeLabel}</p>
              <p className="user-date"><MdDateRange /> {userDate}</p>
            </div>
          </div>
          <button className="leave-quota-btn" onClick={() => setShowLeaveQuotaPopup(true)}>
            <span className="quota-icon"><MdPieChart /></span>
            <div className="quota-text">
              <small>Leave Quota</small>
            </div>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`tab ${activeTab === 'not-checked-in' ? 'active' : ''}`}
          onClick={() => setActiveTab('not-checked-in')}
        >
          Not yet check in
          {pendingItems.length > 0 && (
            <span className="badge">{pendingItems.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
          <span className="badge">1</span>
        </button>
      </div>

      {/* Calendar Section */}
      {activeTab === 'calendar' && (
        <div className="calendar-section">
          <div className="calendar-header">
            <button className="nav-arrow" onClick={goToPreviousMonth} aria-label="Previous month">
              <MdNavigateBefore />
            </button>
            <h3>{calendarTitle}</h3>
            <button className="nav-arrow" onClick={goToNextMonth} aria-label="Next month">
              <MdNavigateNext />
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            <div className="days">
              {calendarDays.map((calendarDay) => (
                <button
                  type="button"
                  key={calendarDay.dateKey}
                  className={`day ${getDayClass(calendarDay)}`}
                  onClick={() => setSelectedCalendarDay(calendarDay)}
                >
                  <span className="day-number">{calendarDay.dayNumber}</span>
                  <div className={`day-mark ${getDayMark(calendarDay)}`}></div>
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot holiday"></div>
              <span>Holiday</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot checkined"></div>
              <span>Check In</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot absent"></div>
              <span>Absent</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot request"></div>
              <span>Request</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'not-checked-in' && (
        <div className="not-checked-in-section">
          {pendingItems.length === 0 ? (
            <div className="not-checked-in-empty">ไม่มีวันที่ค้างดำเนินการ</div>
          ) : (
            <ul className="not-checked-in-list">
              {pendingItems.map((item) => (
                <li key={`${item.kind}-${item.dateKey}-${item.record?.id || ''}`}>
                  <button
                    type="button"
                    className={`not-checked-in-item not-checked-in-item--${item.kind}`}
                    onClick={() => {
                      if (item.kind === 'forgot-checkout') {
                        openManualCheckOut(item.record);
                      } else {
                        openBackdatedCheckIn(item);
                      }
                    }}
                  >
                    <span className="not-checked-in-dot" aria-hidden="true"></span>
                    <span className="not-checked-in-label">
                      {item.label}
                      {item.kind === 'forgot-checkout' && (
                        <span className="not-checked-in-sub"> · ลืม check out (check in {item.record.time})</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="tab-content">
          <p>Announcements content here</p>
        </div>
      )}

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

      {selectedCalendarDay && (
        <div
          className="calendar-day-overlay"
          onClick={() => {
            setSelectedCalendarDay(null);
            setSelectedDayTab('checkin');
          }}
        >
          <div className="calendar-day-popup" onClick={(event) => event.stopPropagation()}>
            <div className="calendar-day-header">
              <div>
                <h3>Day details</h3>
                <p>{selectedDayTitle}</p>
              </div>
              <button
                className="calendar-day-close"
                onClick={() => {
                  setSelectedCalendarDay(null);
                  setSelectedDayTab('checkin');
                }}
                aria-label="Close calendar day"
              >
                <MdClose />
              </button>
            </div>
            <div className="calendar-day-tabs" role="tablist">
              <button
                role="tab"
                type="button"
                className={`calendar-day-tab ${selectedDayTab === 'checkin' ? 'active' : ''}`}
                onClick={() => setSelectedDayTab('checkin')}
              >
                Check-in
                {selectedDayCheckIns.length > 0 && (
                  <span className="calendar-day-tab-count">{selectedDayCheckIns.length}</span>
                )}
              </button>
              <button
                role="tab"
                type="button"
                className={`calendar-day-tab ${selectedDayTab === 'leave' ? 'active' : ''}`}
                onClick={() => setSelectedDayTab('leave')}
              >
                Leave
                {selectedDayRequests.length > 0 && (
                  <span className="calendar-day-tab-count">{selectedDayRequests.length}</span>
                )}
              </button>
              <button
                role="tab"
                type="button"
                className={`calendar-day-tab ${selectedDayTab === 'in-advance' ? 'active' : ''}`}
                onClick={() => setSelectedDayTab('in-advance')}
              >
                In advance
                {selectedDayOutsideRequests.length > 0 && (
                  <span className="calendar-day-tab-count">{selectedDayOutsideRequests.length}</span>
                )}
              </button>
            </div>
            {selectedDayTab === 'checkin' ? (
              selectedDayCheckIns.length > 0 ? (
                <div className="calendar-day-list">
                  {selectedDayCheckIns.map((record) => (
                    <div className="calendar-day-record" key={record.id}>
                      <div>
                        <strong>{record.userName || 'User'}</strong>
                        <span>
                          {record.status || 'Checked in'}
                          {' · '}
                          {record.time}
                          {record.checkOutTime ? ` - ${record.checkOutTime}` : ''}
                        </span>
                      </div>
                      <output>{record.location || '-'}</output>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="calendar-day-empty">No check-in records</div>
              )
            ) : selectedDayTab === 'leave' ? (
              selectedDayRequests.length > 0 ? (
                <div className="calendar-day-list">
                  {selectedDayRequests.map((request) => (
                    <div className="calendar-day-record" key={request.id}>
                      <div>
                        <strong>{request.userName || 'User'}</strong>
                        <span>
                          {LEAVE_TYPE_THAI_LABEL[request.type] || 'N/A'}
                          {request.time ? ` · ${request.time}` : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="calendar-day-empty">No leave requests</div>
              )
            ) : selectedDayOutsideRequests.length > 0 ? (
              <div className="calendar-day-list">
                {selectedDayOutsideRequests.map((request) => {
                  const subType = getOutsideSubType(request);
                  const locationLabel =
                    subType === 'Offsite'
                      ? 'Offsite location'
                      : subType === 'Other'
                        ? 'Other details'
                        : '';
                  return (
                    <div className="calendar-day-record" key={request.id}>
                      <div>
                        <strong>{request.userName || 'User'}</strong>
                        {locationLabel ? (
                          <span>
                            {locationLabel}: {request.location || '-'}
                          </span>
                        ) : (
                          <span>{subType}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="calendar-day-empty">No in-advance requests</div>
            )}
          </div>
        </div>
      )}

      {showLeaveQuotaPopup && (
        <div className="leave-quota-overlay" onClick={() => setShowLeaveQuotaPopup(false)}>
          <div className="leave-quota-popup" onClick={(event) => event.stopPropagation()}>
            <div className="leave-quota-header">
              <div>
                <h3>Leave Quota</h3>
                <p>{user.name}</p>
              </div>
              <button className="leave-quota-close" onClick={() => setShowLeaveQuotaPopup(false)} aria-label="Close leave quota">
                <MdClose />
              </button>
            </div>
            <div className="leave-quota-items">
              {user.leaveQuotas.map((quota) => (
                <div className="leave-quota-item" key={quota.type}>
                  <div>
                    <strong>{quota.type}</strong>
                    <span>{quota.detail}</span>
                  </div>
                  <output>{quota.remaining}</output>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
