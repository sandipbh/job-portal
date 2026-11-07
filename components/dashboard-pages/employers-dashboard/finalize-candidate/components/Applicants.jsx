'use client';
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

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
    reviewDocuments: []
};
const JoiningStarRating = ({ label, name, value, onChange, error }) => (
    <div className="col-md-6 m-0">
        <label className="form-label fw-normal">{label}</label>
        <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map(star => (
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

const Applicants = ({ candidate, onUpdateStatus, onUpdateCallStatus, onUpdateComments }) => {
    const [showComment, setShowComment] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [srno, setSrno] = useState("0");
    const [loading, setLoading] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [loadingShare, setLoadingShare] = useState(false);
    const [shareEmail, setShareEmail] = useState("");
    const [shareRemark, setShareRemark] = useState("");
    const [isSaved, setIsSaved] = useState(candidate.isSave === "Y");
    const [loadingBookmark, setLoadingBookmark] = useState(false);
    const [showJoiningReviewModal, setShowJoiningReviewModal] = useState(false);
    const [loadingJoiningReview, setLoadingJoiningReview] = useState(false);
    const [joiningReviewErrors, setJoiningReviewErrors] = useState({});
    const [joiningReview, setJoiningReview] = useState({ ...initialJoiningReview });

    const review = candidate.review?.split("^") || [];
    const [ratings, setRatings] = useState({
        communication: Number(review[0]) || 0,
        interviewFeedback: Number(review[1]) || 0,
        culturalFit: Number(review[2]) || 0,
        overall: Number(review[3]) || 0
    });
    const [fileName, setFileName] = useState(candidate.reviewFile || "");
    const [file, setFile] = useState(null);
    const [remark, setRemark] = useState(candidate.reviewRemark || "");

    useEffect(() => {
        setIsSaved(candidate.isSave === "Y");
    }, [candidate.isSave]);

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

    const formatComments = list => list.map(item => `${item.id}^${item.appId || candidate.id}^${item.comment || ""}^${item.tdate || ""}`).join("#");

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

    const validateInput = value => /^[a-zA-Z0-9\s.,!?()&'":;-]*$/.test(value);

    const updateComment = (id, text) => {
        setSrno(id);
        setComment(text);
        setEditingCommentId(id);
        setError("");
        setShowComment(true);
    };

    const deleteComment = async id => {
        const selected = commentList.find(item => item.id === id);
        if (!selected) {
            toast.error("Request failed");
            return;
        }
        if (selected.id < 1 || selected.appId < 1) {
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
                        commentSrno: id
                    }
                })
            });
            const user = await res.json();
            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }
            const updatedList = commentList.filter(item => item.id !== id);
            setCommentList(updatedList);
            onUpdateComments?.(candidate.id, formatComments(updatedList));
            toast.success(user.message || "Comment deleted");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCommentSubmit = async appId => {
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
                        comments: comment.trim()
                    }
                })
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
                ? commentList.map(item => item.id === editingCommentId
                    ? { ...item, comment: comment.trim(), tdate: item.tdate || currentDate }
                    : item)
                : [...commentList, {
                    id: Number(savedId) || commentList.length + 1,
                    appId: Number(appId),
                    comment: comment.trim(),
                    tdate: currentDate
                }];
            setCommentList(updatedList);
            onUpdateComments?.(candidate.id, formatComments(updatedList));
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
                        candiUqId: ""
                    }
                })
            });
            const user = await res.json();
            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }
            onUpdateCallStatus?.(appId, status);
            toast.success(user.message || "Call status updated successfully.");
        } catch (error) {
            console.error(error);
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
                        candiUqId
                    }
                })
            });
            const user = await res.json();
            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }
            onUpdateStatus?.(appId, ttype);
            toast.success(user.message || "Status updated successfully.");
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
                applicationId: Number(candidate.applicationId),
                jobpostId: Number(candidate.jobPostId),
                candiUqId: candidate.candiUqId,
                annualCtc: Number(formData.annualCtc),
                offerValidUntil: formData.offerValidUntil,
                reportingTo: formData.reportingTo,
                reportingEmail: formData.reportingEmail,
                terms: formData.terms
            };

            const response = await fetch("/api/employer-submit-job-offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!res.ok) {
                toast.error(user.message || "Request failed");
                return;
            }
            toast.success(user.message || "Feedback saved successfully.");
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
                toast.error(user.message || "Unable to update bookmark.");
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

    const confirmDelete = selectedCandidate => {
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
        try {
            setLoadingShare(true);
            const payload = {
                applicationId: appId,
                jobpostId: candidate.jobId,
                shareEmail,
                shareRemark,
                shareLink: `${window.location.origin}/candidates-single-v1/${candidate.candiUqId}`
            };
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
            toast.success(user.message || "Profile shared successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingShare(false);
        }
    };

    const setRating = (type, value, appId) => {
        if (Number(appId) !== Number(candidate.id)) return;
        setRatings(prev => ({ ...prev, [type]: value }));
    };

    const StarRating = ({ label, type, appId }) => (
        <div className="m-0 d-flex align-items-center gap-2">
            <label className="fs-6" style={{ fontWeight: "400" }}>{label} :</label>
            <div>
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={`${appId}-${type}-${star}`} onClick={() => setRating(type, star, appId)} style={{
                        cursor: "pointer",
                        fontSize: "22px",
                        marginRight: "5px",
                        color: star <= ratings[type] ? "#ffc107" : "#d6d6d6"
                    }}>★</span>
                ))}
            </div>
        </div>
    );

    const RatingStars = ({ rating = 0 }) => {
        const fullStars = Math.floor(Number(rating) || 0);
        const hasHalfStar = Number(rating) % 1 >= 0.5;
        const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));
        return (
            <div className="rating-stars">
                {[...Array(fullStars)].map((_, index) => <i key={`full-${index}`} className="la la-star filled"></i>)}
                {hasHalfStar && <i className="la la-star-half-alt filled"></i>}
                {[...Array(emptyStars)].map((_, index) => <i key={`empty-${index}`} className="lar la-star empty"></i>)}
            </div>
        );
    };

    const openResume = resumePath => {
        if (!resumePath?.trim()) {
            toast.error("Resume is not available.");
            return;
        }
        const url = resumePath.startsWith("http") ? resumePath : `/${resumePath.replace(/^\/+/, "")}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleJoiningReviewModal = () => {
        if (!candidate?.id || !candidate?.jobId || !candidate?.candiUqId) {
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

    const updateJoiningReview = e => {
        const { name, value, files } = e.target;

        if (name === "joiningDocuments" || name === "reviewDocuments") {
            const selectedFiles = Array.from(files || []);
            if (!selectedFiles.length) return;

            if (name === "joiningDocuments" && !joiningReview.documentType) {
                setJoiningReviewErrors(prev => ({ ...prev, documentType: "Please select document type first." }));
                e.target.value = "";
                return;
            }

            const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ];

            const invalidFile = selectedFiles.find(file => !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024);
            if (invalidFile) {
                setJoiningReviewErrors(prev => ({ ...prev, joiningDocuments: "Only PDF, DOC, DOCX, JPG and PNG files up to 5 MB are allowed." }));
                e.target.value = "";
                return;
            }

            if (name === "joiningDocuments") {
                if (joiningReview.joiningDocuments.length + selectedFiles.length > 10) {
                    setJoiningReviewErrors(prev => ({ ...prev, joiningDocuments: "You can upload a maximum of 10 documents." }));
                    e.target.value = "";
                    return;
                }

                const filesToAdd = selectedFiles.map(file => ({
                    file,
                    name: file.name,
                    documentType: joiningReview.documentType
                }));

                setJoiningReview(prev => ({
                    ...prev,
                    joiningDocuments: [...prev.joiningDocuments, ...filesToAdd]
                }));
                setJoiningReviewErrors(prev => ({ ...prev, joiningDocuments: "", documentType: "" }));
            } else {
                setJoiningReview(prev => ({
                    ...prev,
                    reviewDocuments: [...prev.reviewDocuments, ...selectedFiles]
                }));
            }

            e.target.value = "";
            return;
        }

        setJoiningReview(prev => ({ ...prev, [name]: value }));

        setJoiningReviewErrors(prev => {
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
        setJoiningReview(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const updateReviewRating = (field, rating) => {
        setJoiningReview(prev => ({ ...prev, [field]: rating }));
        setJoiningReviewErrors(prev => ({ ...prev, [field]: "" }));
    };


    const handleJoiningReviewSubmit = async e => {
        e.preventDefault();
        if (!validateJoiningReview()) return;

        const applicationId = Number(candidate.id);
        const jobpostId = Number(candidate.jobId);
        const candiUqId = candidate.candiUqId;

        if (!applicationId || !jobpostId || !candiUqId) {
            toast.error("Candidate application details are missing.");
            return;
        }

        try {
            setLoadingJoiningReview(true);

            const formData = new FormData();
            const fields = {
                applicationId,
                jobpostId,
                candiUqId,
                joiningStatus: joiningReview.joiningStatus,
                joiningDate: joiningReview.joiningDate || "",
                abscondingDate: joiningReview.abscondingDate || "",
                abscondingReason: joiningReview.abscondingReason || "",
                joiningComments: joiningReview.joiningComments || "",
                interviewAttendance: joiningReview.interviewAttendance,
                technicalSkills: joiningReview.technicalSkills,
                communication: joiningReview.communication,
                behaviour: joiningReview.behaviour,
                professionalism: joiningReview.professionalism,
                offerCommitment: joiningReview.offerCommitment,
                wouldHireAgain: joiningReview.wouldHireAgain || "",
                reviewComments: joiningReview.reviewComments || ""
            };

            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, String(value ?? ""));
            });

            const documentTypes = joiningReview.joiningDocuments.map(item => item.documentType);
            formData.append("documentTypes", JSON.stringify(documentTypes));

            joiningReview.joiningDocuments.forEach(item => {
                formData.append("documents", item.file, item.file.name);
            });

            const response = await fetch("/api/employer-joining-review", {
                method: "POST",
                body: formData
            });

            const responseText = await response.text();
            let result;

            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch {
                console.error("Invalid joining review response:", responseText);
                toast.error("Invalid response received from server.");
                return;
            }

            if (!response.ok || !result.isSuccess) {
                console.error("Joining review failed:", response.status, result);
                toast.error(result.message || "Unable to save joining review.");
                return;
            }

            toast.success(result.message || "Joining review saved successfully.");
            setJoiningReview({ ...initialJoiningReview });
            setJoiningReviewErrors({});
            setShowJoiningReviewModal(false);

        } catch (error) {
            console.error("Joining review submit error:", error);
            toast.error(error.message || "Unable to save joining review.");
        } finally {
            setLoadingJoiningReview(false);
        }
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
            const ratings = ["interviewAttendance", "technicalSkills", "communication", "behaviour", "professionalism", "offerCommitment"];
            ratings.forEach(field => {
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

    return (
        <>
            <div className="candidate-block-three col-lg-6 col-md-12 col-sm-12" key={candidate.id}>
                <div className="inner-box">
                    <div className="content">
                        <div className="d-flex align-items-center gap-1">
                            <figure className="image mb-0 flex-shrink-0">
                                <Image src={candidate.avatar} alt="Candidate" width={70} height={70} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "50%" }} />
                            </figure>
                            <div className="name mb-0 w-100">
                                <div className="d-flex justify-content-between align-items-center gap-2">
                                    <div>
                                        <input type="checkbox" className="me-2" />
                                        <Link href={`/candidates-single-v1/${candidate.candiUqId}`}>{candidate.candiName}</Link>
                                        {candidate.verifyStatus?.toLowerCase() === "verified" && (
                                            <span className="text-success p-0 mt-0 ms-2">
                                                <i className="fa fa-check-circle fw-normal me-1 fa-sm"></i>
                                            </span>
                                        )}
                                    </div>
                                    <button type="button" className="action-icon-btn" onClick={e => handleBookmarkSubmit(e, candidate.id)} disabled={loadingBookmark}>
                                        <i style={{ fontSize: "16px" }} className={isSaved ? "fas fa-bookmark" : "far fa-bookmark"}></i>
                                    </button>
                                </div>
                                <ul className="candidate-info">
                                    <li className="icon flaticon-briefcase" style={{ paddingLeft: "0" }}>
                                        <span className="ms-2"></span>{candidate.experience}
                                    </li>
                                    <li>
                                        <span className="icon flaticon-map-locator"></span> {candidate.currentAddress}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <ul className="candidate-info">
                            <li><span className="icon flaticon-clock"></span> {candidate.noticePeriod}</li>
                            <li><span className="icon flaticon-money"></span> &#8377; {candidate.curentSalary}</li>
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
                            {(candidate.tags || []).map((val, i) => <span key={i} style={{ padding: "1px 2px" }}>{val}{i < candidate.tags.length - 1 ? ", " : ""}</span>)}
                        </div>
                    </div>
                    <div className="candidate-row skills-row">
                        <div className="label1">Rating</div>
                        <div className="d-flex align-items-center">
                            <RatingStars rating={Number(candidate.avgRating) || 0} />
                            <span className="ms-2">{Number(candidate.avgRating || 0).toFixed(1)} ({candidate.totalRating} reviews)</span>
                        </div>
                    </div>
                    <div className="candidate-row skills-row">
                        <div className="label1">Job Title :</div>
                        <div className="d-flex align-items-center">
                            <span style={{ fontSize: "12pt", fontWeight: "500" }}>{candidate.jobTitle}</span>
                        </div>
                    </div>

                    <div className="ccandidate-actions d-flex flex-wrap justify-content-between align-items-center gap-2">
                        {candidate.status === "Offer Accept" && <div className="offer-badge offer-accept-badge"><i className="la la-check"></i> Offer Accepted</div>}
                        {candidate.status === "Offer Reject" && <div className="offer-badge offer-reject-badge"><i className="la la-clock-o"></i> Offer Rejected</div>}

                        <button type="button" className="action-btn interview-btn" onClick={handleJoiningReviewModal}>
                            Joining & Review
                        </button>

                        <div className="right-side ms-0 ms-md-auto mt-2 mt-md-0">
                            {candidate.status !== "Deleted" ? (
                                <button type="button" className="icon-circle" onClick={() => confirmDelete(candidate)}>
                                    <i className="la la-trash"></i>
                                </button>
                            ) : (
                                <button type="button" className="action-btn reject-btn" disabled>
                                    <i className="la la-times"></i> Deleted
                                </button>
                            )}

                            {candidate.resumePath?.trim() && (
                                <button type="button" className="icon-circle" onClick={() => openResume(candidate.resumePath)} title="View Resume">
                                    <i className="la la-file-pdf-o"></i>
                                </button>
                            )}

                            <button type="button" className="icon-circle"><i className="la la-envelope-o"></i></button>
                            <button type="button" className="icon-circle" onClick={() => setShowShareModal(true)}><i className="la la-share"></i></button>
                            <button type="button" className="icon-circle" style={{ width: "50px", borderRadius: "5%" }}>
                                <i className="la la-eye" style={{ fontSize: "12pt" }}></i> <b className="pe-2">{candidate.viewCount}</b>
                            </button>
                        </div>
                    </div>

                    <div className="candidate-extra">
                        <div className="match-strip">
                            {candidate.queAns && candidate.queAns.split("#").filter(Boolean).map((item, index) => {
                                const [, question, answer] = item.split("^");
                                return <span key={index}>✓ {question} <strong>{answer}</strong></span>;
                            })}
                        </div>

                        <div className="extra-row">
                            <div className="comment-row">
                                <button type="button" className="comment-link" onClick={() => {
                                    setShowComment(!showComment);
                                    setShowReview(false);
                                }}>
                                    {showComment ? "Hide Comment" : "Add Comment"} ({commentList.length})
                                </button>
                                <button type="button" className="comment-link ms-2" onClick={() => {
                                    setShowReview(!showReview);
                                    setShowComment(false);
                                }}>
                                    <i className="la la-star"></i> {showReview ? "Hide Review" : "Add Review"}
                                </button>
                            </div>
                            <div className="candidate-contact-box">
                                <button type="button" className="contact-link"><i className="la la-phone"></i> Contact</button>
                                <div style={{ color: "#c3c3c3" }}>|</div>
                                <select className="status-select" style={{ width: "110px" }} value={candidate.callStatus || ""} onChange={e => handleCallStatus(e.target.value, candidate.id)} disabled={loading}>
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
                                <textarea className="form-control" placeholder="Type your comment here..." value={comment} maxLength={200} onChange={e => {
                                    const value = e.target.value;
                                    if (validateInput(value)) setComment(value);
                                }} />
                                {error && <span className="error-text">{error}</span>}
                                <div className="text-end mt-2 mb-2">
                                    <button type="button" className="btn btn-sm btn-primary" disabled={loading} onClick={() => handleCommentSubmit(candidate.id)}>
                                        {loading ? "Saving..." : editingCommentId ? "Update" : "Save"}
                                    </button>
                                    {editingCommentId && (
                                        <button type="button" className="btn btn-sm btn-outline-secondary ms-2" onClick={() => {
                                            setEditingCommentId(null);
                                            setComment("");
                                            setSrno("0");
                                            setError("");
                                        }}>Cancel</button>
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
                                                            <button type="button" onClick={() => updateComment(item.id, item.comment)}><i className="la la-edit"></i></button>
                                                            <button type="button" onClick={() => deleteComment(item.id)} disabled={loading}><i className="la la-trash"></i></button>
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
                                        <form onSubmit={e => handleReviewSubmit(e, candidate.id)}>
                                            <StarRating label="Communication" type="communication" appId={candidate.id} />
                                            <StarRating label="Interview Feedback" type="interviewFeedback" appId={candidate.id} />
                                            <StarRating label="Cultural Fit" type="culturalFit" appId={candidate.id} />
                                            <StarRating label="Overall" type="overall" appId={candidate.id} />

                                            <div className="form-group mb-1 mt-2">
                                                <label className="fs-6" style={{ fontWeight: "400" }}>
                                                    File attachment for test result{" "}
                                                    {fileName && <a href={`/candiReview/${fileName}`} target="_blank" rel="noopener noreferrer">(View Attachment)</a>}
                                                </label>
                                                <input type="file" className="form-control" accept=".pdf" onChange={e => {
                                                    const selectedFile = e.target.files?.[0] || null;
                                                    if (selectedFile && (selectedFile.type !== "application/pdf" || selectedFile.size > 5 * 1024 * 1024)) {
                                                        toast.error("Please select a PDF file up to 5 MB.");
                                                        e.target.value = "";
                                                        return;
                                                    }
                                                    setFile(selectedFile);
                                                }} />
                                            </div>

                                            <div className="form-group mb-1">
                                                <label className="fs-6" style={{ fontWeight: "400" }}>Remark / Feedback</label>
                                                <textarea className="about-input-company" style={{ height: "70px" }} maxLength={500} rows="3" placeholder="Enter your feedback..." value={remark} onChange={e => setRemark(e.target.value)} />
                                            </div>

                                            <button type="submit" className="btn btn-success mt-2" disabled={loadingReview}>
                                                {loadingReview ? "Saving..." : "Submit Feedback"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {showShareModal && (
                        <>
                            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Share Profile of {candidate.candiName}</h5>
                                            <button type="button" className="btn-close" onClick={() => !loadingShare && setShowShareModal(false)} disabled={loadingShare}></button>
                                        </div>
                                        <form onSubmit={e => handleShareSubmit(e, candidate.id)}>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label className="form-label">Email</label>
                                                    <input type="email" className="form-control" value={shareEmail} onChange={e => setShareEmail(e.target.value)} placeholder="Enter email" required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Remark</label>
                                                    <textarea className="form-control" rows="4" value={shareRemark} onChange={e => setShareRemark(e.target.value)} placeholder="Enter remark" required maxLength={500}></textarea>
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowShareModal(false)} disabled={loadingShare}>Cancel</button>
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

                    {showJoiningReviewModal && (
                        <>
                            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                                <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                                    <div className="modal-content joining-review-modal">
                                        <div className="modal-header">
                                            <div>
                                                <h5 className="modal-title">Joining & Candidate Review</h5>
                                                <small className="text-muted">Candidate: {candidate.candiName} | Job: {candidate.jobTitle}</small>
                                            </div>
                                            <button type="button" className="btn-close" onClick={closeJoiningReviewModal} disabled={loadingJoiningReview}></button>
                                        </div>
                                        <div className="overflow-scroll">
                                            <form onSubmit={handleJoiningReviewSubmit} noValidate>
                                                <div className="modal-body">
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label">Joining Status <span className="text-danger">*</span></label>
                                                            <select name="joiningStatus" className={`form-select ${joiningReviewErrors.joiningStatus ? "is-invalid" : ""}`} value={joiningReview.joiningStatus} onChange={updateJoiningReview}>
                                                                <option value="">Select Status</option>
                                                                <option value="Joined">Joined</option>
                                                                <option value="Absconding">Absconding</option>
                                                                <option value="Not Joined">Not Joined</option>
                                                            </select>
                                                            {joiningReviewErrors.joiningStatus && <div className="invalid-feedback">{joiningReviewErrors.joiningStatus}</div>}
                                                        </div>

                                                        {joiningReview.joiningStatus === "Joined" && (
                                                            <div className="col-md-6">
                                                                <label className="form-label">Date of Joining <span className="text-danger">*</span></label>
                                                                <input type="date" name="joiningDate" className={`form-control ${joiningReviewErrors.joiningDate ? "is-invalid" : ""}`} value={joiningReview.joiningDate} onChange={updateJoiningReview} />
                                                                {joiningReviewErrors.joiningDate && <div className="invalid-feedback">{joiningReviewErrors.joiningDate}</div>}
                                                            </div>
                                                        )}

                                                        {joiningReview.joiningStatus === "Absconding" && (
                                                            <>
                                                                <div className="col-md-6">
                                                                    <label className="form-label">Absconding Date <span className="text-danger">*</span></label>
                                                                    <input type="date" name="abscondingDate" className={`form-control ${joiningReviewErrors.abscondingDate ? "is-invalid" : ""}`} value={joiningReview.abscondingDate} onChange={updateJoiningReview} />
                                                                    {joiningReviewErrors.abscondingDate && <div className="invalid-feedback">{joiningReviewErrors.abscondingDate}</div>}
                                                                </div>
                                                                <div className="col-12">
                                                                    <label className="form-label">Reason for Absconding <span className="text-danger">*</span></label>
                                                                    <textarea name="abscondingReason" className={`form-control ${joiningReviewErrors.abscondingReason ? "is-invalid" : ""}`} rows={3} maxLength={1000} value={joiningReview.abscondingReason} onChange={updateJoiningReview} placeholder="Enter details about the candidate's absconding..." />
                                                                    {joiningReviewErrors.abscondingReason && <div className="invalid-feedback">{joiningReviewErrors.abscondingReason}</div>}
                                                                </div>
                                                            </>
                                                        )}

                                                        <div className="col-12">
                                                            <label className="form-label">Joining Comments</label>
                                                            <textarea name="joiningComments" className="form-control" rows={3} maxLength={2000} value={joiningReview.joiningComments} onChange={updateJoiningReview} placeholder="Enter joining-related comments..." />
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
                                                                    {joiningReviewErrors.documentType && <div className="invalid-feedback">{joiningReviewErrors.documentType}</div>}
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
                                                                    {joiningReviewErrors.joiningDocuments && <div className="invalid-feedback">{joiningReviewErrors.joiningDocuments}</div>}
                                                                </div>
                                                            </div>
                                                            <small className="text-muted">PDF, DOC, DOCX, JPG, PNG. Maximum 5 MB per file.</small>
                                                            {joiningReview.joiningDocuments.map((item, index) => (
                                                                <div className="selected-file" key={`${item.name}-${index}`}>
                                                                    <span>{item.documentType} - {item.name}</span>
                                                                    <button type="button" onClick={() => removeJoiningDocument("joiningDocuments", index)}>
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
                                                                <JoiningStarRating label="Interview Attendance" name="interviewAttendance" value={joiningReview.interviewAttendance} onChange={updateReviewRating} error={joiningReviewErrors.interviewAttendance} />
                                                                <JoiningStarRating label="Technical Skills" name="technicalSkills" value={joiningReview.technicalSkills} onChange={updateReviewRating} error={joiningReviewErrors.technicalSkills} />
                                                                <JoiningStarRating label="Communication" name="communication" value={joiningReview.communication} onChange={updateReviewRating} error={joiningReviewErrors.communication} />
                                                                <JoiningStarRating label="Behaviour" name="behaviour" value={joiningReview.behaviour} onChange={updateReviewRating} error={joiningReviewErrors.behaviour} />
                                                                <JoiningStarRating label="Professionalism" name="professionalism" value={joiningReview.professionalism} onChange={updateReviewRating} error={joiningReviewErrors.professionalism} />
                                                                <JoiningStarRating label="Offer Commitment" name="offerCommitment" value={joiningReview.offerCommitment} onChange={updateReviewRating} error={joiningReviewErrors.offerCommitment} />

                                                                <div className="col-md-6">
                                                                    <label className="form-label fw-semibold">Would Hire Again? <span className="text-danger">*</span></label>
                                                                    <div className="d-flex gap-3">
                                                                        <label className="review-radio">
                                                                            <input type="radio" name="wouldHireAgain" value="Yes" checked={joiningReview.wouldHireAgain === "Yes"} onChange={updateJoiningReview} /> Yes
                                                                        </label>
                                                                        <label className="review-radio">
                                                                            <input type="radio" name="wouldHireAgain" value="No" checked={joiningReview.wouldHireAgain === "No"} onChange={updateJoiningReview} /> No
                                                                        </label>
                                                                    </div>
                                                                    {joiningReviewErrors.wouldHireAgain && <div className="text-danger small">{joiningReviewErrors.wouldHireAgain}</div>}
                                                                </div>

                                                                <div className="col-12">
                                                                    <label className="form-label">Review Comments</label>
                                                                    <textarea name="reviewComments" className="form-control" rows={4} maxLength={2000} value={joiningReview.reviewComments} onChange={updateJoiningReview} placeholder="Enter detailed feedback about the candidate's performance..." />
                                                                    <div className="text-end">
                                                                        <small className="text-danger">{joiningReview.reviewComments.length}/2000</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-secondary" onClick={closeJoiningReviewModal} disabled={loadingJoiningReview}>Close</button>
                                                    <button type="submit" className="btn btn-primary" disabled={loadingJoiningReview}>
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
                </div>
            </div>

        </>
    );
};

export default Applicants;