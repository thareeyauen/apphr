import { useEffect, useState } from 'react'
import Account from './User/Account'
import Landing from './User/Landing'
import Leave from './User/Leave'
import Login from './User/Login'
import Overtime from './User/Overtime'
import Outside from './User/Outside'
import Record from './User/Record'
import Request from './User/Request'
import Requestdoc from './User/Requestdoc'
import { DEFAULT_USER_TYPE, USER_TYPES, getUserType } from './User/userTypes'

const CHECK_IN_RECORDS_KEY = 'apphr-checkin-records'
const CHECK_IN_RECORDS_SYNC_EVENT = 'apphr-checkin-records-sync'
const CURRENT_USER_KEY = 'apphr-current-user'
const REQUEST_RECORDS_KEY = 'apphr-request-records'
const USER_ACCOUNT_OVERRIDES_KEY = 'apphr-user-account-overrides'
const LEAVE_CHECKIN_WARNING_KEY = 'apphr-show-leave-checkin-warning'
const REQUEST_APPROVER_LEVELS = ['Board Level', 'Director Level']

const baseUser = {
  company: 'บริษัท แฮนด์ วิสาหกิจเพื่อสังคม จำกัด',
  language: 'English',
  leaveQuota: '5 days'
}

const getUserRecordOwnerKey = (user) =>
  user?.employeeId || user?.email || user?.userType || ''

const getRecordOwnerKey = (record) =>
  record?.ownerKey || record?.employeeId || record?.email || record?.userId || ''

const isRecordOwnedByUser = (record, user) => {
  const userOwnerKey = getUserRecordOwnerKey(user)
  return Boolean(userOwnerKey) && getRecordOwnerKey(record) === userOwnerKey
}

const formatRequestDate = (date) =>
  date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

const getDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const readStoredCheckInRecords = () => {
  const savedRecords = localStorage.getItem(CHECK_IN_RECORDS_KEY)
  return savedRecords ? JSON.parse(savedRecords) : []
}

const readStoredUserOverrides = () => {
  const savedOverrides = localStorage.getItem(USER_ACCOUNT_OVERRIDES_KEY)
  if (!savedOverrides) return {}
  try {
    const parsedOverrides = JSON.parse(savedOverrides)
    return parsedOverrides && typeof parsedOverrides === 'object' ? parsedOverrides : {}
  } catch {
    return {}
  }
}

const hasSavedUserChanges = (savedUser, baseUserData) =>
  savedUser?.password !== baseUserData?.password ||
  savedUser?.email !== baseUserData?.email ||
  savedUser?.name !== baseUserData?.name ||
  JSON.stringify(savedUser?.profile?.user || {}) !== JSON.stringify(baseUserData?.profile?.user || {})

const readInitialUserOverrides = () => {
  const storedOverrides = readStoredUserOverrides()
  const savedUser = localStorage.getItem(CURRENT_USER_KEY)
  if (!savedUser) return storedOverrides

  try {
    const parsedUser = JSON.parse(savedUser)
    const baseUserData = USER_TYPES.find((type) => type.id === parsedUser?.id)
    if (!baseUserData || !hasSavedUserChanges(parsedUser, baseUserData)) {
      return storedOverrides
    }

    return {
      ...storedOverrides,
      [parsedUser.id]: mergeUserAccount(storedOverrides[parsedUser.id] || {}, parsedUser)
    }
  } catch {
    return storedOverrides
  }
}

const mergeUserAccount = (baseUserData, override = {}) => ({
  ...baseUserData,
  ...override,
  profile: {
    ...baseUserData.profile,
    ...override.profile,
    user: {
      ...baseUserData.profile?.user,
      ...override.profile?.user
    },
    job: {
      ...baseUserData.profile?.job,
      ...override.profile?.job,
      bank: {
        ...baseUserData.profile?.job?.bank,
        ...override.profile?.job?.bank
      }
    },
    documents: override.profile?.documents || baseUserData.profile?.documents || []
  }
})

const THAI_MONTH_MAP = {
  'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
  'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
  'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
}

