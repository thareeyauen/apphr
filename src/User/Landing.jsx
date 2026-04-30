import { useEffect, useState } from 'react';
import {
  MdAccessTime,
  MdEventBusy,
  MdLocalHospital,
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

export default function Landing({ onGoRecord, onGoRequest, onGoAccount }) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [activePage, setActivePage] = useState('home');
  const [calendarDate, setCalendarDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);
  const [selectedCheckInLocation, setSelectedCheckInLocation] = useState('');
  const [offsiteAddress, setOffsiteAddress] = useState('');
  const [checkInRecords, setCheckInRecords] = useState(() => {
    const savedRecords = localStorage.getItem(CHECK_IN_RECORDS_KEY);
    return savedRecords ? JSON.parse(savedRecords) : [];
  });

  useEffect(() => {
    localStorage.setItem(CHECK_IN_RECORDS_KEY, JSON.stringify(checkInRecords));
  }, [checkInRecords]);

  // Mock user data
  const user = {
    name: 'Thareeya Uentrakul',
    position: 'Project Coordinator',
    employeeId: 'HAND23',
    company: 'บริษัท แฮนด์ วิสาหกิจเพื่อสังคม จำกัด',
    language: 'English',
    leaveQuota: '5 days'
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
  const stats = [
    { icon: <MdAccessTime />, label: 'Not yet check in', value: '0 Days', color: 'orange' },
    { icon: <MdEventBusy />, label: 'Absent', value: '0 day', color: 'red' },
    { icon: <MdLocalHospital />, label: 'Sick Leave', value: '0 day', color: 'blue' }
  ];

  const checkInLocations = [
    { icon: <MdBusiness />, name: 'HAND SE Thonglor', detail: 'Office' },
    { icon: <MdBusiness />, name: 'KRAC Chulalongkorn University', detail: 'Office' },
    { icon: <MdHome />, name: 'WFH', detail: 'Work from home' },
    { icon: <MdWorkOutline />, name: 'Offsite', detail: 'Set address' }
  ];

  const calendarDays = getCalendarDays(calendarDate);
  const todayKey = getDateKey(today);
  const checkInDateKeys = new Set(
    checkInRecords.map((record) => record.dateKey).filter(Boolean)
  );
  const calendarTitle = calendarDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const getDayMark = (calendarDay) => {
    if (!calendarDay.isCurrentMonth) return '';
    if (calendarDay.dateKey === todayKey) return 'today';
    if (checkInDateKeys.has(calendarDay.dateKey)) return 'late';
    if (calendarDay.date.getDay() === 0 || calendarDay.date.getDay() === 6) return 'holiday';
    return '';
  };

  const getDayClass = (calendarDay) => {
    const dayMark = getDayMark(calendarDay);
    const monthClass = calendarDay.isCurrentMonth ? '' : 'other-month';
    return `${monthClass} ${dayMark || 'no-mark'}`.trim();
  };

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

  const handleSubmitCheckIn = () => {
    const checkedInAt = new Date();
    const location =
      selectedCheckInLocation === 'Offsite'
        ? offsiteAddress.trim()
        : selectedCheckInLocation;

    setCheckInRecords((currentRecords) => [
      {
        id: checkedInAt.toISOString(),
        dateKey: getDateKey(checkedInAt),
        date: checkedInAt.toLocaleDateString('th-TH', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        time: checkedInAt.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        location
      },
      ...currentRecords
    ]);
    setSelectedCheckInLocation('');
    setOffsiteAddress('');
    setShowCheckInPopup(false);
  };

  const handleDeleteCheckInRecord = (recordId) => {
    setCheckInRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId)
    );
  };

  if (activePage === 'record') {
    return (
      <Record
        records={checkInRecords}
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
              <p className="user-date"><MdDateRange /> {userDate}</p>
            </div>
          </div>
          <button className="leave-quota-btn">
            <span className="quota-icon"><MdPieChart /></span>
            <div className="quota-text">
              <small>Leave Quota</small>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
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
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
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
                <div key={calendarDay.dateKey} className={`day ${getDayClass(calendarDay)}`}>
                  <span className="day-number">{calendarDay.dayNumber}</span>
                  <div className={`day-mark ${getDayMark(calendarDay)}`}></div>
                </div>
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

      {activeTab === 'requests' && (
        <div className="tab-content">
          <p>Requests content here</p>
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
        <button className="nav-item center" onClick={() => setShowCheckInPopup(true)} aria-label="Open check in">
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
        <div className="checkin-overlay" onClick={() => setShowCheckInPopup(false)}>
          <div className="checkin-popup" onClick={(event) => event.stopPropagation()}>
            <div className="checkin-header">
              <h3>WHERE ARE YOU WORKING?</h3>
              <button className="checkin-close" onClick={() => setShowCheckInPopup(false)} aria-label="Close check in">
                <MdClose />
              </button>
            </div>
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
          </div>
        </div>
      )}
    </div>
  );
}
