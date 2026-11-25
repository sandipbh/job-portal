
'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const PACKAGE_PAGE = "/employers-dashboard/packages";

const ApplicantCard = ({
    candidate,
    onUpdateStatus,
    onUpdateCallStatus,
    onShortlist,
    onMaybe,
    onReject,
    onDelete,
    onUpdateComments,
}) => {
    const router = useRouter();

    const [showShareModal, setShowShareModal] = useState(false);
    const [loadingShare, setLoadingShare] = useState(false);
    const [shareEmail, setShareEmail] = useState("");
    const [shareRemark, setShareRemark] = useState("");
    const [showComment, setShowComment] = useState(false);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [srno, setSrno] = useState("0");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(candidate.status || "");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [isSaved, setIsSaved] = useState(candidate.isSave === "Y");
    const [loadingBookmark, setLoadingBookmark] = useState(false);
    const [showContact, setShowContact] = useState(null);

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [shortlistBalance, setShortlistBalance] = useState(0);
    const [viewBalance, setViewBalance] = useState(0);
    const [permissionLoading, setPermissionLoading] = useState(true);

    const normalizeKey = value =>
        String(value ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    const getValue = (data, key) => {
        if (!data || typeof data !== "object") return null;
        const actualKey = Object.keys(data).find(
            property => normalizeKey(property) === normalizeKey(key)
        );
        return actualKey !== undefined ? data[actualKey] : null;
    };

    const findSubscriptionRows = obj => {
        if (Array.isArray(obj)) {
            return obj.flatMap(item => findSubscriptionRows(item));
        }

        if (!obj || typeof obj !== "object") return [];

        if (
            getValue(obj, "TOTAL_VIEW") !== null ||
            getValue(obj, "TOTAL_SHORT") !== null ||
            getValue(obj, "REMAINING_VIEW") !== null ||
            getValue(obj, "REMAINING_SHORT") !== null
        ) {
            return [obj];
        }

        for (const key of ["data", "result", "subscriptions", "items", "payload"]) {
            const nested = getValue(obj, key);
            if (nested !== null) {
                const rows = findSubscriptionRows(nested);
                if (rows.length) return rows;
            }
        }

        return [];
    };

    const fetchSubscriptionBalances = useCallback(async () => {
        try {
            setPermissionLoading(true);

            const response = await fetch("/api/emp-subscription-details", {
                method: "GET",
                cache: "no-store",
                headers: { "Cache-Control": "no-cache" }
            });

            if (response.status === 404) {
                setIsSubscribed(false);
                setShortlistBalance(0);
                setViewBalance(0);
                return;
            }

            const result = await response.json();

            if (
                !response.ok ||
                result?.success === false ||
                result?.Success === false
            ) {
                throw new Error(
                    result?.message ||
                    result?.Message ||
                    "Unable to fetch subscription balance."
                );
            }

            const subscriptions = findSubscriptionRows(result);

            if (!subscriptions.length) {
                setIsSubscribed(false);
                setShortlistBalance(0);
                setViewBalance(0);
                return;
            }

            const balances = subscriptions.reduce((acc, item) => {
                const totalShort = Number(getValue(item, "TOTAL_SHORT") ?? 0);
                const usedShort = Number(getValue(item, "USE_SHORT") ?? 0);
                const remainingShort = getValue(item, "REMAINING_SHORT")
                    ?? getValue(item, "BALANCE_SHORT");

                const totalView = Number(getValue(item, "TOTAL_VIEW") ?? 0);
                const usedView = Number(getValue(item, "USE_VIEW") ?? 0);
                const remainingView = getValue(item, "REMAINING_VIEW")
                    ?? getValue(item, "BALANCE_VIEW");

                const shortBalance = remainingShort !== null
                    ? Number(remainingShort)
                    : totalShort - usedShort;

                const profileBalance = remainingView !== null
                    ? Number(remainingView)
                    : totalView - usedView;

                acc.short += Number.isFinite(shortBalance)
                    ? Math.max(0, shortBalance)
                    : 0;

                acc.view += Number.isFinite(profileBalance)
                    ? Math.max(0, profileBalance)
                    : 0;

                return acc;
            }, { short: 0, view: 0 });

            setIsSubscribed(true);
            setShortlistBalance(balances.short);
            setViewBalance(balances.view);
        } catch (error) {
            console.error("Employer Subscription Balance Error:", error);
            setIsSubscribed(false);
            setShortlistBalance(0);
            setViewBalance(0);
        } finally {
            setPermissionLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscriptionBalances();
    }, [fetchSubscriptionBalances]);

    const canShortlist = isSubscribed && shortlistBalance > 0;
    const canViewProfile = isSubscribed && viewBalance > 0;

    const checkShortlistPermission = () => {
        if (permissionLoading) {
            toast.info("Checking your subscription. Please wait.");
            return false;
        }

        if (!isSubscribed) {
            router.push(`${PACKAGE_PAGE}?notice=subscription-required`);
            return false;
        }

        if (shortlistBalance <= 0) {
            router.push(`${PACKAGE_PAGE}?notice=shortlist-balance-exhausted`);
            return false;
        }

        return true;
    };

    const checkProfileViewPermission = () => {
        if (permissionLoading) {
            toast.info("Checking your subscription. Please wait.");
            return false;
        }

        if (!isSubscribed) {
            router.push("/employers-dashboard/packages?notice=subscription-required");
            return false;
        }

        if (viewBalance <= 0) {
            router.push("/employers-dashboard/packages?notice=view-balance-exhausted");
            return false;
        }

        return true;
    };

    const handleContactClick = () => {
        if (!checkProfileViewPermission()) return;
        setShowContact(candidate.candiUqId);
    };

    const openResume = (resumePath) => {
        if (!checkProfileViewPermission()) return;

        if (!resumePath?.trim()) {
            toast.error("Resume is not available.");
            return;
        }

        const url = resumePath.startsWith("http")
            ? resumePath
            : `/${resumePath.replace(/^\/+/, "")}`;

        window.open(url, "_blank", "noopener,noreferrer");
    };

    useEffect(() => {
        setIsSaved(candidate.isSave === "Y");
    }, [candidate.isSave]);

    useEffect(() => {
        setStatus(candidate.status || "");
    }, [candidate.status]);

    const parseComments = (commentsString, applicationId) => {
        if (!commentsString) return [];

        const currentAppId = Number(applicationId);

        return commentsString
            .split("#")
            .filter(Boolean)
            .map(item => {
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
            .filter(item => Number(item.appId) === currentAppId);
    };

    const formatComments = list => {
        return list
            .map(item =>
                `${item.id}^${item.appId || candidate.id}^${item.comment || ""}^${item.tdate || ""}`
            )
            .join("#");
    };

    useEffect(() => {
        setCommentList(parseComments(candidate.comments, candidate.id));
    }, [candidate.comments, candidate.id]);

    const handleBookmarkSubmit = async (e, appId) => {
        e?.preventDefault();

        try {
            setLoadingBookmark(true);

            const res = await fetch("/api/emp-application-profile-bookmark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId: appId,
                    jobpostId: candidate.jobId,
                }),
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed.");
                return;
            }

            setIsSaved(prev => !prev);
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingBookmark(false);
        }
    };

    const updateComment = (id, text) => {
        setSrno(id);
        setComment(text);
        setEditingCommentId(id);
        setError("");
    };

    const confirmDelete = candidateData => {
        toast(
            ({ closeToast }) => (
                <div>
                    <div className="mb-2">Do you want to delete this candidate?</div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                                closeToast();
                                await handleStatus(
                                    "Deleted",
                                    candidateData.candiUqId,
                                    candidateData.id
                                );
                            }}
                        >
                            Yes
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={closeToast}
                        >
                            No
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            }
        );
    };

    const handleShareSubmit = async (e, appId) => {
        e.preventDefault();

        const payload = {
            applicationId: appId,
            jobpostId: candidate.jobId,
            shareEmail,
            shareRemark,
            shareLink: `${window.location.origin}/candidates-single-v1/${candidate.candiUqId}`,
        };

        try {
            setLoadingShare(true);

            const res = await fetch("/api/emp-application-profile-share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed.");
                return;
            }

            setShowShareModal(false);
            setShareEmail("");
            setShareRemark("");
            toast.success(user.message || "Profile shared successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingShare(false);
        }
    };

    const deleteComment = async id => {
        const selectedComment = commentList.find(item => item.id === id);

        if (!selectedComment) {
            toast.error("Request failed.");
            return;
        }

        if (selectedComment.id < 1 || selectedComment.appId < 1) {
            setError("Invalid request.");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/emp-application-delete-comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    details: {
                        applicationId: selectedComment.appId,
                        jobpostId: candidate.jobId,
                        commentSrno: id,
                    },
                }),
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed.");
                return;
            }

            toast.success(user.message || "Comment deleted.");

            const updatedList = commentList.filter(item => item.id !== id);
            setCommentList(updatedList);

            onUpdateComments?.(candidate.id, formatComments(updatedList));
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const validateInput = value => {
        const regex = /^[a-zA-Z0-9\s.,!?()&'":;-]*$/;
        return regex.test(value);
    };

    const handleSubmit = async appId => {
        if (!comment.trim() || comment.trim().length < 2) {
            setError("Enter your comments.");
            return;
        }

        if (!appId || appId < 1) {
            setError("Invalid request.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/emp-application-comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    details: {
                        applicationId: appId,
                        jobpostId: candidate.jobId,
                        commentSrno: srno,
                        comments: comment,
                    },
                }),
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed.");
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
                ? commentList.map(item =>
                    item.id === editingCommentId
                        ? { ...item, comment, tdate: item.tdate || currentDate }
                        : item
                )
                : [
                    ...commentList,
                    {
                        id: Number(savedId) || commentList.length + 1,
                        appId: Number(appId),
                        comment,
                        tdate: currentDate,
                    },
                ];

            setCommentList(updatedList);
            onUpdateComments?.(candidate.id, formatComments(updatedList));

            setComment("");
            setShowComment(true);
            setEditingCommentId(null);
            setSrno("0");
            toast.success(user.message || "Comment saved.");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (ttype, candiUqId = candidate.candiUqId, appId = candidate.id) => {
        if (loading) return;

        if (ttype === "Shortlisted" && !checkShortlistPermission()) return;

        try {
            setLoading(true);

            const response = await fetch("/api/emp-application-change-status", {
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

            const result = await response.json();

            if (response.status === 402) {
                if (ttype === "Shortlisted") {
                    await fetchSubscriptionBalances();
                    router.push(`${PACKAGE_PAGE}?notice=shortlist-balance-exhausted`);
                } else {
                    toast.error(result.message || "Unable to update candidate status.");
                }
                return;
            }

            if (
                !response.ok ||
                result?.success === false ||
                result?.Success === false
            ) {
                throw new Error(
                    result?.message ||
                    result?.Message ||
                    "Unable to update candidate status."
                );
            }

            setStatus(ttype);
            onUpdateStatus?.(appId, ttype);

            if (ttype === "Shortlisted") {
                onShortlist?.(candidate);
                await fetchSubscriptionBalances();
            } else if (ttype === "Maybe") {
                onMaybe?.(candidate);
            } else if (ttype === "Rejected") {
                onReject?.(candidate);
            } else if (ttype === "Deleted") {
                onDelete?.(candidate);
            }

            toast.success(result?.message || result?.Message || "Candidate status updated.");
        } catch (error) {
            console.error("Application Status Error:", error);
            toast.error(error.message || "Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCallStatus = async (callStatus, appId) => {
        if (!callStatus || !appId || appId < 1) {
            setError("Invalid request.");
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
                        status: callStatus,
                        candiUqId: candidate.candiUqId,
                    },
                }),
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed.");
                return;
            }

            onUpdateCallStatus?.(appId, callStatus);
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text, type) => {
        if (!text) {
            toast.error(`${type} is not available.`);
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${type} copied!`);
        } catch (error) {
            toast.error(`Unable to copy ${type}.`);
        }
    };

    return (
        <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
            <div className={`inner-box ${candidate.status !== "Applied" ? "show-check" : ""}`}>
                <div className="content">
                    <div className="d-flex align-items-center gap-1">
                        <figure className="image mb-0 flex-shrink-0">
                            <Image
                                src={candidate.avatar || "/images/resource/candidate-default.png"}
                                alt="Candidate"
                                width={70}
                                height={70}
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                }}
                            />
                        </figure>

                        <h4 className="name mb-0">
                            <div className="d-flex justify-content-between align-items-center gap-2">
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                    <input type="checkbox" className="me-1" />
                                    <Link href={`/candidates-single-v1/${candidate.candiUqId}`}>
                                        {candidate.candiName}
                                    </Link>
                                    {candidate.verifyStatus?.toLowerCase() === "verified" && (
                                        <span className="text-success p-0 mt-0">
                                            <i className="fa fa-check-circle fw-normal me-1 fa-sm"></i>
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="action-icon-btn"
                                    onClick={e => handleBookmarkSubmit(e, candidate.id)}
                                    disabled={loadingBookmark}
                                >
                                    <i
                                        style={{ fontSize: "16px" }}
                                        className={isSaved ? "fas fa-bookmark" : "far fa-bookmark"}
                                    ></i>
                                </button>
                            </div>

                            <ul className="candidate-info">
                                <li className="icon flaticon-briefcase" style={{ paddingLeft: 0 }}>
                                    {candidate.experience}
                                </li>
                                <li>
                                    <span className="icon flaticon-map-locator"></span>{" "}
                                    {candidate.currentAddress}
                                </li>
                            </ul>
                        </h4>
                    </div>

                    <ul className="candidate-info">
                        <li>
                            <span className="icon flaticon-clock"></span>{" "}
                            {candidate.noticePeriod}
                        </li>
                        <li>
                            <span className="icon flaticon-money"></span>
                            &#8377; {candidate.curentSalary}
                        </li>
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
                                {val}{i < candidate.tags.length - 1 ? ", " : ""}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="candidate-row skills-row">
                    <div className="label1">Job Title:</div>
                    <div className="d-flex align-items-center">
                        <span style={{ fontSize: "12pt", fontWeight: 500 }}>
                            {candidate.jobTitle}
                        </span>
                    </div>
                </div>

                {showContact === candidate.candiUqId && (
                    <div className="contact-info">
                        <button
                            type="button"
                            className="contact-close-btn"
                            title="Close"
                            onClick={() => setShowContact(null)}
                        >
                            <i className="las la-times"></i>
                        </button>

                        <div className="contact-item">
                            <span className="fw-bold">Email:</span>
                            <a href={`mailto:${candidate.email || ""}`}>
                                {candidate.email || "Not available"}
                            </a>
                            <button
                                type="button"
                                title="Copy email"
                                onClick={() => copyToClipboard(candidate.email, "Email")}
                            >
                                <i className="la la-copy"></i>
                            </button>
                        </div>

                        <div className="contact-item">
                            <span className="fw-bold">Mobile:</span>
                            <a href={`tel:${candidate.mobile || ""}`}>
                                {candidate.mobile || "Not available"}
                            </a>
                            <button
                                type="button"
                                title="Copy mobile"
                                onClick={() => copyToClipboard(candidate.mobile, "Mobile")}
                            >
                                <i className="la la-copy"></i>
                            </button>
                        </div>
                    </div>
                )}

                <div className="candidate-actions d-flex flex-wrap align-items-center">
                    {candidate.status !== "Applied" ? (
                        candidate.status === "Shortlisted" ? (
                            <button className="action-btn shortlist-btn" disabled>
                                <i className="la la-check"></i> Shortlisted
                            </button>
                        ) : candidate.status === "Maybe" ? (
                            <button className="action-btn maybe-btn" disabled>
                                <i className="la la-clock-o"></i> Maybe
                            </button>
                        ) : candidate.status === "Rejected" ? (
                            <button className="action-btn reject-btn" disabled>
                                <i className="la la-times"></i> Rejected
                            </button>
                        ) : candidate.status === "Deleted" ? (
                            <button className="action-btn reject-btn" disabled>
                                <i className="la la-times"></i> Deleted
                            </button>
                        ) : null
                    ) : (
                        <>
                            <button
                                type="button"
                                className="action-btn shortlist-btn"
                                style={{
                                    opacity: !canShortlist ? 0.55 : 1,
                                    cursor: loading || permissionLoading ? "wait" : "pointer",
                                }}
                                onClick={() => handleStatus("Shortlisted", candidate.candiUqId, candidate.id)}
                                disabled={loading || permissionLoading}
                                title={
                                    permissionLoading
                                        ? "Checking subscription"
                                        : !isSubscribed
                                            ? "Purchase a subscription to shortlist candidates"
                                            : shortlistBalance <= 0
                                                ? "Your shortlist balance is exhausted"
                                                : `Available shortlist credits: ${shortlistBalance}`
                                }
                            >
                                <i className="la la-check"></i>
                                {loading ? "Processing..." : "Shortlist"}
                            </button>

                            <button
                                type="button"
                                className="action-btn maybe-btn"
                                onClick={() => handleStatus("Maybe", candidate.candiUqId, candidate.id)}
                                disabled={loading}
                            >
                                <i className="la la-clock-o"></i> Maybe
                            </button>

                            <button
                                type="button"
                                className="action-btn reject-btn"
                                onClick={() => handleStatus("Rejected", candidate.candiUqId, candidate.id)}
                                disabled={loading}
                            >
                                <i className="la la-times"></i> Reject
                            </button>
                        </>
                    )}

                    <div className="right-side ms-0 ms-md-auto mt-2 mt-md-0">
                        <button
                            type="button"
                            className="icon-circle emp-btn-tooltip"
                            onClick={handleContactClick}
                            disabled={permissionLoading}
                            data-tooltip="View Contact"
                            title={
                                permissionLoading
                                    ? "Checking subscription"
                                    : !isSubscribed
                                        ? "Purchase a subscription to view contact details"
                                        : viewBalance <= 0
                                            ? "Profile view balance exhausted"
                                            : `Available profile views: ${viewBalance}`
                            }
                        >
                            <span style={{ fontWeight: 500 }}>
                                <i className="las la-phone"></i>
                            </span>
                        </button>

                        {candidate.status !== "Deleted" ? (
                            <button
                                type="button"
                                className="icon-circle emp-btn-tooltip"
                                onClick={() => confirmDelete(candidate)}
                                disabled={loading}
                                data-tooltip="Delete"
                            >
                                <i className="la la-trash"></i>
                            </button>
                        ) : (
                            <button className="action-btn reject-btn" disabled>
                                <i className="la la-times"></i> Deleted
                            </button>
                        )}

                        {candidate.resumePath?.trim() && (
                            <button
                                type="button"
                                className="icon-circle emp-btn-tooltip"
                                onClick={() => openResume(candidate.resumePath)}
                                disabled={permissionLoading}
                                data-tooltip="View Resume"
                                title={
                                    permissionLoading
                                        ? "Checking subscription"
                                        : !isSubscribed
                                            ? "Purchase a subscription to view resumes"
                                            : viewBalance <= 0
                                                ? "Profile view balance exhausted"
                                                : `Available profile views: ${viewBalance}`
                                }
                            >
                                <i className="la la-file-pdf-o"></i>
                            </button>
                        )}

                        <button type="button" className="icon-circle emp-btn-tooltip"
                            data-tooltip="Mail">
                            <i className="la la-envelope-o"></i>
                        </button>

                        <button
                            type="button"
                            className="icon-circle emp-btn-tooltip"
                            onClick={() => setShowShareModal(true)}
                            data-tooltip="Share Profile"
                        >
                            <i className="la la-share"></i>
                        </button>

                        <button
                            type="button"
                            className="icon-circle"
                            style={{ width: "50px", borderRadius: "5%" }}
                        >
                            <i className="la la-eye" style={{ fontSize: "12pt" }}></i>
                            <b className="pe-2">{candidate.viewCount}</b>
                        </button>
                    </div>
                </div>

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
                                onClick={() => setShowComment(!showComment)}
                            >
                                <i className="la la-comment-o"></i>
                                Add Comment ({commentList.length})
                            </button>
                        </div>

                        <div className="candidate-contact-box">
                            <button
                                type="button"
                                className="contact-link"
                                onClick={handleContactClick}
                                disabled={permissionLoading}
                            >
                                <i className="la la-phone"></i> Contact
                            </button>

                            <div style={{ color: "#c3c3c3" }}>|</div>

                            <select
                                className="status-select"
                                style={{ width: "110px" }}
                                value={candidate.callStatus || ""}
                                onChange={e => handleCallStatus(e.target.value, candidate.id)}
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
                                onChange={e => {
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
                                    onClick={() => handleSubmit(candidate.id)}
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

                            {commentList.map(item => (
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
                </div>
            </div>

            {showShareModal && (
                <div>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Share Profile of {candidate.candiName}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowShareModal(false)}
                                    ></button>
                                </div>

                                <form onSubmit={e => handleShareSubmit(e, candidate.id)}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={shareEmail}
                                                onChange={e => setShareEmail(e.target.value)}
                                                placeholder="Enter email"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Remark</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={shareRemark}
                                                onChange={e => setShareRemark(e.target.value)}
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
                                        <button
                                            type="submit"
                                            className="btn btn-sm btn-primary"
                                            disabled={loadingShare}
                                        >
                                            {loadingShare ? "Submitting..." : "Submit"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop fade show"
                        onClick={() => !loadingShare && setShowShareModal(false)}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default ApplicantCard;
