import { useState, useMemo } from "react";
import {
  MdAttachMoney,
  MdBeachAccess,
  MdCheck,
  MdClose,
  MdDescription,
  MdDelete,
  MdHomeWork,
  MdMoreTime,
} from "react-icons/md";
import BottomNav from "./Components/BottomNav";
import "./Request.css";

const REQUESTS = [
  {
    id: "REQ-1042",
    type: "ขออุปกรณ์ทำงาน",
    detail: "Mouse + Keyboard ergonomic",
    date: "28 เม.ย. 2026",
    approver: "คุณวิชัย ส.",
    status: "pending",
  },
  {
    id: "REQ-1041",
    type: "เบิกค่าใช้จ่าย",
    detail: "ค่าเดินทางพบลูกค้า — ฿2,450",
    date: "26 เม.ย. 2026",
    approver: "คุณสุดา พ.",
    status: "approved",
  },
  {
    id: "REQ-1038",
    type: "ลาพักร้อน",
    detail: "5–9 พ.ค. 2026 (5 วัน)",
    date: "22 เม.ย. 2026",
    approver: "คุณวิชัย ส.",
    status: "approved",
  },
  {
    id: "REQ-1035",
    type: "ขอเข้าถึงระบบ",
    detail: "Production database (read-only)",
    date: "20 เม.ย. 2026",
    approver: "ฝ่าย IT Security",
    status: "pending",
  },
  {
    id: "REQ-1031",
    type: "เบิกค่าอบรม",
    detail: "หลักสูตร UX Research — ฿15,000",
    date: "15 เม.ย. 2026",
    approver: "คุณสุดา พ.",
    status: "rejected",
  },
  {
    id: "REQ-1029",
    type: "ลาป่วย",
    detail: "12 เม.ย. 2026 (1 วัน)",
    date: "12 เม.ย. 2026",
    approver: "คุณวิชัย ส.",
    status: "approved",
  },
];

const STATUS_LABEL = {
  approved: "อนุมัติ",
  pending: "รออนุมัติ",
  rejected: "ไม่อนุมัติ",
};

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ไม่อนุมัติ" },
];

const CREATE_REQUEST_OPTIONS = [
  { key: "leave", label: "Leave", icon: <MdBeachAccess /> },
  { key: "overtime", label: "Overtime", icon: <MdMoreTime /> },
  { key: "work-outsides", label: "Work Outsides", icon: <MdHomeWork /> },
  { key: "request-documents", label: "Request documents", icon: <MdDescription /> },
  { key: "expense", label: "Expense", icon: <MdAttachMoney /> },
];

const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  return (
    <span className={`request-badge request-badge--${status}`}>
      <span className="request-badge__dot" />
      {STATUS_LABEL[status]}
    </span>
  );
}

const getSubmitterLabel = (request) =>
  request.userName || request.employeeId || request.email || request.userId || '-';

const APPROVER_LEVELS = ['Board Level', 'Director Level'];

