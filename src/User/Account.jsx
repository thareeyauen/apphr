import { useState, useRef, useLayoutEffect } from 'react';
import {
  MdBusiness,
  MdPerson,
  MdWorkOutline,
  MdCardGiftcard,
  MdDescription,
  MdLocalHospital,
  MdHealthAndSafety,
  MdCheckroom,
  MdEngineering,
  MdLaptop
} from 'react-icons/md';
import {
  AccountContent,
  AccountHeader,
  AccountTabs,
  PasswordResetModal
} from './Components/AccountPageComponents';
import BottomNav from './Components/BottomNav';
import { apiChangePassword } from '../api';
import './Account.css';

const TAB_IDS = [
  { id: 'company',  th: 'บริษัท',         icon: <MdBusiness /> },
  { id: 'general',  th: 'ข้อมูลทั่วไป',    icon: <MdPerson /> },
  { id: 'job',      th: 'งาน',            icon: <MdWorkOutline /> },
  { id: 'benefits', th: 'สวัสดิการ',       icon: <MdCardGiftcard /> },
  { id: 'docs',     th: 'เอกสาร',          icon: <MdDescription /> }
];

const BENEFIT_ICONS = {
  socialSecurity: <MdHealthAndSafety />,
  groupInsurance: <MdLocalHospital />,
  suit: <MdCheckroom />,
  workWear: <MdEngineering />,
  equipment: <MdLaptop />
};


function useNarrow(ref, threshold = 760) {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setNarrow(e.contentRect.width < threshold);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref, threshold]);
  return narrow;
}

function KV({ k, v, mono, multiline }) {
  return (
    <div className="up-kv">
      <div className="up-kv-key">{k}</div>
      <div
        className={
          'up-kv-val' +
          (mono ? ' up-kv-val--mono' : '') +
          (multiline ? ' up-kv-val--multiline' : '')
        }
      >
        {v || '—'}
      </div>
    </div>
  );
}

