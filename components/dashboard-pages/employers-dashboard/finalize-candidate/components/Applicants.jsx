'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";


const Applicants = ({ candidate,
    onUpdateStatus,
    onUpdateCallStatus,
    onUpdateComments
}) => {

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
    const [ratings, setRatings] = useState({
        communication: Number(review[0]) || 0,
        interviewFeedback: Number(review[1]) || 0,
        culturalFit: Number(review[2]) || 0,
        overall: Number(review[3]) || 0,
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

    const [showJoiningReviewModal, setShowJoiningReviewModal] = useState(false);
    const [loadingJoiningReview, setLoadingJoiningReview] = useState(false);
    const [joiningReviewErrors, setJoiningReviewErrors] = useState({});
    const [joiningReview, setJoiningReview] = useState({
        joiningStatus: "",
        joiningDate: "",
        abscondingDate: "",
        abscondingReason: "",
        joiningComments: "",
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
    });

    // const StarRating = ({ label, name, value, onChange, error }) => (
    //     <div className="col-md-6">
    //         <label className="form-label fw-semibold mb-1">{label} <span className="text-danger">*</span></label>
    //         <div className="d-flex align-items-center gap-1">
    //             {[1, 2, 3, 4, 5].map(star => (
    //                 <button
    //                     key={star}
    //                     type="button"
    //                     className={`rating-star ${star <= value ? "active" : ""}`}
    //                     onClick={() => onChange(name, star)}
    //                     aria-label={`${star} out of 5`}
    //                 >
    //                     ★
    //                 </button>
    //             ))}
    //             <span className="ms-2 small text-muted">{value ? `${value}/5` : "Not rated"}</span>
    //         </div>
    //         {error && <div className="text-danger small">{error}</div>}
    //     </div>
    // );


    useEffect(() => {
        setIsSaved(candidate.isSave === "Y");
    }, [candidate.isSave]);

    const setRating = (type, value, appId) => {
        if (Number(appId) !== Number(candidate.id)) {
            return;
        }
        setRatings((prev) => ({
            ...prev,
            [type]: value
        }));
    };

    useEffect(() => {
        setCommentList(parseComments(candidate.comments, candidate.id));
    }, [candidate.comments, candidate.id]);

    useEffect(() => {
        const review = candidate.review?.split("^") || [];

        setRatings({
            communication: Number(review[0]) || 0,
            interviewFeedback: Number(review[1]) || 0,
            culturalFit: Number(review[2]) || 0,
            overall: Number(review[3]) || 0,
        });

        setFileName(candidate.reviewFile || "");
        setFile(null);
        setRemark(candidate.reviewRemark || "");
    }, [
        candidate.id,
        candidate.review,
        candidate.reviewFile,
        candidate.reviewRemark
    ]);

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
    const formatComments = (list) => {
        return list
            .map(item => `${item.id}^${item.appId || candidate.id}^${item.comment || ""}^${item.tdate || ""}`)
            .join("#");
    };
    const updateComment = (id, text) => {
        setSrno(id);
        setComment(text);
        setEditingCommentId(id);
    };
    const validateInput = (value) => {
        const regex = /^[a-zA-Z0-9\s.,!?()&'":;-]*$/;
        return regex.test(value);
    };
    const deleteComment = async (id) => {
        const updatedList1 = commentList.filter(item => item.id == id);

        if (updatedList1.length == 0) {
            toast.error("Request failed");
            return;
        }

        if (updatedList1[0].id < 1 || updatedList1[0].appId < 1) {
            setError("invalid request")
            return;
        }
        try {
            const details = {
                applicationId: updatedList1[0].appId,
                jobpostId: candidate.jobId,
                commentSrno: id,
            };

            setLoading(true);
            const res = await fetch("/api/emp-application-delete-comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    details,
                }),
            });

            const user = await res.json();
            // console.log("Response from /api/emp-application-change-call-status:", user);

            if (!res.ok) {
                toast.error(user.message || "request failed");
                return;
            }
            else {

                toast.success(user.message || "Comment deleted");

                const updatedList = commentList.filter(item => item.id !== id);
                setCommentList(updatedList);
                if (onUpdateComments) {
                    onUpdateComments(candidate.id, formatComments(updatedList));
                }
            }

        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const handleCommentSubmit = async (appId) => {

        if (comment == "" || comment.length < 2) {
            setError("enter your comments")
            return;
        }
        if (appId == "" || appId < 1) {
            setError("invalid request")
            return;
        }
        try {
            const details = {
                applicationId: appId,
                jobpostId: candidate.jobId,
                commentSrno: srno,
                comments: comment
            };

            setLoading(true);
            const res = await fetch("/api/emp-application-comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    details,
                }),
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "request failed");
                setLoading(false);
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
            if (onUpdateComments) {
                onUpdateComments(candidate.id, formatComments(updatedList));
            }

            setLoading(false);
            setComment("");
            setShowComment(true);
            setEditingCommentId(null);
            setSrno("0");
            toast.success(user.message || "Comment saved");

        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }

    };
    const handleCallStatus = async (status, appId) => {

        if (status == "" || appId < 1) {
            setError("invalid request")
            return;
        }
        try {
            const details = {
                applicationId: appId,
                jobpostId: candidate.jobId,
                status: status,
                candiUqId: ""
            };

            setLoading(true);
            const res = await fetch("/api/emp-application-change-call-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    details,
                }),
            });

            // const user = await res.json();
            // console.log("Response from /api/emp-application-change-call-status:", user);

            if (!res.ok) {
                toast.error(user.message || "request failed");
                return;
            }
            else {
                onUpdateCallStatus(appId, status)
            }

        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }

    };

    const handleStatus = async (ttype, candiUqId, appId) => {

        if (ttype == "" || candiUqId == "" || appId < 1) {
            setError("invalid request")
            return;
        }
        try {
            const details = {
                applicationId: appId,
                jobpostId: candidate.jobId,
                ttype: ttype,
                candiUqId: candiUqId
            };

            setLoading(true);
            const res = await fetch("/api/emp-application-change-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    details,
                }),
            });

            const user = await res.json();
            // console.log("Response from /api/emp-application-comment:", user);

            if (!res.ok) {
                toast.error(user.message || "request failed");

                return;
            }
            onUpdateStatus(appId, ttype)
            toast.success(user.message);
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoading(false);
        }

    };

    const handleReviewSubmit = async (e, appId) => {
        e.preventDefault();

        const fileToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.readAsDataURL(file);

                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
            });
        };

        const base64File = file ? await fileToBase64(file) : null;

        const payload = {
            applicationId: appId,
            jobpostId: candidate.jobId,
            communication: ratings.communication,
            interviewFeedback: ratings.interviewFeedback,
            culturalFit: ratings.culturalFit,
            overall: ratings.overall,
            remark: remark,
            fileData: base64File,
        };

        try {

            setLoadingReview(true);

            const res = await fetch("/api/emp-application-feedback", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const user = await res.json();
            console.log("Response from /api/emp-application-feedback:", user);

            if (!res.ok) {
                toast.error(user.message || "Request failed");
                setLoadingReview(false);
                return;
            }


            toast.success(user.message);
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingReview(false);
        }
    };

    const handleBookmarkSubmit = async (e, appId) => {
        if (e && typeof e.preventDefault === "function") {
            e.preventDefault();
        }

        const payload = {
            applicationId: appId,
            jobpostId: candidate.jobId,
        };

        try {
            setLoadingBookmark(true);
            const res = await fetch("/api/emp-application-profile-bookmark", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const user = await res.json();

            if (!res.ok) {
                // toast.error(user.message || "Request failed");
                return;
            }

            setIsSaved((prev) => !prev);
            //toast.success(user.message);
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingBookmark(false);
        }
    };

    const confirmDelete = (candidate) => {
        toast(
            ({ closeToast }) => (
                <div>
                    <div className="mb-2">
                        Do you want to delete this candidate?
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                                closeToast();

                                await handleStatus(
                                    "Deleted",
                                    candidate.candiUqId,
                                    candidate.id
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

        console.log("Email:", shareEmail);
        console.log("Remark:", shareRemark);

        const payload = {
            applicationId: appId,
            jobpostId: candidate.jobId,
            shareEmail: shareEmail,
            shareRemark: shareRemark,
            shareLink: `${window.location.origin}/candidates-single-v1/${candidate.candiUqId}`,
        };

        try {

            setLoadingShare(true);

            const res = await fetch("/api/emp-application-profile-share", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const user = await res.json();

            if (!res.ok) {
                toast.error(user.message || "Request failed");
                setLoadingShare(false);
                return;
            }

            setShowShareModal(false);
            setShareEmail("");
            setShareRemark("");

            toast.success(user.message);
        } catch (error) {
            console.error(error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingShare(false);
        }
    };

    const StarRating = ({ label, type, appId }) => {
        return (
            <div className="mb-1 d-flex align-items-center gap-2">
                <label className="fs-6" style={{ fontWeight: "400" }}>
                    {label} :
                </label>

                <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={`${appId}-${type}-${star}`}
                            onClick={() => setRating(type, star, appId)}
                            style={{
                                cursor: "pointer",
                                fontSize: "22px",
                                marginRight: "5px",
                                color:
                                    star <= ratings[type]
                                        ? "#ffc107"
                                        : "#d6d6d6"
                            }}
                        >
                            ★
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    const RatingStars = ({ rating = 0 }) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="rating-stars">
                {/* Filled */}
                {[...Array(fullStars)].map((_, index) => (
                    <i key={`full-${index}`} className="la la-star filled"></i>
                ))}

                {/* Half */}
                {hasHalfStar && (
                    <i className="la la-star-half-alt filled"></i>
                )}

                {/* Empty */}
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

    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [loadingInterview, setLoadingInterview] = useState(false);
    const [interview, setInterview] = useState({
        interviewDate: "",
        interviewLocation: "",
        interviewMode: "Online",
        interviewer: "",
        interviewerEmail: "",
        duration: "60",
        description: ""
    });

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
            console.error("Schedule interview error:", error);
            toast.error("Request failed. Please try again.");
        } finally {
            setLoadingInterview(false);
        }
    };

    const [interviewErrors, setInterviewErrors] = useState({});

    const validateInterview = () => {
        const errors = {};
        const emailRegex = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
        const descriptionRegex = new RegExp("^[\\p{L}\\p{N}\\s.,!?;:'\"()\\-/@&+#%]+$", "u");
        const selectedDate = new Date(interview.interviewDate);
        const location = interview.interviewLocation.trim();
        const interviewer = interview.interviewer.trim();
        const email = interview.interviewerEmail.trim();
        const description = interview.description.trim();

        if (!interview.interviewDate) errors.interviewDate = "Interview date and time is required.";
        else if (Number.isNaN(selectedDate.getTime())) errors.interviewDate = "Please enter a valid date and time.";
        else if (selectedDate.getTime() <= Date.now()) errors.interviewDate = "Interview date and time must be in the future.";

        if (!interview.interviewMode) errors.interviewMode = "Please select an interview mode.";

        if (!location) errors.interviewLocation = "Interview location or meeting link is required.";
        else if (location.length > 500) errors.interviewLocation = "Location cannot exceed 500 characters.";
        else if (interview.interviewMode === "Online" && !/^https?:\/\/\S+$/i.test(location)) errors.interviewLocation = "Enter a valid meeting URL starting with http:// or https://.";

        if (!interviewer) errors.interviewer = "Interviewer name is required.";
        else if (interviewer.length > 150) errors.interviewer = "Interviewer name cannot exceed 150 characters.";
        else if (!/^[\p{L}\s.'-]+$/u.test(interviewer)) errors.interviewer = "Use letters, spaces, periods, apostrophes, or hyphens only.";

        if (!email) errors.interviewerEmail = "Interviewer email is required.";
        else if (email.length > 254 || !emailRegex.test(email)) errors.interviewerEmail = "Enter a valid email address, for example name@example.com.";

        if (!["15", "30", "45", "60", "90", "120"].includes(String(interview.duration))) errors.duration = "Please select a valid interview duration.";

        if (!description) errors.description = "Interview description is required.";
        else if (description.length > 2000) errors.description = "Description cannot exceed 2000 characters.";
        // else if (!descriptionRegex.test(description)) errors.description = "Description contains unsupported symbols. Use letters, numbers, spaces, and standard punctuation only.";

        setInterviewErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const updateInterview = (e) => {
        const { name, value } = e.target;
        setInterview(prev => ({ ...prev, [name]: value }));
        setInterviewErrors(prev => ({ ...prev, [name]: "" }));
    };

    const closeInterviewModal = () => {
        if (loadingInterview) return;
        setShowInterviewModal(false);
        setInterviewErrors({});
    };

    const handleJoiningReviewModal = () => {
        if (!candidate?.id || !candidate?.jobId || !candidate?.candiUqId) {
            toast.error("Candidate application, job, or candidate details are missing.");
            return;
        }

        setJoiningReview({
            joiningStatus: "",
            joiningDate: "",
            abscondingDate: "",
            abscondingReason: "",
            joiningComments: "",
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
        });
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

        if (files) {
            const selectedFiles = Array.from(files);
            const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ];

            const invalidFile = selectedFiles.find(file =>
                !allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024
            );

            if (invalidFile) {
                toast.error("Only PDF, DOC, DOCX, JPG and PNG files up to 5 MB are allowed.");
                e.target.value = "";
                return;
            }

            setJoiningReview(prev => ({
                ...prev,
                [name]: [...prev[name], ...selectedFiles]
            }));
        } else {
            setJoiningReview(prev => ({
                ...prev,
                [name]: value
            }));
        }

        setJoiningReviewErrors(prev => ({ ...prev, [name]: "" }));
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

    const handleJoiningReviewSubmit = async (e) => {
        e.preventDefault();

        const errors = {};

        if (!joiningReview.joiningStatus) errors.joiningStatus = "Please select joining status.";

        if (joiningReview.joiningStatus === "Joined" && !joiningReview.joiningDate) {
            errors.joiningDate = "Please select joining date.";
        }

        if (joiningReview.joiningStatus === "Absconding") {
            if (!joiningReview.abscondingDate) errors.abscondingDate = "Please select absconding date.";
            if (!joiningReview.abscondingReason.trim()) errors.abscondingReason = "Please enter absconding reason.";
        }

        if (joiningReview.joiningStatus === "Joined") {
            ["interviewAttendance", "technicalSkills", "communication", "behaviour", "professionalism", "offerCommitment"].forEach(field => {
                if (!joiningReview[field]) errors[field] = "Please provide a rating.";
            });

            if (!joiningReview.wouldHireAgain) errors.wouldHireAgain = "Please select an option.";
        }

        if (Object.keys(errors).length) {
            setJoiningReviewErrors(errors);
            toast.warning("Please complete all required fields.");
            return;
        }

        try {
            setLoadingJoiningReview(true);

            const formData = new FormData();
            formData.append("applicationId", candidate.id);
            formData.append("jobPostId", candidate.jobId);
            formData.append("candidateUqId", candidate.candiUqId);

            Object.entries(joiningReview).forEach(([key, value]) => {
                if (key === "joiningDocuments" || key === "reviewDocuments") {
                    value.forEach(file => formData.append(key, file));
                } else {
                    formData.append(key, value);
                }
            });

            const response = await fetch("/api/emp-candidate-joining-review", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result?.isSuccess) {
                toast.error(result?.message || "Unable to save joining and review details.");
                return;
            }

            toast.success(result.message || "Joining and review details saved successfully.");
            setShowJoiningReviewModal(false);
            setJoiningReviewErrors({});
        } catch (error) {
            console.error("Joining Review Error:", error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoadingJoiningReview(false);
        }
    };

    return (
        <>

            <div
                className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                key={candidate.id}
            >
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
                    {/* <div className="candidate-row">
                <div className="label1">Previous</div>
                <div className="value">
                    {candidate.previousDesignation} at{" "}
                    <strong>{candidate.previousCompany}</strong>
                </div>
            </div> */}
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

                        {candidate.status != "Applied" &&
                            candidate.status === "Offer Accept" ? (
                            <div className="offer-badge offer-accept-badge">
                                <i className="la la-check"></i> Offer Accepted
                            </div>
                        ) : candidate.status === "Offer Reject" ? (
                            <div className="offer-badge offer-reject-badge">
                                <i className="la la-clock-o"></i> Offer Rejected
                            </div>
                        ) : null
                        }

                        <button
                            type="button"
                            className="action-btn interview-btn"
                            onClick={handleJoiningReviewModal}>
                            Joining & Review
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

                    {/* Bottom Extra Section */}
                    <div className="candidate-extra">

                        {/* Row 2 */}
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

                                            {/* File Upload */}
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

                                            {/* Remark */}
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

                                            {/* Submit */}
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

                                            {/* Header */}
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

                                            {/* Body */}
                                            <form onSubmit={(e) => handleShareSubmit(e, candidate.id)}>
                                                <div className="modal-body">

                                                    {/* Textbox */}
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

                                                    {/* Textarea */}
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

                                                {/* Footer */}
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

                                {/* Backdrop */}
                                <div
                                    className="modal-backdrop fade show"
                                    onClick={() => setShowShareModal(false)}
                                ></div>
                            </div>
                        )}

                        {/* Interview Modal */}
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
                                                <button type="button" className="btn-close" onClick={closeJoiningReviewModal} disabled={loadingJoiningReview} />
                                            </div>
                                            <div className="overflow-scroll">
                                                <form onSubmit={handleJoiningReviewSubmit} noValidate>
                                                    <div className="modal-body">
                                                        <div className="row g-2">
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
                                                                {joiningReviewErrors.joiningStatus && <div className="invalid-feedback">{joiningReviewErrors.joiningStatus}</div>}
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
                                                                    {joiningReviewErrors.joiningDate && <div className="invalid-feedback">{joiningReviewErrors.joiningDate}</div>}
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
                                                                        {joiningReviewErrors.abscondingDate && <div className="invalid-feedback">{joiningReviewErrors.abscondingDate}</div>}
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
                                                                        {joiningReviewErrors.abscondingReason && <div className="invalid-feedback">{joiningReviewErrors.abscondingReason}</div>}
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
                                                                        <select className="form-select" name="documentType" value={joiningReview.documentType || ""} onChange={updateJoiningReview}>
                                                                            <option value="">Select Document Type</option>
                                                                            <option value="Salary Slip">Salary Slip</option>
                                                                            <option value="Relieving Letter">Relieving Letter</option>
                                                                            <option value="Experience Letter">Experience Letter</option>
                                                                            <option value="Other">Other</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="col-md-8">
                                                                        <input type="file" name="joiningDocuments" className="form-control" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple onChange={updateJoiningReview} />
                                                                    </div>
                                                                </div>
                                                                <small className="text-muted">PDF, DOC, DOCX, JPG, PNG. Maximum 5 MB per file.</small>
                                                                {joiningReview.joiningDocuments.map((file, index) => (
                                                                    <div className="selected-file" key={`${file.name}-${index}`}>
                                                                        <span>{file.documentType} - {file.name}</span>
                                                                        <button type="button" onClick={() => removeJoiningDocument("joiningDocuments", index)}><i className="la la-times"></i></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {joiningReview.joiningStatus === "Joined" && (
                                                            <div className="joining-section mt-4">
                                                                <div className="row g-2">
                                                                    <StarRating label="Interview Attendance" name="interviewAttendance" value={joiningReview.interviewAttendance} onChange={updateReviewRating} error={joiningReviewErrors.interviewAttendance} />
                                                                    <StarRating label="Technical Skills" name="technicalSkills" value={joiningReview.technicalSkills} onChange={updateReviewRating} error={joiningReviewErrors.technicalSkills} />
                                                                    <StarRating label="Communication" name="communication" value={joiningReview.communication} onChange={updateReviewRating} error={joiningReviewErrors.communication} />
                                                                    <StarRating label="Behaviour" name="behaviour" value={joiningReview.behaviour} onChange={updateReviewRating} error={joiningReviewErrors.behaviour} />
                                                                    <StarRating label="Professionalism" name="professionalism" value={joiningReview.professionalism} onChange={updateReviewRating} error={joiningReviewErrors.professionalism} />
                                                                    <StarRating label="Offer Commitment" name="offerCommitment" value={joiningReview.offerCommitment} onChange={updateReviewRating} error={joiningReviewErrors.offerCommitment} />

                                                                    <div className="col-md-6">
                                                                        <label className="form-label fw-semibold">Would Hire Again? <span className="text-danger">*</span></label>
                                                                        <div className="d-flex gap-3 mt-2">
                                                                            <label className="review-radio">
                                                                                <input type="radio" name="wouldHireAgain" value="Yes" checked={joiningReview.wouldHireAgain === "Yes"} onChange={updateJoiningReview} />
                                                                                Yes
                                                                            </label>
                                                                            <label className="review-radio">
                                                                                <input type="radio" name="wouldHireAgain" value="No" checked={joiningReview.wouldHireAgain === "No"} onChange={updateJoiningReview} />
                                                                                No
                                                                            </label>
                                                                        </div>
                                                                        {joiningReviewErrors.wouldHireAgain && <div className="text-danger small">{joiningReviewErrors.wouldHireAgain}</div>}
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
                                                                        <small className="text-muted">{joiningReview.reviewComments.length}/2000</small>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="modal-footer">
                                                        <button type="button" className="btn btn-secondary" onClick={closeJoiningReviewModal} disabled={loadingJoiningReview}>
                                                            Close
                                                        </button>
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
                    {/* End admin options box */}
                </div>
            </div>

            <style jsx>{`
.joining-review-modal{border:0;border-radius:12px;overflow:hidden}
.joining-section{padding:18px;border:1px solid #e8edf3;border-radius:10px;background:#fff}
.joining-section-heading{display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid #edf0f4}
.joining-section-heading h5{font-size:16px;font-weight:700;color:#26364a;margin:0 0 4px}
.joining-section-heading small{font-size:12px;color:#818a98}
.joining-section-icon{width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:#edf4ff;color:#1967d2;border-radius:9px;font-size:23px}
.upload-box{padding:18px;border:1px dashed #b9c9df;border-radius:9px;background:#f9fbff;text-align:center}
.upload-box>i{font-size:28px;color:#1967d2}
.upload-box p{font-size:13px;color:#667085;margin:5px 0 12px}
.upload-box input{background:#fff}
.selected-file{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;margin-top:7px;border:1px solid #e8edf3;border-radius:6px;font-size:12px;color:#344054}
.selected-file button{border:0;background:transparent;color:#dc3545;font-size:17px}
.rating-star{border:0;background:transparent;padding:0 2px;font-size:26px;line-height:1;color:#d5d9e0;cursor:pointer}
.rating-star.active{color:#f4b400}
.review-radio{display:flex;align-items:center;gap:7px;font-size:14px;color:#344054;cursor:pointer}
.review-radio input{accent-color:#1967d2;width:16px;height:16px}
.workflow-status{display:flex;align-items:center;justify-content:center;padding:18px;background:#f7faff;border:1px solid #e6edf8;border-radius:9px}
.workflow-step{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#98a2b3}
.workflow-step i{font-size:21px}
.workflow-step.completed{color:#16834b}
.workflow-step.active{color:#1967d2}
.workflow-line{height:2px;width:65px;background:#cbd8e8;margin:0 12px}
@media(max-width:576px){.joining-section{padding:12px}.workflow-line{width:25px;margin:0 6px}.workflow-step{font-size:11px}}
`}</style>

        </>
    );
};

export default Applicants;
