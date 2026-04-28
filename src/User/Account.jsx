import {
  MdAccessTime,
  MdAssignment,
  MdChevronRight,
  MdHome,
  MdPerson,
  MdSchedule
} from 'react-icons/md';
import './Account.css';

const accountMenuGroups = [
  [
    { label: 'Pay Slip' },
    { label: '50 Tavi' }
  ],
  [
    { label: 'Change Password' }
  ],
  [
    { label: 'Sign out', danger: true }
  ]
];

export default function Account({ user, onGoHome, onGoRecord, onOpenCheckIn }) {
  return (
    <div className="account-container">
      <div className="account-hero">
        <section className="account-profile">
          <div className="account-avatar" aria-label={`${user.name} avatar`}></div>

          <div className="account-profile-text">
            <h2>{user.name}</h2>
            <p>{user.position}</p>
            <p>Employee ID : {user.employeeId}</p>
            <p>{user.company}</p>
          </div>
        </section>
      </div>

      <section className="account-panel">
        <div className="account-menu">
          {accountMenuGroups.map((group, groupIndex) => (
            <div className="account-menu-group" key={groupIndex}>
              {group.map((item) => (
                <button className="account-menu-item" key={item.label}>
                  <span className={item.danger ? 'account-danger' : undefined}>{item.label}</span>
                  <span className="account-menu-right">
                    {item.value && <span className="account-menu-value">{item.value}</span>}
                    {!item.danger && <MdChevronRight />}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="bottom-nav">
        <button className="nav-item" onClick={onGoHome}>
          <span className="nav-icon"><MdHome /></span>
          <span className="nav-label">Home</span>
          <span className="nav-badge">9</span>
        </button>
        <button className="nav-item" onClick={onGoRecord}>
          <span className="nav-icon"><MdAccessTime /></span>
          <span className="nav-label">Record</span>
        </button>
        <button className="nav-item center" onClick={onOpenCheckIn} aria-label="Open check in">
          <span className="nav-icon large"><MdSchedule /></span>
        </button>
        <button className="nav-item">
          <span className="nav-icon"><MdAssignment /></span>
          <span className="nav-label">Requests</span>
        </button>
        <button className="nav-item active">
          <span className="nav-icon"><MdPerson /></span>
          <span className="nav-label">My Account</span>
        </button>
      </div>
    </div>
  );
}
