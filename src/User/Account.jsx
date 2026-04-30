import { useState, useRef, useLayoutEffect } from 'react';
import {
  MdBusiness,
  MdPerson,
  MdWorkOutline,
  MdCardGiftcard,
  MdDescription,
  MdLocalHospital,
  MdFitnessCenter,
  MdSchool,
  MdDirectionsBus,
  MdRestaurant,
  MdHome,
  MdAccessTime,
  MdAssignment,
  MdSchedule
} from 'react-icons/md';
import './Account.css';

const TAB_IDS = [
  { id: 'company',  th: 'บริษัท',         icon: <MdBusiness /> },
  { id: 'general',  th: 'ข้อมูลทั่วไป',    icon: <MdPerson /> },
  { id: 'job',      th: 'งาน',            icon: <MdWorkOutline /> },
  { id: 'benefits', th: 'สวัสดิการ',       icon: <MdCardGiftcard /> },
  { id: 'docs',     th: 'เอกสาร',          icon: <MdDescription /> }
];

const BENEFIT_ICONS = {
  health: <MdLocalHospital />,
  gym: <MdFitnessCenter />,
  training: <MdSchool />,
  transport: <MdDirectionsBus />,
  food: <MdRestaurant />
};

const DEFAULT_PROFILE = {
  user: {
    initial: 'TU',
    nameTh: 'ธรีญา อึ้งตระกูล',
    nameEn: 'Thareeya Uentrakul',
    nicknameTh: 'แทร',
    gender: 'หญิง',
    age: 28,
    dob: '12 ส.ค. 2540',
    citizenId: '1-2345-67890-12-3',
    phone: '081-234-5678',
    email: 'thareeya@example.com',
    line: 'thareeya.u',
    addressCard: '123/45 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
    addressNow: '99/8 อาคาร XYZ ชั้น 4 ซอยทองหล่อ 10 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
    emergency: { name: 'คุณแม่ — สมใจ อึ้งตระกูล', phone: '089-876-5432' },
    education: [
      { uni: 'จุฬาลงกรณ์มหาวิทยาลัย', faculty: 'คณะรัฐศาสตร์', degree: 'ปริญญาตรี', year: '2562' }
    ]
  },
  job: {
    code: 'HAND23',
    roleTh: 'Project Coordinator',
    department: 'ฝ่ายโครงการ',
    type: 'พนักงานประจำ',
    startDate: '01 เม.ย. 2566',
    tenure: '3 ปี 1 เดือน',
    probationEnd: '01 ก.ค. 2566',
    bank: {
      name: 'ธนาคารกสิกรไทย',
      branch: 'สาขาทองหล่อ',
      acc: '123-4-56789-0',
      accName: 'ธรีญา อึ้งตระกูล'
    },
    history: [
      { date: '01 เม.ย. 2567', from: 'Project Assistant', to: 'Project Coordinator', kind: 'เลื่อนตำแหน่ง', salary: '+15%' },
      { date: '01 เม.ย. 2566', from: '—',                  to: 'Project Assistant',   kind: 'เริ่มงาน',     salary: '25,000' }
    ],
    benefits: {
      health:    { titleTh: 'ประกันสุขภาพ',    titleEn: 'Health Insurance',  icon: 'health',    status: 'active', detail: 'วงเงิน 100,000 บาท/ปี ครอบคลุม OPD/IPD' },
      gym:       { titleTh: 'ค่าออกกำลังกาย',  titleEn: 'Fitness Allowance', icon: 'gym',       status: 'issued', detail: 'เบิกได้ 1,000 บาท/เดือน' },
      training:  { titleTh: 'งบฝึกอบรม',        titleEn: 'Training Budget',   icon: 'training',  status: 'active', detail: '15,000 บาท/ปี' },
      transport: { titleTh: 'ค่าเดินทาง',       titleEn: 'Transport',         icon: 'transport', status: 'active', detail: '2,000 บาท/เดือน' }
    }
  },
  company: {
    nameTh: 'บริษัท แฮนด์ วิสาหกิจเพื่อสังคม จำกัด',
    nameEn: 'HAND Social Enterprise Co., Ltd.',
    taxId: '0-1055-12345-67-8',
    phone: '02-123-4567',
    address: '456/12 ซอยทองหล่อ 10 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110'
  },
  documents: [
    { kind: 'สัญญาจ้างงาน',         file: 'employment-contract-2023.pdf', size: '256 KB', date: '01 เม.ย. 2566', status: 'signed' },
    { kind: 'สำเนาบัตรประชาชน',      file: 'national-id.pdf',              size: '512 KB', date: '01 เม.ย. 2566', status: 'reviewed' },
    { kind: 'หนังสือผ่านทดลองงาน', file: 'probation-pass.pdf',           size: '128 KB', date: '01 ก.ค. 2566', status: 'signed' }
  ]
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
      </Group>
      <Group columns={1}>
        <KV k="ที่อยู่จดทะเบียน" v={c.address} multiline />
      </Group>
    </>
  );
}

