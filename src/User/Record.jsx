import {
  MdAccessTime,
  MdCalendarToday,
  MdLocationOn
} from 'react-icons/md';
import BottomNav from './Components/BottomNav';
import './Record.css';

export default function Record({
  records,
  currentUser,
  onDeleteRecord,
  onGoHome,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn,
  isCheckInDisabled = false
}) {
  const isExemptFromCheckIn = isCheckInDisabled || currentUser?.profile?.job?.employeeLevel === 'Board Level' || currentUser?.profile?.job?.employeeLevel === 'Director Level';
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
            </article>
          ))
        )}
      </div>

      <BottomNav
        activePage="record"
        isExemptFromCheckIn={isExemptFromCheckIn}
        onGoHome={onGoHome}
        onOpenCheckIn={onOpenCheckIn}
        onGoRequest={onGoRequest}
        onGoAccount={onGoAccount}
      />
    </div>
  );
}
