'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { encodeJobId } from "@/lib/jobIdCrypto";
import DOMPurify from "isomorphic-dompurify";
import { toast } from "react-toastify";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

<ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    theme="colored"
/>

const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value || 0));
};

const JobFavouriteTable = () => {
    const [jobList, setJobList] = useState([]);
    const [expandedOffer, setExpandedOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [offerAgreements, setOfferAgreements] = useState({});
    const [decisionLoading, setDecisionLoading] = useState({});

    useEffect(() => {
        getJobOffers();
    }, []);

    const getJobOffers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/candi-job-offers", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                cache: "no-store"
            });

            const result = await response.json();

            if (!response.ok || !result?.isSuccess) {
                throw new Error(result?.message || "Unable to fetch job offers.");
            }

            setJobList(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Job Offers Error:", error);
            setError(error.message || "Something went wrong while fetching job offers.");
        } finally {
            setLoading(false);
        }
    };

    const toggleOffer = (offerSrno) => {
        setExpandedOffer((previous) => previous === offerSrno ? null : offerSrno);
    };

    const getStatusClass = status => {
        switch ((status || "").toLowerCase()) {
            case "pending":
                return "pending";
            case "accepted":
            case "offer accept":
                return "accepted";
            case "rejected":
            case "offer reject":
                return "rejected";
            default:
                return "default";
        }
    };

    const handleOfferDecision = async (item, decision) => {
        const offerKey = item.offerSrno;
        const agreed = offerAgreements[offerKey] === true;

        if (decision === "Offer Accept" && !agreed) {
            toast.warning("Please confirm that you have read and accepted the offer terms.");
            return;
        }

        if (!item.applicationId || !item.jobPostId) {
            toast.error("Application details are missing. Please refresh the page and try again.");
            return;
        }
        if (decision === "Offer Reject") {
            toast.info(
                <div>
                    <p className="mb-2">Are you sure you want to reject this offer?</p>
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                                toast.dismiss();
                                submitOfferDecision(item, decision);
                            }}
                        >
                            Yes, Reject
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => toast.dismiss()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>,
                { autoClose: false, closeOnClick: false, draggable: false }
            );
            return;
        }
        try {
            setDecisionLoading(prev => ({ ...prev, [offerKey]: true }));

            const response = await fetch("/api/candi-job-offer-decision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    details: {
                        applicationId: item.applicationId,
                        jobpostId: item.jobPostId,
                        ttype: decision,
                        agreed
                    }
                })
            });

            const result = await response.json();

            if (!response.ok || !result?.isSuccess) {
                toast.error(result?.message || "Unable to update offer decision.");
                return;
            }

            toast.success(result.message || "Offer decision updated successfully.");
            setOfferAgreements(prev => ({ ...prev, [offerKey]: false }));
            await getJobOffers();
        } catch (error) {
            console.error("Offer decision error:", error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setDecisionLoading(prev => ({ ...prev, [offerKey]: false }));
        }
    };

    const submitOfferDecision = async (item, decision) => {
        const offerKey = item.offerSrno;
        const agreed = offerAgreements[offerKey] === true;

        try {
            setDecisionLoading(prev => ({ ...prev, [offerKey]: true }));

            const response = await fetch("/api/candi-job-offer-decision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    details: {
                        applicationId: item.applicationId,
                        jobpostId: item.jobPostId,
                        ttype: decision,
                        agreed
                    }
                })
            });

            const result = await response.json();

            if (!response.ok || !result?.isSuccess) {
                toast.error(result?.message || "Unable to update offer decision.");
                return;
            }

            toast.success(result.message || "Offer decision updated successfully.");
            setOfferAgreements(prev => ({ ...prev, [offerKey]: false }));
            await getJobOffers();
        } catch (error) {
            console.error("Offer decision error:", error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setDecisionLoading(prev => ({ ...prev, [offerKey]: false }));
        }
    };

    return (
        <div className="tabs-box candidate-offers">
            <div className="widget-title offers-heading">
                <div>
                    <h4>My Job Offers</h4>
                    <p>View your employment offers and offer letter details.</p>
                </div>
                <span className="offer-count">
                    {jobList.length} {jobList.length === 1 ? "Offer" : "Offers"}
                </span>
            </div>

            <div className="widget-content">
                {loading ? (
                    <div className="offers-message">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Loading your job offers...
                    </div>
                ) : error ? (
                    <div className="offers-message error-message">
                        <i className="la la-exclamation-circle"></i>
                        <span>{error}</span>
                        <button type="button" onClick={getJobOffers}>
                            Try Again
                        </button>
                    </div>
                ) : jobList.length === 0 ? (
                    <div className="empty-offers">
                        <div className="empty-offers-icon">
                            <i className="la la-file-alt"></i>
                        </div>
                        <h4>No Job Offers Yet</h4>
                        <p>
                            When an employer sends you an employment offer,
                            it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="offer-list">
                        {jobList.map((item) => {
                            const isExpanded = expandedOffer === item.offerSrno;

                            return (
                                <div
                                    className={`offer-card ${isExpanded ? "expanded" : ""}`}
                                    key={item.offerSrno}
                                >
                                    <button
                                        type="button"
                                        className="offer-card-header"
                                        onClick={() => toggleOffer(item.offerSrno)}
                                        aria-expanded={isExpanded}
                                    >
                                        <div className="offer-company-logo">
                                            {item.logo ? (
                                                <img
                                                    src={item.logo}
                                                    alt={item.company || "Company"}
                                                />
                                            ) : (
                                                <i className="la la-building"></i>
                                            )}
                                        </div>

                                        <div className="offer-main-info">
                                            <h4>{item.jobTitle}</h4>
                                            <div className="offer-company">
                                                <i className="la la-building"></i>
                                                {item.company}
                                            </div>
                                            <div className="offer-location">
                                                <i className="la la-map-marker"></i>
                                                {item.location || "Location not specified"}
                                            </div>
                                        </div>

                                        <div className="offer-summary d-flex gap-2">
                                            <div>
                                                <span className="offer-ctc-label">Annual CTC : </span>
                                                <span className="fw-medium">{formatCurrency(item.annualCtc)}</span>
                                                <span className={`offer-status ms-3 ${getStatusClass(item.offerStatus)}`}>
                                                    {item.offerStatus}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="offer-toggle">
                                            <i className={`la ${isExpanded ? "la-angle-up" : "la-angle-down"}`}></i>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="offer-expanded-content">
                                            <div className="offer-details-grid">
                                                <div className="offer-detail-box">
                                                    <span>Offer Date : </span>
                                                    <strong>{formatDateTime(item.offerDate)}</strong>
                                                </div>

                                                <div className="offer-detail-box">
                                                    <span>Offer Valid Until : </span>
                                                    <strong>{formatDate(item.validDate)}</strong>
                                                </div>

                                                <div className="offer-detail-box">
                                                    <span>Manager Name : </span>
                                                    <strong>{item.managerName || "N/A"}</strong>
                                                </div>

                                                <div className="offer-detail-box">
                                                    <span>Email Address : </span>
                                                    <a href={`mailto:${item.managerEmail}`}>
                                                        {item.managerEmail || "N/A"}
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="offer-letter-section">
                                                <div className="offer-letter-heading">
                                                    <div>
                                                        <h5>
                                                            Offer Description
                                                        </h5>
                                                    </div>
                                                </div>

                                                <div
                                                    className="offer-letter-document"
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(item.description || "")
                                                    }}
                                                />
                                            </div>

                                            <div className="offer-card-footer">
                                                <div>
                                                    <span>Job Type:</span>
                                                    <strong>{item.jobType || "N/A"}</strong>
                                                </div>
                                                <div>
                                                    <span>Work Mode:</span>
                                                    <strong>{item.workMode || "N/A"}</strong>
                                                </div>
                                                <Link href={`/job-single-v2/${encodeJobId(item.jobPostId)}`} className="view-job-link">
                                                    View Job Details
                                                    <i className="la la-arrow-right"></i>
                                                </Link>
                                                <div className="offer-agreement">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!offerAgreements[item.offerSrno]}
                                                            onChange={e => setOfferAgreements(prev => ({
                                                                ...prev,
                                                                [item.offerSrno]: e.target.checked
                                                            }))}
                                                            disabled={item.offerStatus === "Offer Accept" || item.offerStatus === "Offer Reject"}
                                                        />
                                                        <span>
                                                            I have read and understood all the details, terms and conditions mentioned in this offer letter, and I agree to accept this offer.
                                                        </span>
                                                    </label>
                                                </div>
                                                <div className="offer-action-buttons">
                                                    <button
                                                        type="button"
                                                        className="btn-accept"
                                                        disabled={!offerAgreements[item.offerSrno] || !!decisionLoading[item.offerSrno] || item.offerStatus === "Offer Accept" || item.offerStatus === "Offer Reject"}
                                                        onClick={() => handleOfferDecision(item, "Offer Accept")}
                                                    >
                                                        {decisionLoading[item.offerSrno] ? "Processing..." : "Accept"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-reject"
                                                        disabled={!!decisionLoading[item.offerSrno] || item.offerStatus === "Offer Accept" || item.offerStatus === "Offer Reject"}
                                                        onClick={() => handleOfferDecision(item, "Offer Reject")}
                                                    >
                                                        {decisionLoading[item.offerSrno] ? "Processing..." : "Reject"}
                                                    </button>
                                                </div>
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
                .candidate-offers {
                    width: 100%;
                }
                .offers-heading {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                .offers-heading h4 {
                    margin-bottom: 5px;
                }
                .offers-heading p {
                    color: #777;
                    font-size: 13px;
                    margin: 0;
                }
                .offer-count {
                    background: #eef4ff;
                    color: #1967d2;
                    padding: 7px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                }
                .offer-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .offer-card {
                    border: 1px solid #e7eaf0;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #fff;
                    transition: box-shadow .2s ease, border-color .2s ease;
                }
                .offer-card:hover,
                .offer-card.expanded {
                    border-color: #b9ccec;
                    box-shadow: 0 5px 20px rgba(20, 50, 90, .07);
                }
                .offer-card-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    padding: 20px;
                    border: 0;
                    background: transparent;
                    text-align: left;
                    cursor: pointer;
                }
                .offer-company-logo {
                    width: 60px;
                    height: 55px;
                    flex-shrink: 0;
                    border: 1px solid #edf0f4;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background: #f8faff;
                }
                .offer-company-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    padding: 5px;
                }
                .offer-company-logo i {
                    font-size: 30px;
                    color: #1967d2;
                }
                .offer-main-info {
                    flex: 1;
                    min-width: 0;
                }
                .offer-main-info h4 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #202b3c;
                    margin: 0 0 5px;
                }
                .offer-company,
                .offer-location {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    color: #777;
                    font-size: 13px;
                    margin-right: 16px;
                }
                .offer-company i,
                .offer-location i {
                    font-size: 16px;
                    color: #1967d2;
                }
                .offer-summary {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 5px;
                    min-width: 125px;
                }
                .offer-ctc-label {
                    color: #858b96;
                    font-size: 15px;
                }
                .offer-summary strong {
                    color: #172b4d;
                    font-size: 17px;
                }
                .offer-status {
                    padding: 4px 11px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: capitalize;
                }
                .offer-status.pending {
                    color: #9a6700;
                    background: #fff4d6;
                }
                .offer-status.accepted {
                    color: #16834b;
                    background: #e2f6eb;
                }
                .offer-status.rejected {
                    color: #c0392b;
                    background: #fde9e7;
                }
                .offer-status.default {
                    color: #536174;
                    background: #edf1f5;
                }
                .offer-toggle {
                    width: 30px;
                    height: 30px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #f1f5fb;
                    color: #1967d2;
                    font-size: 19px;
                }
                .offer-toggle i{ font-size: 15px; }
                .offer-expanded-content {
                    padding: 10px 15px;
                    border-top: 1px solid #edf0f4;
                    background: #fcfdff;
                }
                .offer-details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }
                .offer-detail-box {
                    padding: 5px 10px;
                    background: #fff;
                    border: 1px solid #e9edf3;
                    border-radius: 9px;
                    display: flex;
                    gap: 5px;
                    justify-content: flex-start;
                }
                .offer-detail-box span,
                .manager-info span {
                    display: block;
                    font-size: 13px;
                    color: #3e3e3e;
                    margin-bottom: 0px;
                    font-weight: 500;
                }
                .offer-detail-box strong,
                .manager-info strong {
                    display: block;
                    font-size: 14px;
                    color: #26364a;
                    overflow-wrap: anywhere;
                }
                .offer-detail-box .highlight-ctc {
                    color: #16834b;
                    font-size: 16px;
                }
                .offer-manager-section {
                    margin-top: 22px;
                    padding: 18px;
                    border: 1px solid #e9edf3;
                    background: #fff;
                    border-radius: 10px;
                }
                .offer-manager-section h5,
                .offer-letter-heading h5 {
                    margin: 0 0 14px;
                    font-size: 15px;
                    font-weight: 700;
                    color: #24364b;
                }
                .offer-manager-section h5 i,
                .offer-letter-heading h5 i {
                    color: #1967d2;
                    margin-right: 7px;
                    font-size: 18px;
                }
                .manager-info {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 20px;
                }
                .manager-info a {
                    color: #1967d2;
                    font-size: 14px;
                    overflow-wrap: anywhere;
                }
                .offer-letter-section {
                    margin-top: 22px;
                }
                .offer-letter-heading {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .offer-letter-heading h5 {
                    margin-bottom: 4px;
                }
                .offer-letter-heading p {
                    margin: 0;
                    font-size: 12px;
                    color: #858b96;
                }
                .offer-letter-badge {
                    white-space: nowrap;
                    padding: 7px 12px;
                    background: #edf4ff;
                    color: #1967d2;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                }
                .offer-letter-document {
                    padding: 28px;
                    border: 1px solid #e3e7ed;
                    border-radius: 9px;
                    background: #fff;
                    color: #333;
                    font-size: 14px;
                    line-height: 1.7;
                    overflow-wrap: anywhere;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, .025);
                }
                .offer-letter-document :global(h2),
                .offer-letter-document :global(h3),
                .offer-letter-document :global(h4),
                .offer-letter-document :global(h5) {
                    color: #202b3c;
                    margin-top: 18px;
                    margin-bottom: 10px;
                }
                .offer-letter-document :global(p) {
                    margin-bottom: 12px;
                }
                .offer-letter-document :global(ul) {
                    padding-left: 22px;
                    margin-bottom: 15px;
                }
                .offer-letter-document :global(li) {
                    margin-bottom: 6px;
                }
                .offer-card-footer {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;
                    border-top: 1px solid #edf0f4;
                    padding-top: 18px;
                    margin-top: 20px;
                }
                .offer-card-footer div {
                    font-size: 12px;
                    color: #818a98;
                }
                .offer-card-footer strong {
                    color: #26364a;
                    margin-left: 5px;
                }
                .view-job-link {
                    margin-left: auto;
                    color: #1967d2;
                    font-size: 10px !important;
                    font-weight: 600;
                }
                .view-job-link i {
                    margin-left: 6px;
                }
                .offers-message,
                .empty-offers {
                    padding: 45px 15px;
                    text-align: center;
                    color: #777;
                }
                .error-message {
                    color: #c0392b;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .error-message i {
                    font-size: 20px;
                }
                .error-message button {
                    border: 0;
                    color: #1967d2;
                    background: transparent;
                    font-weight: 600;
                    cursor: pointer;
                }
                .empty-offers-icon {
                    width: 65px;
                    height: 65px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: #eef4ff;
                    color: #1967d2;
                    font-size: 30px;
                    margin: 0 auto 15px;
                }
                .empty-offers h4 {
                    font-size: 17px;
                    color: #26364a;
                    margin-bottom: 8px;
                }
                .empty-offers p {
                    font-size: 13px;
                    margin: 0;
                }
                @media (max-width: 767px) {
                    .offer-card-header {
                        flex-wrap: wrap;
                        gap: 12px;
                        padding: 15px;
                    }
                    .offer-company-logo {
                        width: 52px;
                        height: 52px;
                    }
                    .offer-main-info {
                        flex-basis: calc(100% - 70px);
                    }
                    .offer-summary {
                        align-items: flex-start;
                        margin-left: 64px;
                    }
                    .offer-toggle {
                        margin-left: auto;
                    }
                    .offer-details-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                    .offer-expanded-content {
                        padding: 10px;
                    }
                    .manager-info {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .offer-letter-document {
                        padding: 16px;
                    }
                    .offer-letter-heading {
                        align-items: flex-start;
                        flex-direction: column;
                    }
                    .view-job-link {
                        margin-left: 0;
                    }
                }
                @media (max-width: 420px) {
                    .offer-details-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default JobFavouriteTable;