function EditableKV({ k, value, onChange, type = 'text', multiline = false, options }) {
  return (
    <label className="up-kv up-kv--edit">
      <span className="up-kv-key">{k}</span>
      {options ? (
        <select
          className="up-edit-field"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : multiline ? (
        <textarea
          className="up-edit-field up-edit-field--textarea"
          value={value || ''}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="up-edit-field"
          type={type}
          value={value ?? ''}
          onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
        />
      )}
    </label>
  );
}

function Group({ title, columns = 3, children }) {
  return (
    <div className="up-group">
      {title && <div className="up-group-title">{title}</div>}
      <div className="up-grid" style={{ '--up-cols': columns }}>
        {children}
      </div>
    </div>
  );
}

function CompanyTab({ c }) {
  return (
    <>
      <Group columns={2}>
        <KV k="ชื่อ (ไทย)"    v={c.nameTh} multiline />
        <KV k="ชื่อ (อังกฤษ)" v={c.nameEn} multiline />
        <KV k="เลขเสียภาษี"   v={c.taxId}  mono />
        <KV k="โทรศัพท์"      v={c.phone}  mono />
        <KV k="จำนวนพนักงาน" v={c.employeeCount} />
      </Group>
      <Group columns={1}>
        <KV k="ที่อยู่จดทะเบียน" v={c.address} multiline />
      </Group>
    </>
  );
}

function GeneralTab({ u, editing = false, draft = u, onDraftChange }) {
  const setField = (field, value) => {
    onDraftChange?.({
      ...draft,
      [field]: value
    });
  };
  const setEmergencyField = (field, value) => {
    onDraftChange?.({
      ...draft,
      emergency: {
        ...draft.emergency,
        [field]: value
      }
    });
  };
  const setEducationField = (index, field, value) => {
    const education = [...(draft.education || [])];
    education[index] = {
      ...education[index],
      [field]: value
    };
    onDraftChange?.({
      ...draft,
      education
    });
  };
  const addEducation = () => {
    onDraftChange?.({
      ...draft,
      education: [
        ...(draft.education || []),
        { degreeLevel: '', faculty: '', major: '', institute: '', studyYears: '' }
      ]
    });
  };
  const removeEducation = (index) => {
    onDraftChange?.({
      ...draft,
      education: (draft.education || []).filter((_, i) => i !== index)
    });
  };

  return (
    <>
      <Group title="ข้อมูลส่วนตัว" columns={3}>
        {editing ? (
          <>
            <EditableKV k="คำนำหน้า" value={draft.prefix} onChange={(value) => setField('prefix', value)} />
            <EditableKV k="ชื่อ-นามสกุล (TH)" value={draft.nameTh} onChange={(value) => setField('nameTh', value)} />
            <EditableKV k="ชื่อ-นามสกุล (ENG)" value={draft.nameEn} onChange={(value) => setField('nameEn', value)} />
            <EditableKV k="ชื่อเล่น (TH)" value={draft.nicknameTh} onChange={(value) => setField('nicknameTh', value)} />
            <EditableKV k="เพศ" value={draft.gender} onChange={(value) => setField('gender', value)} options={['', 'Male', 'Female']} />
            <EditableKV k="วัน/เดือน/ปีเกิด" value={draft.dob} onChange={(value) => setField('dob', value)} type="date" />
            <EditableKV k="อายุ" type="number" value={draft.age} onChange={(value) => setField('age', value)} />
            <EditableKV k="เลขบัตรประชาชน (ไม่มีขีด)" value={draft.citizenId} onChange={(value) => setField('citizenId', value)} />
          </>
        ) : (
          <>
            <KV k="คำนำหน้า" v={u.prefix} />
            <KV k="ชื่อ-นามสกุล (TH)" v={u.nameTh} />
            <KV k="ชื่อ-นามสกุล (ENG)" v={u.nameEn} />
            <KV k="ชื่อเล่น (TH)" v={u.nicknameTh} />
            <KV k="เพศ" v={u.gender} />
            <KV k="วัน/เดือน/ปีเกิด" v={u.dob} />
            <KV k="อายุ" v={`${u.age} ปี`} />
            <KV k="เลขบัตรประชาชน (ไม่มีขีด)" v={u.citizenId} mono />
          </>
        )}
      </Group>
      <Group title="ช่องทางติดต่อ" columns={3}>
        {editing ? (
          <>
            <EditableKV k="Email (mail บริษัท)" type="email" value={draft.email} onChange={(value) => setField('email', value)} />
            <EditableKV k="เบอร์โทรติดต่อ (ไม่มีขีด)" value={draft.phone} onChange={(value) => setField('phone', value)} />
            <EditableKV k="ช่องทางการติดต่อผ่าน line ID" value={draft.line} onChange={(value) => setField('line', value)} />
          </>
        ) : (
          <>
            <KV k="Email (mail บริษัท)" v={u.email} mono />
            <KV k="เบอร์โทรติดต่อ (ไม่มีขีด)" v={u.phone} mono />
            <KV k="ช่องทางการติดต่อผ่าน line ID" v={u.line} mono />
          </>
        )}
      </Group>
      <Group title="ที่อยู่" columns={2}>
        {editing ? (
          <>
            <EditableKV k="ที่อยู่ตามบัตรประชาชน" value={draft.addressCard} multiline onChange={(value) => setField('addressCard', value)} />
            <EditableKV k="ที่อยู่ปัจจุบัน" value={draft.addressNow} multiline onChange={(value) => setField('addressNow', value)} />
          </>
        ) : (
          <>
            <KV k="ที่อยู่ตามบัตรประชาชน" v={u.addressCard} multiline />
            <KV k="ที่อยู่ปัจจุบัน" v={u.addressNow} multiline />
          </>
        )}
      </Group>
      <Group title="ชื่อและเบอร์โทรติดต่อฉุกเฉิน" columns={2}>
        {editing ? (
          <>
            <EditableKV k="ผู้ติดต่อ" value={draft.emergency?.name} onChange={(value) => setEmergencyField('name', value)} />
            <EditableKV k="เบอร์โทร" value={draft.emergency?.phone} onChange={(value) => setEmergencyField('phone', value)} />
          </>
        ) : (
          <>
            <KV k="ผู้ติดต่อ" v={u.emergency.name} />
            <KV k="เบอร์โทร"  v={u.emergency.phone} mono />
          </>
        )}
      </Group>
      <Group title="การศึกษา" columns={1}>
        <div className="up-table">
          <div className={'up-row up-row--education' + (editing ? ' up-row--education-edit' : '') + ' up-row--head'}>
            <div>วุฒิการศึกษา</div>
            <div>คณะ</div>
            <div>สาขา</div>
            <div>สถาบัน</div>
            <div className="up-cell-mono--right">ปีที่เริ่ม-จบการศึกษา</div>
            {editing && <div />}
          </div>
          {(editing ? draft.education : u.education).map((e, i) => (
            <div key={i} className={'up-row up-row--education' + (editing ? ' up-row--education-edit' : '') + ' up-row--zebra'}>
              {editing ? (
                <>
                  <input className="up-edit-field" value={e.degreeLevel || ''} onChange={(event) => setEducationField(i, 'degreeLevel', event.target.value)} />
                  <input className="up-edit-field" value={e.faculty || ''} onChange={(event) => setEducationField(i, 'faculty', event.target.value)} />
                  <input className="up-edit-field" value={e.major || ''} onChange={(event) => setEducationField(i, 'major', event.target.value)} />
                  <input className="up-edit-field" value={e.institute || ''} onChange={(event) => setEducationField(i, 'institute', event.target.value)} />
                  <input className="up-edit-field" value={e.studyYears || ''} onChange={(event) => setEducationField(i, 'studyYears', event.target.value)} />
                  <button
                    type="button"
                    className="up-btn up-btn--icon"
                    onClick={() => removeEducation(i)}
                    aria-label="ลบวุฒิการศึกษา"
                    title="ลบวุฒิการศึกษา"
                  >
                    ×
                  </button>
                </>
              ) : (
                <>
                  <div className="up-cell-strong">{e.degreeLevel}</div>
                  <div className="up-cell-muted">{e.faculty}</div>
                  <div className="up-cell-muted">{e.major}</div>
                  <div className="up-cell-muted">{e.institute}</div>
                  <div className="up-cell-mono up-cell-mono--right">{e.studyYears}</div>
                </>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <button
            type="button"
            className="up-btn up-add-education"
            onClick={addEducation}
          >
            + เพิ่มวุฒิการศึกษา
          </button>
        )}
      </Group>
    </>
  );
}

function JobTab({ j }) {
  const positionHistory = j.positionHistory?.length
    ? j.positionHistory.map((history, index) => ({
        ...history,
        salaryChange: history.salaryChange || j.history?.[index]?.salary || ''
      }))
    : (j.history || []).map((history) => ({
        year: history.year || history.date,
        from: history.from,
        to: history.to,
        salaryChange: history.salary || ''
      }));

  return (
    <>
      <Group title="ตำแหน่งและสังกัด" columns={3}>
        <KV k="รหัสพนักงาน"           v={j.code} mono />
        <KV k="ตำแหน่งงาน" v={j.roleTh} />
        <KV k="สังกัดฝ่าย/แผนก" v={j.department} />
        <KV k="ระดับพนักงาน" v={j.employeeLevel} />
        <KV k="ประเภทพนักงาน" v={j.type} />
        <KV k="วันเริ่มต้นทำงาน" v={j.startDate} />
        <KV k="อายุงาน" v={j.tenure} />
        <KV k="วันเริ่มทดลองงาน" v={j.probationStart} />
        <KV k="วันผ่านทดลองงาน" v={j.probationEnd} />
        <KV k="เงินเดือน" v={j.salary} mono />
      </Group>
      <Group title="ข้อมูลธนาคาร" columns={3}>
        <KV k="ชื่อธนาคาร" v={j.bank.name} />
        <KV k="สาขา"        v={j.bank.branch} />
        <KV k="เลขบัญชี" v={j.bank.acc} mono />
      </Group>
      <Group title="ประวัติการเปลี่ยนแปลงตำแหน่ง" columns={1}>
        <div className="up-table">
          {positionHistory.map((h, i) => (
            <div key={i} className="up-row up-row--history">
              <div className="up-cell-mono">{h.year}</div>
              <div className="up-cell-strong">{h.to}</div>
              <div className="up-cell-mono up-cell-mono--right">{h.salaryChange || '—'}</div>
            </div>
          ))}
        </div>
      </Group>
    </>
  );
}

function BenefitsTab({ j }) {
  return (
    <div className="up-benefits">
      {Object.values(j.benefits).filter((b) => b.status !== 'inactive').map((b) => (
        <div key={b.titleEn} className="up-benefit">
          <div className="up-benefit-head">
            <div className="up-benefit-title">
              <span className="up-benefit-icon">
                {BENEFIT_ICONS[b.icon] || <MdCardGiftcard />}
              </span>
              <div>
                <div className="up-benefit-name">{b.titleTh}</div>
                <div className="up-benefit-name-en">{b.titleEn}</div>
              </div>
            </div>
          </div>
          <div className="up-benefit-detail">{b.detail}</div>
        </div>
      ))}
    </div>
  );
}

function DocsTab({ documents }) {
  return (
    <div className="up-doc-list">
      {documents.map((d, i) => (
        <div key={i} className="up-row up-row--doc">
          <span className="up-doc-thumb">PDF</span>
          <div className="up-doc-name">{d.kind}</div>
          <div
            className="up-doc-meta"
            style={{
              fontFamily: 'var(--up-font-mono)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {d.file}
          </div>
          <div className="up-doc-meta up-doc-date" style={{ fontFamily: 'var(--up-font-mono)' }}>{d.size}</div>
          <div className="up-doc-meta up-doc-date">{d.date}</div>
        </div>
      ))}
    </div>
  );
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const normalizeEducation = (education = []) =>
  education.map((item) => ({
    degreeLevel: item.degreeLevel || item.degree || '',
    faculty: item.faculty || '',
    major: item.major || '',
    institute: item.institute || item.uni || '',
    studyYears: item.studyYears || item.year || ''
  }));

const removeDashes = (value = '') => String(value).replaceAll('-', '');

export default function Account({
  user,
  settings,
  onUpdateUser,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onOpenCheckIn,
  onLogout,
  onMessage,
  isCheckInDisabled = false,
  initialTab = 'general'
}) {
  const ref = useRef(null);
  const narrow = useNarrow(ref, 760);
  const [active, setActive] = useState(initialTab);
  const [generalDraft, setGeneralDraft] = useState(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const profile = user?.profile || {};
  const isExemptFromCheckIn = isCheckInDisabled || user?.profile?.job?.employeeLevel === 'Board Level' || user?.profile?.job?.employeeLevel === 'Director Level';

  const data = {
    user: {
      ...profile.user,
      nameEn: user?.name || profile.user?.nameEn || '',
      email: user?.email || profile.user?.email || '',
      initial: profile.user?.initial || (user?.name ? getInitials(user.name) : ''),
      citizenId: removeDashes(profile.user?.citizenId || ''),
      phone: removeDashes(profile.user?.phone || ''),
      emergency: {
        name:  profile.user?.emergency?.name  || '',
        phone: removeDashes(profile.user?.emergency?.phone || ''),
      },
      education: normalizeEducation(profile.user?.education || []),
    },
    job: {
      ...profile.job,
      bank:           { ...profile.job?.bank },
      benefits:       { ...(settings?.benefits || profile.job?.benefits) },
      code:           user?.employeeId || profile.job?.code || '',
      roleTh:         user?.position   || profile.job?.roleTh || '',
      employeeLevel:  profile.job?.employeeLevel || '',
      probationStart: profile.job?.probationStart || profile.job?.startDate || '',
      salary:         profile.job?.salary || '',
      positionHistory: profile.job?.positionHistory || [],
    },
    company: {
      ...(settings?.company || profile.company),
      nameTh: settings?.company?.nameTh || user?.company || profile.company?.nameTh || '',
    },
    documents: profile.documents || [],
  };

  const { user: u, job: j, company: c, documents } = data;
  const isEditingGeneral = active === 'general' && Boolean(generalDraft);

  const startEditGeneral = () => {
    setGeneralDraft(JSON.parse(JSON.stringify(u)));
  };

  const cancelEditGeneral = () => {
    setGeneralDraft(null);
  };

  const saveEditGeneral = () => {
    if (!generalDraft) return;
    const nextInitial = generalDraft.initial || getInitials(generalDraft.nameEn || user?.name || '');

    onUpdateUser?.({
      name: generalDraft.nameEn || user?.name,
      email: generalDraft.email || user?.email,
      profile: {
        ...profile,
        user: {
          ...profile.user,
          ...generalDraft,
          initial: nextInitial
        }
      }
    });
    setGeneralDraft(null);
  };

  const openPasswordPopup = () => {
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    setPwError(''); setPwSuccess(false);
    setShowPwCurrent(false); setShowPwNew(false); setShowPwConfirm(false);
    setShowPasswordPopup(true);
  };

  const closePasswordPopup = () => setShowPasswordPopup(false);

  const handleResetPassword = async () => {
    if (!pwCurrent) { setPwError('กรุณากรอกรหัสผ่านปัจจุบัน'); return; }
    if (pwNew.length < 8) { setPwError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
    if (pwNew !== pwConfirm) { setPwError('ยืนยันรหัสผ่านใหม่ไม่ตรงกัน'); return; }
    try {
      await apiChangePassword(pwCurrent, pwNew);
      setPwError('');
      setPwSuccess(true);
      setTimeout(closePasswordPopup, 1500);
    } catch (err) {
      if (err?.status === 401) setPwError('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      else if (err?.status === 400) setPwError(err.message || 'ข้อมูลไม่ถูกต้อง');
      else setPwError('เปลี่ยนรหัสผ่านไม่สำเร็จ');
    }
  };

  return (
    <div ref={ref} className={'up-root' + (narrow ? ' is-narrow' : '')}>
      <AccountHeader
        user={user}
        accountUser={u}
        job={j}
        active={active}
        isEditingGeneral={isEditingGeneral}
        onStartEditGeneral={startEditGeneral}
        onCancelEditGeneral={cancelEditGeneral}
        onSaveEditGeneral={saveEditGeneral}
        onOpenPasswordPopup={openPasswordPopup}
        onLogout={onLogout}
        onMessage={onMessage}
      />

      <AccountTabs
        tabs={TAB_IDS}
        active={active}
        onChange={(tabId) => {
          setActive(tabId);
          setGeneralDraft(null);
        }}
      />

      <AccountContent
        active={active}
        company={c}
        accountUser={u}
        job={j}
        documents={documents}
        isEditingGeneral={isEditingGeneral}
        generalDraft={generalDraft}
        onDraftChange={setGeneralDraft}
        CompanyTab={CompanyTab}
        GeneralTab={GeneralTab}
        JobTab={JobTab}
        BenefitsTab={BenefitsTab}
        DocsTab={DocsTab}
      />

      <PasswordResetModal
        isOpen={showPasswordPopup}
        success={pwSuccess}
        error={pwError}
        currentPassword={pwCurrent}
        newPassword={pwNew}
        confirmPassword={pwConfirm}
        showCurrent={showPwCurrent}
        showNew={showPwNew}
        showConfirm={showPwConfirm}
        onClose={closePasswordPopup}
        onSubmit={handleResetPassword}
        onCurrentPasswordChange={(value) => {
          setPwCurrent(value);
          setPwError('');
        }}
        onNewPasswordChange={(value) => {
          setPwNew(value);
          setPwError('');
        }}
        onConfirmPasswordChange={(value) => {
          setPwConfirm(value);
          setPwError('');
        }}
        onToggleCurrent={() => setShowPwCurrent((value) => !value)}
        onToggleNew={() => setShowPwNew((value) => !value)}
        onToggleConfirm={() => setShowPwConfirm((value) => !value)}
      />

      <BottomNav
        activePage="account"
        isExemptFromCheckIn={isExemptFromCheckIn}
        onGoHome={onGoHome}
        onGoRecord={onGoRecord}
        onOpenCheckIn={onOpenCheckIn}
        onGoRequest={onGoRequest}
      />
    </div>
  );
}


