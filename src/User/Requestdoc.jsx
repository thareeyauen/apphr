import { useEffect, useMemo, useState } from 'react';
import {
  MdArrowBack,
  MdDescription,
  MdSend,
  MdSupervisorAccount
} from 'react-icons/md';
import BottomNav from './Components/BottomNav';
import { apiGetDocumentRequestTypes } from '../api';
import './Requestdoc.css';

const LANGUAGE_OPTIONS = [
  { id: 'thai', label: 'ภาษาไทย' },
  { id: 'english', label: 'ภาษาอังกฤษ' }
];

const NEEDS_LANGUAGE_CODES = new Set(['EMPLOYMENT_CERT', 'WORK_CERT']);

export default function Requestdoc({
  onSubmitRequest,
  currentUser,
  onGoBack,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onGoAccount,
  onOpenCheckIn,
  isCheckInDisabled = false
}) {
  const isExemptFromCheckIn = isCheckInDisabled || currentUser?.profile?.job?.employeeLevel === 'Board Level' || currentUser?.profile?.job?.employeeLevel === 'Director Level';
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentTypeCode, setDocumentTypeCode] = useState('');
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0].id);
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiGetDocumentRequestTypes()
      .then((types) => {
        if (cancelled) return;
        setDocumentTypes(types || []);
        if (types?.length && !documentTypeCode) setDocumentTypeCode(types[0].code);
      })
      .catch(() => { if (!cancelled) setDocumentTypes([]); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedDocument = useMemo(
    () => documentTypes.find((d) => d.code === documentTypeCode) || documentTypes[0] || null,
    [documentTypes, documentTypeCode]
  );
  const selectedLanguage = LANGUAGE_OPTIONS.find((option) => option.id === language) || LANGUAGE_OPTIONS[0];
  const needsLanguage = selectedDocument ? NEEDS_LANGUAGE_CODES.has(selectedDocument.code) : false;
  const canSubmit = Boolean(selectedDocument) && (!needsLanguage || language);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || !selectedDocument) return;
    const purposeParts = [];
    if (needsLanguage) purposeParts.push(selectedLanguage.label);
    if (note.trim()) purposeParts.push(note.trim());
    onSubmitRequest?.({
      type: 'Request Documents',
      detail: `${selectedDocument.name_th}${purposeParts.length ? ` · ${purposeParts.join(' · ')}` : ''}`,
      approver: 'Assigned by admin',
      documentTypeCode: selectedDocument.code,
      language: needsLanguage ? language : null,
      note: note.trim() || null,
      purpose: purposeParts.join(' · ') || null,
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
            <span><MdDescription /> {selectedDocument?.name_th || '-'}</span>
          </div>
          <div className="requestdoc-field-grid">
            <label className="requestdoc-field">
              <span>ประเภทเอกสาร</span>
              <select value={documentTypeCode} onChange={(event) => setDocumentTypeCode(event.target.value)}>
                {documentTypes.map((d) => (
                  <option key={d.code} value={d.code}>{d.name_th}</option>
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
            <strong>{selectedDocument?.name_th || '-'}</strong>
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

      <BottomNav
        activePage="request"
        isExemptFromCheckIn={isExemptFromCheckIn}
        onGoHome={onGoHome}
        onGoRecord={onGoRecord}
        onOpenCheckIn={onOpenCheckIn}
        onGoRequest={onGoRequest}
        onGoAccount={onGoAccount}
      />
    </div>
  );
}
