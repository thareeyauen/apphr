import { useEffect, useState } from 'react'
import Account from './User/Account'
import Landing from './User/Landing'
import Leave from './User/Leave'
import Login from './User/Login'
import Overtime from './User/Overtime'
import Outside from './User/Oueside'
import Record from './User/Record'
import Request from './User/Request'

const CHECK_IN_RECORDS_KEY = 'apphr-checkin-records'

const mockUser = {
  name: 'Thareeya Uentrakul',
  position: 'Project Coordinator',
  employeeId: 'HAND23',
  company: 'บริษัท แฮนด์ วิสาหกิจเพื่อสังคม จำกัด',
  language: 'English',
  leaveQuota: '5 days'
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [checkInRecords, setCheckInRecords] = useState(() => {
    const savedRecords = localStorage.getItem(CHECK_IN_RECORDS_KEY)
    return savedRecords ? JSON.parse(savedRecords) : []
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
    document.body.classList.toggle('login-route', path === '/login')
    document.body.classList.toggle('full-width-route', ['/', '/home', '/record', '/account', '/request', '/leave', '/overtime', '/outside'].includes(path))

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

  if (path === '/login') {
    return <Login onSignIn={() => navigate('/home')} />
  }

  if (path === '/record') {
    return (
      <Record
        records={checkInRecords}
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
        onCreateNew={(requestType) => {
          if (requestType === 'leave') navigate('/leave')
          if (requestType === 'overtime') navigate('/overtime')
          if (requestType === 'work-outsides') navigate('/outside')
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
        user={mockUser}
        onGoHome={() => navigate('/home')}
        onGoRecord={() => navigate('/record')}
        onGoRequest={() => navigate('/request')}
        onOpenCheckIn={() => navigate('/home')}
      />
    )
  }

  return (
    <Landing
      onGoRecord={() => navigate('/record')}
      onGoRequest={() => navigate('/request')}
      onGoAccount={() => navigate('/account')}
    />
  )
}

export default App
