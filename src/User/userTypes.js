export const USER_TYPES = [
  {
    id: 'employee',
    label: 'พนักงานทั่วไป',
    position: 'Employee',
    name: 'Thareeya Uentrakul',
    employeeId: 'HAND23',
    email: 'employee@apphr.test',
    password: 'Employee@123',
    profile: {
      user: {
        initial: 'TU',
        prefix: 'นางสาว',
        nameTh: 'ธรีญา อึ้งตระกูล',
        nameEn: 'Thareeya Uentrakul',
        nicknameTh: 'แทร์',
        email: 'employee@apphr.test',
        phone: '0812345678',
        line: 'thareeya.u',
        citizenId: '1234567890123',
        education: [
          { degreeLevel: 'ปริญญาตรี', faculty: 'คณะรัฐศาสตร์', major: 'รัฐศาสตร์', institute: 'จุฬาลงกรณ์มหาวิทยาลัย', studyYears: '2558-2562' }
        ]
      },
      job: {
        code: 'HAND23',
        roleTh: 'Project Coordinator',
        department: 'ฝ่ายโครงการ',
        employeeLevel: 'Staff',
        type: 'สัญญาจ้างประจำ',
        startDate: '01 เม.ย. 2566',
        tenure: '3 ปี 1 เดือน',
        probationStart: '01 เม.ย. 2566',
        probationEnd: '01 ก.ค. 2566',
        salary: '35,000 บาท',
        bank: {
          name: 'ธนาคารกสิกรไทย',
          branch: 'สาขาทองหล่อ',
          acc: '123-4-56789-0',
          accName: 'ธรีญา อึ้งตระกูล'
        },
        positionHistory: [
          { year: '2567', from: 'Project Assistant', to: 'Project Coordinator', salaryChange: '+15%' },
          { year: '2566', from: '—', to: 'Project Assistant', salaryChange: '25,000' }
        ]
      },
      documents: [
        { kind: 'สำเนาบัตรประชาชน', file: 'national-id-HAND23.pdf', size: '512 KB', date: '01 เม.ย. 2566', status: 'reviewed' },
        { kind: 'สำเนาทะเบียนบ้าน', file: 'house-registration-HAND23.pdf', size: '480 KB', date: '01 เม.ย. 2566', status: 'reviewed' },
        { kind: 'หนังสือรับรองการศึกษา', file: 'education-certificate-HAND23.pdf', size: '768 KB', date: '01 เม.ย. 2566', status: 'reviewed' },
        { kind: 'สำเนาบัญชีธนาคาร', file: 'bank-account-HAND23.pdf', size: '320 KB', date: '01 เม.ย. 2566', status: 'reviewed' },
        { kind: 'สัญญาจ้างงาน', file: 'employment-contract-HAND23.pdf', size: '256 KB', date: '01 เม.ย. 2566', status: 'signed' },
        { kind: 'เอกสารแจ้งปรับเงินเดือน', file: 'salary-adjustment-HAND23-2567.pdf', size: '180 KB', date: '01 เม.ย. 2567', status: 'signed' },
        { kind: 'เอกสารแจ้งปรับตำแหน่ง', file: 'position-adjustment-HAND23-2567.pdf', size: '192 KB', date: '01 เม.ย. 2567', status: 'signed' }
      ]
    }
  },
  {
    id: 'admin',
    label: 'แอดมิน',
    position: 'Admin',
    name: 'Admin User',
    employeeId: 'ADMIN01',
    email: 'admin@apphr.test',
    password: 'Admin@123',
    profile: {
      user: {
        initial: 'AU',
        prefix: 'นาย',
        nameTh: 'แอดมิน ระบบ',
        nameEn: 'Admin User',
        nicknameTh: 'แอดมิน',
        email: 'admin@apphr.test',
        phone: '0821000001',
        line: 'admin.apphr',
        citizenId: '110000001001',
        education: [
          { degreeLevel: 'ปริญญาตรี', faculty: 'วิทยาศาสตร์', major: 'เทคโนโลยีสารสนเทศ', institute: 'มหาวิทยาลัยกรุงเทพ', studyYears: '2556-2560' }
        ]
      },
      job: {
        code: 'ADMIN01',
        roleTh: 'Admin',
        department: 'ฝ่ายบริหารระบบ',
        employeeLevel: 'Senior Staff',
        type: 'สัญญาจ้างประจำ',
        startDate: '01 ม.ค. 2566',
        tenure: '3 ปี 4 เดือน',
        probationStart: '01 ม.ค. 2566',
        probationEnd: '01 เม.ย. 2566',
        salary: '42,000 บาท',
        bank: {
          name: 'ธนาคารกรุงเทพ',
          branch: 'สาขาสุขุมวิท',
          acc: '200-1-00001-1',
          accName: 'แอดมิน ระบบ'
        },
        positionHistory: [
          { year: '2567', from: 'System Officer', to: 'Admin', salaryChange: '+12%' },
          { year: '2566', from: '—', to: 'System Officer', salaryChange: '37,000' }
        ]
      },
      documents: [
        { kind: 'สำเนาบัตรประชาชน', file: 'national-id-ADMIN01.pdf', size: '512 KB', date: '01 ม.ค. 2566', status: 'reviewed' },
        { kind: 'สำเนาทะเบียนบ้าน', file: 'house-registration-ADMIN01.pdf', size: '480 KB', date: '01 ม.ค. 2566', status: 'reviewed' },
        { kind: 'หนังสือรับรองการศึกษา', file: 'education-certificate-ADMIN01.pdf', size: '768 KB', date: '01 ม.ค. 2566', status: 'reviewed' },
        { kind: 'สำเนาบัญชีธนาคาร', file: 'bank-account-ADMIN01.pdf', size: '320 KB', date: '01 ม.ค. 2566', status: 'reviewed' },
        { kind: 'สัญญาจ้างงาน', file: 'employment-contract-ADMIN01.pdf', size: '244 KB', date: '01 ม.ค. 2566', status: 'signed' },
        { kind: 'เอกสารแจ้งปรับเงินเดือน', file: 'salary-adjustment-ADMIN01-2567.pdf', size: '180 KB', date: '01 ม.ค. 2567', status: 'signed' },
        { kind: 'เอกสารแจ้งปรับตำแหน่ง', file: 'position-adjustment-ADMIN01-2567.pdf', size: '192 KB', date: '01 ม.ค. 2567', status: 'signed' }
      ]
    }
  },
  {
    id: 'accounting',
    label: 'บัญชี',
    position: 'Accounting',
    name: 'Accounting User',
    employeeId: 'ACC01',
    email: 'accounting@apphr.test',
    password: 'Accounting@123',
    profile: {
      user: {
        initial: 'AC',
        prefix: 'นางสาว',
        nameTh: 'บัญชี ผู้ใช้งาน',
        nameEn: 'Accounting User',
        nicknameTh: 'บัญชี',
        email: 'accounting@apphr.test',
        phone: '0821000002',
        line: 'accounting.apphr',
        citizenId: '110000002002',
        education: [
          { degreeLevel: 'ปริญญาตรี', faculty: 'บริหารธุรกิจ', major: 'การบัญชี', institute: 'มหาวิทยาลัยหอการค้าไทย', studyYears: '2557-2561' }
        ]
      },
      job: {
        code: 'ACC01',
        roleTh: 'Accounting',
        department: 'ฝ่ายบัญชีและการเงิน',
        employeeLevel: 'Staff',
        type: 'สัญญาจ้างประจำ',
        startDate: '15 ก.พ. 2566',
        tenure: '3 ปี 2 เดือน',
        probationStart: '15 ก.พ. 2566',
        probationEnd: '15 พ.ค. 2566',
        salary: '32,000 บาท',
        bank: {
          name: 'ธนาคารไทยพาณิชย์',
          branch: 'สาขาอโศก',
          acc: '200-1-00002-2',
          accName: 'บัญชี ผู้ใช้งาน'
        },
        positionHistory: [
          { year: '2567', from: 'Accounting Assistant', to: 'Accounting', salaryChange: '+10%' },
          { year: '2566', from: '—', to: 'Accounting Assistant', salaryChange: '29,000' }
        ]
      },
      documents: [
        { kind: 'สำเนาบัตรประชาชน', file: 'national-id-ACC01.pdf', size: '512 KB', date: '15 ก.พ. 2566', status: 'reviewed' },
        { kind: 'สำเนาทะเบียนบ้าน', file: 'house-registration-ACC01.pdf', size: '480 KB', date: '15 ก.พ. 2566', status: 'reviewed' },
        { kind: 'หนังสือรับรองการศึกษา', file: 'education-certificate-ACC01.pdf', size: '768 KB', date: '15 ก.พ. 2566', status: 'reviewed' },
        { kind: 'สำเนาบัญชีธนาคาร', file: 'bank-account-ACC01.pdf', size: '320 KB', date: '15 ก.พ. 2566', status: 'reviewed' },
        { kind: 'สัญญาจ้างงาน', file: 'employment-contract-ACC01.pdf', size: '248 KB', date: '15 ก.พ. 2566', status: 'signed' },
        { kind: 'เอกสารแจ้งปรับเงินเดือน', file: 'salary-adjustment-ACC01-2567.pdf', size: '180 KB', date: '15 ก.พ. 2567', status: 'signed' },
        { kind: 'เอกสารแจ้งปรับตำแหน่ง', file: 'position-adjustment-ACC01-2567.pdf', size: '192 KB', date: '15 ก.พ. 2567', status: 'signed' }
      ]
    }
  },
  {
    id: 'manager',
    label: 'หัวหน้า',
    position: 'Manager',
    name: 'Manager User',
    employeeId: 'MGR01',
    email: 'manager@apphr.test',
    password: 'Manager@123',
    profile: {
      user: {
        initial: 'MU',
        prefix: 'นาย',
        nameTh: 'หัวหน้า ผู้ใช้งาน',
        nameEn: 'Manager User',
        nicknameTh: 'หัวหน้า',
        email: 'manager@apphr.test',
        phone: '0821000003',
        line: 'manager.apphr',
        citizenId: '110000003003',
        education: [
          { degreeLevel: 'ปริญญาโท', faculty: 'พาณิชยศาสตร์และการบัญชี', major: 'การจัดการ', institute: 'จุฬาลงกรณ์มหาวิทยาลัย', studyYears: '2555-2557' }
        ]
      },
      job: {
        code: 'MGR01',
        roleTh: 'Manager',
        department: 'ฝ่ายบริหารงานบุคคล',
        employeeLevel: 'Manager',
        type: 'สัญญาจ้างประจำ',
        startDate: '01 มี.ค. 2565',
        tenure: '4 ปี 2 เดือน',
        probationStart: '01 มี.ค. 2565',
        probationEnd: '01 มิ.ย. 2565',
        salary: '55,000 บาท',
        bank: {
          name: 'ธนาคารกสิกรไทย',
          branch: 'สาขาทองหล่อ',
          acc: '200-1-00003-3',
          accName: 'หัวหน้า ผู้ใช้งาน'
        },
        positionHistory: [
          { year: '2567', from: 'Assistant Manager', to: 'Manager', salaryChange: '+18%' },
          { year: '2565', from: '—', to: 'Assistant Manager', salaryChange: '46,000' }
        ]
      },
      documents: [
        { kind: 'สำเนาบัตรประชาชน', file: 'national-id-MGR01.pdf', size: '512 KB', date: '01 มี.ค. 2565', status: 'reviewed' },
        { kind: 'สำเนาทะเบียนบ้าน', file: 'house-registration-MGR01.pdf', size: '480 KB', date: '01 มี.ค. 2565', status: 'reviewed' },
        { kind: 'หนังสือรับรองการศึกษา', file: 'education-certificate-MGR01.pdf', size: '768 KB', date: '01 มี.ค. 2565', status: 'reviewed' },
        { kind: 'สำเนาบัญชีธนาคาร', file: 'bank-account-MGR01.pdf', size: '320 KB', date: '01 มี.ค. 2565', status: 'reviewed' },
        { kind: 'สัญญาจ้างงาน', file: 'employment-contract-MGR01.pdf', size: '252 KB', date: '01 มี.ค. 2565', status: 'signed' },
        { kind: 'เอกสารแจ้งปรับเงินเดือน', file: 'salary-adjustment-MGR01-2567.pdf', size: '180 KB', date: '01 มี.ค. 2567', status: 'signed' },
        { kind: 'เอกสารแจ้งปรับตำแหน่ง', file: 'position-adjustment-MGR01-2567.pdf', size: '192 KB', date: '01 มี.ค. 2567', status: 'signed' }
      ]
    }
  }
];

export const DEFAULT_USER_TYPE = USER_TYPES[0].id;

export const getUserType = (userTypeId = DEFAULT_USER_TYPE) =>
  USER_TYPES.find((type) => type.id === userTypeId) || USER_TYPES[0];

export const getUserTypeByEmail = (email = '') => {
  const normalizedEmail = email.trim().toLowerCase();
  return USER_TYPES.find((type) => type.email.toLowerCase() === normalizedEmail);
};
