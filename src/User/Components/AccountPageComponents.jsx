import {
  MdClose,
  MdEdit,
  MdLock,
  MdLogout,
  MdSave,
  MdVisibility,
  MdVisibilityOff
} from 'react-icons/md';

export function AccountHeader({
  user,
  accountUser,
  job,
  active,
  isEditingGeneral,
  onStartEditGeneral,
  onCancelEditGeneral,
  onSaveEditGeneral,
  onOpenPasswordPopup,
  onLogout,
  onMessage
}) {
  return (
    <div className="up-header">
      <div className="up-avatar">{accountUser.initial}</div>
      <div className="up-headline">
        <div className="up-emp-code">{job.code}</div>
        <h1 className="up-name">{accountUser.nameTh}</h1>
        <div className="up-subtitle">
          {job.roleTh} · {accountUser.nameEn}
        </div>
        {user?.userTypeLabel && (
          <div className="up-user-type">{user.userTypeLabel}</div>
        )}
      </div>
      <div className="up-actions">
        {active === 'general' && (
          isEditingGeneral ? (
            <>
              <button className="up-btn" type="button" onClick={onCancelEditGeneral}>Cancel</button>
              <button className="up-btn up-btn--primary" type="button" onClick={onSaveEditGeneral}>
                <MdSave />
                Save
              </button>
            </>
          ) : (
            <button className="up-btn up-btn--primary" type="button" onClick={onStartEditGeneral}>
              <MdEdit />
              Edit
            </button>
          )
        )}
        <button className="up-btn" type="button" onClick={onOpenPasswordPopup}>
          <MdLock />
          Reset Password
        </button>
        {onMessage && (
          <button className="up-btn" onClick={onMessage}>ส่งข้อความ</button>
        )}
        <button
          className="up-btn up-btn--logout"
          onClick={onLogout || (() => { window.location.href = '/login'; })}
        >
          <MdLogout />
          Log out
        </button>
      </div>
    </div>
  );
}

export function AccountTabs({ tabs, active, onChange }) {
  return (
    <div className="up-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={'up-tab' + (active === tab.id ? ' is-active' : '')}
        >
          {tab.icon}
          {tab.th}
        </button>
      ))}
    </div>
  );
}

export function AccountContent({
  active,
  company,
  accountUser,
  job,
  documents,
  isEditingGeneral,
  generalDraft,
  onDraftChange,
  CompanyTab,
  GeneralTab,
  JobTab,
  BenefitsTab,
  DocsTab
}) {
  return (
    <div className="up-content">
      <div className="up-card">
        {active === 'company' && <CompanyTab c={company} />}
        {active === 'general' && (
          <GeneralTab
            u={accountUser}
            editing={isEditingGeneral}
            draft={generalDraft || accountUser}
            onDraftChange={onDraftChange}
          />
        )}
        {active === 'job' && <JobTab j={job} />}
        {active === 'benefits' && <BenefitsTab j={job} />}
        {active === 'docs' && <DocsTab documents={documents} />}
      </div>
    </div>
  );
}

export function PasswordResetModal({
  isOpen,
  success,
  error,
  currentPassword,
  newPassword,
  confirmPassword,
  showCurrent,
  showNew,
  showConfirm,
  onClose,
  onSubmit,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleCurrent,
  onToggleNew,
  onToggleConfirm
}) {
  if (!isOpen) return null;

  return (
    <div className="up-modal-overlay" onClick={onClose}>
      <div className="up-modal" onClick={(event) => event.stopPropagation()}>
        <div className="up-modal-header">
          <h3>เปลี่ยนรหัสผ่าน</h3>
          <button className="up-modal-close" type="button" onClick={onClose} aria-label="Close">
            <MdClose />
          </button>
        </div>
        <div className="up-modal-body">
          {success ? (
            <p className="up-modal-success">เปลี่ยนรหัสผ่านสำเร็จ</p>
          ) : (
            <>
              <label className="up-pw-field">
                <span>รหัสผ่านปัจจุบัน</span>
                <div className="up-pw-input-wrap">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(event) => onCurrentPasswordChange(event.target.value)}
                    autoComplete="current-password"
                    placeholder="รหัสผ่านปัจจุบัน"
                  />
                  <button type="button" className="up-pw-eye" onClick={onToggleCurrent}>
                    {showCurrent ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </label>
              <label className="up-pw-field">
                <span>รหัสผ่านใหม่</span>
                <div className="up-pw-input-wrap">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => onNewPasswordChange(event.target.value)}
                    autoComplete="new-password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                  />
                  <button type="button" className="up-pw-eye" onClick={onToggleNew}>
                    {showNew ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </label>
              <label className="up-pw-field">
                <span>ยืนยันรหัสผ่านใหม่</span>
                <div className="up-pw-input-wrap">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => onConfirmPasswordChange(event.target.value)}
                    autoComplete="new-password"
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  />
                  <button type="button" className="up-pw-eye" onClick={onToggleConfirm}>
                    {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </label>
              {error && <p className="up-modal-error">{error}</p>}
              <button
                className="up-btn up-btn--primary up-modal-submit"
                type="button"
                onClick={onSubmit}
              >
                บันทึก
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
