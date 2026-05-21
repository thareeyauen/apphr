import { useEffect, useState } from 'react';
import {
  MdHome,
  MdDateRange,
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
import BottomNav from './Components/BottomNav';
import { CHECK_IN_USER_TYPES } from './userTypes';
import { LEAVE_LABELS, LEAVE_TYPES, quotaForUser } from '../leaveTypes';

const CHECK_IN_RECORDS_KEY = 'apphr-checkin-records';
const CHECK_IN_RECORDS_SYNC_EVENT = 'apphr-checkin-records-sync';
const DEMO_SEED_KEY = 'apphr-demo-seeded';
const LEAVE_CHECKIN_WARNING_KEY = 'apphr-show-leave-checkin-warning';
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

const getRecordTimeValue = (record) => {
  const isoTime = Date.parse(record?.id);
  if (Number.isFinite(isoTime)) return isoTime;
  if (record?.dateKey && record?.time) {
    const normalizedTime = String(record.time).replace('.', ':');
    const parsed = Date.parse(`${record.dateKey}T${normalizedTime}`);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const readStoredCheckInRecords = () => {
  const savedRecords = localStorage.getItem(CHECK_IN_RECORDS_KEY);
  return savedRecords ? JSON.parse(savedRecords) : [];
};

const writeStoredCheckInRecords = (records) => {
  localStorage.setItem(CHECK_IN_RECORDS_KEY, JSON.stringify(records));
  window.dispatchEvent(
    new CustomEvent(CHECK_IN_RECORDS_SYNC_EVENT, { detail: records })
  );
};

const TEAM_MOCK_STATUS = {
  employee: {
    status: { label: 'พร้อมทำงาน', tone: 'ready' },
    checkInTime: '09:05',
    location: 'HQ · สาทร',
    statusMessage: '',
    accent: '#C4895A'
  },
  director: {
    status: null,
    checkInTime: '',
    location: '',
    statusMessage: ''
  },
  board: {
    status: null,
    checkInTime: '',
    location: '',
    statusMessage: ''
  }
};

const TEAM_ACCENTS = ['#C4895A', '#6F9DB5', '#6B8E5A', '#B685C7', '#8E7CC3', '#B57373'];

const CHECK_IN_EXEMPT_LEVELS = ['Board Level', 'Director Level'];

const isCheckInExemptAccount = (account) =>
  CHECK_IN_EXEMPT_LEVELS.includes(account?.profile?.job?.employeeLevel);

const isDirectorAccount = (account) =>
  account?.profile?.job?.employeeLevel === 'Director Level';

export default function Landing({
  user: currentUser,
  entitlements,
  requests = [],
  teamRequests = requests,
  checkInRecords: externalCheckInRecords,
  onCheckInRecordsChange,
  onGoRecord,
  onGoRequest,
  onGoAccount
}) {
  const [activePage, setActivePage] = useState('home');
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);
  const [selectedCheckInLocation, setSelectedCheckInLocation] = useState('');
  const [offsiteAddress, setOffsiteAddress] = useState('');
  const [popupMode, setPopupMode] = useState('checkin');
  const [checkInNote, setCheckInNote] = useState('');
  const [showLeaveCheckInWarning, setShowLeaveCheckInWarning] = useState(false);
  const [showAlreadyDonePopup, setShowAlreadyDonePopup] = useState(false);
  const [localCheckInRecords, setLocalCheckInRecords] = useState(readStoredCheckInRecords);
  const hasExternalCheckInRecords = Array.isArray(externalCheckInRecords);
  const checkInRecords = hasExternalCheckInRecords ? externalCheckInRecords : localCheckInRecords;
  const updateCheckInRecords = (updater) => {
    const update = typeof updater === 'function'
      ? updater
      : () => updater;
    if (onCheckInRecordsChange) {
      onCheckInRecordsChange(update);
    } else {
      setLocalCheckInRecords(update);
    }
  };

  useEffect(() => {
    if (!hasExternalCheckInRecords) {
      writeStoredCheckInRecords(checkInRecords);
    }
  }, [checkInRecords, hasExternalCheckInRecords]);

  useEffect(() => {
    if (hasExternalCheckInRecords) return undefined;
    const syncRecords = (records) => {
      setLocalCheckInRecords(Array.isArray(records) ? records : []);
    };
    const handleStorageChange = (event) => {
      if (event.key !== CHECK_IN_RECORDS_KEY) return;
      syncRecords(event.newValue ? JSON.parse(event.newValue) : []);
    };
    const handleLocalSync = (event) => syncRecords(event.detail);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CHECK_IN_RECORDS_SYNC_EVENT, handleLocalSync);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CHECK_IN_RECORDS_SYNC_EVENT, handleLocalSync);
    };
  }, [hasExternalCheckInRecords]);

  useEffect(() => {
    if (hasExternalCheckInRecords) return;
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
      buildRecord(buildPastWeekday(1, 9, 5), 'HAND SE Thonglor', undefined),
      buildRecord(buildPastWeekday(2, 9, 30), 'WFH', '17:30'),
      buildRecord(buildPastWeekday(4, 8, 50), 'KRAC Chulalongkorn University', undefined),
      buildRecord(buildPastWeekday(6, 9, 15), 'HAND SE Thonglor', '18:00')
    ];

    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateCheckInRecords((current) => {
      const existingKeys = new Set(current.map((r) => r.id));
      const merged = [...demoRecords.filter((r) => !existingKeys.has(r.id)), ...current];
      return merged;
    });
    localStorage.setItem(DEMO_SEED_KEY, '1');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock user data
  const user = {
    name: 'ธรีญา อึ้งตระกูล',
    position: 'Project coordinator',
    employeeId: 'H0029',
    company: 'บริษัท แฮนด์ วิสาหกิจเพื่อสังคม จำกัด',
    language: 'English',
    leaveQuota: `${quotaForUser('annual', currentUser, entitlements)} days`,
    leaveQuotas: LEAVE_TYPES.map((t) => ({
      type: t.label,
      detail: t.labelTh,
      remaining: `${quotaForUser(t.id, currentUser, entitlements)} days`,
    })),
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

  const todaysUserRecords = userCheckInRecords
    .filter((record) => record.dateKey === todayKey)
    .sort((a, b) => getRecordTimeValue(b) - getRecordTimeValue(a));
  const activeCheckIn = todaysUserRecords.find((record) => !record.checkOutTime);
  const todayCheckIn = activeCheckIn || todaysUserRecords[0];

  const getStatusInfo = (location) => {
    if (!location) return { label: 'เช็คอินแล้ว', tone: 'ready' };
    const lower = String(location).toLowerCase();
    if (lower === 'wfh' || lower.includes('บ้าน')) return { label: 'WFH', tone: 'wfh' };
    if (lower.includes('hand') || lower.includes('krac') || lower.includes('hq')) {
      return { label: 'พร้อมทำงาน', tone: 'ready' };
    }
    return { label: 'นอกสำนักงาน', tone: 'offsite' };
  };

  const getAccountRecords = (account) => {
    const accountOwnerKey = getUserRecordOwnerKey(account);
    return checkInRecords.filter((record) =>
      Boolean(accountOwnerKey) && getRecordOwnerKey(record) === accountOwnerKey
    );
  };

  const getTodayRecordForAccount = (account) => {
    const accountRecords = getAccountRecords(account)
      .filter((record) => record.dateKey === todayKey)
      .sort((a, b) => getRecordTimeValue(b) - getRecordTimeValue(a));
    const activeRecord = accountRecords.find((record) => !record.checkOutTime);
    return {
      activeRecord,
      todayRecord: activeRecord || accountRecords[0]
    };
  };

  const getAccountDisplay = (account) => {
    const nickname =
      account?.profile?.user?.nicknameTh ||
      account?.profile?.user?.nameTh ||
      account?.name ||
      account?.label ||
      'User';
    const role = account?.profile?.job?.roleTh || account?.position || account?.profile?.job?.employeeLevel || 'Employee';
    const initial =
      account?.profile?.user?.initial ||
      nickname
        .split(' ')
        .map((namePart) => namePart[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return { nickname, role, initial };
  };

  const isExemptFromCheckIn =
    isCheckInExemptAccount(user);

  const selfNickname = user?.profile?.user?.nicknameTh || user.nickname || 'เพ้นท์';
  const selfRole = user?.position || user?.profile?.job?.roleTh || 'Junior Analyst';
  const selfInitial = (selfNickname || user.name || '?').trim().charAt(0).toUpperCase();
  const LEAVE_LABEL = LEAVE_LABELS;
  const getTodayApprovedLeaveForAccount = (account) => {
    const accountOwnerKey = getUserRecordOwnerKey(account);
    return teamRequests.find((req) => {
      if (req.status !== 'approved') return false;
      if (!LEAVE_LABEL[req.type]) return false;
      if (accountOwnerKey && getRecordOwnerKey(req) !== accountOwnerKey) return false;
      const startKey = req.startDateKey || req.dateKey;
      const endKey = req.endDateKey || startKey;
      return startKey && todayKey >= startKey && todayKey <= endKey;
    });
  };
  const todayApprovedLeave = getTodayApprovedLeaveForAccount(user);
  const getLeaveStatusMessage = (leaveRequest) =>
    leaveRequest?.note || leaveRequest?.reason || '';
  const shouldSkipCheckInToday = isExemptFromCheckIn || Boolean(todayApprovedLeave);
  const shouldBlockCheckInForLeave = Boolean(todayApprovedLeave);
  const selfStatus = todayApprovedLeave
    ? { label: 'ลา', tone: 'leave' }
    : activeCheckIn
      ? getStatusInfo(activeCheckIn.location)
      : todayCheckIn?.checkOutTime
        ? { label: 'เช็คเอาท์แล้ว', tone: 'done' }
        : { label: 'ยังไม่เช็คอิน', tone: 'idle' };
  const selfCheckInTime = todayCheckIn?.time || (todayApprovedLeave ? 'วันนี้' : '');
  const selfLocation = todayApprovedLeave
    ? LEAVE_LABEL[todayApprovedLeave.type]
    : todayCheckIn?.location || '';
  const selfStatusMessage = todayApprovedLeave
    ? getLeaveStatusMessage(todayApprovedLeave)
    : activeCheckIn?.note || todayCheckIn?.note || '';

  const currentOwnerKey = getUserRecordOwnerKey(user);
  const currentUserDepartment = user?.profile?.job?.department || '';
  const isBoardViewer = currentUserDepartment === 'Board of Directors';
  const isSelfDirector = isDirectorAccount(user);
  const selfTeamMember = isExemptFromCheckIn && !(isSelfDirector && todayApprovedLeave)
    ? []
    : [{
        id: user?.id || user?.userType || 'self',
        nickname: selfNickname,
        role: selfRole,
        initial: selfInitial,
        accent: TEAM_MOCK_STATUS[user?.userType]?.accent || '#C4895A',
        status: selfStatus,
        checkInTime: selfCheckInTime,
        location: selfLocation,
        statusMessage: selfStatusMessage,
        hideCheckIn: shouldSkipCheckInToday,
        isSelf: true
      }];
  const teamMembers = [
    ...selfTeamMember,
    ...CHECK_IN_USER_TYPES
      .filter((account) => {
        const accountApprovedLeave = getTodayApprovedLeaveForAccount(account);
        if (getUserRecordOwnerKey(account) === currentOwnerKey) return false;
        if (!isBoardViewer && account?.profile?.job?.department !== currentUserDepartment) return false;
        if (!isCheckInExemptAccount(account)) return true;
        return isDirectorAccount(account) && Boolean(accountApprovedLeave);
      })
      .map((account, index) => {
        const display = getAccountDisplay(account);
        const fallback = TEAM_MOCK_STATUS[account.id] || TEAM_MOCK_STATUS.employee;
        const isExemptAccount = isCheckInExemptAccount(account);
        const accountApprovedLeave = getTodayApprovedLeaveForAccount(account);
        const { activeRecord, todayRecord } = isExemptAccount
          ? { activeRecord: null, todayRecord: null }
          : getTodayRecordForAccount(account);
        const recordStatus = accountApprovedLeave
          ? { label: 'ลา', tone: 'leave' }
          : isExemptAccount
          ? null
          : activeRecord
            ? getStatusInfo(activeRecord.location)
            : todayRecord?.checkOutTime
              ? { label: 'เช็คเอาท์แล้ว', tone: 'done' }
              : null;
        const hasTodayRecord = Boolean(todayRecord);

        return {
          id: account.id,
          ...display,
          accent: fallback.accent || TEAM_ACCENTS[index % TEAM_ACCENTS.length],
          status: recordStatus || { label: 'ยังไม่เช็คอิน', tone: 'idle' },
          checkInTime: accountApprovedLeave ? 'วันนี้' : (hasTodayRecord ? (todayRecord?.time || '') : ''),
          location: accountApprovedLeave ? LEAVE_LABEL[accountApprovedLeave.type] : (hasTodayRecord ? (todayRecord?.location || '') : ''),
          statusMessage: accountApprovedLeave ? getLeaveStatusMessage(accountApprovedLeave) : activeRecord?.note || todayRecord?.note || '',
          hideCheckIn: isExemptAccount || Boolean(accountApprovedLeave)
        };
      })
      .filter((member) => member.status)
  ];
  const closeCheckInPopup = () => {
    setShowCheckInPopup(false);
    setSelectedCheckInLocation('');
    setOffsiteAddress('');
    setCheckInNote('');
    setPopupMode('checkin');
  };

  useEffect(() => {
    if (!todayApprovedLeave) return;
    if (localStorage.getItem(LEAVE_CHECKIN_WARNING_KEY) !== '1') return;
    localStorage.removeItem(LEAVE_CHECKIN_WARNING_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowLeaveCheckInWarning(true);
  }, [todayApprovedLeave]);

  const openCheckInPopup = () => {
    if (shouldBlockCheckInForLeave) {
      setShowLeaveCheckInWarning(true);
      return;
    }
    if (isExemptFromCheckIn) return;
    if (!activeCheckIn && todayCheckIn?.checkOutTime) {
      setShowAlreadyDonePopup(true);
      return;
    }
    if (activeCheckIn) {
      setPopupMode('checkout');
    } else {
      setPopupMode('checkin');
    }
    setShowCheckInPopup(true);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  const handleSubmitCheckIn = () => {
    if (shouldBlockCheckInForLeave) {
      setShowLeaveCheckInWarning(true);
      return;
    }
    if (isExemptFromCheckIn) return;
    const checkedInAt = new Date();
    const location =
      selectedCheckInLocation === 'Offsite'
        ? offsiteAddress.trim()
        : selectedCheckInLocation;

    updateCheckInRecords((currentRecords) => [
      {
        id: checkedInAt.toISOString(),
        dateKey: getDateKey(checkedInAt),
        date: checkedInAt.toLocaleDateString('th-TH', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        time: formatTime(checkedInAt),
        status: 'Checked in',
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
    if (shouldBlockCheckInForLeave) {
      setShowLeaveCheckInWarning(true);
      return;
    }
    if (isExemptFromCheckIn || !activeCheckIn) return;
    const checkedOutAt = new Date();
    updateCheckInRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === activeCheckIn.id
          ? { ...record, checkOutTime: formatTime(checkedOutAt), status: 'Checked out' }
          : record
      )
    );
    closeCheckInPopup();
  };

  const handleDeleteCheckInRecord = (recordId) => {
    updateCheckInRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId)
    );
  };

  if (activePage === 'record') {
    return (
      <Record
        records={userCheckInRecords}
        currentUser={user}
        onDeleteRecord={handleDeleteCheckInRecord}
        onGoHome={() => setActivePage('home')}
        onGoAccount={onGoAccount || (() => setActivePage('account'))}
        onOpenCheckIn={() => {
          setActivePage('home');
          openCheckInPopup();
        }}
        isCheckInDisabled={isExemptFromCheckIn}
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
          openCheckInPopup();
        }}
        isCheckInDisabled={isExemptFromCheckIn}
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
          openCheckInPopup();
        }}
        isCheckInDisabled={isExemptFromCheckIn}
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
                <h2 className="welcome-card__name">{user?.profile?.user?.nameTh || user.name}</h2>
                <p className="welcome-card__type">{user.userTypeLabel}</p>
              </div>
            </div>
            <div className="welcome-card__date">
              <MdDateRange />
              <span>{userDate}</span>
            </div>
          </div>

          <div className="welcome-card__divider" />

          {todayApprovedLeave ? (
            <div className="dashboard-today dashboard-today--leave">
              <div className="dashboard-today-status">
                <MdCheckCircle />
                <strong>คำลาได้รับการอนุมัติแล้ว</strong>
              </div>
              <dl className="dashboard-today-meta">
                <div>
                  <dt>Leave</dt>
                  <dd>{LEAVE_LABEL[todayApprovedLeave.type] || todayApprovedLeave.type}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>ไม่ต้อง Check in วันนี้</dd>
                </div>
              </dl>
            </div>
          ) : todayCheckIn ? (
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
            !shouldSkipCheckInToday && (
              <div className="dashboard-today dashboard-today--out">
                <div className="dashboard-today-status">
                  <MdWarningAmber />
                  <strong>ยังไม่ได้เช็คอินวันนี้</strong>
                </div>
              </div>
            )
          )}
          {!shouldSkipCheckInToday && !todayCheckIn?.checkOutTime && (
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
                    <div className="team-card__avatar" style={{ '--team-accent': member.accent }}>
                      {member.initial}
                    </div>
                    <div className="team-card__id">
                      <strong>
                        {member.nickname}
                        {member.isSelf && <small>คุณ</small>}
                      </strong>
                      <span>{member.role}</span>
                    </div>
                  </div>
                  <div className={`team-card__status team-card__status--${member.status.tone}`}>
                    <span className="team-card__dot" />
                    {member.status.label}
                  </div>
                </header>
                {!member.hideCheckIn && (
                  <div className="team-card__workline">
                    <span>{member.checkInTime || 'วันนี้'}</span>
                    <span>{member.location || 'ไม่อยู่ในระบบ check-in'}</span>
                  </div>
                )}
                {member.statusMessage && (
                  <p className="team-card__note">{member.statusMessage}</p>
                )}
              </article>
            ))}
          </div>
        </section>

      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activePage="home"
        isExemptFromCheckIn={isExemptFromCheckIn}
        onGoHome={undefined}
        onGoRecord={onGoRecord || (() => setActivePage('record'))}
        onOpenCheckIn={openCheckInPopup}
        onGoRequest={onGoRequest || (() => setActivePage('request'))}
        onGoAccount={onGoAccount || (() => setActivePage('account'))}
        checkInAriaLabel={activeCheckIn ? 'Open check out' : 'Open check in'}
      />

      {showLeaveCheckInWarning && (
        <div className="checkin-overlay" onClick={() => setShowLeaveCheckInWarning(false)}>
          <div className="checkin-popup checkin-popup--notice" onClick={(event) => event.stopPropagation()}>
            <div className="checkin-header">
              <div>
                <h3>ไม่ต้อง Check in วันนี้</h3>
              </div>
              <button className="checkin-close" onClick={() => setShowLeaveCheckInWarning(false)} aria-label="Close">
                <MdClose />
              </button>
            </div>
            <div className="checkin-notice">
              <MdCheckCircle />
              <strong>คำลาได้รับการอนุมัติแล้ว</strong>
              <p>
                วันนี้เป็นวันลา {LEAVE_LABEL[todayApprovedLeave?.type] || todayApprovedLeave?.type || ''}
                จึงไม่ต้อง Check in
              </p>
            </div>
            <button className="checkin-submit" onClick={() => setShowLeaveCheckInWarning(false)}>
              รับทราบ
            </button>
          </div>
        </div>
      )}

      {showAlreadyDonePopup && (
        <div className="checkin-overlay" onClick={() => setShowAlreadyDonePopup(false)}>
          <div className="checkin-popup checkin-popup--notice" onClick={(event) => event.stopPropagation()}>
            <div className="checkin-header">
              <div>
                <h3>เช็คอิน/เช็คเอาท์แล้ววันนี้</h3>
              </div>
              <button className="checkin-close" onClick={() => setShowAlreadyDonePopup(false)} aria-label="Close">
                <MdClose />
              </button>
            </div>
            <div className="checkin-notice">
              <MdCheckCircle />
              <strong>คุณได้เช็คอินและเช็คเอาท์ของวันนี้เรียบร้อยแล้ว</strong>
              <p>
                ไม่สามารถกดเช็คอินหรือเช็คเอาท์ซ้ำในวันเดียวกันได้
                {todayCheckIn?.time && todayCheckIn?.checkOutTime && (
                  <> · เช็คอิน {todayCheckIn.time} · เช็คเอาท์ {todayCheckIn.checkOutTime}</>
                )}
              </p>
            </div>
            <button className="checkin-submit" onClick={() => setShowAlreadyDonePopup(false)}>
              รับทราบ
            </button>
          </div>
        </div>
      )}

      {showCheckInPopup && (
        <div className="checkin-overlay" onClick={closeCheckInPopup}>
          <div className="checkin-popup" onClick={(event) => event.stopPropagation()}>
            <div className="checkin-header">
              <div>
                <h3>
                  {popupMode === 'checkout' ? 'CHECK OUT?' : 'WHERE ARE YOU WORKING?'}
                </h3>
              </div>
              <button className="checkin-close" onClick={closeCheckInPopup} aria-label="Close">
                <MdClose />
              </button>
            </div>
            {popupMode === 'checkout' ? (
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
