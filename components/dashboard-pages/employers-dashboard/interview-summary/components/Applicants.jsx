"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";

/* ============================================================
 *  HELPERS
 * ============================================================ */

const INTERVIEW_STAGES = [
  { key: "Applied", label: "Applied", icon: "la la-file-alt" },
  { key: "Interview", label: "Interview", icon: "la la-comments" },
  { key: "Technical Round", label: "Technical Round", icon: "la la-code" },
  { key: "HR Round", label: "HR Round", icon: "la la-user-tie" },
  { key: "Offer", label: "Offer", icon: "la la-file-contract" },
  { key: "Joined", label: "Joined", icon: "la la-user-check" },
  { key: "Review Submitted", label: "Review Submitted", icon: "la la-star" },
];

const STATUS_ALIASES = {
  applied: "Applied",
  "in process": "Interview",
  "in-process": "Interview",
  shortlisted: "Interview",
  interview: "Interview",
  "interview scheduled": "Interview",
  "technical round": "Technical Round",
  technical: "Technical Round",
  "hr round": "HR Round",
  hr: "HR Round",
  "selected candidate": "Offer",
  selected: "Offer",
  "offer accept": "Offer",
  "offer accepted": "Offer",
  "offer reject": "Offer",
  "offer rejected": "Offer",
  offer: "Offer",
  joined: "Joined",
  absconding: "Joined",
  "not joined": "Joined",
  deleted: "Deleted",
  "rejected candidate": "Rejected",
  rejected: "Rejected",
};

const normalizeStatus = (value) => {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  return STATUS_ALIASES[key] || null;
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateOnly = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ============================================================
 *  SMALL UI COMPONENTS
 * ============================================================ */

const JoiningStarRating = ({ label, name, value, onChange, error }) => (
  <div className="col-md-6 m-0">
    <label className="form-label fw-normal">{label}</label>
    <div className="d-flex align-items-center gap-2">
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`rating-star ${star <= Number(value) ? "active" : "inactive"}`}
            onClick={() => onChange(name, star)}
            aria-label={`Rate ${label} ${star} out of 5`}
          >
            ★
          </button>
        ))}
      </div>
      <small className="text-muted">{value}/5</small>
    </div>
    {error && <div className="text-danger small">{error}</div>}
  </div>
);

const SummaryStat = ({ icon, label, value, tone = "default" }) => (
  <div className={`jt-stat jt-stat-${tone}`}>
    <div className="jt-stat-icon">
      <i className={icon}></i>
    </div>
    <div className="jt-stat-body">
      <div className="jt-stat-label">{label}</div>
      <div className="jt-stat-value">{value}</div>
    </div>
  </div>
);

/* ============================================================
 *  TIMELINE PANEL
 * ============================================================ */