const parseDateKeyFromThaiDate = (thaiDate) => {
  if (typeof thaiDate !== 'string') return ''
  const parts = thaiDate.trim().split(/\s+/)
  if (parts.length !== 3) return ''
  const [day, monthAbbr, beYear] = parts
  const month = THAI_MONTH_MAP[monthAbbr]
  const year = Number(beYear)
  if (!month || !Number.isFinite(year)) return ''
  const ceYear = year > 2400 ? year - 543 : year
  return `${ceYear}-${month}-${day.padStart(2, '0')}`
}

const ensureRequestDateKey = (record) => {
  if (record?.dateKey) return record
  const derived = parseDateKeyFromThaiDate(record?.date)
  return derived ? { ...record, dateKey: derived } : record
}

const getRequestApproverLevels = (record) => {
  if (Array.isArray(record?.approverLevels)) return record.approverLevels
  if (typeof record?.approverLevel === 'string') return [record.approverLevel]
  return REQUEST_APPROVER_LEVELS
}

const isRequestAssignedToLevel = (record, employeeLevel) =>
  Boolean(employeeLevel) && getRequestApproverLevels(record).includes(employeeLevel)

const getApproverLevelsForRequester = (requester) =>
  requester?.profile?.job?.employeeLevel === 'Director Level'
    ? ['Board Level']
    : REQUEST_APPROVER_LEVELS

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [userOverrides, setUserOverrides] = useState(() => readInitialUserOverrides())
  const [signedInUser, setSignedInUser] = useState(() => {
    const storedOverrides = readStoredUserOverrides()
    const savedUser = localStorage.getItem(CURRENT_USER_KEY)
    if (!savedUser) {
      const defaultUser = getUserType(DEFAULT_USER_TYPE)
      return mergeUserAccount(defaultUser, storedOverrides[defaultUser.id])
    }
    const parsedUser = JSON.parse(savedUser)
    if (USER_TYPES.some((type) => type.id === parsedUser?.id)) {
      return mergeUserAccount(parsedUser, storedOverrides[parsedUser.id])
    }
    const defaultUser = getUserType(DEFAULT_USER_TYPE)
    return mergeUserAccount(defaultUser, storedOverrides[defaultUser.id])
  })
  const [checkInRecords, setCheckInRecords] = useState(() => {
    return readStoredCheckInRecords()
  })
  const [requestRecords, setRequestRecords] = useState(() => {
    const savedRequests = localStorage.getItem(REQUEST_RECORDS_KEY)
    if (!savedRequests) return []
    try {
      return JSON.parse(savedRequests).map(ensureRequestDateKey)
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    localStorage.setItem(CHECK_IN_RECORDS_KEY, JSON.stringify(checkInRecords))
    window.dispatchEvent(
      new CustomEvent(CHECK_IN_RECORDS_SYNC_EVENT, { detail: checkInRecords })
    )
  }, [checkInRecords])

  useEffect(() => {
    const syncRecords = (records) => {
      setCheckInRecords(Array.isArray(records) ? records : [])
    }
    const handleStorageChange = (event) => {
      if (event.key !== CHECK_IN_RECORDS_KEY) return
      syncRecords(event.newValue ? JSON.parse(event.newValue) : [])
    }
    const handleLocalSync = (event) => syncRecords(event.detail)

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(CHECK_IN_RECORDS_SYNC_EVENT, handleLocalSync)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(CHECK_IN_RECORDS_SYNC_EVENT, handleLocalSync)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(signedInUser))
  }, [signedInUser])

  useEffect(() => {
    localStorage.setItem(USER_ACCOUNT_OVERRIDES_KEY, JSON.stringify(userOverrides))
  }, [userOverrides])

  useEffect(() => {
    localStorage.setItem(REQUEST_RECORDS_KEY, JSON.stringify(requestRecords))
  }, [requestRecords])

  useEffect(() => {
    if (localStorage.getItem('apphr-demo-seeded-requests')) return
    const baseUserType = getUserType(signedInUser?.id || DEFAULT_USER_TYPE)
    const seedUser = { ...baseUser, ...baseUserType, ...signedInUser }
    const ownerKey = seedUser?.employeeId || seedUser?.email || seedUser?.userType
    if (!ownerKey) return

    const buildPastWeekday = (weekdaysAgo, hour, minute) => {
      const now = new Date()
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      let count = 0
      while (count < weekdaysAgo) {
        d.setDate(d.getDate() - 1)
        if (d.getDay() !== 0 && d.getDay() !== 6) count += 1
      }
      d.setHours(hour, minute, 0, 0)
      return d
    }

    const buildRequest = (date, type, status) => ({
      id: `REQ-${String(date.getTime()).slice(-6)}`,
      date: formatRequestDate(date),
      dateKey: getDateKey(date),
      approver: 'Board Level / Director Level',
      approverLevels: REQUEST_APPROVER_LEVELS,
      status,
      type,
      detail: 'Demo entry',
      ownerKey,
      employeeId: seedUser.employeeId,
      email: seedUser.email,
      userId: baseUserType.id,
      userName: seedUser.name
    })

    const demoRequests = [
      buildRequest(buildPastWeekday(2, 10, 0), 'Annual Leave', 'approved'),
      buildRequest(buildPastWeekday(5, 11, 30), 'Overtime', 'pending'),
      buildRequest(buildPastWeekday(8, 9, 0), 'Work Outside', 'rejected')
    ]

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRequestRecords((current) => {
      const existingIds = new Set(current.map((r) => r.id))
      return [...demoRequests.filter((r) => !existingIds.has(r.id)), ...current]
    })
    localStorage.setItem('apphr-demo-seeded-requests', '1')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.body.classList.toggle('login-route', path === '/login')
    document.body.classList.toggle('full-width-route', ['/', '/home', '/record', '/account', '/request', '/leave', '/overtime', '/outside', '/request-documents'].includes(path))

    return () => {
      document.body.classList.remove('login-route')
      document.body.classList.remove('full-width-route')
    }
  }, [path])

  const navigate = (nextPath) => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  const deleteCheckInRecord = (recordId) => {
    setCheckInRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId)
    )
  }

  const createRequestRecord = (request) => {
    const createdAt = new Date()
    const ownerKey = getUserRecordOwnerKey(currentUser)
    const approverLevels = getApproverLevelsForRequester(currentUser)
    const startDateKey = typeof request?.startDateKey === 'string' ? request.startDateKey : null
    const effectiveDateKey = startDateKey || getDateKey(createdAt)
    const effectiveDate = startDateKey
      ? formatRequestDate(new Date(`${startDateKey}T00:00:00`))
      : formatRequestDate(createdAt)

    setRequestRecords((currentRequests) => [
      {
        id: `REQ-${String(createdAt.getTime()).slice(-6)}`,
        ownerKey,
        employeeId: currentUser.employeeId,
        email: currentUser.email,
        userId: currentUser.userType,
        userName: currentUser.name,
        ...request,
        approver: approverLevels.join(' / '),
        approverLevels,
        status: 'pending',
        date: effectiveDate,
        dateKey: effectiveDateKey
      },
      ...currentRequests
    ])
  }

  const deleteRequestRecord = (requestId) => {
    setRequestRecords((currentRequests) =>
      currentRequests.filter((request) => {
        if (request.id !== requestId) return true
        return !isRecordOwnedByUser(request, currentUser)
      })
    )
  }

  const approveRequestRecord = (requestId) => {
    setRequestRecords((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? { ...request, status: 'approved' } : request
      )
    )
  }

  const rejectRequestRecord = (requestId) => {
    setRequestRecords((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? { ...request, status: 'rejected' } : request
      )
    )
  }

  const updateCurrentUser = (userPatch) => {
    setSignedInUser((currentUserData) => {
      const nextUserData = mergeUserAccount(currentUserData, userPatch)
      const accountId = nextUserData.id || currentUserData.id

      if (accountId) {
        setUserOverrides((currentOverrides) => ({
          ...currentOverrides,
          [accountId]: mergeUserAccount(currentOverrides[accountId] || {}, userPatch)
        }))
      }

      return nextUserData
    })
  }

  const currentUserType = getUserType(signedInUser?.id || DEFAULT_USER_TYPE)
  const userAccounts = USER_TYPES.map((userType) =>
    mergeUserAccount(userType, userOverrides[userType.id])
  )
  const currentUser = {
    ...baseUser,
    ...mergeUserAccount(currentUserType, userOverrides[currentUserType.id]),
    ...signedInUser,
    userType: currentUserType.id,
    userTypeLabel: currentUserType.label
  }
  const currentUserRecords = checkInRecords.filter((record) =>
    isRecordOwnedByUser(record, currentUser)
  )
  const currentUserLevel = currentUser?.profile?.job?.employeeLevel
  const isApprover =
    currentUserLevel === 'Board Level' || currentUserLevel === 'Director Level'
  const currentUserRequests = isApprover
    ? requestRecords.filter((record) =>
        isRequestAssignedToLevel(record, currentUserLevel) ||
        isRecordOwnedByUser(record, currentUser)
      )
    : requestRecords.filter((record) => isRecordOwnedByUser(record, currentUser))
  const teamStatusRequests = requestRecords.filter((record) =>
    record.status === 'approved' &&
    ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave'].includes(record.type)
  )
  const todayKey = getDateKey(new Date())
  const currentUserHasApprovedLeaveToday = teamStatusRequests.some((record) => {
    if (!isRecordOwnedByUser(record, currentUser)) return false
    const startKey = record.startDateKey || record.dateKey
    const endKey = record.endDateKey || startKey
    return startKey && todayKey >= startKey && todayKey <= endKey
  })
  const openCheckInFromNavigation = () => {
    if (currentUserHasApprovedLeaveToday) {
      localStorage.setItem(LEAVE_CHECKIN_WARNING_KEY, '1')
    }
    navigate('/home')
  }

  if (path === '/login') {
    return (
      <Login
        users={userAccounts}
        onSignIn={(nextUser) => {
          setSignedInUser(nextUser)
          navigate('/home')
        }}
      />
    )
  }

  if (path === '/record') {
    return (
      <Record
        records={currentUserRecords}
        currentUser={currentUser}
        onDeleteRecord={deleteCheckInRecord}
        onGoHome={() => navigate('/home')}
        onGoAccount={() => navigate('/account')}
        onGoRequest={() => navigate('/request')}
        onOpenCheckIn={openCheckInFromNavigation}
      />
    )
  }

  if (path === '/request') {
    return (
      <Request
        data={currentUserRequests}
        currentUser={currentUser}
        onDeleteRequest={deleteRequestRecord}
        onApproveRequest={approveRequestRecord}
        onRejectRequest={rejectRequestRecord}
        onCreateNew={(requestType) => {
          if (requestType === 'leave') navigate('/leave')
          if (requestType === 'overtime') navigate('/overtime')
          if (requestType === 'work-outsides') navigate('/outside')
          if (requestType === 'request-documents') navigate('/request-documents')
        }}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={openCheckInFromNavigation}
      />
    )
  }

  if (path === '/leave') {
    return (
      <Leave
        onSubmitRequest={createRequestRecord}
        currentUser={currentUser}
        requests={currentUserRequests}
        onGoBack={() => navigate('/request')}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={openCheckInFromNavigation}
      />
    )
  }

  if (path === '/overtime') {
    return (
      <Overtime
        onSubmitRequest={createRequestRecord}
        currentUser={currentUser}
        onGoBack={() => navigate('/request')}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={openCheckInFromNavigation}
      />
    )
  }

  if (path === '/outside') {
    return (
      <Outside
        onSubmitRequest={createRequestRecord}
        currentUser={currentUser}
        onGoBack={() => navigate('/request')}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={openCheckInFromNavigation}
      />
    )
  }

  if (path === '/request-documents') {
    return (
      <Requestdoc
        onSubmitRequest={createRequestRecord}
        currentUser={currentUser}
        onGoBack={() => navigate('/request')}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={openCheckInFromNavigation}
      />
    )
  }

  if (path === '/account') {
    return (
      <Account
        user={currentUser}
        onUpdateUser={updateCurrentUser}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onOpenCheckIn={openCheckInFromNavigation}
        onLogout={() => {
          localStorage.removeItem(CURRENT_USER_KEY)
          setSignedInUser(getUserType(DEFAULT_USER_TYPE))
          navigate('/login')
        }}
      />
    )
  }

  return (
    <Landing
      user={currentUser}
      requests={currentUserRequests}
      teamRequests={teamStatusRequests}
      checkInRecords={checkInRecords}
      onCheckInRecordsChange={setCheckInRecords}
      onGoRecord={() => navigate('/record')}
      onGoRequest={() => navigate('/request')}
      onGoAccount={() => navigate('/account')}
    />
  )
}

export default App
