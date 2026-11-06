
'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { getCookie } from "cookies-next/client";

const OfferEditor = dynamic(() => import("./OfferEditor"), { ssr: false });

const Applicants = ({ candidate, onUpdateStatus, onUpdateCallStatus, onUpdateComments }) => {
    const [showComment, setShowComment] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [srno, setSrno] = useState("0");
    const [loading, setLoading] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);
    const [status, setStatus] = useState(candidate.status || "");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [verifiedCandidate, setVerifiedCandidate] = useState(false);

    const review = candidate.review?.split("^") || [];
    const [companyName, setCompanyName] = useState("");

    useEffect(() => {
        const getCompanyDetails = async () => {
            try {
                const response = await fetch("/api/cookies-details");
                if (!response.ok) throw new Error("Unable to fetch company details");
                const data = await response.json();
                setCompanyName(data?.fullname || "");
            } catch (error) {
                console.error("Company details error:", error);
            }
        };
        getCompanyDetails();
    }, []);

    const [ratings, setRatings] = useState({
        communication: Number(review[0]) || 0,
        interviewFeedback: Number(review[1]) || 0,
        culturalFit: Number(review[2]) || 0,
        overall: Number(review[3]) || 0
    });

    const [fileName, setFileName] = useState(candidate.reviewFile || "");
    const [file, setFile] = useState(null);
    const [remark, setRemark] = useState(candidate.reviewRemark || "");

    const [showShareModal, setShowShareModal] = useState(false);
    const [loadingShare, setLoadingShare] = useState(false);
    const [shareEmail, setShareEmail] = useState("");
    const [shareRemark, setShareRemark] = useState("");

    const [isSaved, setIsSaved] = useState(candidate.isSave === "Y");
    const [loadingBookmark, setLoadingBookmark] = useState(false);

    // Job offer states
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [loadingOffer, setLoadingOffer] = useState(false);
    const [offerStatus, setOfferStatus] = useState(candidate.offerStatus || "");
    const [offerErrors, setOfferErrors] = useState({});
    const [offer, setOffer] = useState({
        annualCtc: "",
        offerValidUntil: "",
        reportingTo: "",
        reportingEmail: "",
        terms: ""
    });

    // Interview states
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [loadingInterview, setLoadingInterview] = useState(false);
    const [interviewErrors, setInterviewErrors] = useState({});
    const [interview, setInterview] = useState({
        interviewDate: "",
        interviewLocation: "",
        interviewMode: "Online",
        interviewer: "",
        interviewerEmail: "",
        duration: "60",
        description: ""
    });

    console.log(JSON.stringify(candidate));

    const parseComments = (commentsString, applicationId) => {
        if (!commentsString) return [];
        const currentAppId = Number(applicationId);

        return commentsString.split("#").filter(Boolean).map(item => {
            const parts = item.split("^");

            if (parts.length >= 4) {
                const [id, appId, commentText, tdate] = parts;
                return {
                    id: Number(id) || 0,
                    appId: Number(appId) || 0,
                    comment: commentText || "",
                    tdate: tdate || ""
                };
            }

            const [id, commentText, tdate] = parts;
            return {
                id: Number(id) || 0,
                appId: currentAppId,
                comment: commentText || "",
                tdate: tdate || ""
            };
        }).filter(item => Number(item.appId) === currentAppId);
    };

    const formatComments = (list) => list.map(item =>
        `${item.id}^${item.appId || candidate.id}^${item.comment || ""}^${item.tdate || ""}`
    ).join("#");

    useEffect(() => {
        setIsSaved(candidate.isSave === "Y");
    }, [candidate.isSave]);

    useEffect(() => {
        setCommentList(parseComments(candidate.comments, candidate.id));
    }, [candidate.comments, candidate.id]);

    useEffect(() => {
        const currentReview = candidate.review?.split("^") || [];

        setRatings({
            communication: Number(currentReview[0]) || 0,
            interviewFeedback: Number(currentReview[1]) || 0,
            culturalFit: Number(currentReview[2]) || 0,
            overall: Number(currentReview[3]) || 0
        });

        setFileName(candidate.reviewFile || "");
        setFile(null);
        setRemark(candidate.reviewRemark || "");
    }, [candidate.id, candidate.review, candidate.reviewFile, candidate.reviewRemark]);

    useEffect(() => {
        setOfferStatus(candidate.offerStatus || "");
    }, [candidate.id, candidate.offerStatus]);

    useEffect(() => {
        setStatus(candidate.status || "");
    }, [candidate.id, candidate.status]);

    const setRating = (type, value, appId) => {
        if (Number(appId) !== Number(candidate.id)) return;
        setRatings(prev => ({ ...prev, [type]: value }));
    };

    const updateComment = (id, text) => {
        setSrno(id);
        setComment(text);
        setEditingCommentId(id);
    };

    const validateInput = (value) => /^[a-zA-Z0-9\s.,!?()&'":;-]*$/.test(value);

    const deleteComment = async (id) => {
        const selectedComment = commentList.find(item => item.id === Number(id));

        if (!selectedComment) {
            toast.error("Request failed");
            return;
        }

        if (selectedComment.id < 1 || selectedComment.appId < 1) {
            setError("Invalid request");
            return;
        }

        try {
            const details = {
                applicationId: selectedComment.appId,
                jobpostId: candidate.jobId,
                commentSrno: id
            };

            setLoading(true);

            const res = await fetch("/api/emp-application-delete-comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ details })
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }

            toast.success(user.message || "Comment deleted");

            const updatedList = commentList.filter(item => item.id !== Number(id));
            setCommentList(updatedList);

            if (onUpdateComments) {
                onUpdateComments(candidate.id, formatComments(updatedList));
            }
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (appId) => {
        if (comment.trim().length < 2) {
            setError("Enter your comments");
            return;
        }

        if (!appId || Number(appId) < 1) {
            setError("Invalid request");
            return;
        }

        try {
            const details = {
                applicationId: appId,
                jobpostId: candidate.jobId,
                commentSrno: srno,
                comments: comment.trim()
            };

            setLoading(true);

            const res = await fetch("/api/emp-application-comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ details })
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
                hour12: true
            });

            const updatedList = editingCommentId
                ? commentList.map(item => item.id === Number(editingCommentId)
                    ? { ...item, comment: comment.trim(), tdate: item.tdate || currentDate }
                    : item)
                : [
                    ...commentList,
                    {
                        id: Number(savedId) || commentList.length + 1,
                        appId: Number(appId),
                        comment: comment.trim(),
                        tdate: currentDate
                    }
                ];

            setCommentList(updatedList);

            if (onUpdateComments) {
                onUpdateComments(candidate.id, formatComments(updatedList));
            }

            setComment("");
            setShowComment(true);
            setEditingCommentId(null);
            setSrno("0");
            setError("");
            toast.success(user.message || "Comment saved");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCallStatus = async (status, appId) => {
        if (!status || !appId || Number(appId) < 1) {
            setError("Invalid request");
            return;
        }

        try {
            const details = {
                applicationId: appId,
                jobpostId: candidate.jobId,
                status,
                candiUqId: ""
            };

            setLoading(true);

            const res = await fetch("/api/emp-application-change-call-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ details })
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }

            if (onUpdateCallStatus) onUpdateCallStatus(appId, status);
            toast.success(user.message || "Call status updated");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (ttype, candiUqId, appId) => {
        if (!ttype || !candiUqId || !appId || Number(appId) < 1) {
            setError("Invalid request");
            return;
        }

        try {
            const details = {
                applicationId: appId,
                jobpostId: candidate.jobId,
                ttype,
                candiUqId
            };

            setLoading(true);

            const res = await fetch("/api/emp-application-change-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ details })
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }

            setStatus(ttype);
            if (onUpdateStatus) onUpdateStatus(appId, ttype);
            toast.success(user.message || "Status updated");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e, appId) => {
        e.preventDefault();

        try {
            const fileToBase64 = (selectedFile) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
            });

            const base64File = file ? await fileToBase64(file) : null;

            const payload = {
                applicationId: appId,
                jobpostId: candidate.jobId,
                communication: ratings.communication,
                interviewFeedback: ratings.interviewFeedback,
                culturalFit: ratings.culturalFit,
                overall: ratings.overall,
                remark,
                fileData: base64File
            };

            setLoadingReview(true);

            const res = await fetch("/api/emp-application-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }

            toast.success(user.message || "Feedback saved");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingReview(false);
        }
    };

    const handleBookmarkSubmit = async (e, appId) => {
        e?.preventDefault?.();

        try {
            setLoadingBookmark(true);

            const res = await fetch("/api/emp-application-profile-bookmark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId: appId,
                    jobpostId: candidate.jobId
                })
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Unable to update bookmark");
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

    const confirmDelete = (selectedCandidate) => {
        toast(({ closeToast }) => (
            <div>
                <div className="mb-2">Do you want to delete this candidate?</div>
                <div className="d-flex gap-2">
                    <button className="btn btn-danger btn-sm" onClick={async () => {
                        closeToast();
                        await handleStatus("Deleted", selectedCandidate.candiUqId, selectedCandidate.id);
                    }}>Yes</button>
                    <button className="btn btn-secondary btn-sm" onClick={closeToast}>No</button>
                </div>
            </div>
        ), {
            autoClose: false,
            closeOnClick: false,
            closeButton: false
        });
    };

    const handleShareSubmit = async (e, appId) => {
        e.preventDefault();

        const payload = {
            applicationId: appId,
            jobpostId: candidate.jobId,
            shareEmail,
            shareRemark,
            shareLink: `${window.location.origin}/candidates-single-v1/${candidate.candiUqId}`
        };

        try {
            setLoadingShare(true);

            const res = await fetch("/api/emp-application-profile-share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }

            setShowShareModal(false);
            setShareEmail("");
            setShareRemark("");
            toast.success(user.message || "Profile shared successfully");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingShare(false);
        }
    };

    const StarRating = ({ label, type, appId }) => (
        <div className="mb-1 d-flex align-items-center gap-2">
            <label className="fs-6" style={{ fontWeight: "400" }}>{label} :</label>
            <div>
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={`${appId}-${type}-${star}`}
                        onClick={() => setRating(type, star, appId)}
                        style={{
                            cursor: "pointer",
                            fontSize: "22px",
                            marginRight: "5px",
                            color: star <= ratings[type] ? "#ffc107" : "#d6d6d6"
                        }}
                    >★</span>
                ))}
            </div>
        </div>
    );

    const RatingStars = ({ rating = 0 }) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="rating-stars">
                {[...Array(fullStars)].map((_, index) => (
                    <i key={`full-${index}`} className="la la-star filled"></i>
                ))}
                {hasHalfStar && <i className="la la-star-half-alt filled"></i>}
                {[...Array(emptyStars)].map((_, index) => (
                    <i key={`empty-${index}`} className="lar la-star empty"></i>
                ))}
            </div>
        );
    };

    const openResume = (resumePath) => {
        if (!resumePath?.trim()) {
            toast.error("Resume is not available.");
            return;
        }

        const url = resumePath.startsWith("http")
            ? resumePath
            : `/${resumePath.replace(/^\/+/, "")}`;

        window.open(url, "_blank", "noopener,noreferrer");
    };

    // Interview validation and submission
    const validateInterview = () => {
        const errors = {};

        if (!interview.interviewDate) errors.interviewDate = "Interview date is required.";
        else if (new Date(interview.interviewDate) < new Date()) errors.interviewDate = "Interview date cannot be in the past.";

        if (!interview.interviewMode) errors.interviewMode = "Select interview mode.";
        if (!interview.interviewLocation.trim()) errors.interviewLocation = "Interview location or meeting link is required.";
        if (!interview.interviewer.trim()) errors.interviewer = "Interviewer name is required.";
        if (!interview.interviewerEmail.trim()) errors.interviewerEmail = "Interviewer email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interview.interviewerEmail.trim())) errors.interviewerEmail = "Enter a valid interviewer email.";
        if (!interview.duration || Number(interview.duration) <= 0) errors.duration = "Enter a valid interview duration.";

        setInterviewErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenInterviewModal = () => {
        setInterviewErrors({});
        setInterview({
            interviewDate: "",
            interviewLocation: "",
            interviewMode: "Online",
            interviewer: "",
            interviewerEmail: "",
            duration: "60",
            description: ""
        });
        setShowInterviewModal(true);
    };

    const handleInterviewSubmit = async (e) => {
        e.preventDefault();
        if (!validateInterview()) return;

        const applicationId = Number(candidate?.id);
        const jobpostId = Number(candidate?.jobId);
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
            description: interview.description.trim()
        };

        try {
            setLoadingInterview(true);

            const res = await fetch("/api/emp-application-schedule-interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (!res.ok || result?.isSuccess !== true) {
                toast.error(result?.message || "Failed to schedule interview.");
                return;
            }

            toast.success(result.message || "Interview scheduled successfully.");
            setShowInterviewModal(false);
            setInterviewErrors({});
            setInterview({
                interviewDate: "",
                interviewLocation: "",
                interviewMode: "Online",
                interviewer: "",
                interviewerEmail: "",
                duration: "60",
                description: ""
            });
        } catch (error) {
            console.error("Interview scheduling error:", error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingInterview(false);
        }
    };

    const getLoggedInCompanyName = () => {
        try {
            const token = getCookie("regToken");
            if (!token) return "Company Name";
            const user = typeof token === "string" ? JSON.parse(token) : token;
            return user?.external?.companyName || "Company Name";
        } catch {
            return "Company Name";
        }
    };

    const getDefaultOfferTemplate = (selectedCandidate) => {
        const company = companyName || "Company Name";
        const candidateName = selectedCandidate?.candiName || "Candidate";

        return `
            <h4 style="text-align:center;">LETTER OF EMPLOYMENT OFFER</h4>
            <h5 style="text-align:center; font-weight: 700; ">${company}</h3>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
            <p><strong>To,</strong><br/>${candidateName}</p>
            <p><strong>Subject: Employment Offer Letter</strong></p>
            <p>Dear ${candidateName},</p>
            <p>We are pleased to offer you an opportunity to join <strong>${company}</strong>. We appreciate your skills and experience and look forward to having you as part of our team.</p>
            <h5>Compensation Details</h5>
            <p>Your annual Cost to Company (CTC) will be <strong>[Annual CTC]</strong>, subject to applicable taxes and statutory deductions.</p>
            <h5>Offer Validity</h5>
            <p>This offer is valid until <strong>[Offer Validity Date]</strong>. Please communicate your acceptance before this date.</p>
            <h5>Reporting Manager</h5>
            <p><strong>Name:</strong> [Reporting Manager]<br/><strong>Email:</strong> [Manager Email]</p>
            <h5>Terms and Conditions</h5>
            <ul>
            <li>Your employment will be governed by ${company}'s policies and procedures.</li>
            <li>Your compensation will be subject to applicable taxes and statutory deductions.</li>
            <li>You are expected to maintain confidentiality of company information.</li>
            <li>Other employment conditions will be communicated by the organization.</li>
            </ul>
            <p>We look forward to welcoming you to ${company}.</p>
            <p>Regards,<br/><strong>HR Department</strong><br/>For ${company}<br/>Authorized Signatory</p>
            `;
    };

    const validateOffer = () => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const validDate = offer.offerValidUntil
            ? new Date(`${offer.offerValidUntil}T00:00:00`)
            : null;

        const termsText = (offer.terms || "")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();

        if (!offer.annualCtc || !Number.isFinite(Number(offer.annualCtc)) || Number(offer.annualCtc) <= 0) {
            errors.annualCtc = "Enter a valid annual CTC.";
        }

        if (!validDate || Number.isNaN(validDate.getTime())) {
            errors.offerValidUntil = "Offer validity date is required.";
        } else if (validDate < today) {
            errors.offerValidUntil = "Offer validity cannot be in the past.";
        }

        if (!offer.reportingTo.trim()) errors.reportingTo = "Reporting manager is required.";

        if (!offer.reportingEmail.trim()) {
            errors.reportingEmail = "Manager email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(offer.reportingEmail.trim())) {
            errors.reportingEmail = "Enter a valid manager email.";
        }

        if (!termsText) errors.terms = "Offer letter content is required.";
        else if (offer.terms.length > 4000) errors.terms = "Offer letter content cannot exceed 4000 characters.";

        setOfferErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isReOffer = String(offerStatus || "").toLowerCase() === "rejected";

    const handleOpenOfferModal = () => {
        setOffer({
            annualCtc: "",
            offerValidUntil: "",
            reportingTo: "",
            reportingEmail: "",
            terms: getDefaultOfferTemplate(candidate)
        });
        setOfferErrors({});
        setShowOfferModal(true);
    };

    const updateOffer = (e) => {
        const { name, value } = e.target;
        setOffer(prev => ({ ...prev, [name]: value }));
        setOfferErrors(prev => ({ ...prev, [name]: "" }));
    };

    const closeOfferModal = () => {
        if (loadingOffer) return;
        setShowOfferModal(false);
        setOfferErrors({});
    };

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        if (!validateOffer()) return;

        const applicationId = Number(candidate?.id);
        const jobpostId = Number(candidate?.jobId);
        const candiUqId = String(candidate?.candiUqId || "").trim();

        if (!Number.isSafeInteger(applicationId) || applicationId <= 0 ||
            !Number.isSafeInteger(jobpostId) || jobpostId <= 0 || !candiUqId) {
            toast.error("Invalid candidate application or job details.");
            return;
        }

        try {
            setLoadingOffer(true);

            const payload = {
                applicationId,
                jobpostId,
                candiUqId,
                annualCtc: Number(offer.annualCtc),
                offerValidUntil: offer.offerValidUntil,
                reportingTo: offer.reportingTo.trim(),
                reportingEmail: offer.reportingEmail.trim(),
                terms: offer.terms
            };

            const response = await fetch("/api/emp-application-submit-job-offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || !result?.isSuccess) {
                toast.error(result?.message || "Unable to submit job offer.");
                return;
            }

            toast.success(result.message || "Job offer submitted successfully.");
            setShowOfferModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Job offer submission error:", error);
            toast.error("Unable to submit job offer. Please try again.");
        } finally {
            setLoadingOffer(false);
        }
    };

    return (
        <>

            <div
                className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                key={candidate.id}>
                <div className="inner-box">
                    <div className="content">

                        <div className="d-flex align-items-center gap-1">
                            <figure className="image mb-0 flex-shrink-0">
                                <Image
                                    src={candidate.avatar}
                                    alt="candidates"
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

                            <div className="name mb-0">
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
                                    <div>
                                        <button
                                            type="button"
                                            className="action-icon-btn"
                                            onClick={(e) => handleBookmarkSubmit(e, candidate.id)}
                                            disabled={loadingBookmark}
                                        >
                                            <i
                                                style={{ fontSize: "16px" }}
                                                className={isSaved ? "fas fa-bookmark" : "far fa-bookmark"}
                                            ></i>
                                        </button>
                                    </div>
                                </div>
                                <ul className="candidate-info">
                                    <li className="icon flaticon-briefcase" style={{ paddingLeft: "0" }}>
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
                            <li>
                                <span className="icon flaticon-clock"></span>{" "}
                                {candidate.noticePeriod}
                            </li>
                            <li>
                                <span className="icon flaticon-money"></span>
                                &#8377; {candidate.curentSalary}
                            </li>
                        </ul>
                        {/* End candidate-info */}
                    </div>
                    {/* End content */}
                    <div className="candidate-row">
                        <div className="label1">Current</div>
                        <div className="value">
                            {candidate.currentCompany}
                            {candidate.currentCompany} {candidate.currentCompany}
                        </div>
                    </div>
                    <div className="candidate-row">
                        <div className="label1">Education</div>
                        <div className="value">
                            {candidate.education}  {candidate.education}  {candidate.education}
                        </div>
                    </div>
                    <div className="candidate-row">
                        <div className="label1">Pref. Location</div>
                        <div className="value">
                            {candidate.workingLocation}
                        </div>
                    </div>

                    <div className="candidate-row skills-row">
                        <div className="label1">Key Skills</div>
                        <div className="value">
                            {candidate.tags.map((val, i) => (
                                <span key={i} style={{ padding: "1px 2px" }}>
                                    {val}, {" "}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="candidate-row skills-row">
                        <div className="label1">Rating</div>
                        <div className="d-flex align-items-center">
                            <RatingStars rating={Number(candidate.avgRating).toFixed(1)} />
                            <span className="ms-2">
                                {Number(candidate.avgRating).toFixed(1)} ({candidate.totalRating} reviews)
                            </span>
                        </div>
                    </div>
                    <div className="candidate-row skills-row">
                        <div className="label1">Job Title :</div>
                        <div className="d-flex align-items-center">
                            <span style={{ fontSize: "12pt", fontWeight: "500" }}>  {candidate.jobTitle}</span>
                        </div>
                    </div>

                    <div className="ccandidate-actions d-flex flex-wrap justify-content-between align-items-center gap-2">

                        <div className={`action-btn rounded ${candidate.status?.toLowerCase() === "rejected candidate" ? "rejected-badge" : "selected-badge"}`}>
                            <span>
                                {candidate.status?.toLowerCase() === "rejected candidate" ? (
                                    <><i className="fa fa-times-circle fw-normal fa-sm"></i> Rejected</>
                                ) : (
                                    <><i className="fa fa-check-circle fw-normal fa-sm"></i> Selected</>
                                )}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="action-btn interview-btn"
                            onClick={handleOpenOfferModal}
                            disabled={loadingOffer}
                        >
                            <i className="la la-file-text"></i>
                            {isReOffer ? "Re-Offer Job" : "Offer Job"}
                        </button>

                        <div className="right-side ms-0 ms-md-auto mt-2 mt-md-0">
                            {candidate.status != "Deleted" ? (
                                <button
                                    className="icon-circle"
                                    onClick={() => confirmDelete(candidate)}
                                >
                                    <i className="la la-trash"></i>
                                </button>
                            ) : (<button className="action-btn reject-btn" disabled={true}>
                                <i className="la la-times"></i> Deleted
                            </button>)}

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

                            <button className="icon-circle">
                                <i className="la la-envelope-o"></i>
                            </button>

                            <button className="icon-circle" onClick={() => setShowShareModal(true)}>
                                <i className="la la-share"></i>
                            </button>
                            <button className="icon-circle" style={{ width: "50px", borderRadius: "5%" }} >
                                <i className="la la-eye" style={{ fontSize: "12pt" }}></i> <b className="pe-2">{candidate.viewCount}</b>
                            </button>
                        </div>

                    </div>

                    <div className="candidate-extra">
                        <div className="match-strip">
                            {candidate.queAns &&
                                candidate.queAns
                                    .split("#")
                                    .filter(item => item)
                                    .map((item, index) => {
                                        const [, question, answer] = item.split("^");
                                        return (
                                            <span key={index}>
                                                ✓ {question} {" "} <strong>{" "} {answer}</strong>
                                            </span>
                                        );
                                    })}
                        </div>
                        {/* Row 3 */}
                        <div className="extra-row">
                            <div className="comment-row">

                                <button
                                    className="comment-link"
                                    onClick={() => {
                                        setShowComment(!showComment);
                                        setShowReview(false);
                                    }}
                                >
                                    {showComment ? "Hide Comment" : "Add Comment"}
                                    ({commentList.length})
                                </button>

                                <button
                                    className="comment-link ms-2"
                                    onClick={() => {
                                        setShowReview(!showReview);
                                        setShowComment(false);
                                    }}
                                >
                                    <i className="la la-star"></i>
                                    {showReview ? "Hide Review" : "Add Review"}
                                </button>
                            </div>
                            <div className="candidate-contact-box">
                                <button className="contact-link">
                                    <i className="la la-phone"></i>
                                    Contact
                                </button>
                                <div style={{ color: "#c3c3c3" }} >|</div>

                                <select className="status-select" style={{ width: "110px" }}

                                    value={candidate.callStatus || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleCallStatus(value, candidate.id)
                                    }}
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
                                        if (validateInput(value)) {
                                            setComment(value);
                                        }
                                    }}
                                />

                                {error && (
                                    <span className="error-text">{error}</span>
                                )}
                                <div className="text-end mt-2  mb-2">
                                    <button type="button"
                                        className="btn btn-sm btn-primary"
                                        disabled={loading}
                                        onClick={() => handleCommentSubmit(candidate.id)}
                                    >
                                        {loading ? "Saving..." : editingCommentId ? "Update" : "Save"}
                                    </button>

                                    {editingCommentId ? (
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
                                    ) : null}
                                </div>
                                <>
                                    {commentList.map(item => (
                                        <div key={item.id}>
                                            <div className="comment-item">
                                                <div className="comment-header">
                                                    <div className="comment-content">
                                                        <p> {item.comment} </p>
                                                        <div className="comment-actions">
                                                            <small >{item.tdate} </small>
                                                            <div>
                                                                <button onClick={() => updateComment(item.id, item.comment)}>
                                                                    <i className="la la-edit"></i>
                                                                </button>
                                                                <button onClick={() => deleteComment(item.id)}>
                                                                    <i className="la la-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            </div>
                        )}
                        {showReview && (
                            <div className="comment-box">
                                <div className="card mt-3 shadow-sm">
                                    <div className="card-header">
                                        <h6 className="mb-0 fs-7">
                                            Interview Feedback
                                        </h6>
                                    </div>
                                    <div className="card-body default-form">
                                        <form onSubmit={(e) => handleReviewSubmit(e, candidate.id)}>
                                            <StarRating
                                                label="Communication"
                                                type="communication"
                                                appId={candidate.id}
                                            />
                                            <StarRating
                                                label="Interview Feedback"
                                                type="interviewFeedback"
                                                appId={candidate.id}
                                            />
                                            <StarRating
                                                label="Cultural Fit"
                                                type="culturalFit"
                                                appId={candidate.id}
                                            />
                                            <StarRating
                                                label="Overall"
                                                type="overall"
                                                appId={candidate.id}
                                            />
                                            <div className="form-group  mb-1 mt-2 ">
                                                <label className="fs-6" style={{ fontWeight: "400" }}>
                                                    File attachment for test result {fileName && (
                                                        <a href={`/candiReview/${fileName}`} target="_blank" rel="noopener noreferrer">
                                                            (View Attachment)
                                                        </a>
                                                    )}
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept=".pdf"
                                                    onChange={(e) => {
                                                        const selectedFile = e.target.files?.[0] || null;
                                                        setFile(selectedFile);
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group mb-1">
                                                <label className="fs-6" style={{ fontWeight: "400" }}>
                                                    Remark / Feedback
                                                </label>
                                                <textarea
                                                    className="about-input-company"
                                                    style={{ height: "70px" }}
                                                    maxLength={500}
                                                    rows="3"
                                                    placeholder="Enter your feedback..."
                                                    value={remark}
                                                    onChange={(e) => setRemark(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-success mt-2"
                                            >
                                                {loadingReview ? "Saving..." : "Submit Feedback"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>)}

                        {/* Modal */}
                        {showShareModal && (
                            <div>
                                <div
                                    className="modal fade show d-block"
                                    tabIndex="-1"
                                    role="dialog"
                                >
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

                                            <form onSubmit={(e) => handleShareSubmit(e, candidate.id)}>
                                                <div className="modal-body">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Email
                                                        </label>
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
                                                        <label className="form-label">
                                                            Remark
                                                        </label>

                                                        <textarea
                                                            className="form-control"
                                                            rows="4"
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
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        {loading ? "Saving..." : "Submit"}
                                                    </button>

                                                </div>
                                            </form>

                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="modal-backdrop fade show"
                                    onClick={() => setShowShareModal(false)}
                                ></div>
                            </div>
                        )}

                        {/* Interview Modal */}
                        {showOfferModal && (
                            <>
                                <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                                    <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <div>
                                                    <h5 className="modal-title">
                                                        {isReOffer ? "Re-Issue Job Offer" : "Create Job Offer"}
                                                    </h5>
                                                    <small className="text-muted">
                                                        Candidate: <strong>{candidate.candiName}</strong>
                                                        {" | "}Job: <strong>{candidate.jobTitle}</strong>
                                                    </small>
                                                    {isReOffer && (
                                                        <div className="text-danger small mt-1">
                                                            Previous offer was rejected. You can issue a revised offer.
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="button" className="btn-close" onClick={closeOfferModal} disabled={loadingOffer}></button>
                                            </div>

                                            <div className="overflow-scroll">
                                                <form onSubmit={handleOfferSubmit} noValidate >
                                                    <div className="modal-body">
                                                        <div className="row g-3">
                                                            <div className="col-md-6">
                                                                <label className="form-label">Annual CTC <span className="text-danger">*</span></label>
                                                                <input
                                                                    type="number"
                                                                    name="annualCtc"
                                                                    min="1"
                                                                    step="0.01"
                                                                    className={`form-control ${offerErrors.annualCtc ? "is-invalid" : ""}`}
                                                                    value={offer.annualCtc}
                                                                    onChange={updateOffer}
                                                                    placeholder="Example: 600000"
                                                                />
                                                                {offerErrors.annualCtc && <div className="invalid-feedback">{offerErrors.annualCtc}</div>}
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label">Offer Valid Until <span className="text-danger">*</span></label>
                                                                <input
                                                                    type="date"
                                                                    name="offerValidUntil"
                                                                    className={`form-control ${offerErrors.offerValidUntil ? "is-invalid" : ""}`}
                                                                    value={offer.offerValidUntil}
                                                                    onChange={updateOffer}
                                                                    min={new Date().toLocaleDateString("en-CA")}
                                                                />
                                                                {offerErrors.offerValidUntil && <div className="invalid-feedback">{offerErrors.offerValidUntil}</div>}
                                                            </div>

                                                            <div className="col-md-6">
                                                                <label className="form-label">Reporting Manager <span className="text-danger">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="reportingTo"
                                                                    className={`form-control ${offerErrors.reportingTo ? "is-invalid" : ""}`}
                                                                    value={offer.reportingTo || ""}
                                                                    onChange={updateOffer}
                                                                    maxLength={150}
                                                                    placeholder="Enter reporting manager"
                                                                />
                                                                {offerErrors.reportingTo && <div className="invalid-feedback">{offerErrors.reportingTo}</div>}
                                                            </div>

                                                            <div className="col-md-6">
                                                                <label className="form-label">Manager Email <span className="text-danger">*</span></label>
                                                                <input
                                                                    type="email"
                                                                    name="reportingEmail"
                                                                    className={`form-control ${offerErrors.reportingEmail ? "is-invalid" : ""}`}
                                                                    value={offer.reportingEmail || ""}
                                                                    onChange={updateOffer}
                                                                    maxLength={150}
                                                                    placeholder="Enter manager email"
                                                                />
                                                                {offerErrors.reportingEmail && <div className="invalid-feedback">{offerErrors.reportingEmail}</div>}
                                                            </div>

                                                            <div className="col-12">
                                                                <label className="form-label">
                                                                    Offer Description / Terms & Conditions <span className="text-danger">*</span>
                                                                </label>
                                                                <OfferEditor
                                                                    value={offer.terms}
                                                                    onChange={(value) => {
                                                                        setOffer(prev => ({ ...prev, terms: value }));
                                                                        setOfferErrors(prev => ({ ...prev, terms: "" }));
                                                                    }}
                                                                />
                                                                {offerErrors.terms && (
                                                                    <div className="text-danger small mt-1">{offerErrors.terms}</div>
                                                                )}
                                                                <small className={`d-flex justify-content-end ${offer.terms.length > 4000 ? "text-danger" : "text-muted"}`}>
                                                                    {offer.terms.length}/4000 characters
                                                                </small>
                                                            </div>

                                                        </div>
                                                    </div>

                                                    <div className="modal-footer">
                                                        <button type="button" className="btn btn-secondary" onClick={closeOfferModal} disabled={loadingOffer}>
                                                            Cancel
                                                        </button>
                                                        <button type="submit" className="btn btn-primary" disabled={loadingOffer}>
                                                            <i className="la la-paper-plane me-1"></i>
                                                            {loadingOffer ? "Submitting..." : isReOffer ? "Re-Issue Offer" : "Send Job Offer"}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-backdrop fade show"></div>
                            </>
                        )}
                    </div>
                </div>
            </div >

        </>
    );
};

export default Applicants;
