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
import { DEFAULT_USER_TYPE, getUserType } from './User/userTypes'

const CHECK_IN_RECORDS_KEY = 'apphr-checkin-records'
const CURRENT_USER_KEY = 'apphr-current-user'
const REQUEST_RECORDS_KEY = 'apphr-request-records'

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

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [signedInUser, setSignedInUser] = useState(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY)
    return savedUser ? JSON.parse(savedUser) : getUserType(DEFAULT_USER_TYPE)
  })
  const [checkInRecords, setCheckInRecords] = useState(() => {
    const savedRecords = localStorage.getItem(CHECK_IN_RECORDS_KEY)
    return savedRecords ? JSON.parse(savedRecords) : []
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
  }, [checkInRecords])

  useEffect(() => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(signedInUser))
  }, [signedInUser])

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
      approver: 'คุณวิชัย ส.',
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
    if (nextPath === '/record') {
      const savedRecords = localStorage.getItem(CHECK_IN_RECORDS_KEY)
      setCheckInRecords(savedRecords ? JSON.parse(savedRecords) : [])
    }

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
    const startDateKey = typeof request?.startDateKey === 'string' ? request.startDateKey : null
    const effectiveDateKey = startDateKey || getDateKey(createdAt)
    const effectiveDate = startDateKey
      ? formatRequestDate(new Date(`${startDateKey}T00:00:00`))
      : formatRequestDate(createdAt)

    setRequestRecords((currentRequests) => [
      {
        id: `REQ-${String(createdAt.getTime()).slice(-6)}`,
        approver: 'คุณวิชัย ส.',
        status: 'pending',
        ownerKey,
        employeeId: currentUser.employeeId,
        email: currentUser.email,
        userId: currentUser.userType,
        userName: currentUser.name,
        ...request,
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

  const updateCurrentUser = (userPatch) => {
    setSignedInUser((currentUserData) => ({
      ...currentUserData,
      ...userPatch,
      profile: {
        ...currentUserData.profile,
        ...userPatch.profile
      }
    }))
  }

  const currentUserType = getUserType(signedInUser?.id || DEFAULT_USER_TYPE)
  const currentUser = {
    ...baseUser,
    ...currentUserType,
    ...signedInUser,
    userType: currentUserType.id,
    userTypeLabel: currentUserType.label
  }
  const currentUserRecords = checkInRecords.filter((record) =>
    isRecordOwnedByUser(record, currentUser)
  )
  const currentUserRequests = requestRecords.filter((record) =>
    isRecordOwnedByUser(record, currentUser)
  )

  if (path === '/login') {
    return (
      <Login
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
        onDeleteRecord={deleteCheckInRecord}
        onGoHome={() => navigate('/home')}
        onGoAccount={() => navigate('/account')}
        onGoRequest={() => navigate('/request')}
        onOpenCheckIn={() => navigate('/home')}
      />
    )
  }

  if (path === '/request') {
    return (
      <Request
        data={currentUserRequests}
        onDeleteRequest={deleteRequestRecord}
        onCreateNew={(requestType) => {
          if (requestType === 'leave') navigate('/leave')
          if (requestType === 'overtime') navigate('/overtime')
          if (requestType === 'work-outsides') navigate('/outside')
          if (requestType === 'request-documents') navigate('/request-documents')
        }}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={() => navigate('/home')}
      />
    )
  }

  if (path === '/leave') {
    return (
      <Leave
        onSubmitRequest={createRequestRecord}
        onGoBack={() => navigate('/request')}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={() => navigate('/home')}
      />
    )
  }

  if (path === '/overtime') {
    return (
      <Overtime
        onSubmitRequest={createRequestRecord}
        onGoBack={() => navigate('/request')}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={() => navigate('/home')}
      />
    )
  }

  if (path === '/outside') {
    return (
      <Outside
        onSubmitRequest={createRequestRecord}
        onGoBack={() => navigate('/request')}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={() => navigate('/home')}
      />
    )
  }

  if (path === '/request-documents') {
    return (
      <Requestdoc
        onSubmitRequest={createRequestRecord}
        onGoBack={() => navigate('/request')}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onGoAccount={() => navigate('/account')}
        onOpenCheckIn={() => navigate('/home')}
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
        onOpenCheckIn={() => navigate('/home')}
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
      onGoRecord={() => navigate('/record')}
      onGoRequest={() => navigate('/request')}
      onGoAccount={() => navigate('/account')}
    />
  )
}

export default App
