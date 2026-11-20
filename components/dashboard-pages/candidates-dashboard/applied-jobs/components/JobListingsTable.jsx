
'use client';

import { encodeJobId } from "@/lib/jobIdCrypto";
import { useEffect, useState } from "react";
import Link from "next/link.js";
import { getTimeAgo } from "@/lib/dateUtils";
import Image from "next/image.js";

const statusConfig = {
  Applied: { label: "Applied", className: "text-primary", icon: "fas fa-check-circle" },
  Shortlisted: { label: "Shortlisted", className: "text-success", icon: "fas fa-user-check" },
  Maybe: { label: "Maybe", className: "text-warning", icon: "fas fa-question-circle" },
  Rejected: { label: "Rejected", className: "text-danger", icon: "fas fa-times-circle" },
  Deleted: { label: "Deleted", className: "text-secondary", icon: "fas fa-trash-alt" },
  Interview: { label: "Interview", className: "text-info", icon: "fas fa-calendar-check" },
  Reschedule: { label: "Reschedule", className: "text-warning", icon: "fas fa-calendar-alt" },
  "Selected Candidate": { label: "Selected Candidate", className: "text-success", icon: "fas fa-user-tie" },
  Offer: { label: "Offer", className: "text-primary", icon: "fas fa-file-contract" },
  "Offer Accept": { label: "Offer Accepted", className: "text-success", icon: "fas fa-file-signature" },
  Joined: { label: "Joined", className: "text-success", icon: "fas fa-user-check" }
};

const getStatusConfig = (value) => {
  const normalizedStatus = String(value || "").trim();
  return statusConfig[normalizedStatus] || {
    label: normalizedStatus || "Pending",
    className: "text-secondary",
    icon: "fas fa-info-circle"
  };
};

const JobListingsTable = () => {
  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCardId, setOpenCardId] = useState(null);

  useEffect(() => {
    getAppliedJobs();
  }, []);

  const getAppliedJobs = async () => {
    try {
      const response = await fetch("/api/candi-applied-jobs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch applied jobs.");
      }

      const result = await response.json();
      const listData = result?.data;

      setJobList(Array.isArray(listData) ? listData : []);
    } catch (error) {
      setJobList([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (e, cardId) => {
    const card = e.currentTarget;
    const allCards = document.querySelectorAll(".job-card-apply");
    const detail = card.querySelector(".detail-section-apply");

    if (!detail) return;

    const isOpen = detail.classList.contains("show");

    allCards.forEach((c) => {
      c.classList.remove("active");
      c.querySelector(".detail-section-apply")?.classList.remove("show");
    });

    if (!isOpen) {
      card.classList.add("active");
      detail.classList.add("show");
      setOpenCardId(cardId);
    } else {
      setOpenCardId(null);
    }
  };

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Applied Jobs</h4>
        <div className="chosen-outer">
          <select className="chosen-single form-select">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Last 16 Months</option>
            <option>Last 24 Months</option>
            <option>Last 5 year</option>
          </select>
        </div>
      </div>

      <div className="col-lg-12 col-xl-12 sidebar-apply p-1">
        <div className="p-1">
          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm me-2"></span>
              Loading applied jobs...
            </div>
          ) : jobList.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-briefcase fa-2x text-muted mb-2"></i>
              <p className="text-muted mb-0">You haven't applied for any jobs yet.</p>
            </div>
          ) : (
            jobList.map((item, index) => {
              const status = getStatusConfig(item.status);
              const cardId = item.applicationId || item.id || index;

              return (
                <div
                  className="job-card-apply"
                  onClick={(e) => toggleDetails(e, cardId)}
                  key={cardId}
                >
                  <div className="d-flex flex-column gap-3" style={{ width: "100%" }}>
                    <div className="p-1">
                      <div className="d-flex align-items-start">
                        <div style={{ width: "75px", flexShrink: 0 }}>
                          <Image
                            width={75}
                            height={49}
                            src={item.logo || "/images/default-company.png"}
                            alt="Company logo"
                            style={{ objectFit: "contain" }}
                          />
                        </div>

                        <div className="flex-grow-1 ms-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1 fw-semibold">
                                <Link
                                  href={`/job-single-v2/${encodeJobId(item.id)}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.jobTitle}
                                </Link>
                              </h6>
                              <p className="text-muted mb-1 small">
                                {item.company}
                              </p>
                            </div>

                            <span className="text-muted rounded-pill px-3 py-2">
                              {getTimeAgo(item.apply_at)}
                            </span>
                          </div>

                          <div className={`small d-flex align-items-center gap-2 ${status.className}`}>
                            <i className={`${status.icon} me-1`}></i>
                            <span>{status.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section-apply">
                      <div className="pb-1">
                        <div className="border rounded-3 bg-white p-2">
                          <div className="timeline">
                            {item.statusList
                              ?.split("#")
                              .filter(Boolean)
                              .map((historyItem, historyIndex) => {
                                const [date, applicationId, historyStatus] = historyItem.split("^");
                                const historyConfig = getStatusConfig(historyStatus);

                                return (
                                  <div className="timeline-item" key={historyIndex}>
                                    <div className="timeline-number">
                                      {historyIndex + 1}
                                    </div>

                                    <div className="timeline-content">
                                      <div className="d-flex justify-content-between align-items-center mb-0">
                                        <p className="mb-0">
                                          {historyConfig.label}
                                        </p>

                                        <small className="text-muted">
                                          {date}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                            {!item.statusList && (
                              <p className="text-muted small mb-0">
                                No application history available.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListingsTable;
