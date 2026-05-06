import { useState, useMemo } from "react";
import {
  MdAccessTime,
  MdAssignment,
  MdAttachMoney,
  MdBeachAccess,
  MdClose,
  MdDescription,
  MdDelete,
  MdHome,
  MdHomeWork,
  MdMoreTime,
  MdPerson,
  MdSchedule,
} from "react-icons/md";
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

export default function Request({
  data = REQUESTS,
  onDeleteRequest,
  onCreateNew,
  onGoHome,
  onGoRecord,
  onGoAccount,
  onOpenCheckIn,
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [page, setPage] = useState(1);

  const stats = useMemo(
    () => ({
      total: data.length,
      approved: data.filter((d) => d.status === "approved").length,
      pending: data.filter((d) => d.status === "pending").length,
      rejected: data.filter((d) => d.status === "rejected").length,
    }),
    [data]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((r) => {
      const matchStatus = filter === "all" || r.status === filter;
      const matchQuery =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.detail.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [data, filter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shouldShowPagination = filtered.length > PAGE_SIZE;
  const currentPage = Math.min(page, pageCount);
  const visibleRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, currentPage]);

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

  return (
    <div className="request-page">
      <header className="request-header">
        <div>
          <h1 className="request-title">คำขอของฉัน</h1>
          <p className="request-subtitle">
            ประวัติคำขอทั้งหมดที่คุณเคยส่ง พร้อมสถานะล่าสุด
          </p>
        </div>
        <button
          type="button"
          className="request-btn request-btn--primary"
          onClick={handleCreate}
        >
          + สร้างคำขอใหม่
        </button>
      </header>

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
        <div className="request-tabs" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`request-tab ${
                filter === f.key ? "request-tab--active" : ""
              }`}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="request-search"
          placeholder="ค้นหารหัสคำขอหรือประเภท..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </section>

      <section className="request-table" role="table">
        <div className="request-table__head" role="row">
          <div role="columnheader">รหัสคำขอ</div>
          <div role="columnheader">ประเภท / รายละเอียด</div>
          <div role="columnheader">วันที่ส่ง</div>
          <div role="columnheader">ผู้อนุมัติ</div>
          <div role="columnheader">สถานะ</div>
          <div role="columnheader">Action</div>
        </div>

        {filtered.length === 0 ? (
          <div className="request-empty">ไม่พบรายการคำขอที่ตรงกับเงื่อนไข</div>
        ) : (
          visibleRequests.map((r) => (
            <div className="request-row" role="row" key={r.id}>
              <div className="request-row__id">{r.id}</div>
              <div className="request-row__type">
                <div className="request-row__type-name">{r.type}</div>
                <div className="request-row__type-detail">{r.detail}</div>
              </div>
              <div className="request-row__date">{r.date}</div>
              <div className="request-row__approver">{r.approver}</div>
              <div>
                <StatusBadge status={r.status} />
              </div>
              <div className="request-row__actions">
                <button
                  type="button"
                  className="request-delete"
                  onClick={() => setRequestToDelete(r)}
                  aria-label={`Delete request ${r.id}`}
                  title="Delete request"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <footer className="request-footer">
        <span className="request-footer__info">
          แสดง {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} จาก {filtered.length} รายการ
        </span>
        {shouldShowPagination && (
          <div className="request-pagination">
            <button
              type="button"
              className="request-btn request-btn--page"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="ก่อนหน้า"
            >
              ‹
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={`request-btn request-btn--page ${currentPage === pageNumber ? "request-btn--active" : ""}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="request-btn request-btn--page"
              onClick={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
              disabled={currentPage === pageCount}
              aria-label="ถัดไป"
            >
              ›
            </button>
          </div>
        )}
      </footer>

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
        <button className="nav-item active">
          <span className="nav-icon"><MdAssignment /></span>
          <span className="nav-label">Requests</span>
        </button>
        <button className="nav-item" onClick={onGoAccount}>
          <span className="nav-icon"><MdPerson /></span>
          <span className="nav-label">My Account</span>
        </button>
      </div>
    </div>
  );
}
