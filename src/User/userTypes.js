const MOCK_EMPLOYEES = [
  {
    nameTh: 'ดร.ต่อภัสสร์ ยมนาค',
    employeeId: 'H0001',
    position: 'Co-Founder and Chief Advisor',
    department: 'Board of Directors',
    employeeLevel: 'Board Level',
    bankName: 'kbank'
  },
  {
    nameTh: 'สุภอรรถ โบสุวรรณ',
    employeeId: 'H0002',
    position: 'Managing Director',
    department: 'Board of Directors',
    employeeLevel: 'Board Level',
    bankName: 'kbank'
  },
  {
    nameTh: 'พลังรัฐ รัชตะนาวิน',
    employeeId: 'H0003',
    position: 'Director of Operations',
    department: 'Board of Directors',
    employeeLevel: 'Board Level',
    bankName: 'kbank'
  },
  {
    nameTh: 'ยุทธนา วังวสุ',
    employeeId: 'H0004',
    position: 'Co-Founder and Director',
    department: 'Board of Directors',
    employeeLevel: 'Board Level',
    bankName: 'kbank'
  },
  {
    nameTh: 'สุภัจจา อังค์สุวรรณ',
    employeeId: 'H0006',
    position: 'Director of Research & Knowledge Management',
    department: 'Good Governance Research and Learning Department',
    employeeLevel: 'Director Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '18/12/2017',
    bankName: 'kbank',
    bankAccount: '0351293993'
  },
  {
    nameTh: 'พัชรี ตรีพรม',
    employeeId: 'H0007',
    position: 'Project Manager',
    department: 'Collaboration and Coordination Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '18/12/2017',
    bankName: 'kbank',
    bankAccount: '0351575697'
  },
  {
    nameTh: 'จรัสศรี พะลายะสุต',
    employeeId: 'H0008',
    position: 'Director of Accounting and Finance',
    department: 'Accounting and Finance Department',
    employeeLevel: 'Director Level',
    employeeType: 'การจ้างที่ปรึกษา',
    startDate: '07/04/2019',
    bankName: 'kbank',
    bankAccount: '7722080984',
    bankBranch: 'Central World'
  },
  {
    nameTh: 'รักษ์ป่า อู่สุวรรณ',
    employeeId: 'H0015',
    position: 'Project Manager',
    department: 'Open Data for Transparency & Participation Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '03/07/2022',
    probationStart: '03/07/2022',
    probationEnd: '06/07/2022',
    bankName: 'kbank',
    bankAccount: '0138434362',
    bankBranch: 'บ้านดู่'
  },
  {
    nameTh: 'ศรันย์ชนก ลิมวิสิฐธนกร',
    employeeId: 'H0025',
    position: 'Executive Assistant',
    department: 'Collaboration and Coordination Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '04/03/2023',
    probationStart: '04/03/2023',
    bankName: 'kbank',
    bankAccount: '0238067782',
    bankBranch: 'บางกระบือ'
  },
  {
    nameTh: 'ธรีญา อึ้งตระกูล',
    employeeId: 'H0029',
    position: 'Project coordinator',
    department: 'Open Data for Transparency & Participation Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '08/07/2023',
    probationStart: '08/07/2023',
    bankName: 'kbank',
    bankAccount: '0533261361',
    bankBranch: 'ฟิวเจอร์ พาร์ค รังสิต'
  },
  {
    nameTh: 'จตุพร ศิรเลิศมุกุล',
    employeeId: 'H0031',
    position: 'Accountant',
    department: 'Accounting and Finance Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '25/03/2024',
    probationStart: '25/03/2024',
    bankName: 'kbank',
    bankAccount: '1803680430',
    bankBranch: 'ฟิวเจอร์ พาร์ค รังสิต'
  },
  {
    nameTh: 'ธนากาญจน์ กันทอง',
    employeeId: 'H0032',
    position: 'Research Assistant',
    department: 'Good Governance Research and Learning Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '27/05/2024',
    probationStart: '27/05/2024',
    bankName: 'kbank',
    bankAccount: '0408689627',
    bankBranch: 'บิ๊กซี อ่อนนุช'
  },
  {
    nameTh: 'ศุภชัย เสถียรหมั่น',
    employeeId: 'H0033',
    position: 'Researcher',
    department: 'Good Governance Research and Learning Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '06/10/2024',
    probationStart: '06/10/2024',
    bankName: 'kbank',
    bankAccount: '1861796600',
    bankBranch: 'จามจุรี สแควร์'
  },
  {
    nameTh: 'ศุภวิชญ์ แก้วคูนอก',
    employeeId: 'H0034',
    position: 'Center Manager of KRAC',
    department: 'Good Governance Research and Learning Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '09/09/2024',
    probationStart: '09/09/2024',
    probationEnd: '12/10/2024',
    bankName: 'kbank',
    bankAccount: '1928266644',
    bankBranch: 'ตลาดเกาะโพธิ์'
  },
  {
    nameTh: 'ศศธร เอี่ยมสะอาด',
    employeeId: 'H0042',
    position: 'Content Writer',
    department: 'Open Data for Transparency & Participation Department',
    employeeLevel: 'Project Level',
    employeeType: 'สัญญาจ้างประจำ',
    startDate: '06/05/2025',
    probationStart: '06/05/2025',
    bankName: 'kbank',
    bankAccount: '0252721827',
    bankBranch: 'สาขาเซ็นทรัลพลาซ่า เชียงใหม่'
  }
];

