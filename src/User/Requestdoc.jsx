import { useMemo, useState } from 'react';
import {
  MdAccessTime,
  MdArrowBack,
  MdAssignment,
  MdDescription,
  MdHome,
  MdPerson,
  MdSchedule,
  MdSend,
  MdSupervisorAccount
} from 'react-icons/md';
import './Requestdoc.css';

const DOCUMENT_TYPES = [
  { id: 'employment-certificate', label: 'หนังสือรับรองการทำงาน' },
  { id: 'pay-slip', label: 'สลิปเงินเดือน' },
  { id: 'withholding-tax', label: 'ใบ 50 ทวิ' },
  { id: 'employment-contract', label: 'สัญญาจ้างงาน' },
  { id: 'position-adjustment', label: 'เอกสารปรับตำแหน่ง' }
];

const LANGUAGE_OPTIONS = [
  { id: 'thai', label: 'ภาษาไทย' },
  { id: 'english', label: 'ภาษาอังกฤษ' }
];

export default function Requestdoc({
  onSubmitRequest,
  currentUser,
  onGoBack,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn
}) {
  const isExemptFromCheckIn = currentUser?.profile?.job?.employeeLevel === 'Board Level' || currentUser?.profile?.job?.employeeLevel === 'Director Level';
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0].id);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].id);
  const [note, setNote] = useState('');

  const selectedDocument = useMemo(
    () => DOCUMENT_TYPES.find((document) => document.id === documentType) || DOCUMENT_TYPES[0],
    [documentType]
  );
  const selectedLanguage = LANGUAGE_OPTIONS.find((option) => option.id === language) || LANGUAGE_OPTIONS[0];
  const needsLanguage = documentType === 'employment-certificate';
  const canSubmit = documentType && (!needsLanguage || language);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmitRequest?.({
      type: 'Request Documents',
      detail: `${selectedDocument.label}${needsLanguage ? ` · ${selectedLanguage.label}` : ''}${note.trim() ? ` · ${note.trim()}` : ''}`,
      approver: 'Assigned by admin'
    });
    onGoRequest?.();
  };

  return (
    <div className="requestdoc-page">
      <header className="requestdoc-header">
        <button type="button" className="requestdoc-back" onClick={onGoBack} aria-label="Back to requests">
          <MdArrowBack />
        </button>
        <div>
          <p className="requestdoc-eyebrow">Create Request</p>
          <h1>Request Documents</h1>
          <p className="requestdoc-subtitle">ส่งคำขอเอกสาร เลือกประเภทเอกสาร และเพิ่มหมายเหตุประกอบได้</p>
        </div>
      </header>

      <form className="requestdoc-form" onSubmit={handleSubmit}>
        <section className="requestdoc-card">
          <div className="requestdoc-card-head">
            <h2>Document</h2>
            <span><MdDescription /> {selectedDocument.label}</span>
          </div>
          <div className="requestdoc-field-grid">
            <label className="requestdoc-field">
              <span>ประเภทเอกสาร</span>
              <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                {DOCUMENT_TYPES.map((document) => (
                  <option key={document.id} value={document.id}>{document.label}</option>
                ))}
              </select>
            </label>
            {needsLanguage && (
              <label className="requestdoc-field">
                <span>ภาษาเอกสาร</span>
                <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </section>

        <section className="requestdoc-card">
          <div className="requestdoc-card-head">
            <h2>Note</h2>
            <span>{note.trim().length}/200</span>
          </div>
          <label className="requestdoc-field">
            <span>หมายเหตุ / เหตุผลเพิ่มเติม</span>
            <textarea
              value={note}
              maxLength={200}
              rows={5}
              onChange={(event) => setNote(event.target.value)}
              placeholder="ระบุเหตุผลหรือรายละเอียดเพิ่มเติม เช่น ใช้ยื่นธนาคาร ยื่นวีซ่า หรือประกอบการสมัครงาน"
            />
          </label>
        </section>

        <aside className="requestdoc-summary">
          <div>
            <span>Document</span>
            <strong>{selectedDocument.label}</strong>
          </div>
          {needsLanguage && (
            <div>
              <span>Language</span>
              <strong>{selectedLanguage.label}</strong>
            </div>
          )}
          <div>
            <span>Send to</span>
            <strong><MdSupervisorAccount /> Assigned by admin</strong>
          </div>
          <div>
            <span>Note</span>
            <strong>{note.trim() || '-'}</strong>
          </div>
          <button type="submit" className="requestdoc-submit" disabled={!canSubmit}>
            <MdSend />
            Submit Request
          </button>
        </aside>
      </form>

      <div className="bottom-nav">
        <button className="nav-item" onClick={onGoHome}>
          <span className="nav-icon"><MdHome /></span>
          <span className="nav-label">Home</span>
        </button>
        {!isExemptFromCheckIn && (
          <button className="nav-item" onClick={onGoRecord}>
            <span className="nav-icon"><MdAccessTime /></span>
            <span className="nav-label">Record</span>
          </button>
        )}
        {!isExemptFromCheckIn && (
          <button className="nav-item center" onClick={onOpenCheckIn} aria-label="Open check in">
            <span className="nav-icon large"><MdSchedule /></span>
          </button>
        )}
        <button className="nav-item active" onClick={onGoRequest}>
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
