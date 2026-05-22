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
import {
  apiCreateCheckin,
  apiCreateRequest,
  apiDeleteCheckin,
  apiDeleteRequest,
  apiGetAllUsers,
  apiGetCheckins,
  apiGetMyEntitlement,
  apiGetRequests,
  apiGetSettings,
  apiMe,
  apiUpdateCheckin,
  apiUpdateCurrentUser,
  apiUpdateRequestStatus,
  setToken,
} from './api'
import { LEAVE_TYPE_LABEL_SET } from './leaveTypes'

const LEAVE_CHECKIN_WARNING_KEY = 'apphr-show-leave-checkin-warning'
const REQUEST_APPROVER_LEVELS = ['Board Level', 'Director Level']

const baseUser = {
  company: 'บริษัท แฮนด์ วิสาหกิจเพื่อสังคม จำกัด',
  language: 'English',
  leaveQuota: '5 days'
}

const getUserRecordOwnerKey = (user) =>
  user?.employeeId || user?.email || user?.id || ''

const getRecordOwnerKey = (record) =>
  record?.ownerKey || record?.employeeId || record?.email || record?.userId || record?.ownerId || ''

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
  const [signedInUser, setSignedInUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [checkInRecords, setCheckInRecords] = useState([])
  const [requestRecords, setRequestRecords] = useState([])
  const [entitlements, setEntitlements] = useState({})
  const [allEmployees, setAllEmployees] = useState([])
  const [settings, setSettings] = useState(null)

  // ─── Initial load: restore session via stored token ────────────────────────
  useEffect(() => {
    let cancelled = false
    apiMe()
      .then((user) => {
        if (cancelled) return
        setSignedInUser(user)
      })
      .catch(() => {
        if (!cancelled) setSignedInUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false)
      })
    return () => { cancelled = true }
  }, [])

  // ─── Load records when signed in ───────────────────────────────────────────
  const refreshRecords = async () => {
    try {
      const [checkins, reqs] = await Promise.all([
        apiGetCheckins({ scope: 'team' }),
        apiGetRequests({ scope: 'approver' }),
      ])
      setCheckInRecords(checkins || [])
      setRequestRecords(reqs || [])
    } catch {
      setCheckInRecords([])
      setRequestRecords([])
    }
  }
  useEffect(() => {
    if (!signedInUser) {
      setCheckInRecords([])
      setRequestRecords([])
      setEntitlements({})
      setAllEmployees([])
      setSettings(null)
      return
    }
    refreshRecords()
    apiGetMyEntitlement().then((e) => setEntitlements(e || {})).catch(() => setEntitlements({}))
    apiGetAllUsers().then((list) => setAllEmployees(list || [])).catch(() => setAllEmployees([]))
    apiGetSettings().then((s) => setSettings(s || null)).catch(() => setSettings(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedInUser?.id])

  // ─── Refresh team check-ins on landing page (immediate + every 60s) ──────────
  useEffect(() => {
    if (!signedInUser) return
    if (path !== '/' && path !== '/home') return
    const fetchTeamCheckins = () =>
      apiGetCheckins({ scope: 'team' })
        .then((list) => setCheckInRecords(list || []))
        .catch(() => {})
    fetchTeamCheckins()
    const id = setInterval(fetchTeamCheckins, 60_000)
    return () => clearInterval(id)
  }, [signedInUser?.id, path])

  // ─── Routing ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
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

  // ─── Mutations (all call API, then reload local state) ─────────────────────
  const deleteCheckInRecord = async (recordId) => {
    try { await apiDeleteCheckin(recordId) } catch { /* ignore */ }
    const list = await apiGetCheckins({ scope: 'team' }).catch(() => [])
    setCheckInRecords(list || [])
  }

  const createCheckInRecord = async (record) => {
    try { await apiCreateCheckin(record) } catch { /* ignore */ }
    const list = await apiGetCheckins({ scope: 'team' }).catch(() => [])
    setCheckInRecords(list || [])
  }

  const replaceCheckInRecords = async (updater) => {
    const next = typeof updater === 'function' ? updater(checkInRecords) : updater
    const safeNext = Array.isArray(next) ? next : []
    const prevById = new Map(checkInRecords.map((r) => [r.id, r]))
    const nextIds = new Set(safeNext.map((r) => r.id))
    const additions = []
    const mutations = []
    for (const r of safeNext) {
      const prev = prevById.get(r.id)
      if (!prev) {
        additions.push(r)
      } else if (JSON.stringify(prev) !== JSON.stringify(r)) {
        mutations.push(r)
      }
    }
    const removals = checkInRecords.filter((r) => !nextIds.has(r.id))
    setCheckInRecords(safeNext)
    for (const add of additions) {
      try { await apiCreateCheckin(add) } catch { /* ignore */ }
    }
    for (const mut of mutations) {
      const { id, ownerId, ownerKey, employeeId, createdAt, ...patch } = mut
      try { await apiUpdateCheckin(id, patch) } catch { /* ignore */ }
    }
    for (const rem of removals) {
      try { await apiDeleteCheckin(rem.id) } catch { /* ignore */ }
    }
    const list = await apiGetCheckins({ scope: 'team' }).catch(() => null)
    if (list) setCheckInRecords(list)
  }

  const createRequestRecord = async (request) => {
    const createdAt = new Date()
    const approverLevels = getApproverLevelsForRequester(currentUser)
    const startDateKey = typeof request?.startDateKey === 'string' ? request.startDateKey : null
    const effectiveDateKey = startDateKey || getDateKey(createdAt)
    const effectiveDate = startDateKey
      ? formatRequestDate(new Date(`${startDateKey}T00:00:00`))
      : formatRequestDate(createdAt)
    const body = {
      ...request,
      approver: approverLevels.join(' / '),
      approverLevels,
      status: 'pending',
      date: effectiveDate,
      dateKey: effectiveDateKey,
    }
    try { await apiCreateRequest(body) } catch { /* ignore */ }
    const list = await apiGetRequests({ scope: 'approver' }).catch(() => [])
    setRequestRecords(list || [])
  }

  const deleteRequestRecord = async (requestId) => {
    try { await apiDeleteRequest(requestId) } catch { /* ignore */ }
    const list = await apiGetRequests({ scope: 'approver' }).catch(() => [])
    setRequestRecords(list || [])
  }

  const approveRequestRecord = async (requestId) => {
    try { await apiUpdateRequestStatus(requestId, 'approved') } catch { /* ignore */ }
    const list = await apiGetRequests({ scope: 'approver' }).catch(() => [])
    setRequestRecords(list || [])
  }

  const rejectRequestRecord = async (requestId) => {
    try { await apiUpdateRequestStatus(requestId, 'rejected') } catch { /* ignore */ }
    const list = await apiGetRequests({ scope: 'approver' }).catch(() => [])
    setRequestRecords(list || [])
  }

  const updateCurrentUser = async (userPatch) => {
    try {
      const updated = await apiUpdateCurrentUser(userPatch)
      setSignedInUser(updated)
    } catch { /* ignore */ }
  }

  // ─── Derived state ─────────────────────────────────────────────────────────
  const currentUser = signedInUser
    ? {
        ...baseUser,
        ...signedInUser,
        userType: signedInUser.id,
        userTypeLabel: signedInUser.label || signedInUser.profile?.job?.employeeLevel || '',
      }
    : null

  const currentUserRecords = currentUser
    ? checkInRecords.filter((record) => isRecordOwnedByUser(record, currentUser))
    : []

  const currentUserLevel = currentUser?.profile?.job?.employeeLevel
  const isApprover =
    currentUserLevel === 'Board Level' || currentUserLevel === 'Director Level'
  const currentUserRequests = currentUser
    ? (isApprover
        ? requestRecords.filter((record) =>
            isRequestAssignedToLevel(record, currentUserLevel) ||
            isRecordOwnedByUser(record, currentUser)
          )
        : requestRecords.filter((record) => isRecordOwnedByUser(record, currentUser)))
    : []

  const teamStatusRequests = requestRecords.filter((record) =>
    record.status === 'approved' && LEAVE_TYPE_LABEL_SET.has(record.type)
  )
  const todayKey = getDateKey(new Date())
  const currentUserHasApprovedLeaveToday = currentUser ? teamStatusRequests.some((record) => {
    if (!isRecordOwnedByUser(record, currentUser)) return false
    const startKey = record.startDateKey || record.dateKey
    const endKey = record.endDateKey || startKey
    return startKey && todayKey >= startKey && todayKey <= endKey
  }) : false

  const openCheckInFromNavigation = () => {
    if (currentUserHasApprovedLeaveToday) {
      localStorage.setItem(LEAVE_CHECKIN_WARNING_KEY, '1')
    }
    navigate('/home')
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loadingUser) {
    return <main className="login-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>กำลังโหลด…</p>
    </main>
  }

  if (!currentUser || path === '/login') {
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
        entitlements={entitlements}
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
        settings={settings}
        onUpdateUser={updateCurrentUser}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onOpenCheckIn={openCheckInFromNavigation}
        onLogout={() => {
          setToken(null)
          setSignedInUser(null)
          navigate('/login')
        }}
      />
    )
  }

  return (
    <Landing
      user={currentUser}
      entitlements={entitlements}
      requests={currentUserRequests}
      teamRequests={teamStatusRequests}
      checkInRecords={checkInRecords}
      onCheckInRecordsChange={replaceCheckInRecords}
      onCreateCheckIn={createCheckInRecord}
      allEmployees={allEmployees}
      onGoRecord={() => navigate('/record')}
      onGoRequest={() => navigate('/request')}
      onGoAccount={() => navigate('/account')}
    />
  )
}

export default App