const CandidateJourney = ({ candidate, interviewSchedules = [], commentList = [] }) => {
  const [activeTab, setActiveTab] = useState("timeline");

  /* ---------- derive stages ---------- */
  const { stages, currentStageIndex } = useMemo(() => {
    const derived = INTERVIEW_STAGES.map((stage) => ({
      ...stage,
      status: "pending",
      meta: null,
    }));

    const statusKey = normalizeStatus(candidate.status);

    // Applied: always done
    derived[0].status = "done";
    derived[0].meta = formatDate(candidate.appliedOn || candidate.appliedDate);

    // Interview: if any interview schedule exists OR status moved past Applied
    const hasInterview = (interviewSchedules || []).length > 0;
    if (hasInterview || ["Interview", "Technical Round", "HR Round", "Offer", "Joined"].includes(statusKey)) {
      derived[1].status = "done";
      const latest = (interviewSchedules || [])[0];
      derived[1].meta = latest ? formatDate(latest.INTER_DATE) : null;
    }

    // Technical Round
    const techSchedule = (interviewSchedules || []).find((s) =>
      String(s.INTER_TYPE || "").toLowerCase().includes("technical")
    );
    if (techSchedule || ["Technical Round", "HR Round", "Offer", "Joined"].includes(statusKey)) {
      derived[2].status = "done";
      derived[2].meta = techSchedule ? formatDate(techSchedule.INTER_DATE) : null;
    }

    // HR Round
    const hrSchedule = (interviewSchedules || []).find((s) =>
      String(s.INTER_TYPE || "").toLowerCase().includes("hr")
    );
    if (hrSchedule || ["HR Round", "Offer", "Joined"].includes(statusKey)) {
      derived[3].status = "done";
      derived[3].meta = hrSchedule ? formatDate(hrSchedule.INTER_DATE) : null;
    }

    // Offer
    const offerTouched = ["Offer", "Joined"].includes(statusKey) ||
      ["Offer Accept", "Offer Reject"].includes(candidate.status);
    if (offerTouched) {
      derived[4].status = "done";
      if (candidate.status === "Offer Accept") derived[4].meta = "Offer Accepted";
      else if (candidate.status === "Offer Reject") derived[4].meta = "Offer Rejected";
    }

    // Joined / Absconding / Not Joined
    const joiningStatus = normalizeJoining(candidate.joiningStatus);
    if (joiningStatus || statusKey === "Joined") {
      derived[5].status = "done";
      derived[5].meta =
        joiningStatus === "Joined"
          ? `Joined on ${formatDateOnly(candidate.joiningDate)}`
          : joiningStatus === "Absconding"
            ? `Absconded on ${formatDateOnly(candidate.abscondingDate)}`
            : joiningStatus === "Not Joined"
              ? "Did not join"
              : "Joined";
    }

    // Review submitted
    const hasReview =
      Number(candidate.totalRating || 0) > 0 ||
      (candidate.review && candidate.review !== "0^0^0^0") ||
      !!candidate.joiningReview;
    if (hasReview) {
      derived[6].status = "done";
      derived[6].meta = `Avg ${Number(candidate.avgRating || 0).toFixed(1)} ★ (${candidate.totalRating || 0} reviews)`;
    }

    // If rejected/deleted, mark current stage as danger and stop
    let current = derived.findIndex((s) => s.status === "pending");
    if (current === -1) current = derived.length - 1;
    else current = Math.max(0, current - 1);

    if (statusKey === "Rejected" || statusKey === "Deleted") {
      derived[Math.max(0, current)].status = "danger";
    }

    return { stages: derived, currentStageIndex: current };
  }, [candidate, interviewSchedules]);

  function normalizeJoining(v) {
    if (!v) return null;
    const k = String(v).trim().toLowerCase();
    if (k === "joined") return "Joined";
    if (k === "absconding") return "Absconding";
    if (k === "not joined") return "Not Joined";
    return null;
  }

  /* ---------- summary numbers ---------- */
  const totalInterviews = (interviewSchedules || []).length;
  const totalComments = (commentList || []).length;
  const totalDocuments =
    (Array.isArray(candidate.joiningDocuments) ? candidate.joiningDocuments.length : 0) +
    (candidate.reviewFile ? 1 : 0);

  const ratings = String(candidate.review || "")
    .split("^")
    .map((n) => Number(n) || 0);
  const ratingRows = [
    { label: "Communication", value: ratings[0] },
    { label: "Interview", value: ratings[1] },
    { label: "Cultural Fit", value: ratings[2] },
    { label: "Overall", value: ratings[3] },
  ];

  return (
    <div className="jt-panel">
      {/* ---------- Header strip ---------- */}
      <div className="jt-header">
        <div className="jt-header-left">
          <div className="jt-avatar-wrap">
            <Image
              src={candidate.avatar}
              alt={candidate.candiName}
              width={56}
              height={56}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
          <div>
            <div className="jt-title">
              {candidate.candiName}
              {candidate.verifyStatus?.toLowerCase() === "verified" && (
                <i className="fa fa-check-circle text-success ms-2"></i>
              )}
            </div>
            <div className="jt-subtitle">
              {candidate.jobTitle || "—"} · {candidate.currentCompany || "—"}
            </div>
          </div>
        </div>
        <div className="jt-header-right">
          <span className={`jt-status-pill jt-status-${(candidate.status || "applied").toLowerCase().replace(/\s+/g, "-")}`}>
            {candidate.status || "Applied"}
          </span>
        </div>
      </div>

      {/* ---------- Summary stats ---------- */}
      <div className="jt-stats">
        <SummaryStat icon="la la-briefcase" label="Experience" value={candidate.experience || "—"} />
        <SummaryStat icon="la la-calendar" label="Notice" value={candidate.noticePeriod || "—"} />
        <SummaryStat icon="la la-money" label="Current CTC" value={`₹ ${candidate.curentSalary || "—"}`} />
        <SummaryStat icon="la la-map-marker" label="Location" value={candidate.workingLocation || "—"} />
        <SummaryStat icon="la la-comments" label="Interviews" value={totalInterviews} tone="info" />
        <SummaryStat icon="la la-comment-dots" label="Comments" value={totalComments} tone="muted" />
        <SummaryStat icon="la la-file" label="Documents" value={totalDocuments} tone="muted" />
        <SummaryStat icon="la la-star" label="Avg Rating" value={`${Number(candidate.avgRating || 0).toFixed(1)} ★`} tone="success" />
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="jt-tabs">
        {[
          { key: "timeline", label: "Hiring Timeline", icon: "la la-stream" },
          { key: "ratings", label: "Performance", icon: "la la-star" },
          { key: "evidence", label: "Evidence & Docs", icon: "la la-folder-open" },
          { key: "notes", label: "Comments", icon: "la la-comment" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={`jt-tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            <i className={t.icon}></i> {t.label}
          </button>
        ))}
      </div>

      {/* ---------- Tab body ---------- */}
      <div className="jt-body">
        {/* ============ TIMELINE ============ */}
        {activeTab === "timeline" && (
          <div className="jt-timeline">
            {stages.map((stage, idx) => {
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={stage.key}
                  className={`jt-step jt-step-${stage.status} ${isCurrent ? "jt-step-current" : ""}`}
                >
                  <div className="jt-step-marker">
                    <i className={stage.status === "done" ? "la la-check" : stage.icon}></i>
                  </div>
                  <div className="jt-step-line"></div>
                  <div className="jt-step-content">
                    <div className="jt-step-title">
                      {stage.label}
                      {isCurrent && <span className="jt-current-tag">Current</span>}
                      {stage.status === "danger" && (
                        <span className="jt-danger-tag">Rejected</span>
                      )}
                    </div>
                    {stage.meta && <div className="jt-step-meta">{stage.meta}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============ RATINGS ============ */}
        {activeTab === "ratings" && (
          <div className="jt-ratings">
            {ratingRows.map((r) => (
              <div key={r.label} className="jt-rating-row">
                <div className="jt-rating-label">{r.label}</div>
                <div className="jt-rating-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <i
                      key={s}
                      className={`la ${s <= r.value ? "la-star filled" : "lar la-star"}`}
                    ></i>
                  ))}
                </div>
                <div className="jt-rating-value">{r.value}/5</div>
              </div>
            ))}

            <div className="jt-ratings-footer">
              <div>
                <strong>Overall:</strong>{" "}
                {Number(candidate.avgRating || 0).toFixed(1)} ★
              </div>
              <div>
                <strong>Total Reviews:</strong> {candidate.totalRating || 0}
              </div>
            </div>
          </div>
        )}

        {/* ============ EVIDENCE / DOCUMENTS ============ */}
        {activeTab === "evidence" && (
          <div className="jt-evidence">
            {/* Joining documents */}
            <div className="jt-evidence-block">
              <h6 className="jt-evidence-title">
                <i className="la la-file-upload me-2"></i>
                Joining Documents
              </h6>
              {(Array.isArray(candidate.joiningDocuments) && candidate.joiningDocuments.length > 0) ? (
                <ul className="jt-doc-list">
                  {candidate.joiningDocuments.map((d, i) => (
                    <li key={i}>
                      <i className="la la-file-pdf-o text-danger me-2"></i>
                      <span className="jt-doc-type">{d.documentType || "Document"}</span>
                      <span className="jt-doc-name">{d.fileName || d.name || "File"}</span>
                      {d.filePath && (
                        <a
                          href={d.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="jt-doc-link"
                        >
                          <i className="la la-external-link"></i>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="jt-empty">No joining documents uploaded.</div>
              )}
            </div>

            {/* Review / test attachment */}
            <div className="jt-evidence-block">
              <h6 className="jt-evidence-title">
                <i className="la la-paperclip me-2"></i>
                Interview / Review Attachment
              </h6>
              {candidate.reviewFile ? (
                <a
                  href={`/candiReview/${candidate.reviewFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="jt-doc-link-inline"
                >
                  <i className="la la-file-pdf-o me-1"></i>
                  View attachment
                </a>
              ) : (
                <div className="jt-empty">No review attachment.</div>
              )}
            </div>

            {/* Absconding evidence */}
            {(candidate.abscondingDate || candidate.abscondingReason) && (
              <div className="jt-evidence-block">
                <h6 className="jt-evidence-title">
                  <i className="la la-exclamation-triangle me-2 text-warning"></i>
                  Absconding Details
                </h6>
                <div className="jt-kv">
                  <div><span>Date</span><strong>{formatDateOnly(candidate.abscondingDate)}</strong></div>
                  <div><span>Reason</span><strong>{candidate.abscondingReason || "—"}</strong></div>
                </div>
              </div>
            )}

            {/* Resume */}
            <div className="jt-evidence-block">
              <h6 className="jt-evidence-title">
                <i className="la la-file-text me-2"></i>
                Resume
              </h6>
              {candidate.resumePath?.trim() ? (
                <a
                  href={candidate.resumePath.startsWith("http") ? candidate.resumePath : `/${candidate.resumePath.replace(/^\/+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="jt-doc-link-inline"
                >
                  <i className="la la-file-pdf-o me-1"></i>
                  Open resume
                </a>
              ) : (
                <div className="jt-empty">No resume available.</div>
              )}
            </div>
          </div>
        )}

        {/* ============ COMMENTS ============ */}
        {activeTab === "notes" && (
          <div className="jt-notes">
            {(commentList || []).length === 0 ? (
              <div className="jt-empty">No comments yet.</div>
            ) : (
              <ul className="jt-note-list">
                {commentList.map((c) => (
                  <li key={c.id}>
                    <div className="jt-note-meta">
                      <i className="la la-comment-o"></i>
                      <span>{c.tdate || "—"}</span>
                    </div>
                    <div className="jt-note-text">{c.comment}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ---------- Inline styles (scoped) ---------- */}
      <style jsx>{`
                .jt-panel {
                    border: 1px solid #e7e9ef;
                    border-radius: 14px;
                    background: #ffffff;
                    overflow: hidden;
                    font-family: inherit;
                }
                .jt-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 18px;
                    background: linear-gradient(90deg, #f7f8fc, #eef2ff);
                    border-bottom: 1px solid #e7e9ef;
                }
                .jt-header-left { display: flex; align-items: center; gap: 12px; }
                .jt-avatar-wrap {
                    border-radius: 50%;
                    padding: 2px;
                    background: linear-gradient(135deg, #6366f1, #22d3ee);
                }
                .jt-title { font-size: 15px; font-weight: 600; color: #111827; }
                .jt-subtitle { font-size: 12px; color: #6b7280; }
                .jt-status-pill {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 999px;
                    background: #eef2ff;
                    color: #4338ca;
                    letter-spacing: 0.4px;
                }
                .jt-status-offer-accept { background: #ecfdf5; color: #047857; }
                .jt-status-offer-reject { background: #fef2f2; color: #b91c1c; }
                .jt-status-deleted       { background: #f3f4f6; color: #6b7280; }
                .jt-status-joined        { background: #ecfeff; color: #0e7490; }
                .jt-status-absconding    { background: #fef3c7; color: #92400e; }

                .jt-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    padding: 14px 18px;
                    background: #fbfbfe;
                    border-bottom: 1px solid #e7e9ef;
                }
                .jt-stat {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    background: #ffffff;
                    border: 1px solid #eef0f5;
                    border-radius: 10px;
                }
                .jt-stat-icon {
                    width: 32px; height: 32px;
                    display: grid; place-items: center;
                    border-radius: 8px;
                    background: #eef2ff;
                    color: #4338ca;
                    font-size: 16px;
                }
                .jt-stat-info .jt-stat-icon { background: #e0f2fe; color: #0369a1; }
                .jt-stat-muted .jt-stat-icon { background: #f3f4f6; color: #4b5563; }
                .jt-stat-success .jt-stat-icon { background: #ecfdf5; color: #047857; }
                .jt-stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px; }
                .jt-stat-value { font-size: 13px; font-weight: 600; color: #111827; }

                .jt-tabs {
                    display: flex;
                    gap: 6px;
                    padding: 10px 14px 0;
                    border-bottom: 1px solid #e7e9ef;
                    background: #ffffff;
                    overflow-x: auto;
                }
                .jt-tab {
                    background: transparent;
                    border: 0;
                    padding: 8px 14px;
                    border-radius: 10px 10px 0 0;
                    font-size: 13px;
                    color: #4b5563;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .jt-tab.active {
                    color: #4338ca;
                    background: #eef2ff;
                    font-weight: 600;
                }
                .jt-body { padding: 16px 18px 18px; }

                /* Timeline */
                .jt-timeline { position: relative; padding-left: 6px; }
                .jt-step {
                    position: relative;
                    display: flex;
                    gap: 14px;
                    padding: 6px 0 18px;
                    min-height: 46px;
                }
                .jt-step:last-child { padding-bottom: 0; }
                .jt-step-marker {
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    background: #f3f4f6;
                    color: #9ca3af;
                    display: grid; place-items: center;
                    font-size: 13px;
                    flex-shrink: 0;
                    position: relative;
                    z-index: 2;
                }
                .jt-step-line {
                    position: absolute;
                    top: 28px;
                    left: 13px;
                    width: 2px;
                    height: calc(100% - 28px);
                    background: #e5e7eb;
                }
                .jt-step:last-child .jt-step-line { display: none; }
                .jt-step-content { flex: 1; padding-top: 4px; }
                .jt-step-title { font-size: 13px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px; }
                .jt-step-meta { font-size: 12px; color: #6b7280; margin-top: 2px; }

                .jt-step-done .jt-step-marker { background: #ecfdf5; color: #047857; }
                .jt-step-done .jt-step-title { color: #065f46; }

                .jt-step-current .jt-step-marker {
                    background: #eef2ff;
                    color: #4338ca;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
                }
                .jt-step-current .jt-step-title { color: #4338ca; }

                .jt-step-danger .jt-step-marker { background: #fef2f2; color: #b91c1c; }
                .jt-step-danger .jt-step-title { color: #b91c1c; }

                .jt-current-tag {
                    font-size: 10px;
                    font-weight: 600;
                    color: #4338ca;
                    background: #eef2ff;
                    padding: 2px 6px;
                    border-radius: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                }
                .jt-danger-tag {
                    font-size: 10px;
                    font-weight: 600;
                    color: #b91c1c;
                    background: #fee2e2;
                    padding: 2px 6px;
                    border-radius: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                }

                /* Ratings */
                .jt-ratings { display: flex; flex-direction: column; gap: 8px; }
                .jt-rating-row {
                    display: grid;
                    grid-template-columns: 140px 1fr 40px;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    background: #fafbff;
                }
                .jt-rating-label { font-size: 13px; color: #374151; }
                .jt-rating-stars { color: #d1d5db; font-size: 15px; letter-spacing: 2px; }
                .jt-rating-stars .filled { color: #f59e0b; }
                .jt-rating-value { font-size: 12px; color: #6b7280; text-align: right; }
                .jt-ratings-footer {
                    margin-top: 10px;
                    padding: 10px 12px;
                    background: #f0f9ff;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #0c4a6e;
                }

                /* Evidence */
                .jt-evidence { display: flex; flex-direction: column; gap: 14px; }
                .jt-evidence-block { border: 1px solid #eef0f5; border-radius: 10px; padding: 12px 14px; }
                .jt-evidence-title { font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 8px; }
                .jt-doc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
                .jt-doc-list li {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 12px; color: #374151;
                    padding: 6px 8px;
                    border-radius: 6px;
                    background: #fafbff;
                }
                .jt-doc-type {
                    font-weight: 600; color: #111827;
                    background: #eef2ff; padding: 2px 6px; border-radius: 6px;
                    font-size: 11px;
                }
                .jt-doc-name { flex: 1; }
                .jt-doc-link { color: #4338ca; }
                .jt-doc-link-inline {
                    display: inline-flex; align-items: center; gap: 4px;
                    font-size: 12px; color: #4338ca; text-decoration: none;
                }
                .jt-doc-link-inline:hover { text-decoration: underline; }
                .jt-empty { font-size: 12px; color: #9ca3af; padding: 4px 0; }
                .jt-kv { display: grid; grid-template-columns: 100px 1fr; gap: 6px; font-size: 12px; }
                .jt-kv span { color: #6b7280; }
                .jt-kv strong { color: #111827; font-weight: 600; }

                /* Notes */
                .jt-note-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
                .jt-note-list li {
                    padding: 10px 12px;
                    background: #fafbff;
                    border: 1px solid #eef0f5;
                    border-radius: 8px;
                }
                .jt-note-meta { font-size: 11px; color: #6b7280; display: flex; gap: 6px; margin-bottom: 4px; }
                .jt-note-text { font-size: 13px; color: #111827; }

                @media (max-width: 576px) {
                    .jt-rating-row { grid-template-columns: 1fr; }
                }
            `}</style>
    </div>
  );
};

/* ============================================================
 *  INITIAL STATE
 * ============================================================ */

const initialJoiningReview = {
  joiningStatus: "",
  joiningDate: "",
  abscondingDate: "",
  abscondingReason: "",
  joiningComments: "",
  documentType: "",
  joiningDocuments: [],
  interviewAttendance: 0,
  technicalSkills: 0,
  communication: 0,
  behaviour: 0,
  professionalism: 0,
  offerCommitment: 0,
  wouldHireAgain: "",
  reviewComments: "",
  reviewDocuments: [],
};

const initialInterview = {
  interviewDate: "",
  interviewLocation: "",
  interviewMode: "Online",
  interviewer: "",
  interviewerEmail: "",
  duration: "60",
  description: "",
};

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */

const Applicants = ({ candidate, onUpdateStatus, onUpdateCallStatus, onUpdateComments }) => {
  /* --------------- UI state --------------- */
  const [showComment, setShowComment] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [srno, setSrno] = useState("0");
  const [loading, setLoading] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [interviewSchedules, setInterviewSchedules] = useState([]);
  const [loadingInterviewSchedules, setLoadingInterviewSchedules] = useState(false);

  /* --------------- ratings --------------- */
  const review = candidate.review?.split("^") || [];
  const [ratings, setRatings] = useState({
    communication: Number(review[0]) || 0,
    interviewFeedback: Number(review[1]) || 0,
    culturalFit: Number(review[2]) || 0,
    overall: Number(review[3]) || 0,
  });
  const [fileName, setFileName] = useState(candidate.reviewFile || "");
  const [file, setFile] = useState(null);
  const [remark, setRemark] = useState(candidate.reviewRemark || "");

  /* --------------- share --------------- */
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRemark, setShareRemark] = useState("");

  /* --------------- bookmark --------------- */
  const [isSaved, setIsSaved] = useState(candidate.isSave === "Y");
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  /* --------------- joining review --------------- */
  const [showJoiningReviewModal, setShowJoiningReviewModal] = useState(false);
  const [loadingJoiningReview, setLoadingJoiningReview] = useState(false);
  const [joiningReviewErrors, setJoiningReviewErrors] = useState({});
  const [joiningReview, setJoiningReview] = useState({ ...initialJoiningReview });

  /* --------------- interview --------------- */
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [interview, setInterview] = useState({ ...initialInterview });
  const [interviewErrors, setInterviewErrors] = useState({});

  /* --------------- effects --------------- */
  useEffect(() => {
    setIsSaved(candidate.isSave === "Y");
  }, [candidate.isSave]);

  useEffect(() => {
    setCommentList(parseComments(candidate.comments, candidate.id));
  }, [candidate.comments, candidate.id]);

  useEffect(() => {
    const current = candidate.review?.split("^") || [];
    setRatings({
      communication: Number(current[0]) || 0,
      interviewFeedback: Number(current[1]) || 0,
      culturalFit: Number(current[2]) || 0,
      overall: Number(current[3]) || 0,
    });
    setFileName(candidate.reviewFile || "");
    setFile(null);
    setRemark(candidate.reviewRemark || "");
  }, [candidate.id, candidate.review, candidate.reviewFile, candidate.reviewRemark]);

  /* ============================================================
   *  ID RESOLVERS  (never fall back to candidate.id for app id)
   * ============================================================ */
  const getApplicationId = () =>
    candidate.applicationId ?? candidate.application_id ?? candidate.appId ?? null;

  const getJobpostId = () =>
    candidate.jobpostId ?? candidate.jobPostId ?? candidate.jobId ?? null;

  /* ============================================================
   *  COMMENTS
   * ============================================================ */
  const parseComments = (commentsString, applicationId) => {
    if (!commentsString) return [];
    const currentAppId = Number(applicationId);
    return commentsString
      .split("#")
      .filter(Boolean)
      .map((item) => {
        const parts = item.split("^");
        if (parts.length >= 4) {
          const [id, appId, commentText, tdate] = parts;
          return {
            id: Number(id) || 0,
            appId: Number(appId) || 0,
            comment: commentText || "",
            tdate: tdate || "",
          };
        }
        const [id, commentText, tdate] = parts;
        return {
          id: Number(id) || 0,
          appId: currentAppId,
          comment: commentText || "",
          tdate: tdate || "",
        };
      })
      .filter((item) => Number(item.appId) === currentAppId);
  };

  const formatComments = (list) =>
    list
      .map(
        (item) =>
          `${item.id}^${item.appId || candidate.id}^${item.comment || ""}^${item.tdate || ""}`
      )
      .join("#");

  const validateInput = (value) => /^[a-zA-Z0-9\s.,!?()&'":;-]*$/.test(value);

  const updateComment = (id, text) => {
    setSrno(id);
    setComment(text);
    setEditingCommentId(id);
    setError("");
    setShowComment(true);
  };

  const deleteComment = async (id) => {
    const selected = commentList.find((item) => item.id === id);
    if (!selected || selected.id < 1 || selected.appId < 1) {
      setError("Invalid request");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/emp-application-delete-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: {
            applicationId: selected.appId,
            jobpostId: candidate.jobId,
            commentSrno: id,
          },
        }),
      });
      const user = await res.json();
      if (!res.ok) {
        toast.error(user.message || "Request failed");
        return;
      }
      const updatedList = commentList.filter((item) => item.id !== id);
      setCommentList(updatedList);
      onUpdateComments?.(candidate.id, formatComments(updatedList));
      toast.success(user.message || "Comment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (appId) => {
    if (!comment.trim() || comment.trim().length < 2) {
      setError("Enter your comments");
      return;
    }
    if (!appId || appId < 1) {
      setError("Invalid request");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/emp-application-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: {
            applicationId: appId,
            jobpostId: candidate.jobId,
            commentSrno: srno,
            comments: comment.trim(),
          },
        }),
      });
      const user = await res.json();
      if (!res.ok) {
        toast.error(user.message || "Request failed");
        return;
      }
      const savedId = user?.srno || srno || 0;
      const currentDate = new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const updatedList = editingCommentId
        ? commentList.map((item) =>
          item.id === editingCommentId
            ? { ...item, comment: comment.trim(), tdate: item.tdate || currentDate }
            : item
        )
        : [
          ...commentList,
          {
            id: Number(savedId) || commentList.length + 1,
            appId: Number(appId),
            comment: comment.trim(),
            tdate: currentDate,
          },
        ];
      setCommentList(updatedList);
      onUpdateComments?.(candidate.id, formatComments(updatedList));
      setComment("");
      setShowComment(true);
      setEditingCommentId(null);
      setSrno("0");
      setError("");
      toast.success(user.message || "Comment saved");
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
   *  STATUS
   * ============================================================ */
  const handleCallStatus = async (status, appId) => {
    if (!status || !appId || appId < 1) {
      setError("Invalid request");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/emp-application-change-call-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: {
            applicationId: appId,
            jobpostId: candidate.jobId,
            status,
            candiUqId: "",
          },
        }),
      });
      const user = await res.json();
      if (!res.ok) {
        toast.error(user.message || "Request failed");
        return;
      }
      onUpdateCallStatus?.(appId, status);
      toast.success(user.message || "Call status updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (ttype, candiUqId, appId) => {
    if (!ttype || !candiUqId || !appId || appId < 1) {
      setError("Invalid request");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/emp-application-change-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: {
            applicationId: appId,
            jobpostId: candidate.jobId,
            ttype,
            candiUqId,
          },
        }),
      });
      const user = await res.json();
      if (!res.ok) {
        toast.error(user.message || "Request failed");
        return;
      }
      onUpdateStatus?.(appId, ttype);
      toast.success(user.message || "Status updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
   *  REVIEW SUBMIT (interview feedback)
   * ============================================================ */
  const setRating = (type, value, appId) => {
    if (Number(appId) !== Number(candidate.id)) return;
    setRatings((prev) => ({ ...prev, [type]: value }));
  };

  const handleReviewSubmit = async (e, appId) => {
    e.preventDefault();
    if (!appId || appId < 1) {
      toast.error("Invalid application.");
      return;
    }
    try {
      setLoadingReview(true);
      let base64File = null;
      if (file) {
        base64File = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      const payload = {
        details: {
          applicationId: Number(getApplicationId() ?? appId),
          jobpostId: Number(getJobpostId()),
          candiUqId: candidate.candiUqId,
          review: `${ratings.communication}^${ratings.interviewFeedback}^${ratings.culturalFit}^${ratings.overall}`,
          reviewRemark: remark || "",
          reviewFile: base64File,
          fileName: file?.name || "",
        },
      };
      const response = await fetch("/api/emp-application-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.isSuccess === false) {
        toast.error(result?.message || "Request failed");
        return;
      }
      toast.success(result?.message || "Feedback saved successfully.");
      setShowReview(false);
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoadingReview(false);
    }
  };

  /* ============================================================
   *  BOOKMARK / DELETE / SHARE
   * ============================================================ */
  const handleBookmarkSubmit = async (e, appId) => {
    e?.preventDefault?.();
    try {
      setLoadingBookmark(true);
      const res = await fetch("/api/emp-application-profile-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, jobpostId: candidate.jobId }),
      });
      const user = await res.json();
      if (!res.ok) {
        toast.error(user.message || "Unable to update bookmark.");
        return;
      }
      setIsSaved((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoadingBookmark(false);
    }
  };

  const confirmDelete = (selectedCandidate) => {
    toast(
      ({ closeToast }) => (
        <div>
          <div className="mb-2">Do you want to delete this candidate?</div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-danger btn-sm"
              onClick={async () => {
                closeToast();
                await handleStatus("Deleted", selectedCandidate.candiUqId, selectedCandidate.id);
              }}
            >
              Yes
            </button>
            <button className="btn btn-secondary btn-sm" onClick={closeToast}>
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  };

  const handleShareSubmit = async (e, appId) => {
    e.preventDefault();
    try {
      setLoadingShare(true);
      const payload = {
        applicationId: appId,
        jobpostId: candidate.jobId,
        shareEmail,
        shareRemark,
        shareLink: `${window.location.origin}/candidates-single-v1/${candidate.candiUqId}`,
      };
      const res = await fetch("/api/emp-application-profile-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const user = await res.json();
      if (!res.ok) {
        toast.error(user.message || "Request failed");
        return;
      }
      setShowShareModal(false);
      setShareEmail("");
      setShareRemark("");
      toast.success(user.message || "Profile shared successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoadingShare(false);
    }
  };

  /* ============================================================
   *  HELPERS
   * ============================================================ */
  const openResume = (resumePath) => {
    if (!resumePath?.trim()) {
      toast.error("Resume is not available.");
      return;
    }
    const url = resumePath.startsWith("http") ? resumePath : `/${resumePath.replace(/^\/+/, "")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatInterviewDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  /* ============================================================
   *  JOINING REVIEW
   * ============================================================ */
  const handleJoiningReviewModal = () => {
    if (!getApplicationId() || !getJobpostId() || !candidate?.candiUqId) {
      toast.error("Candidate application, job, or candidate details are missing.");
      return;
    }
    setJoiningReview({ ...initialJoiningReview });
    setJoiningReviewErrors({});
    setShowJoiningReviewModal(true);
  };

  const closeJoiningReviewModal = () => {
    if (loadingJoiningReview) return;
    setShowJoiningReviewModal(false);
    setJoiningReviewErrors({});
  };

  const updateJoiningReview = (e) => {
    const { name, value, files } = e.target;

    if (name === "joiningDocuments" || name === "reviewDocuments") {
      const selectedFiles = Array.from(files || []);
      if (!selectedFiles.length) return;

      if (name === "joiningDocuments" && !joiningReview.documentType) {
        setJoiningReviewErrors((prev) => ({ ...prev, documentType: "Please select document type first." }));
        e.target.value = "";
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const invalidFile = selectedFiles.find(
        (f) => !allowedTypes.includes(f.type) || f.size > 5 * 1024 * 1024
      );
      if (invalidFile) {
        setJoiningReviewErrors((prev) => ({
          ...prev,
          joiningDocuments: "Only PDF, DOC, DOCX, JPG and PNG files up to 5 MB are allowed.",
        }));
        e.target.value = "";
        return;
      }

      if (name === "joiningDocuments") {
        if (joiningReview.joiningDocuments.length + selectedFiles.length > 10) {
          setJoiningReviewErrors((prev) => ({
            ...prev,
            joiningDocuments: "You can upload a maximum of 10 documents.",
          }));
          e.target.value = "";
          return;
        }
        const filesToAdd = selectedFiles.map((f) => ({
          file: f,
          name: f.name,
          documentType: joiningReview.documentType,
        }));
        setJoiningReview((prev) => ({
          ...prev,
          joiningDocuments: [...prev.joiningDocuments, ...filesToAdd],
        }));
        setJoiningReviewErrors((prev) => ({ ...prev, joiningDocuments: "", documentType: "" }));
      } else {
        setJoiningReview((prev) => ({
          ...prev,
          reviewDocuments: [...prev.reviewDocuments, ...selectedFiles],
        }));
      }
      e.target.value = "";
      return;
    }

    setJoiningReview((prev) => ({ ...prev, [name]: value }));
    setJoiningReviewErrors((prev) => {
      const updated = { ...prev, [name]: "" };
      if (name === "joiningStatus") {
        updated.joiningDate = "";
        updated.abscondingDate = "";
        updated.abscondingReason = "";
        updated.wouldHireAgain = "";
        updated.interviewAttendance = "";
        updated.technicalSkills = "";
        updated.communication = "";
        updated.behaviour = "";
        updated.professionalism = "";
        updated.offerCommitment = "";
      }
      return updated;
    });
  };

  const removeJoiningDocument = (field, index) => {
    setJoiningReview((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateReviewRating = (field, rating) => {
    setJoiningReview((prev) => ({ ...prev, [field]: rating }));
    setJoiningReviewErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateJoiningReview = () => {
    const errors = {};
    const status = joiningReview.joiningStatus;
    if (!status) {
      errors.joiningStatus = "Please select joining status.";
    } else if (!["Joined", "Absconding", "Not Joined"].includes(status)) {
      errors.joiningStatus = "Please select a valid joining status.";
    }
    if (status === "Joined") {
      if (!joiningReview.joiningDate) errors.joiningDate = "Please select date of joining.";
      const ratingFields = [
        "interviewAttendance",
        "technicalSkills",
        "communication",
        "behaviour",
        "professionalism",
        "offerCommitment",
      ];
      ratingFields.forEach((field) => {
        const value = Number(joiningReview[field]);
        if (!value || value < 1 || value > 5) errors[field] = "Please provide a rating between 1 and 5.";
      });
      if (!joiningReview.wouldHireAgain) errors.wouldHireAgain = "Please select Yes or No.";
    }
    if (status === "Absconding") {
      if (!joiningReview.abscondingDate) errors.abscondingDate = "Please select absconding date.";
      if (!joiningReview.abscondingReason.trim()) errors.abscondingReason = "Please enter reason for absconding.";
    }
    if (joiningReview.joiningDocuments.length > 10) {
      errors.joiningDocuments = "You can upload a maximum of 10 documents.";
    }
    setJoiningReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleJoiningReviewSubmit = async (e) => {
    e.preventDefault();
    if (!validateJoiningReview()) return;

    const applicationId = getApplicationId();
    const jobpostId = getJobpostId();

    if (!applicationId || !jobpostId || !candidate?.candiUqId) {
      toast.error("Application, job, or candidate ID is missing.");
      return;
    }

    try {
      setLoadingJoiningReview(true);

      const formData = new FormData();
      formData.append("applicationId", String(applicationId));
      formData.append("jobpostId", String(jobpostId));
      formData.append("candiUqId", String(candidate.candiUqId));
      formData.append("joiningStatus", joiningReview.joiningStatus);
      formData.append("joiningDate", joiningReview.joiningDate || "");
      formData.append("abscondingDate", joiningReview.abscondingDate || "");
      formData.append("abscondingReason", joiningReview.abscondingReason || "");
      formData.append("joiningComments", joiningReview.joiningComments || "");
      formData.append("interviewAttendance", String(joiningReview.interviewAttendance || ""));
      formData.append("technicalSkills", String(joiningReview.technicalSkills || ""));
      formData.append("communication", String(joiningReview.communication || ""));
      formData.append("behaviour", String(joiningReview.behaviour || ""));
      formData.append("professionalism", String(joiningReview.professionalism || ""));
      formData.append("offerCommitment", String(joiningReview.offerCommitment || ""));
      formData.append("wouldHireAgain", joiningReview.wouldHireAgain || "");
      formData.append("reviewComments", joiningReview.reviewComments || "");

      const documents = joiningReview.joiningDocuments || [];
      formData.append(
        "documentTypes",
        JSON.stringify(documents.map((item) => item.documentType))
      );
      documents.forEach((item) => {
        if (item.file instanceof File) formData.append("documents", item.file, item.name);
      });

      const response = await fetch("/api/employer-joining-review", {
        method: "POST",
        body: formData,
      });

      let result = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.isSuccess) {
        toast.error(result?.message || `Request failed (${response.status})`);
        return;
      }

      toast.success(result.message || "Joining review saved successfully.");
      setJoiningReview({ ...initialJoiningReview });
      closeJoiningReviewModal();
    } catch (err) {
      console.error("Joining review error:", err);
      toast.error("Unable to save joining review. Please try again.");
    } finally {
      setLoadingJoiningReview(false);
    }
  };

  /* ============================================================
   *  INTERVIEW SCHEDULING
   * ============================================================ */
  const handleOpenInterviewModal = async () => {
    if (!candidate?.candiUqId || !candidate?.jobId) {
      toast.error("Candidate or job details are missing.");
      return;
    }
    setShowInterviewModal(true);
    setLoadingInterviewSchedules(true);
    setInterviewSchedules([]);
    try {
      const response = await fetch("/api/emp-interview-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candiUqId: candidate.candiUqId,
          jobpostId: candidate.jobId,
        }),
      });
      const contentType = response.headers.get("content-type") || "";
      const responseText = await response.text();
      if (!contentType.includes("application/json")) {
        throw new Error(`Expected JSON but received HTTP ${response.status}.`);
      }
      const result = JSON.parse(responseText);
      if (!response.ok || !result.isSuccess) {
        toast.error(result.message || "Unable to load interview schedules.");
        return;
      }
      setInterviewSchedules(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Interview schedule loading error:", err);
      toast.error(err.message || "Unable to load interview schedules.");
    } finally {
      setLoadingInterviewSchedules(false);
    }
  };

  const closeInterviewModal = () => {
    if (loadingInterview) return;
    setShowInterviewModal(false);
    setInterviewErrors({});
  };

  const updateInterview = (e) => {
    const { name, value } = e.target;
    setInterview((prev) => ({ ...prev, [name]: value }));
    setInterviewErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateInterview = () => {
    const errors = {};
    const emailRegex =
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
    const selectedDate = new Date(interview.interviewDate);
    const location = interview.interviewLocation.trim();
    const interviewer = interview.interviewer.trim();
    const email = interview.interviewerEmail.trim();
    const description = interview.description.trim();

    if (!interview.interviewDate) errors.interviewDate = "Interview date and time is required.";
    else if (Number.isNaN(selectedDate.getTime())) errors.interviewDate = "Please enter a valid date and time.";
    else if (selectedDate.getTime() <= Date.now())
      errors.interviewDate = "Interview date and time must be in the future.";

    if (!interview.interviewMode) errors.interviewMode = "Please select an interview mode.";

    if (!location) errors.interviewLocation = "Interview location or meeting link is required.";
    else if (location.length > 500) errors.interviewLocation = "Location cannot exceed 500 characters.";
    else if (interview.interviewMode === "Online" && !/^https?:\/\/\S+$/i.test(location))
      errors.interviewLocation = "Enter a valid meeting URL starting with http:// or https://.";

    if (!interviewer) errors.interviewer = "Interviewer name is required.";
    else if (interviewer.length > 150) errors.interviewer = "Interviewer name cannot exceed 150 characters.";
    else if (!/^[\p{L}\s.'-]+$/u.test(interviewer))
      errors.interviewer = "Use letters, spaces, periods, apostrophes, or hyphens only.";

    if (!email) errors.interviewerEmail = "Interviewer email is required.";
    else if (email.length > 254 || !emailRegex.test(email))
      errors.interviewerEmail = "Enter a valid email address.";

    if (!["15", "30", "45", "60", "90", "120"].includes(String(interview.duration)))
      errors.duration = "Please select a valid interview duration.";

    if (!description) errors.description = "Interview description is required.";
    else if (description.length > 2000) errors.description = "Description cannot exceed 2000 characters.";

    setInterviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!validateInterview()) return;

    const applicationId = Number(getApplicationId() ?? candidate.id);
    const jobpostId = Number(getJobpostId());
    const candiUqId = String(candidate?.candiUqId || "").trim();

    if (!Number.isSafeInteger(applicationId) || applicationId <= 0 ||
      !Number.isSafeInteger(jobpostId) || jobpostId <= 0 || !candiUqId) {
      toast.error("Invalid candidate application or job details.");
      return;
    }

    const payload = {
      applicationId,
      jobpostId,
      candiUqId,
      interviewDate: interview.interviewDate,
      interviewLocation: interview.interviewLocation.trim(),
      interviewMode: interview.interviewMode,
      interviewer: interview.interviewer.trim(),
      interviewerEmail: interview.interviewerEmail.trim(),
      duration: Number(interview.duration),
      description: interview.description.trim(),
    };

    try {
      setLoadingInterview(true);
      const res = await fetch("/api/emp-application-reschedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || result?.isSuccess !== true) {
        toast.error(result?.message || "Failed to reschedule interview.");
        return;
      }
      toast.success(result.message || "Interview rescheduled successfully.");
      setShowInterviewModal(false);
      setInterviewErrors({});
      setInterview({ ...initialInterview });
    } catch (err) {
      console.error("Reschedule interview error:", err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoadingInterview(false);
    }
  };

  const handleInterviewDecision = async (decision, candiUqId, applicationId) => {
    if (!["Selected Candidate", "Rejected Candidate"].includes(decision)) {
      toast.error("Invalid interview decision.");
      return;
    }
    const payload = {
      applicationId: Number(applicationId),
      jobpostId: Number(candidate.jobId),
      ttype: decision,
      candiUqId,
    };
    if (!Number.isSafeInteger(payload.applicationId) || payload.applicationId < 1 ||
      !Number.isSafeInteger(payload.jobpostId) || payload.jobpostId < 1 || !payload.candiUqId) {
      toast.error("Invalid candidate application or job details.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/emp-application-interview-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: {
            applicationId: candidate.id,
            jobpostId: candidate.jobId,
            ttype: decision,
            candiUqId: candidate.candiUqId,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || result.isSuccess !== true) {
        toast.error(result.message || "Failed to update interview decision.");
        return;
      }
      toast.success(result.message || "Interview decision updated successfully.");
    } catch (err) {
      console.error("Interview decision error:", err);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
   *  SMALL RENDER HELPERS
   * ============================================================ */
  const StarRating = ({ label, type, appId }) => (
    <div className="mb-1 d-flex align-items-center gap-2">
      <label className="fs-6" style={{ fontWeight: 400 }}>{label} :</label>
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={`${appId}-${type}-${star}`}
            onClick={() => setRating(type, star, appId)}
            style={{
              cursor: "pointer",
              fontSize: "22px",
              marginRight: "5px",
              color: star <= ratings[type] ? "#ffc107" : "#d6d6d6",
            }}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );

  const RatingStars = ({ rating = 0 }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));
    return (
      <div className="rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`f-${i}`} className="la la-star filled"></i>
        ))}
        {hasHalfStar && <i className="la la-star-half-alt filled"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`e-${i}`} className="lar la-star empty"></i>
        ))}
      </div>
    );
  };

  /* ============================================================
   *  RENDER
   * ============================================================ */
  return (
    <>
      <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12" key={candidate.id}>
        <div className="inner-box">
          <div className="content">
            <div className="d-flex align-items-center gap-1">
              <figure className="image mb-0 flex-shrink-0">
                <Image
                  src={candidate.avatar}
                  alt="Candidate"
                  width={70}
                  height={70}
                  style={{ width: 70, height: 70, objectFit: "cover", borderRadius: "50%" }}
                />
              </figure>
              <div className="name mb-0 w-100">
                <div className="d-flex justify-content-between align-items-center gap-2">
                  <div>
                    <input type="checkbox" className="me-2" />
                    <Link href={`/candidates-single-v1/${candidate.candiUqId}`}>
                      {candidate.candiName}
                    </Link>
                    {candidate.verifyStatus?.toLowerCase() === "verified" && (
                      <span className="text-success p-0 mt-0 ms-2">
                        <i className="fa fa-check-circle fw-normal me-1 fa-sm"></i>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={(e) => handleBookmarkSubmit(e, candidate.id)}
                    disabled={loadingBookmark}
                  >
                    <i
                      style={{ fontSize: 16 }}
                      className={isSaved ? "fas fa-bookmark" : "far fa-bookmark"}
                    ></i>
                  </button>
                </div>
                <ul className="candidate-info">
                  <li className="icon flaticon-briefcase" style={{ paddingLeft: 0 }}>
                    <span className="ms-2"></span>
                    {candidate.experience}
                  </li>
                  <li>
                    <span className="icon flaticon-map-locator"></span>{" "}
                    {candidate.currentAddress}
                  </li>
                </ul>
              </div>
            </div>
            <ul className="candidate-info">
              <li><span className="icon flaticon-clock"></span> {candidate.noticePeriod}</li>
              <li><span className="icon flaticon-money"></span> ₹ {candidate.curentSalary}</li>
            </ul>
          </div>

          <div className="candidate-row">
            <div className="label1">Current</div>
            <div className="value">{candidate.currentCompany}</div>
          </div>
          <div className="candidate-row">
            <div className="label1">Education</div>
            <div className="value">{candidate.education}</div>
          </div>
          <div className="candidate-row">
            <div className="label1">Pref. Location</div>
            <div className="value">{candidate.workingLocation}</div>
          </div>
          <div className="candidate-row skills-row">
            <div className="label1">Key Skills</div>
            <div className="value">
              {(candidate.tags || []).map((val, i) => (
                <span key={i} style={{ padding: "1px 2px" }}>
                  {val}
                  {i < candidate.tags.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          </div>
          <div className="candidate-row skills-row">
            <div className="label1">Rating</div>
            <div className="d-flex align-items-center">
              <RatingStars rating={Number(candidate.avgRating) || 0} />
              <span className="ms-2">
                {Number(candidate.avgRating || 0).toFixed(1)} ({candidate.totalRating} reviews)
              </span>
            </div>
          </div>
          <div className="candidate-row skills-row">
            <div className="label1">Job Title :</div>
            <div className="d-flex align-items-center">
              <span style={{ fontSize: "12pt", fontWeight: 500 }}>{candidate.jobTitle}</span>
            </div>
          </div>

          <div className="ccandidate-actions d-flex flex-wrap justify-content-between align-items-center gap-2">
            {candidate.status === "Offer Accept" && (
              <div className="offer-badge offer-accept-badge">
                <i className="la la-check"></i> Offer Accepted
              </div>
            )}
            {candidate.status === "Offer Reject" && (
              <div className="offer-badge offer-reject-badge">
                <i className="la la-clock-o"></i> Offer Rejected
              </div>
            )}

            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="action-btn interview-btn"
                onClick={handleOpenInterviewModal}
              >
                <i className="la la-calendar"></i> Reschedule
              </button>

              <button
                type="button"
                className="action-btn interview-btn"
                onClick={handleJoiningReviewModal}
              >
                <i className="la la-user-check"></i> Joining & Review
              </button>

              <button
                type="button"
                className="action-btn"
                style={{
                  background: "#eef2ff",
                  color: "#4338ca",
                  border: "1px solid #c7d2fe",
                }}
                onClick={() => setShowSummary((v) => !v)}
              >
                <i className="la la-stream"></i> {showSummary ? "Hide Summary" : "View Summary"}
              </button>
            </div>

            <div className="right-side ms-0 ms-md-auto mt-2 mt-md-0">
              {candidate.status !== "Deleted" ? (
                <button
                  type="button"
                  className="icon-circle"
                  onClick={() => confirmDelete(candidate)}
                >
                  <i className="la la-trash"></i>
                </button>
              ) : (
                <button type="button" className="action-btn reject-btn" disabled>
                  <i className="la la-times"></i> Deleted
                </button>
              )}

              {candidate.resumePath?.trim() && (
                <button
                  type="button"
                  className="icon-circle"
                  onClick={() => openResume(candidate.resumePath)}
                  title="View Resume"
                >
                  <i className="la la-file-pdf-o"></i>
                </button>
              )}

              <button type="button" className="icon-circle">
                <i className="la la-envelope-o"></i>
              </button>
              <button
                type="button"
                className="icon-circle"
                onClick={() => setShowShareModal(true)}
              >
                <i className="la la-share"></i>
              </button>
              <button
                type="button"
                className="icon-circle"
                style={{ width: 50, borderRadius: "5%" }}
              >
                <i className="la la-eye" style={{ fontSize: "12pt" }}></i>{" "}
                <b className="pe-2">{candidate.viewCount}</b>
              </button>
            </div>
          </div>

          {/* ===================== SUMMARY PANEL ===================== */}
          {showSummary && (
            <div className="mt-3">
              <CandidateJourney
                candidate={candidate}
                interviewSchedules={interviewSchedules}
                commentList={commentList}
              />
            </div>
          )}

          <div className="candidate-extra">
            <div className="match-strip">
              {candidate.queAns &&
                candidate.queAns
                  .split("#")
                  .filter(Boolean)
                  .map((item, index) => {
                    const [, question, answer] = item.split("^");
                    return (
                      <span key={index}>
                        ✓ {question} <strong>{answer}</strong>
                      </span>
                    );
                  })}
            </div>

            <div className="extra-row">
              <div className="comment-row">
                <button
                  type="button"
                  className="comment-link"
                  onClick={() => {
                    setShowComment(!showComment);
                    setShowReview(false);
                  }}
                >
                  {showComment ? "Hide Comment" : "Add Comment"} ({commentList.length})
                </button>
                <button
                  type="button"
                  className="comment-link ms-2"
                  onClick={() => {
                    setShowReview(!showReview);
                    setShowComment(false);
                  }}
                >
                  <i className="la la-star"></i>{" "}
                  {showReview ? "Hide Review" : "Add Review"}
                </button>
              </div>
              <div className="candidate-contact-box">
                <button type="button" className="contact-link">
                  <i className="la la-phone"></i> Contact
                </button>
                <div style={{ color: "#c3c3c3" }}>|</div>
                <select
                  className="status-select"
                  style={{ width: 110 }}
                  value={candidate.callStatus || ""}
                  onChange={(e) => handleCallStatus(e.target.value, candidate.id)}
                  disabled={loading}
                >
                  <option value="">Status</option>
                  <option value="Called">Called</option>
                  <option value="Messaged">Messaged</option>
                  <option value="Not Picked">Not Picked</option>
                  <option value="Not Reachable">Not Reachable</option>
                </select>
              </div>
            </div>

            {showComment && (
              <div className="comment-box">
                <textarea
                  className="form-control"
                  placeholder="Type your comment here..."
                  value={comment}
                  maxLength={200}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (validateInput(value)) setComment(value);
                  }}
                />
                {error && <span className="error-text">{error}</span>}
                <div className="text-end mt-2 mb-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={loading}
                    onClick={() => handleCommentSubmit(candidate.id)}
                  >
                    {loading ? "Saving..." : editingCommentId ? "Update" : "Save"}
                  </button>
                  {editingCommentId && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() => {
                        setEditingCommentId(null);
                        setComment("");
                        setSrno("0");
                        setError("");
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {commentList.map((item) => (
                  <div key={item.id}>
                    <div className="comment-item">
                      <div className="comment-header">
                        <div className="comment-content">
                          <p>{item.comment}</p>
                          <div className="comment-actions">
                            <small>{item.tdate}</small>
                            <div>
                              <button
                                type="button"
                                onClick={() => updateComment(item.id, item.comment)}
                              >
                                <i className="la la-edit"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteComment(item.id)}
                                disabled={loading}
                              >
                                <i className="la la-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showReview && (
              <div className="comment-box">
                <div className="card mt-3 shadow-sm">
                  <div className="card-header">
                    <h6 className="mb-0 fs-7">Interview Feedback</h6>
                  </div>
                  <div className="card-body default-form">
                    <form onSubmit={(e) => handleReviewSubmit(e, candidate.id)}>
                      <StarRating label="Communication" type="communication" appId={candidate.id} />
                      <StarRating label="Interview Feedback" type="interviewFeedback" appId={candidate.id} />
                      <StarRating label="Cultural Fit" type="culturalFit" appId={candidate.id} />
                      <StarRating label="Overall" type="overall" appId={candidate.id} />

                      <div className="form-group mb-1 mt-2">
                        <label className="fs-6" style={{ fontWeight: 400 }}>
                          File attachment for test result{" "}
                          {fileName && (
                            <a
                              href={`/candiReview/${fileName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              (View Attachment)
                            </a>
                          )}
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf"
                          onChange={(e) => {
                            const selected = e.target.files?.[0] || null;
                            if (
                              selected &&
                              (selected.type !== "application/pdf" ||
                                selected.size > 5 * 1024 * 1024)
                            ) {
                              toast.error("Please select a PDF file up to 5 MB.");
                              e.target.value = "";
                              return;
                            }
                            setFile(selected);
                          }}
                        />
                      </div>

                      <div className="form-group mb-1">
                        <label className="fs-6" style={{ fontWeight: 400 }}>
                          Remark / Feedback
                        </label>
                        <textarea
                          className="about-input-company"
                          style={{ height: 70 }}
                          maxLength={500}
                          rows={3}
                          placeholder="Enter your feedback..."
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success mt-2"
                        disabled={loadingReview}
                      >
                        {loadingReview ? "Saving..." : "Submit Feedback"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===================== SHARE MODAL ===================== */}
          {showShareModal && (
            <>
              <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Share Profile of {candidate.candiName}</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => !loadingShare && setShowShareModal(false)}
                        disabled={loadingShare}
                      ></button>
                    </div>
                    <form onSubmit={(e) => handleShareSubmit(e, candidate.id)}>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            placeholder="Enter email"
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Remark</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            value={shareRemark}
                            onChange={(e) => setShareRemark(e.target.value)}
                            placeholder="Enter remark"
                            required
                            maxLength={500}
                          ></textarea>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => setShowShareModal(false)}
                          disabled={loadingShare}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-sm btn-primary" disabled={loadingShare}>
                          {loadingShare ? "Saving..." : "Submit"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show" onClick={() => !loadingShare && setShowShareModal(false)}></div>
            </>
          )}

          {/* ===================== JOINING REVIEW MODAL ===================== */}
          {showJoiningReviewModal && (
            <>
              <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                  <div className="modal-content joining-review-modal">
                    <div className="modal-header">
                      <div>
                        <h5 className="modal-title">Joining & Candidate Review</h5>
                        <small className="text-muted">
                          Candidate: {candidate.candiName} | Job: {candidate.jobTitle}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeJoiningReviewModal}
                        disabled={loadingJoiningReview}
                      ></button>
                    </div>
                    <div className="overflow-scroll">
                      <form onSubmit={handleJoiningReviewSubmit} noValidate>
                        <div className="modal-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Joining Status <span className="text-danger">*</span></label>
                              <select
                                name="joiningStatus"
                                className={`form-select ${joiningReviewErrors.joiningStatus ? "is-invalid" : ""}`}
                                value={joiningReview.joiningStatus}
                                onChange={updateJoiningReview}
                              >
                                <option value="">Select Status</option>
                                <option value="Joined">Joined</option>
                                <option value="Absconding">Absconding</option>
                                <option value="Not Joined">Not Joined</option>
                              </select>
                              {joiningReviewErrors.joiningStatus && (
                                <div className="invalid-feedback">{joiningReviewErrors.joiningStatus}</div>
                              )}
                            </div>

                            {joiningReview.joiningStatus === "Joined" && (
                              <div className="col-md-6">
                                <label className="form-label">Date of Joining <span className="text-danger">*</span></label>
                                <input
                                  type="date"
                                  name="joiningDate"
                                  className={`form-control ${joiningReviewErrors.joiningDate ? "is-invalid" : ""}`}
                                  value={joiningReview.joiningDate}
                                  onChange={updateJoiningReview}
                                />
                                {joiningReviewErrors.joiningDate && (
                                  <div className="invalid-feedback">{joiningReviewErrors.joiningDate}</div>
                                )}
                              </div>
                            )}

                            {joiningReview.joiningStatus === "Absconding" && (
                              <>
                                <div className="col-md-6">
                                  <label className="form-label">Absconding Date <span className="text-danger">*</span></label>
                                  <input
                                    type="date"
                                    name="abscondingDate"
                                    className={`form-control ${joiningReviewErrors.abscondingDate ? "is-invalid" : ""}`}
                                    value={joiningReview.abscondingDate}
                                    onChange={updateJoiningReview}
                                  />
                                  {joiningReviewErrors.abscondingDate && (
                                    <div className="invalid-feedback">{joiningReviewErrors.abscondingDate}</div>
                                  )}
                                </div>
                                <div className="col-12">
                                  <label className="form-label">Reason for Absconding <span className="text-danger">*</span></label>
                                  <textarea
                                    name="abscondingReason"
                                    className={`form-control ${joiningReviewErrors.abscondingReason ? "is-invalid" : ""}`}
                                    rows={3}
                                    maxLength={1000}
                                    value={joiningReview.abscondingReason}
                                    onChange={updateJoiningReview}
                                    placeholder="Enter details about the candidate's absconding..."
                                  />
                                  {joiningReviewErrors.abscondingReason && (
                                    <div className="invalid-feedback">{joiningReviewErrors.abscondingReason}</div>
                                  )}
                                </div>
                              </>
                            )}

                            <div className="col-12">
                              <label className="form-label">Joining Comments</label>
                              <textarea
                                name="joiningComments"
                                className="form-control"
                                rows={3}
                                maxLength={2000}
                                value={joiningReview.joiningComments}
                                onChange={updateJoiningReview}
                                placeholder="Enter joining-related comments..."
                              />
                            </div>

                            <div className="col-12">
                              <label className="form-label">Upload Candidate Documents</label>
                              <div className="row g-2">
                                <div className="col-md-4">
                                  <select
                                    className={`form-select ${joiningReviewErrors.documentType ? "is-invalid" : ""}`}
                                    name="documentType"
                                    value={joiningReview.documentType}
                                    onChange={updateJoiningReview}
                                  >
                                    <option value="">Select Document Type</option>
                                    <option value="Salary Slip">Salary Slip</option>
                                    <option value="Relieving Letter">Relieving Letter</option>
                                    <option value="Experience Letter">Experience Letter</option>
                                    <option value="Other">Other</option>
                                  </select>
                                  {joiningReviewErrors.documentType && (
                                    <div className="invalid-feedback">{joiningReviewErrors.documentType}</div>
                                  )}
                                </div>
                                <div className="col-md-8">
                                  <input
                                    type="file"
                                    name="joiningDocuments"
                                    className={`form-control ${joiningReviewErrors.joiningDocuments ? "is-invalid" : ""}`}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    multiple
                                    onChange={updateJoiningReview}
                                  />
                                  {joiningReviewErrors.joiningDocuments && (
                                    <div className="invalid-feedback">{joiningReviewErrors.joiningDocuments}</div>
                                  )}
                                </div>
                              </div>
                              <small className="text-muted">PDF, DOC, DOCX, JPG, PNG. Maximum 5 MB per file.</small>
                              {joiningReview.joiningDocuments.map((item, index) => (
                                <div className="selected-file" key={`${item.name}-${index}`}>
                                  <span>{item.documentType} - {item.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeJoiningDocument("joiningDocuments", index)}
                                  >
                                    <i className="la la-times"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {joiningReview.joiningStatus === "Joined" && (
                            <div className="joining-section mt-4">
                              <h6 className="fw-medium mb-3">Candidate Performance Review</h6>
                              <div className="row g-2">
                                <JoiningStarRating
                                  label="Interview Attendance"
                                  name="interviewAttendance"
                                  value={joiningReview.interviewAttendance}
                                  onChange={updateReviewRating}
                                  error={joiningReviewErrors.interviewAttendance}
                                />
                                <JoiningStarRating
                                  label="Technical Skills"
                                  name="technicalSkills"
                                  value={joiningReview.technicalSkills}
                                  onChange={updateReviewRating}
                                  error={joiningReviewErrors.technicalSkills}
                                />
                                <JoiningStarRating
                                  label="Communication"
                                  name="communication"
                                  value={joiningReview.communication}
                                  onChange={updateReviewRating}
                                  error={joiningReviewErrors.communication}
                                />
                                <JoiningStarRating
                                  label="Behaviour"
                                  name="behaviour"
                                  value={joiningReview.behaviour}
                                  onChange={updateReviewRating}
                                  error={joiningReviewErrors.behaviour}
                                />
                                <JoiningStarRating
                                  label="Professionalism"
                                  name="professionalism"
                                  value={joiningReview.professionalism}
                                  onChange={updateReviewRating}
                                  error={joiningReviewErrors.professionalism}
                                />
                                <JoiningStarRating
                                  label="Offer Commitment"
                                  name="offerCommitment"
                                  value={joiningReview.offerCommitment}
                                  onChange={updateReviewRating}
                                  error={joiningReviewErrors.offerCommitment}
                                />

                                <div className="col-md-6">
                                  <label className="form-label fw-semibold">
                                    Would Hire Again? <span className="text-danger">*</span>
                                  </label>
                                  <div className="d-flex gap-3">
                                    <label className="review-radio">
                                      <input
                                        type="radio"
                                        name="wouldHireAgain"
                                        value="Yes"
                                        checked={joiningReview.wouldHireAgain === "Yes"}
                                        onChange={updateJoiningReview}
                                      />{" "}
                                      Yes
                                    </label>
                                    <label className="review-radio">
                                      <input
                                        type="radio"
                                        name="wouldHireAgain"
                                        value="No"
                                        checked={joiningReview.wouldHireAgain === "No"}
                                        onChange={updateJoiningReview}
                                      />{" "}
                                      No
                                    </label>
                                  </div>
                                  {joiningReviewErrors.wouldHireAgain && (
                                    <div className="text-danger small">{joiningReviewErrors.wouldHireAgain}</div>
                                  )}
                                </div>

                                <div className="col-12">
                                  <label className="form-label">Review Comments</label>
                                  <textarea
                                    name="reviewComments"
                                    className="form-control"
                                    rows={4}
                                    maxLength={2000}
                                    value={joiningReview.reviewComments}
                                    onChange={updateJoiningReview}
                                    placeholder="Enter detailed feedback about the candidate's performance..."
                                  />
                                  <div className="text-end">
                                    <small className="text-danger">
                                      {joiningReview.reviewComments.length}/2000
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeJoiningReviewModal}
                            disabled={loadingJoiningReview}
                          >
                            Close
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loadingJoiningReview}
                          >
                            <i className="la la-save me-1"></i>
                            {loadingJoiningReview ? "Saving..." : "Save Joining & Review"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show" onClick={closeJoiningReviewModal}></div>
            </>
          )}

          {/* ===================== INTERVIEW MODAL ===================== */}
          {showInterviewModal && (
            <>
              <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
              >
                <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                  <div className="modal-content">
                    <div className="modal-header">
                      <div>
                        <h5 className="modal-title">
                          <i className="la la-calendar-check me-2"></i>
                          Reschedule Interview
                        </h5>
                        <small className="text-muted fw-bold text-primary">
                          Candidate: {candidate.candiName} | Job: {candidate.jobTitle}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeInterviewModal}
                        disabled={loadingInterview}
                      />
                    </div>

                    <div className="overflow-scroll">
                      <form onSubmit={handleInterviewSubmit} noValidate>
                        <div className="modal-body">
                          <div className="row g-2">
                            <div className="col-md-6">
                              <label className="from-label mb-0">
                                Interview Date & Time <span className="text-danger">*</span>
                              </label>
                              <input
                                type="datetime-local"
                                className={`form-control ${interviewErrors.interviewDate ? "is-invalid" : ""}`}
                                name="interviewDate"
                                value={interview.interviewDate}
                                onChange={updateInterview}
                                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                                  .toISOString()
                                  .slice(0, 16)}
                                required
                              />
                              {interviewErrors.interviewDate && (
                                <div className="invalid-feedback">{interviewErrors.interviewDate}</div>
                              )}
                            </div>

                            <div className="col-md-6">
                              <label className="from-label mb-0">
                                Interview Mode <span className="text-danger">*</span>
                              </label>
                              <select
                                className={`form-select ${interviewErrors.interviewMode ? "is-invalid" : ""}`}
                                name="interviewMode"
                                value={interview.interviewMode}
                                onChange={updateInterview}
                                required
                              >
                                <option value="">Select Interview Mode</option>
                                <option value="Online">Online</option>
                                <option value="In-person">In-person</option>
                                <option value="Phone">Phone</option>
                              </select>
                              {interviewErrors.interviewMode && (
                                <div className="invalid-feedback">{interviewErrors.interviewMode}</div>
                              )}
                            </div>

                            <div className="col-md-6">
                              <label className="from-label mb-0">
                                Interview Location / Meeting Link <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${interviewErrors.interviewLocation ? "is-invalid" : ""}`}
                                name="interviewLocation"
                                value={interview.interviewLocation}
                                onChange={updateInterview}
                                placeholder={
                                  interview.interviewMode === "Online"
                                    ? "Enter meeting URL (https://...)"
                                    : interview.interviewMode === "Phone"
                                      ? "Enter contact details"
                                      : "Enter office address"
                                }
                                maxLength={500}
                                required
                              />
                              {interviewErrors.interviewLocation && (
                                <div className="invalid-feedback">{interviewErrors.interviewLocation}</div>
                              )}
                            </div>

                            <div className="col-md-6">
                              <label className="from-label mb-0">
                                Interviewer Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className={`form-control ${interviewErrors.interviewer ? "is-invalid" : ""}`}
                                name="interviewer"
                                value={interview.interviewer}
                                onChange={updateInterview}
                                placeholder="Enter interviewer name"
                                maxLength={150}
                                required
                              />
                              {interviewErrors.interviewer && (
                                <div className="invalid-feedback">{interviewErrors.interviewer}</div>
                              )}
                            </div>

                            <div className="col-md-6">
                              <label className="from-label mb-0">
                                Interviewer Email <span className="text-danger">*</span>
                              </label>
                              <input
                                type="email"
                                className={`form-control ${interviewErrors.interviewerEmail ? "is-invalid" : ""}`}
                                name="interviewerEmail"
                                value={interview.interviewerEmail}
                                onChange={updateInterview}
                                placeholder="Enter interviewer email"
                                maxLength={254}
                                autoComplete="email"
                                required
                              />
                              {interviewErrors.interviewerEmail && (
                                <div className="invalid-feedback">{interviewErrors.interviewerEmail}</div>
                              )}
                            </div>

                            <div className="col-md-6">
                              <label className="from-label mb-0">
                                Duration <span className="text-danger">*</span>
                              </label>
                              <select
                                className={`form-select ${interviewErrors.duration ? "is-invalid" : ""}`}
                                name="duration"
                                value={interview.duration}
                                onChange={updateInterview}
                                required
                              >
                                <option value="">Select Duration</option>
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">60 minutes</option>
                                <option value="90">90 minutes</option>
                                <option value="120">120 minutes</option>
                              </select>
                              {interviewErrors.duration && (
                                <div className="invalid-feedback">{interviewErrors.duration}</div>
                              )}
                            </div>

                            <div className="col-12">
                              <label className="from-label mb-0">
                                Interview Description / Instructions <span className="text-danger">*</span>
                              </label>
                              <textarea
                                className={`form-control ${interviewErrors.description ? "is-invalid" : ""}`}
                                name="description"
                                value={interview.description}
                                onChange={updateInterview}
                                rows={4}
                                maxLength={2000}
                                placeholder="Enter interview agenda, required documents, preparation instructions, or other details"
                                required
                              />
                              {interviewErrors.description && (
                                <div className="invalid-feedback">{interviewErrors.description}</div>
                              )}
                              <div className="d-flex justify-content-between mt-1">
                                <small className="text-muted">
                                  Use letters, numbers and standard punctuation.
                                </small>
                                <small
                                  className={
                                    interview.description.length >= 2000
                                      ? "text-danger"
                                      : "text-muted"
                                  }
                                >
                                  {interview.description.length}/2000
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeInterviewModal}
                            disabled={loadingInterview}
                          >
                            Close
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loadingInterview}
                          >
                            <i className="la la-calendar-check me-1"></i>
                            {loadingInterview ? "Scheduling..." : "Reschedule Interview"}
                          </button>
                        </div>
                      </form>

                      {/* Interview Schedule History */}
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="fw-normal mb-0">
                            <i className="la la-history me-2"></i>
                            Previous Interview Schedules
                          </h5>
                          <span className="badge bg-primary">
                            {interviewSchedules.length} Records
                          </span>
                        </div>

                        {loadingInterviewSchedules ? (
                          <div className="text-center py-4">
                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                            <div className="text-muted small mt-2">
                              Loading interview schedules...
                            </div>
                          </div>
                        ) : interviewSchedules.length === 0 ? (
                          <div className="alert alert-light border text-center mb-0">
                            <i className="la la-calendar-times me-2"></i>
                            No previous interview schedules found.
                          </div>
                        ) : (
                          <div className="table-responsive border rounded">
                            <table className="table table-bordered table-hover align-middle mb-0 tbl-interview">
                              <thead className="table-light">
                                <tr>
                                  <th>#</th>
                                  <th>Interview Date</th>
                                  <th>Mode</th>
                                  <th>Interviewer</th>
                                  <th>Duration</th>
                                  <th>Type</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {interviewSchedules.map((item, index) => (
                                  <tr key={item.SRNO ?? index}>
                                    <td>{index + 1}</td>
                                    <td className="text-nowrap">
                                      {formatInterviewDate(item.INTER_DATE)}
                                    </td>
                                    <td>{item.INTER_MODE || "-"}</td>
                                    <td>
                                      <span className="fw-semibold">
                                        {item.INTERVIEWER_NAME || "-"}
                                      </span>
                                      <div>
                                        <small className="text-muted">
                                          {item.INTERVIEWER_EMAIL || ""}
                                        </small>
                                      </div>
                                    </td>
                                    <td>{item.DURATION || "-"}</td>
                                    <td>
                                      <span className="badge bg-info text-dark">
                                        {item.INTER_TYPE || "-"}
                                      </span>
                                    </td>
                                    <td>
                                      {String(item.FLAG).toUpperCase() === "Y" ? (
                                        <span className="badge bg-success">Active</span>
                                      ) : (
                                        <span className="badge bg-secondary">Previous</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-backdrop fade show" onClick={closeInterviewModal} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Applicants;