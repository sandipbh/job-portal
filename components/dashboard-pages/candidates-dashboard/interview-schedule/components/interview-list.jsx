
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { encodeJobId } from "@/lib/jobIdCrypto";

const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getStatus = (flag) => (flag || "").toUpperCase() === "Y"
    ? { label: "Active", className: "active" }
    : { label: "Inactive", className: "inactive" };

const isValidUrl = (value) => {
    if (!value) return false;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
};

const InterviewSchedule = () => {
    const [interviewList, setInterviewList] = useState([]);
    const [expandedInterview, setExpandedInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getInterviewSchedules();
    }, []);

    const getInterviewSchedules = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await fetch("/api/candi-interview-schedule", { method: "GET", cache: "no-store" });
            const result = await response.json();

            if (!response.ok || !result?.isSuccess) {
                throw new Error(result?.message || "Unable to fetch interview schedules.");
            }

            setInterviewList(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Interview Schedule Error:", error);
            setError(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const toggleInterview = (srno) => {
        setExpandedInterview((previous) => previous === srno ? null : srno);
    };

    return (
        <div className="tabs-box candidate-interviews">
            <div className="widget-title interviews-heading">
                <div>
                    <h4>Interview Schedule</h4>
                    <p>View your upcoming and previous interview schedules.</p>
                </div>
                <div className="interview-count">
                    {interviewList.length} Interview{interviewList.length !== 1 ? "s" : ""}
                </div>
            </div>

            <div className="widget-content">
                {loading ? (
                    <div className="interviews-message">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Loading your interview schedules...
                    </div>
                ) : error ? (
                    <div className="interviews-message error-message">
                        <i className="la la-exclamation-circle"></i>
                        <span>{error}</span>
                        <button type="button" onClick={getInterviewSchedules}>Try Again</button>
                    </div>
                ) : interviewList.length === 0 ? (
                    <div className="empty-interviews">
                        <div className="empty-interviews-icon"><i className="la la-calendar-check"></i></div>
                        <h4>No Interview Schedules Yet</h4>
                        <p>When an employer schedules an interview for you, the details will appear here.</p>
                    </div>
                ) : (
                    <div className="interview-list">
                        {interviewList.map((item) => {
                            const isExpanded = expandedInterview === item.interviewSrno;
                            const status = getStatus(item.flag);

                            return (
                                <div className={`interview-card ${isExpanded ? "expanded" : ""}`} key={item.interviewSrno}>
                                    <button
                                        type="button"
                                        className="interview-card-header"
                                        onClick={() => toggleInterview(item.interviewSrno)}
                                        aria-expanded={isExpanded}
                                    >
                                        <div className="interview-company-logo">
                                            {item.logo ? (
                                                <img src={item.logo} alt={item.company || "Company"} />
                                            ) : (
                                                <i className="la la-building"></i>
                                            )}
                                        </div>

                                        <div className="interview-main-info">
                                            <h4>{item.jobTitle || "Job Title Not Available"}</h4>
                                            <div className="interview-meta">
                                                <span><i className="la la-building"></i>{item.company || "Company Not Available"}</span>
                                                <span><i className="la la-map-marker"></i>{item.location || "Location not specified"}</span>
                                            </div>
                                        </div>

                                        <div className="interview-summary">
                                            <div className="interview-date">
                                                <i className="la la-calendar"></i>
                                                {formatDateTime(item.interviewDate)}
                                            </div>
                                            <span className={`interview-status ${status.className}`}>{status.label}</span>
                                        </div>

                                        <div className="interview-toggle">
                                            <i className={`la ${isExpanded ? "la-angle-up" : "la-angle-down"}`}></i>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="interview-expanded-content">
                                            <div className="interview-section-heading">
                                                <i className="la la-calendar-check"></i>
                                                Interview Details
                                            </div>

                                            <div className="interview-details-single-box">
                                                <div className="interview-details-grid">
                                                    <div className="interview-detail-item">
                                                        <span>Interview Date & Time</span>
                                                        <strong>{formatDateTime(item.interviewDate)}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Interview Mode</span>
                                                        <strong>{item.interviewMode || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Interview Type</span>
                                                        <strong>{item.interviewType || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Duration</span>
                                                        <strong>{item.duration || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Interviewer Name</span>
                                                        <strong>{item.interviewerName || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Interviewer Email</span>
                                                        {item.interviewerEmail ? (
                                                            <a href={`mailto:${item.interviewerEmail}`}>{item.interviewerEmail}</a>
                                                        ) : (
                                                            <strong>N/A</strong>
                                                        )}
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Company</span>
                                                        <strong>{item.company || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Job Role</span>
                                                        <strong>{item.jobRole || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Job Type</span>
                                                        <strong>{item.jobType || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Work Mode</span>
                                                        <strong>{item.workMode || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Job Location</span>
                                                        <strong>{item.location || "N/A"}</strong>
                                                    </div>
                                                    <div className="interview-detail-item">
                                                        <span>Schedule Added Date</span>
                                                        <strong>{formatDate(item.addedDate)}</strong>
                                                    </div>
                                                </div>

                                                {item.interviewLocationLink && (
                                                    <div className="interview-inline-section">
                                                        <span className="interview-inline-label">
                                                            Interview Location / Meeting Link
                                                        </span>
                                                        {isValidUrl(item.interviewLocationLink) ? (
                                                            <a
                                                                href={item.interviewLocationLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="interview-meeting-link"
                                                            >
                                                                <i className="la la-external-link"></i>
                                                                Join Interview / View Location
                                                            </a>
                                                        ) : (
                                                            <p>{item.interviewLocationLink}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {item.description && (
                                                    <div className="interview-inline-section">
                                                        <span className="interview-inline-label">
                                                            Additional Instructions
                                                        </span>
                                                        <p>{item.description}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="interview-card-footer">
                                                <div className="interview-footer-status">
                                                    <span>Interview Status:</span>
                                                    <strong className={status.className}>{status.label}</strong>
                                                </div>
                                                <Link
                                                    href={`/job-single-v2/${encodeJobId(item.jobPostId)}`}
                                                    className="view-job-link"
                                                >
                                                    View Job Details <i className="la la-arrow-right"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                .candidate-interviews{width:100%}
                .interviews-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
                .interviews-heading h4{margin:0 0 4px;font-size:18px}
                .interviews-heading p{color:#777;font-size:12px;margin:0}
                .interview-count{background:#eef4ff;color:#1967d2;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap}
                .interview-list{display:flex;flex-direction:column;gap:12px}
                .interview-card{border:1px solid #e7eaf0;border-radius:9px;overflow:hidden;background:#fff;transition:box-shadow .2s,border-color .2s}
                .interview-card:hover,.interview-card.expanded{border-color:#b9ccec;box-shadow:0 3px 12px rgba(20,50,90,.06)}
                .interview-card-header{width:100%;display:flex;align-items:center;gap:13px;padding:10px 15px;border:0;background:#fff;text-align:left;cursor:pointer}
                .interview-company-logo{width:48px;height:45px;flex-shrink:0;border:1px solid #edf0f4;border-radius:7px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#f8faff}
                .interview-company-logo img{width:100%;height:100%;object-fit:contain;padding:4px}
                .interview-company-logo i{font-size:25px;color:#1967d2}
                .interview-main-info{flex:1;min-width:0}
                .interview-main-info h4{font-size:14px;font-weight:700;color:#202b3c;margin:0 0 4px!important;line-height:1.35}
                .interview-meta{display:flex;align-items:center;gap:5px 14px;flex-wrap:wrap}
                .interview-meta span{display:inline-flex;align-items:center;gap:4px;color:#777;font-size:11px;line-height:1.4}
                .interview-meta i{font-size:14px;color:#1967d2}
                .interview-summary{display:flex;flex-direction:column;align-items:flex-end;gap:5px;min-width:145px}
                .interview-date{color:#26364a;font-size:11px;font-weight:600;white-space:nowrap;line-height:1.4}
                .interview-date i{color:#1967d2;margin-right:4px}
                .interview-status{padding:2px 10px!important;border-radius:20px;font-size:10px!important;font-weight:600!important;line-height:1.5}
                .interview-status.active{color:#16834b;background:#e2f6eb}
                .interview-status.inactive{color:#c0392b;background:#fde9e7}
                .interview-toggle{width:27px;height:27px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#f1f5fb;color:#1967d2;font-size:13px}
                .interview-expanded-content{padding:12px 15px;border-top:1px solid #edf0f4;background:#fcfdff}
                .interview-section-heading{display:flex;align-items:center;gap:6px;margin:0 0 9px;font-size:13px;font-weight:700;color:#24364b}
                .interview-section-heading i{font-size:17px;color:#1967d2}
                .interview-details-single-box{border:1px solid #e6eaf0;border-radius:7px;background:#fff;padding:0 12px}
                .interview-details-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:20px}
                .interview-detail-item{min-width:0;padding:8px 0;border-bottom:1px solid #f0f1f4}
                .interview-detail-item span{display:block;font-size:10px;color:#858b96;margin-bottom:3px;line-height:1.35}
                .interview-detail-item strong,.interview-detail-item a{display:block;font-size:12px;color:#26364a;font-weight:600;line-height:1.4;overflow-wrap:anywhere}
                .interview-detail-item a{color:#1967d2}
                .interview-inline-section{padding:9px 0;border-bottom:1px solid #f0f1f4}
                .interview-inline-section:last-child{border-bottom:0}
                .interview-inline-label{display:block;font-size:11px;color:#596779;font-weight:700;margin-bottom:0px}
                .interview-inline-label i{color:#1967d2;font-size:14px;margin-right:5px}
                .interview-inline-section p{color:#555;font-size:12px;line-height:1.5;margin:0;overflow-wrap:anywhere;white-space:pre-wrap}
                .interview-meeting-link{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;background:#eef4ff;color:#1967d2;border-radius:5px;font-size:11px;font-weight:600;overflow-wrap:anywhere}
                .interview-card-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #edf0f4;padding-top:10px;margin-top:10px}
                .interview-footer-status{display:flex;align-items:center;gap:7px;font-size:11px;color:#818a98}
                .interview-footer-status strong{font-size:11px}
                .interview-footer-status strong.active{color:#16834b}
                .interview-footer-status strong.inactive{color:#c0392b}
                .view-job-link{color:#1967d2;font-size:11px;font-weight:600}
                .view-job-link i{margin-left:4px}
                .interviews-message,.empty-interviews{padding:35px 15px;text-align:center;color:#777;font-size:13px}
                .error-message{color:#c0392b;display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px}
                .error-message i{font-size:18px}
                .error-message button{border:0;color:#1967d2;background:transparent;font-weight:600;cursor:pointer;font-size:12px}
                .empty-interviews-icon{width:55px;height:55px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#eef4ff;color:#1967d2;font-size:26px;margin:0 auto 10px}
                .empty-interviews h4{font-size:15px;color:#26364a;margin:0 0 5px}
                .empty-interviews p{font-size:12px;margin:0}
                @media(max-width:991px){
                    .interview-details-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
                }
                @media(max-width:767px){
                    .interview-card-header{flex-wrap:wrap;gap:9px;padding:10px}
                    .interview-company-logo{width:43px;height:43px}
                    .interview-main-info{flex:1 1 calc(100% - 60px)}
                    .interview-summary{align-items:flex-start;margin-left:52px;min-width:0}
                    .interview-date{white-space:normal}
                    .interview-toggle{margin-left:auto}
                    .interview-expanded-content{padding:10px}
                    .interview-details-single-box{padding:0 9px}
                }
                @media(max-width:480px){
                    .interview-details-grid{grid-template-columns:1fr}
                    .interview-detail-item{padding:7px 0}
                    .interview-card-footer{align-items:flex-start}
                }
            `}</style>
        </div>
    );
};

export default InterviewSchedule;