function GeneralTab({ u }) {
  return (
    <>
      <Group title="ข้อมูลส่วนตัว" columns={3}>
        <KV k="ชื่อ-สกุล (ไทย)"     v={u.nameTh} />
        <KV k="ชื่อ-สกุล (อังกฤษ)"  v={u.nameEn} />
        <KV k="ชื่อเล่น"             v={u.nicknameTh} />
        <KV k="เพศ"                  v={u.gender} />
        <KV k="อายุ"                 v={`${u.age} ปี`} />
        <KV k="วันเกิด"              v={u.dob} />
        <KV k="เลขบัตรประชาชน"       v={u.citizenId} mono />
      </Group>
      <Group title="ช่องทางติดต่อ" columns={3}>
        <KV k="โทรศัพท์" v={u.phone} mono />
        <KV k="Email"    v={u.email} mono />
        <KV k="LINE ID"  v={u.line}  mono />
      </Group>
      <Group title="ที่อยู่" columns={2}>
        <KV k="ตามบัตรประชาชน" v={u.addressCard} multiline />
        <KV k="ปัจจุบัน"       v={u.addressNow}  multiline />
      </Group>
      <Group title="เบอร์ฉุกเฉิน" columns={2}>
        <KV k="ผู้ติดต่อ" v={u.emergency.name} />
        <KV k="เบอร์โทร"  v={u.emergency.phone} mono />
      </Group>
      <Group title="การศึกษา" columns={1}>
        <div className="up-table">
          {u.education.map((e, i) => (
            <div key={i} className="up-row up-row--education up-row--zebra">
              <div className="up-cell-strong">{e.uni}</div>
              <div className="up-cell-muted">{e.faculty}</div>
              <div className="up-cell-muted">{e.degree}</div>
              <div className="up-cell-mono up-cell-mono--right">{e.year}</div>
            </div>
          ))}
        </div>
      </Group>
    </>
  );
}

function JobTab({ j }) {
  return (
    <>
      <Group title="ตำแหน่งและสังกัด" columns={3}>
        <KV k="รหัสพนักงาน"           v={j.code} mono />
        <KV k="ตำแหน่ง"                v={j.roleTh} />
        <KV k="สังกัดฝ่าย"             v={j.department} />
        <KV k="ประเภท"                 v={j.type} />
        <KV k="วันเริ่มงาน"             v={j.startDate} />
        <KV k="อายุงาน"                v={j.tenure} />
        <KV k="วันสิ้นสุดทดลองงาน"     v={j.probationEnd} />
      </Group>
      <Group title="ธนาคาร · สำหรับโอนเงินเดือน" columns={2}>
        <KV k="ธนาคาร"      v={j.bank.name} />
        <KV k="สาขา"        v={j.bank.branch} />
        <KV k="เลขที่บัญชี" v={j.bank.acc} mono />
        <KV k="ชื่อบัญชี"   v={j.bank.accName} />
      </Group>
      <Group title="ประวัติการเปลี่ยนแปลงตำแหน่ง" columns={1}>
        <div className="up-table">
          {j.history.map((h, i) => (
            <div key={i} className="up-row up-row--history">
              <div className="up-cell-mono">{h.date}</div>
              <div className="up-cell-strong">{h.to}</div>
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
      {Object.values(j.benefits).map((b) => (
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

export default function Account({
  user,
  onGoHome,
  onGoRecord,
  onGoRequest,
  onOpenCheckIn,
  onMessage,
  initialTab = 'general'
}) {
  const ref = useRef(null);
  const narrow = useNarrow(ref, 760);
  const [active, setActive] = useState(initialTab);

  const data = {
    ...DEFAULT_PROFILE,
    user: {
      ...DEFAULT_PROFILE.user,
      nameEn: user?.name || DEFAULT_PROFILE.user.nameEn,
      initial: user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : DEFAULT_PROFILE.user.initial
    },
    job: {
      ...DEFAULT_PROFILE.job,
      code: user?.employeeId || DEFAULT_PROFILE.job.code,
      roleTh: user?.position || DEFAULT_PROFILE.job.roleTh
    },
    company: {
      ...DEFAULT_PROFILE.company,
      nameTh: user?.company || DEFAULT_PROFILE.company.nameTh
    }
  };

  const { user: u, job: j, company: c, documents } = data;

  return (
    <div ref={ref} className={'up-root' + (narrow ? ' is-narrow' : '')}>
      <div className="up-header">
        <div className="up-avatar">{u.initial}</div>
        <div className="up-headline">
          <div className="up-emp-code">{j.code}</div>
          <h1 className="up-name">{u.nameTh}</h1>
          <div className="up-subtitle">
            {j.roleTh} · {u.nameEn}
          </div>
        </div>
        {onMessage && (
          <div className="up-actions">
            <button className="up-btn" onClick={onMessage}>ส่งข้อความ</button>
          </div>
        )}
      </div>

      <div className="up-tabs" role="tablist">
        {TAB_IDS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={'up-tab' + (active === t.id ? ' is-active' : '')}
          >
            {t.icon}
            {t.th}
          </button>
        ))}
      </div>

      <div className="up-content">
        <div className="up-card">
          {active === 'company'  && <CompanyTab  c={c} />}
          {active === 'general'  && <GeneralTab  u={u} />}
          {active === 'job'      && <JobTab      j={j} />}
          {active === 'benefits' && <BenefitsTab j={j} />}
          {active === 'docs'     && <DocsTab     documents={documents} />}
        </div>
      </div>

      <div className="bottom-nav">
        <button className="nav-item" onClick={onGoHome}>
          <span className="nav-icon"><MdHome /></span>
          <span className="nav-label">Home</span>
        </button>
        <button className="nav-item" onClick={onGoRecord}>
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
        <button className="nav-item active">
          <span className="nav-icon"><MdPerson /></span>
          <span className="nav-label">My Account</span>
        </button>
      </div>
    </div>
  );
}