const getNickname = (nameTh) => nameTh.split(' ')[0].replace(/^ดร\./, '');

const getInitial = (employee) =>
  employee.employeeId.replace(/^H/, '').slice(-2);

const createUserType = (employee) => ({
  id: employee.employeeId.toLowerCase(),
  label: employee.employeeLevel,
  position: employee.position,
  name: employee.nameTh,
  employeeId: employee.employeeId,
  email: `${employee.employeeId.toLowerCase()}@apphr.test`,
  password: `${employee.employeeId}@123`,
  profile: {
    user: {
      initial: getInitial(employee),
      prefix: '',
      nameTh: employee.nameTh,
      nameEn: employee.nameTh,
      nicknameTh: getNickname(employee.nameTh),
      email: `${employee.employeeId.toLowerCase()}@apphr.test`,
      phone: '',
      line: '',
      citizenId: '',
      education: []
    },
    job: {
      code: employee.employeeId,
      roleTh: employee.position,
      department: employee.department,
      employeeLevel: employee.employeeLevel,
      type: employee.employeeType || '',
      startDate: employee.startDate || '',
      tenure: '',
      probationStart: employee.probationStart || '',
      probationEnd: employee.probationEnd || '',
      salary: '',
      bank: {
        name: employee.bankName || '',
        branch: employee.bankBranch || '',
        acc: employee.bankAccount || '',
        accName: employee.bankAccountName || ''
      },
      positionHistory: []
    },
    documents: []
  }
});

export const USER_TYPES = MOCK_EMPLOYEES.map(createUserType);

export const DEFAULT_USER_TYPE = 'h0029';

export const CHECK_IN_USER_TYPES = USER_TYPES.filter((type) =>
  ['Project Level', 'Director Level', 'Board Level'].includes(type.profile?.job?.employeeLevel)
);

export const ADMIN_USER_TYPES = USER_TYPES.filter((type) =>
  type.profile?.job?.department === 'Accounting and Finance Department'
);

export const getUserType = (userTypeId = DEFAULT_USER_TYPE) =>
  USER_TYPES.find((type) => type.id === userTypeId) ||
  USER_TYPES.find((type) => type.id === DEFAULT_USER_TYPE) ||
  USER_TYPES[0];

export const getUserTypeByEmail = (email = '') => {
  const normalizedEmail = email.trim().toLowerCase();
  return CHECK_IN_USER_TYPES.find((type) => type.email.toLowerCase() === normalizedEmail);
};

export const getAdminUserTypeByEmail = (email = '') => {
  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_USER_TYPES.find((type) => type.email.toLowerCase() === normalizedEmail);
};