export default function Request({
  data = REQUESTS,
  currentUser,
  onDeleteRequest,
  onApproveRequest,
  onRejectRequest,
  onCreateNew,
  onGoHome,
  onGoRecord,
  onGoAccount,
  onOpenCheckIn,
  isCheckInDisabled = false,
}) {
  const canApprove = APPROVER_LEVELS.includes(
    currentUser?.profile?.job?.employeeLevel
  );
  const isBoardLevel = currentUser?.profile?.job?.employeeLevel === 'Board Level';
  const isExemptFromCheckIn = isCheckInDisabled || currentUser?.profile?.job?.employeeLevel === 'Board Level' || currentUser?.profile?.job?.employeeLevel === 'Director Level';
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [requestToReview, setRequestToReview] = useState(null);
  const [minePage, setMinePage] = useState(1);
  const [approvePage, setApprovePage] = useState(1);
  const [statsView, setStatsView] = useState("mine");

  const userOwnerKey =
    currentUser?.employeeId || currentUser?.email || currentUser?.userType || "";
  const isOwnedByCurrentUser = (record) => {
    if (!userOwnerKey) return false;
    const recordKey =
      record?.ownerKey ||
      record?.employeeId ||
      record?.email ||
      record?.userId ||
      "";
    return recordKey === userOwnerKey;
  };

  const myData = useMemo(
    () => data.filter(isOwnedByCurrentUser),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, userOwnerKey]
  );

  const approveData = useMemo(() => {
    if (!canApprove) return [];
    return data.filter((r) => !isOwnedByCurrentUser(r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, canApprove, userOwnerKey]);

  const pendingApproveCount = useMemo(
    () => approveData.filter((r) => r.status === 'pending').length,
    [approveData]
  );

  const statsSource =
    isBoardLevel || (canApprove && statsView === "approve") ? approveData : myData;
  const stats = useMemo(
    () => ({
      total: statsSource.length,
      approved: statsSource.filter((d) => d.status === "approved").length,
      pending: statsSource.filter((d) => d.status === "pending").length,
      rejected: statsSource.filter((d) => d.status === "rejected").length,
    }),
    [statsSource]
  );

  const applySearchAndStatus = (rows) => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => {
        const matchStatus = filter === "all" || r.status === filter;
        const matchQuery =
          !q ||
          r.id.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.detail.toLowerCase().includes(q);
        return matchStatus && matchQuery;
      })
      .sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return 0;
      });
  };

  const filteredMine = useMemo(
    () => applySearchAndStatus(myData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myData, filter, query]
  );
  const filteredApprove = useMemo(
    () => applySearchAndStatus(approveData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [approveData, filter, query]
  );

  const minePageCount = Math.max(1, Math.ceil(filteredMine.length / PAGE_SIZE));
  const mineCurrentPage = Math.min(minePage, minePageCount);
  const visibleMine = useMemo(() => {
    const startIndex = (mineCurrentPage - 1) * PAGE_SIZE;
    return filteredMine.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredMine, mineCurrentPage]);

  const approvePageCount = Math.max(1, Math.ceil(filteredApprove.length / PAGE_SIZE));
  const approveCurrentPage = Math.min(approvePage, approvePageCount);
  const visibleApprove = useMemo(() => {
    const startIndex = (approveCurrentPage - 1) * PAGE_SIZE;
    return filteredApprove.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredApprove, approveCurrentPage]);

  const handleCreate = () => {
    setShowCreateMenu(true);
  };

  const handleSelectCreateOption = (optionKey) => {
    setShowCreateMenu(false);
    if (onCreateNew) onCreateNew(optionKey);
  };

  const handleConfirmDelete = () => {
    if (!requestToDelete) return;
    onDeleteRequest?.(requestToDelete.id);
    setRequestToDelete(null);
  };

  const handleConfirmReview = () => {
    if (!requestToReview) return;
    if (requestToReview.action === "approve") {
      onApproveRequest?.(requestToReview.request.id);
    } else if (requestToReview.action === "reject") {
      onRejectRequest?.(requestToReview.request.id);
    }
    setRequestToReview(null);
  };

  const renderRequestTable = ({
    title,
    rows,
    totalCount,
    countLabel,
    pageNumber,
    pageCount,
    onPageChange,
    emptyMessage,
    showSubmitter = false,
    renderActions,
  }) => (
    <section className="request-table-block">
      <div className="request-table-title-row">
        <h2 className="request-table-title">{title}</h2>
        <span className="request-table-count">
          {countLabel || `${totalCount} รายการ`}
        </span>
      </div>
      <section className="request-table" role="table">
        <div className={`request-table__head${showSubmitter ? ' request-table__head--review' : ''}`} role="row">
          <div role="columnheader">รหัสคำขอ</div>
          {showSubmitter && <div role="columnheader">ผู้ส่ง</div>}
          <div role="columnheader">ประเภท / รายละเอียด</div>
          <div role="columnheader">วันที่ส่ง</div>
          <div role="columnheader">ผู้อนุมัติ</div>
          <div role="columnheader">สถานะ</div>
          <div role="columnheader">Action</div>
        </div>

        {totalCount === 0 ? (
          <div className="request-empty">{emptyMessage}</div>
        ) : (
          rows.map((r) => (
            <div className={`request-row${showSubmitter ? ' request-row--review' : ''}`} role="row" key={r.id}>
              <div className="request-row__id">{r.id}</div>
              {showSubmitter && (
                <div className="request-row__submitter">
                  <strong>{getSubmitterLabel(r)}</strong>
                  {r.employeeId && r.userName && <span>{r.employeeId}</span>}
                </div>
              )}
              <div className="request-row__type">
                <div className="request-row__type-name">{r.type}</div>
                <div className="request-row__type-detail">{r.detail}</div>
              </div>
              <div className="request-row__date">{r.date}</div>
              <div className="request-row__approver">{r.approver}</div>
              <div>
                <StatusBadge status={r.status} />
              </div>
              <div className="request-row__actions">{renderActions(r)}</div>
            </div>
          ))
        )}
      </section>

      <footer className="request-footer">
        <span className="request-footer__info">
          แสดง {totalCount === 0 ? 0 : (pageNumber - 1) * PAGE_SIZE + 1}–
          {Math.min(pageNumber * PAGE_SIZE, totalCount)} จาก {totalCount} รายการ
        </span>
        {totalCount > PAGE_SIZE && (
          <div className="request-pagination">
            <button
              type="button"
              className="request-btn request-btn--page"
              onClick={() => onPageChange((p) => Math.max(1, p - 1))}
              disabled={pageNumber === 1}
              aria-label="ก่อนหน้า"
            >
              ‹
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (n) => (
                <button
                  type="button"
                  key={n}
                  className={`request-btn request-btn--page ${
                    pageNumber === n ? "request-btn--active" : ""
                  }`}
                  onClick={() => onPageChange(n)}
                >
                  {n}
                </button>
              )
            )}
            <button
              type="button"
              className="request-btn request-btn--page"
              onClick={() => onPageChange((p) => Math.min(pageCount, p + 1))}
              disabled={pageNumber === pageCount}
              aria-label="ถัดไป"
            >
              ›
            </button>
          </div>
        )}
      </footer>
    </section>
  );

  return (
    <div className="request-page">
      <header className="request-header">
        <div>
          <h1 className="request-title">{isBoardLevel ? 'คำขอที่ต้องรีวิว' : 'คำขอของฉัน'}</h1>
          <p className="request-subtitle">
            {isBoardLevel
              ? 'ตรวจสอบและอนุมัติคำขอจากทีมต่างๆ ขององค์กร'
              : 'ประวัติคำขอทั้งหมดที่คุณเคยส่ง พร้อมสถานะล่าสุด'}
          </p>
        </div>
        {!isBoardLevel && (
          <button
            type="button"
            className="request-btn request-btn--primary"
            onClick={handleCreate}
          >
            + สร้างคำขอใหม่
          </button>
        )}
      </header>

      {canApprove && !isBoardLevel && (
        <div className="request-stats-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={statsView === "mine"}
            className={`request-stats-tab ${
              statsView === "mine" ? "request-stats-tab--active" : ""
            }`}
            onClick={() => setStatsView("mine")}
          >
            My Requests
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statsView === "approve"}
            className={`request-stats-tab ${
              statsView === "approve" ? "request-stats-tab--active" : ""
            }`}
            onClick={() => setStatsView("approve")}
          >
            Requests for Review
            {pendingApproveCount > 0 && (
              <span className="request-tab-badge">{pendingApproveCount}</span>
            )}
          </button>
        </div>
      )}

      <section className="request-stats">
        <div className="request-stat">
          <span className="request-stat__label">ทั้งหมด</span>
          <span className="request-stat__value">{stats.total}</span>
        </div>
        <div className="request-stat">
          <span className="request-stat__label">อนุมัติแล้ว</span>
          <span className="request-stat__value request-stat__value--approved">
            {stats.approved}
          </span>
        </div>
        <div className="request-stat">
          <span className="request-stat__label">รออนุมัติ</span>
          <span className="request-stat__value request-stat__value--pending">
            {stats.pending}
          </span>
        </div>
        <div className="request-stat">
          <span className="request-stat__label">ไม่อนุมัติ</span>
          <span className="request-stat__value request-stat__value--rejected">
            {stats.rejected}
          </span>
        </div>
      </section>

      <section className="request-toolbar">
        <div className="request-search-group">
          <input
            type="text"
            className="request-search"
            placeholder="ค้นหารหัสคำขอหรือประเภท..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setMinePage(1);
              setApprovePage(1);
            }}
          />
          <select
            className="request-filter-select"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setMinePage(1);
              setApprovePage(1);
            }}
            aria-label="กรองตามสถานะ"
          >
            {FILTERS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {!isBoardLevel && renderRequestTable({
        title: "My Requests",
        rows: visibleMine,
        totalCount: filteredMine.length,
        pageNumber: mineCurrentPage,
        pageCount: minePageCount,
        onPageChange: setMinePage,
        emptyMessage: "ไม่พบรายการคำขอที่ตรงกับเงื่อนไข",
        renderActions: (r) =>
          r.status === "approved" ? null : (
            <button
              type="button"
              className="request-delete"
              onClick={() => setRequestToDelete(r)}
              aria-label={`Delete request ${r.id}`}
              title="Delete request"
            >
              <MdDelete />
            </button>
          ),
      })}

      {canApprove &&
        renderRequestTable({
          title: "Requests for Review",
          rows: visibleApprove,
          totalCount: filteredApprove.length,
          countLabel: `รออนุมัติ ${
            approveData.filter((r) => r.status === "pending").length
          } รายการ`,
          pageNumber: approveCurrentPage,
          pageCount: approvePageCount,
          onPageChange: setApprovePage,
          emptyMessage: "ไม่มีคำขอที่ตรงกับเงื่อนไข",
          showSubmitter: true,
          renderActions: (r) =>
            r.status === "pending" ? (
              <>
                <button
                  type="button"
                  className="request-approve request-approve--icon"
                  onClick={() =>
                    setRequestToReview({ request: r, action: "approve" })
                  }
                  aria-label={`Approve request ${r.id}`}
                  title="Approve request"
                >
                  <MdCheck />
                </button>
                <button
                  type="button"
                  className="request-reject request-reject--icon"
                  onClick={() =>
                    setRequestToReview({ request: r, action: "reject" })
                  }
                  aria-label={`Reject request ${r.id}`}
                  title="Reject request"
                >
                  <MdClose />
                </button>
              </>
            ) : null,
        })}

      {showCreateMenu && (
        <div
          className="create-request-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-request-title"
        >
          <div className="create-request-panel">
            <button
              type="button"
              className="create-request-close"
              onClick={() => setShowCreateMenu(false)}
              aria-label="Close create request menu"
            >
              <MdClose />
            </button>
            <h2 id="create-request-title">Create Request</h2>
            <div className="create-request-list">
              {CREATE_REQUEST_OPTIONS.map((option) => (
                <button
                  type="button"
                  className="create-request-option"
                  key={option.key}
                  onClick={() => handleSelectCreateOption(option.key)}
                >
                  <span className="create-request-icon">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {requestToDelete && (
        <div
          className="delete-request-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-request-title"
        >
          <div className="delete-request-panel">
            <button
              type="button"
              className="delete-request-close"
              onClick={() => setRequestToDelete(null)}
              aria-label="Close delete confirmation"
            >
              <MdClose />
            </button>
            <h2 id="delete-request-title">Delete Request</h2>
            <p>
              Are you sure you want to delete {requestToDelete.id}?
            </p>
            <div className="delete-request-summary">
              <strong>{requestToDelete.type}</strong>
              <span>{requestToDelete.detail}</span>
            </div>
            <div className="delete-request-actions">
              <button
                type="button"
                className="request-btn"
                onClick={() => setRequestToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="request-btn request-btn--danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {requestToReview && (
        <div
          className="delete-request-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-request-title"
        >
          <div className="delete-request-panel">
            <button
              type="button"
              className="delete-request-close"
              onClick={() => setRequestToReview(null)}
              aria-label="Close confirmation"
            >
              <MdClose />
            </button>
            <h2 id="review-request-title">
              {requestToReview.action === "approve"
                ? "ยืนยันการอนุมัติ"
                : "ยืนยันการไม่อนุมัติ"}
            </h2>
            <p>
              {requestToReview.action === "approve"
                ? `ต้องการอนุมัติคำขอ ${requestToReview.request.id} ใช่หรือไม่?`
                : `ต้องการไม่อนุมัติคำขอ ${requestToReview.request.id} ใช่หรือไม่?`}
            </p>
            <div className="delete-request-summary">
              <strong>{requestToReview.request.type}</strong>
              <span>{requestToReview.request.detail}</span>
            </div>
            <div className="delete-request-actions">
              <button
                type="button"
                className="request-btn"
                onClick={() => setRequestToReview(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={
                  requestToReview.action === "approve"
                    ? "request-btn request-btn--success"
                    : "request-btn request-btn--danger"
                }
                onClick={handleConfirmReview}
              >
                {requestToReview.action === "approve"
                  ? "ยืนยันอนุมัติ"
                  : "ยืนยันไม่อนุมัติ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav
        activePage="request"
        isExemptFromCheckIn={isExemptFromCheckIn}
        onGoHome={onGoHome}
        onGoRecord={onGoRecord}
        onOpenCheckIn={onOpenCheckIn}
        onGoRequest={undefined}
        onGoAccount={onGoAccount}
      />
    </div>
  );
}
