import React, { useState } from 'react';
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

export default function Landing() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);
  const [selectedCheckInLocation, setSelectedCheckInLocation] = useState('');
  const [offsiteAddress, setOffsiteAddress] = useState('');

  // Mock user data
  const user = {
    name: 'Thareeya Uentrakul',
    date: 'Mon 27 Apr 2026',
    leaveQuota: '5 days'
  };

  const userInitials = user.name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('');
  const hasCheckedIn = false;

  const stats = [
    { icon: <MdAccessTime />, label: 'Not yet check in', value: '0 Days', color: 'orange' },
    { icon: <MdEventBusy />, label: 'Absent', value: '0 day', color: 'red' },
    { icon: <MdLocalHospital />, label: 'Sick Leave', value: '0 day', color: 'blue' }
  ];

  const checkInLocations = [
    { icon: <MdBusiness />, name: 'HAND SE Thonglor', detail: 'Office' },
    { icon: <MdBusiness />, name: 'KRAC CU', detail: 'Office' },
    { icon: <MdHome />, name: 'WFH', detail: 'Work from home' },
    { icon: <MdWorkOutline />, name: 'Offsite', detail: 'Set address' }
  ];

  // Calendar data for April 2026
  const calendarDays = [
    29, 30, 31, 1, 2, 3, 4,
    5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18,
    19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 1, 2,
    3, 4, 5, 6, 7, 8, 9
  ];

  // Mark specific days with colors (mock data)
  const dayMarks = {
    1: 'ontime', 2: 'ontime', 3: 'ontime',
    5: 'holiday', 6: 'holiday', 7: 'ontime', 8: 'ontime', 9: 'ontime', 10: 'absent', 11: 'holiday',
    12: 'holiday', 13: 'holiday', 14: 'holiday', 15: 'holiday', 16: 'absent', 17: 'absent',
    19: 'holiday', 20: 'ontime', 21: 'ontime', 22: 'ontime', 23: 'ontime', 24: 'absent',
    27: 'today'
  };

  const getDayClass = (day) => {
    if (day < 5 || day > 26) return 'other-month';
    return dayMarks[day] || 'no-mark';
  };

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
              <h2>Good Morning!</h2>
              <p className="user-name">{user.name}</p>
              <p className="user-date"><MdDateRange /> {user.date}</p>
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
            <button className="nav-arrow"><MdNavigateBefore /></button>
            <h3>April 2026</h3>
            <button className="nav-arrow"><MdNavigateNext /></button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            <div className="days">
              {calendarDays.map((day, index) => (
                <div key={index} className={`day ${getDayClass(day)}`}>
                  <span className="day-number">{day}</span>
                  <div className={`day-mark ${dayMarks[day] || ''}`}></div>
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
              <div className="legend-dot shift"></div>
              <span>Shift</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot ontime"></div>
              <span>Ontime</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot absent"></div>
              <span>Absent</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot late"></div>
              <span>Check in</span>
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
        <button className="nav-item">
          <span className="nav-icon"><MdAccessTime /></span>
          <span className="nav-label">Time Record</span>
        </button>
        <button className="nav-item center" onClick={() => setShowCheckInPopup(true)} aria-label="Open check in">
          <span className="nav-icon large"><MdSchedule /></span>
        </button>
        <button className="nav-item">
          <span className="nav-icon"><MdAssignment /></span>
          <span className="nav-label">Requests</span>
        </button>
        <button className="nav-item">
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
              onClick={() => setShowCheckInPopup(false)}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
