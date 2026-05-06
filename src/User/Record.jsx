import {
  MdAccessTime,
  MdAssignment,
  MdCalendarToday,
  MdDelete,
  MdHome,
  MdLocationOn,
  MdPerson,
  MdSchedule
} from 'react-icons/md';
import './Record.css';

export default function Record({
  records,
  onDeleteRecord,
  onGoHome,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn
}) {
  return (
    <div className="record-container">
      <div className="record-header">
        <div>
          <p className="record-eyebrow">Attendance</p>
          <h2>Check in record</h2>
        </div>
        <div className="record-count">
          <strong>{records.length}</strong>
          <span>รายการ</span>
        </div>
      </div>

      <div className="record-list">
        {records.length === 0 ? (
          <div className="record-empty">
            <span className="record-empty-icon"><MdAccessTime /></span>
            <h3>ยังไม่มีรายการ check in</h3>
            <p>เมื่อกด check in แล้ว รายการวันที่และสถานที่จะมาแสดงที่หน้านี้</p>
          </div>
        ) : (
          records.map((record) => (
            <article className="record-item" key={record.id}>
              <div className="record-item-icon">
                <MdLocationOn />
              </div>
              <div className="record-item-content">
                <h3>{record.location}</h3>
                <div className="record-meta">
                  <span className="record-status">{record.status || 'Checked in'}</span>
                  <span><MdCalendarToday /> {record.date}</span>
                  <span>
                    <MdAccessTime /> {record.time}
                    {record.checkOutTime ? ` - ${record.checkOutTime}` : ''}
                  </span>
                </div>
              </div>
              <button
                className="record-delete"
                onClick={() => onDeleteRecord(record.id)}
                aria-label={`Delete check in record at ${record.location}`}
                title="Delete"
              >
                <MdDelete />
              </button>
            </article>
          ))
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-item" onClick={onGoHome}>
          <span className="nav-icon"><MdHome /></span>
          <span className="nav-label">Home</span>
        </button>
        <button className="nav-item active">
          <span className="nav-icon"><MdAccessTime /></span>
          <span className="nav-label">Record</span>
        </button>
        <button className="nav-item center" onClick={onOpenCheckIn} aria-label="Open check in">
          <span className="nav-icon large"><MdSchedule /></span>
        </button>
        <button className="nav-item" onClick={onGoRequest}>
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
