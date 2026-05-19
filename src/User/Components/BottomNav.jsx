import {
  MdAccessTime,
  MdAssignment,
  MdHome,
  MdPerson,
  MdSchedule
} from 'react-icons/md';

export default function BottomNav({
  activePage,
  isExemptFromCheckIn = false,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn,
  checkInAriaLabel = 'Open check in'
}) {
  return (
    <div className="bottom-nav">
      <button
        className={'nav-item' + (activePage === 'home' ? ' active' : '')}
        onClick={onGoHome}
      >
        <span className="nav-icon"><MdHome /></span>
        <span className="nav-label">Home</span>
      </button>
      {!isExemptFromCheckIn && (
        <button
          className={'nav-item' + (activePage === 'record' ? ' active' : '')}
          onClick={onGoRecord}
        >
          <span className="nav-icon"><MdAccessTime /></span>
          <span className="nav-label">Record</span>
        </button>
      )}
      {!isExemptFromCheckIn && (
        <button className="nav-item center" onClick={onOpenCheckIn} aria-label={checkInAriaLabel}>
          <span className="nav-icon large"><MdSchedule /></span>
        </button>
      )}
      <button
        className={'nav-item' + (activePage === 'request' ? ' active' : '')}
        onClick={onGoRequest}
      >
        <span className="nav-icon"><MdAssignment /></span>
        <span className="nav-label">Requests</span>
      </button>
      <button
        className={'nav-item' + (activePage === 'account' ? ' active' : '')}
        onClick={onGoAccount}
      >
        <span className="nav-icon"><MdPerson /></span>
        <span className="nav-label">My Account</span>
      </button>
    </div>
  );
}
