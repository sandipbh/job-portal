
'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RelatedJobs3 from "@/components/job-single-pages/related-jobs/RelatedJobs3";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import Image from "next/image";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";
import { formatDate, getTimeAgo } from "@/lib/dateUtils";
import { decodeJobId } from "@/lib/jobIdCrypto";
import JobViewTracker from "@/app/(job-single)/job-single-v2/JobViewTracker";

const normalizeKey = value => String(value).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

const getApiValue = (data, key) => {
    if (!data || typeof data !== "object") return null;
    const target = normalizeKey(key);
    const actualKey = Object.keys(data).find(k => normalizeKey(k) === target);
    return actualKey !== undefined ? data[actualKey] : null;
};

const extractSubscriptionData = result => {
    let data = result?.data ?? result?.Data ?? result;
    data = data?.data ?? data?.Data ?? data;
    if (Array.isArray(data)) data = data.length ? data[0] : null;
    return data && typeof data === "object" ? data : null;
};

const JobDetailsV2 = ({ id }) => {
    const router = useRouter();
    const [checkingSubscription, setCheckingSubscription] = useState(false);
    const jobId = decodeJobId(id) ?? 0;
    const [jobDetails, setJobDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [shareUrl, setShareUrl] = useState("");
    const [fullName, setFullName] = useState("");
    const [loginType, setLoginType] = useState("");
    const [loginUqid, setLoginUqid] = useState("");

    const [showCompanyDetails, setShowCompanyDetails] = useState(false);
    const [checkingCompanyAccess, setCheckingCompanyAccess] = useState(false);
    const [companyAccessMessage, setCompanyAccessMessage] = useState("");
    const [companyAccessType, setCompanyAccessType] = useState("login");

    useEffect(() => {
        setShareUrl(window.location.href);
    }, []);

    useEffect(() => {
        getCookiesValue();
    }, []);

    const getCookiesValue = async () => {
        try {
            const response = await fetch("/api/cookies-details", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            const fullname = data?.fullname ?? "";
            const role = data?.role ?? "";
            const uqid = data?.uqid ?? "";

            setFullName(fullname);
            setLoginType(role);
            setLoginUqid(uqid);

            if (String(role).toLowerCase() === "employer") {
                saveViewJob(uqid);
            }
        } catch (error) {
            console.error("Cookie details error:", error);
        }
    };

    const checkloginType = () => {
        if (loginType === "") {
            toast.error("Login your account.");
            return;
        }
        if (String(loginType).toLowerCase() !== "candidate") {
            toast.error("Login information is missing. Please log in as candidate.");
            return;
        }
    };

    useEffect(() => {
        getJobDetails();
    }, []);

    const saveViewJob = async (uqid) => {
        try {
            const payload = {
                LoginUqid: uqid,
                jobpostId: jobId
            };

            const response = await fetch("/api/save-job-view", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
        } catch (error) {
            console.error("Save job view error:", error);
        }
    };

    const getJobDetails = async () => {
        try {
            const response = await fetch(`/api/job-details?JobPostId=${jobId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();
            const listData = result?.data ?? result?.Data;

            if (listData) {
                setJobDetails(listData);
            }
        } catch (error) {
            console.error("Job details error:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleApplyClick = async () => {
        if (checkingSubscription) return;

        if (String(loginType).toLowerCase() !== "candidate") {
            toast.error("Please log in as a candidate.");
            return;
        }

        setCheckingSubscription(true);

        try {
            const response = await fetch("/api/candi-subscription-details", {
                method: "GET",
                cache: "no-store",
                headers: { "Content-Type": "application/json" }
            });

            const result = await response.json();

            const packageUrl = "/candidates-dashboard/packages";

            if (response.status === 404) {
                toast.warning("You don't have an active subscription. Please purchase a plan to apply for jobs.");
                router.push(`${packageUrl}?notice=subscription-required`);
                return;
            }

            if (!response.ok || result?.success === false || result?.Success === false) {
                throw new Error(result?.message || result?.Message || "Unable to verify your subscription.");
            }

            const subscription = extractSubscriptionData(result);

            if (!subscription) {
                toast.warning("Please purchase a subscription plan to apply for jobs.");
                router.push(`${packageUrl}?notice=subscription-required`);
                return;
            }

            const totalApply = Number(getApiValue(subscription, "TOTAL_APPLY") ?? 0);
            const usedApply = Number(getApiValue(subscription, "USE_APPLY") ?? 0);
            const remainingValue = getApiValue(subscription, "REMAINING_APPLY");

            const remainingApply = remainingValue !== null
                ? Number(remainingValue)
                : Math.max(0, totalApply - usedApply);

            if (!Number.isFinite(remainingApply) || remainingApply <= 0) {
                toast.warning("Your job application balance is exhausted. Please purchase or upgrade your subscription.");
                router.push(`${packageUrl}?notice=apply-balance-exhausted`);
                return;
            }

            const modalElement = document.getElementById("applyJobModal");

            if (!modalElement) {
                toast.error("Application form is currently unavailable. Please try again.");
                return;
            }

            Modal.getOrCreateInstance(modalElement).show();

        } catch (error) {
            console.error("Application subscription validation error:", error);
            toast.error(error.message || "Unable to verify your application balance. Please try again.");
        } finally {
            setCheckingSubscription(false);
        }
    };

    useEffect(() => {
        const checkCompanyAccess = async () => {
            setShowCompanyDetails(false);
            setCompanyAccessMessage("");

            const role = String(loginType || "").trim().toLowerCase();

            if (!role || role === "guest") {
                setCompanyAccessType("login");
                setCompanyAccessMessage("Please log in as a candidate to view company details.");
                return;
            }

            if (role !== "candidate") {
                setCompanyAccessType("candidate");
                setCompanyAccessMessage("Company details are available only to logged-in candidates.");
                return;
            }

            setCheckingCompanyAccess(true);

            try {
                const response = await fetch("/api/candi-subscription-details", {
                    method: "GET",
                    cache: "no-store",
                    headers: { "Content-Type": "application/json" }
                });

                if (response.status === 404) {
                    setCompanyAccessType("subscription");
                    setCompanyAccessMessage("You don't have an active subscription plan. Purchase a plan to view company details.");
                    return;
                }

                const result = await response.json();

                if (!response.ok || result?.success === false || result?.Success === false) {
                    throw new Error(result?.message || result?.Message || "Unable to verify your subscription.");
                }

                const getValue = (obj, key) => {
                    const actualKey = Object.keys(obj || {}).find(
                        k => k.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === key.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
                    );
                    return actualKey ? obj[actualKey] : null;
                };

                const findRows = obj => {
                    if (Array.isArray(obj)) return obj;
                    if (!obj || typeof obj !== "object") return [];

                    for (const key of ["data", "Data", "result", "Result", "subscriptions", "Subscriptions"]) {
                        if (obj[key] !== undefined) {
                            const rows = findRows(obj[key]);
                            if (rows.length) return rows;
                        }
                    }

                    return getValue(obj, "TOTAL_VIEW") !== null ? [obj] : [];
                };

                const subscriptions = findRows(result);

                if (!subscriptions.length) {
                    setCompanyAccessType("subscription");
                    setCompanyAccessMessage("You don't have an active subscription plan. Purchase a plan to view company details.");
                    return;
                }

                const remainingViews = subscriptions.reduce((total, subscription) => {
                    const totalView = Number(getValue(subscription, "TOTAL_VIEW") ?? 0);
                    const usedView = Number(getValue(subscription, "USE_VIEW") ?? 0);
                    const remainingValue = getValue(subscription, "REMAINING_VIEW");

                    const remaining = remainingValue !== null
                        ? Number(remainingValue)
                        : Math.max(0, totalView - usedView);

                    return total + (Number.isFinite(remaining) ? Math.max(0, remaining) : 0);
                }, 0);

                if (remainingViews < 1) {
                    setCompanyAccessType("balance");
                    setCompanyAccessMessage("Your company profile view balance is exhausted. Purchase or upgrade your subscription to view company details.");
                    return;
                }

                setShowCompanyDetails(true);
            } catch (error) {
                console.error("Company subscription validation error:", error);
                setCompanyAccessType("error");
                setCompanyAccessMessage("Unable to verify your subscription. Please try again later.");
            } finally {
                setCheckingCompanyAccess(false);
            }
        };

        checkCompanyAccess();
    }, [loginType]);

    return (
        <>
            {!loading && Number(jobId) > 0 && String(loginType).toLowerCase() === "candidate" && (
                <JobViewTracker jobPostId={jobId} />
            )}

            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                ))
            ) : (
                <>
                    <section className="job-detail-section">
                        <div className="job-detail-outer">
                            <div className="auto-container">
                                <div className="row align-items-start">
                                    <div className="upper-box" style={{ padding: "10px 0 10px" }}>
                                        <div className="auto-container">
                                            <div className="job-block-seven">
                                                <div className="inner-box">
                                                    <div className="content">
                                                        <span className="company-logo">
                                                            <Image
                                                                width={100}
                                                                height={80}
                                                                src={jobDetails?.logo || "/images/defaultLogo.png"}
                                                                alt="logo"
                                                                priority
                                                            />
                                                        </span>

                                                        <h4>{jobDetails?.jobTitle}</h4>

                                                        <ul className="job-info">
                                                            <li>
                                                                <span className="icon flaticon-briefcase"></span>
                                                                {jobDetails?.company}
                                                            </li>
                                                            <li>
                                                                <span className="icon flaticon-map-locator"></span>
                                                                {jobDetails?.location}
                                                            </li>
                                                            <li>
                                                                <span className="icon flaticon-clock-3"></span>{" "}
                                                                {getTimeAgo(jobDetails?.time)}
                                                            </li>
                                                            <li>
                                                                <span className="icon flaticon-money"></span>{" "}
                                                                {jobDetails?.salary}
                                                            </li>
                                                        </ul>

                                                        <ul className="job-other-info">
                                                            {jobDetails?.jobType?.map((val, i) => (
                                                                <li key={i} className={val.styleClass}>
                                                                    {val.type}
                                                                </li>
                                                            ))}

                                                            <li
                                                                key="view-count"
                                                                style={{
                                                                    background: "rgb(153 153 153 / 15%)",
                                                                    color: "#524831",
                                                                    fontSize: "10pt"
                                                                }}
                                                            >
                                                                <i className="la la-eye"></i> {jobDetails?.viewCount}
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    {String(loginType).toLowerCase() === "candidate" ? (
                                                        <div className="btn-box">
                                                            <button
                                                                type="button"
                                                                className="theme-btn btn-style-one"
                                                                onClick={handleApplyClick}
                                                                disabled={checkingSubscription}
                                                            >
                                                                {checkingSubscription ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                                        Checking Subscription...
                                                                    </>
                                                                ) : (
                                                                    "Apply For Job"
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="btn-box">
                                                            <button
                                                                type="button"
                                                                onClick={checkloginType}
                                                                className="theme-btn btn-style-one"
                                                            >
                                                                Apply For Job
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div
                                                        className="modal fade"
                                                        id="applyJobModal"
                                                        tabIndex="-1"
                                                        aria-hidden="true"
                                                    >
                                                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                                            <div
                                                                className="apply-modal-content modal-content"
                                                                style={{ overflowY: "auto" }}
                                                            >
                                                                <div className="text-center">
                                                                    <h3 className="title">Apply for this job</h3>
                                                                    <button
                                                                        id="applyModalCloseBtn"
                                                                        type="button"
                                                                        className="closed-modal"
                                                                        data-bs-dismiss="modal"
                                                                        aria-label="Close"
                                                                    ></button>
                                                                </div>

                                                                <ApplyJobModalContent
                                                                    id={jobId}
                                                                    hasQue={jobDetails?.hasQue || false}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="content-column col-lg-8 col-md-12 col-sm-12 mt-4">
                                        <div className="job-block-outer">
                                            <div className="job-block-seven">
                                                <div className="inner-box"></div>
                                            </div>
                                        </div>

                                        <div className="job-detail">
                                            <h4 style={{ marginBottom: "0px" }}>Job Description</h4>
                                            <div className="ql-snow">
                                                <div
                                                    className="ql-editor"
                                                    style={{ padding: "5px 0px" }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: jobDetails?.jobDesc || ""
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="job-detail">
                                            <h4 className="mt-2 mb-2">Skills</h4>
                                            <ul className="job-skills">
                                                {(jobDetails?.skills ?? "").split(", ").map((item, index, arr) => (
                                                    <li key={index}>
                                                        {item.replace("*", "")}
                                                        {item.includes("*") && (
                                                            <sup
                                                                className="fa fa-star"
                                                                style={{
                                                                    fontSize: "xx-small",
                                                                    color: "#d66a22",
                                                                    top: "-0.9em"
                                                                }}
                                                            ></sup>
                                                        )}
                                                        {index < arr.length - 1 && ", "}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div
                                            className="other-options"
                                            style={{ marginBottom: "10px", marginTop: "10px" }}
                                        >
                                            <div className="social-share">
                                                <h5>Share this job</h5>
                                                <a
                                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                    className="facebook"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i className="fab fa-facebook-f"></i>Facebook
                                                </a>
                                                <a
                                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(jobDetails?.jobTitle || "Check out this job!")}`}
                                                    className="twitter"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i className="fab fa-twitter"></i>Twitter
                                                </a>
                                                <a
                                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                                    className="linkedin"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i className="fab fa-linkedin"></i>Linkedin
                                                </a>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-6 col-12 col-lg-6 col-md-6 align-self-start mt-3">
                                                <h4
                                                    style={{
                                                        fontWeight: "500",
                                                        fontSize: "18px",
                                                        lineHeight: "24px",
                                                        color: "rgb(32, 33, 36)",
                                                        marginBottom: "20px"
                                                    }}
                                                >
                                                    Job Overview
                                                </h4>

                                                <div className="widget-content">
                                                    <ul className="job-overview">
                                                        <li>
                                                            <i className="icon icon-calendar"></i>
                                                            <h5>Date Posted:</h5>
                                                            <span>Posted {getTimeAgo(jobDetails?.time)}</span>
                                                        </li>
                                                        <li>
                                                            <i className="icon icon-expiry"></i>
                                                            <h5>Expiration date:</h5>
                                                            <span>{formatDate(jobDetails?.expire_at)}</span>
                                                        </li>
                                                        <li>
                                                            <i className="icon icon-location"></i>
                                                            <h5>Location:</h5>
                                                            <span>{jobDetails?.location}</span>
                                                        </li>
                                                        <li>
                                                            <i className="icon icon-user-2"></i>
                                                            <h5>Job Title:</h5>
                                                            <span>{jobDetails?.jobTitle}</span>
                                                        </li>
                                                        <li>
                                                            <i className="icon icon-salary"></i>
                                                            <h5>Salary:</h5>
                                                            <span>{jobDetails?.salary}</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>


                                            <div className="col-12 col-lg-6 col-md-6 align-self-start mt-3">
                                                {checkingCompanyAccess ? (
                                                    <div className="widget-content text-center p-4">
                                                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                                                        <p className="mt-2 mb-0">Checking company details access...</p>
                                                    </div>
                                                ) : showCompanyDetails ? (
                                                    <div className="widget-content">
                                                        <h4 className="company-heading">Company Details</h4>
                                                        <div className="company-title">
                                                            <div className="company-logo">
                                                                <Image
                                                                    width={100}
                                                                    height={80}
                                                                    src={jobDetails?.logo || "/images/defaultLogo.png"}
                                                                    alt="resource"
                                                                    priority
                                                                />
                                                            </div>
                                                            <h6 className="company-name">{jobDetails?.company}</h6>
                                                            {jobDetails?.compWebsite && (
                                                                <a
                                                                    href={jobDetails.compWebsite}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="profile-link"
                                                                >
                                                                    View company profile
                                                                </a>
                                                            )}
                                                            <div>
                                                                <ul className="company-info" style={{ marginBottom: "10px" }}>
                                                                    <li style={{ paddingTop: "8px" }}>
                                                                        Primary industry: <span>{jobDetails?.indistry}</span>
                                                                    </li>
                                                                    <li style={{ paddingTop: "8px" }}>
                                                                        Company size: <span>{jobDetails?.compSize}</span>
                                                                    </li>
                                                                    <li style={{ paddingTop: "8px" }}>
                                                                        Location: <span>{jobDetails?.compCity}, {jobDetails?.compState}</span>
                                                                    </li>
                                                                </ul>
                                                                {jobDetails?.compWebsite && (
                                                                    <div className="btn-box">
                                                                        <a
                                                                            href={jobDetails.compWebsite}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-sm btn-outline-primary w-100"
                                                                        >
                                                                            Visit Website
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="widget-content text-center p-4">
                                                        <div className="mb-3">
                                                            <i className="la la-lock" style={{ fontSize: "42px", color: "#6c757d" }} />
                                                        </div>
                                                        <h4 className="company-heading">Company Details Locked</h4>
                                                        <p className="mb-3">
                                                            {companyAccessMessage || "Please log in as a candidate to view company details."}
                                                        </p>

                                                        {companyAccessType === "login" && (
                                                            <a href="/login" className="theme-btn btn-style-one">
                                                                Login to Continue
                                                            </a>
                                                        )}

                                                        {companyAccessType === "candidate" && (
                                                            <a href="/login" className="theme-btn btn-style-one">
                                                                Login as Candidate
                                                            </a>
                                                        )}

                                                        {(companyAccessType === "subscription" || companyAccessType === "balance") && (
                                                            <a
                                                                href="/candidates-dashboard/packages"
                                                                className="theme-btn btn-style-one"
                                                            >
                                                                View Subscription Plans
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    <div className="sidebar-column col-lg-4 col-md-12 col-sm-12 mt-4">
                                        <aside className="sidebar">
                                            <div
                                                className="sidebar-widget"
                                                style={{
                                                    marginBlock: "0px",
                                                    padding: "10px"
                                                }}
                                            >
                                                <div className="related-jobs">
                                                    <div className="title-box">
                                                        <h3>Related Jobs</h3>
                                                    </div>
                                                    <div className="row">
                                                        <RelatedJobs3 id={jobDetails?.indistryList} />
                                                    </div>
                                                </div>
                                            </div>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </>
    );
};

export default JobDetailsV2;
