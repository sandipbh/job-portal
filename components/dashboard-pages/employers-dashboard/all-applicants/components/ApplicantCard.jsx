'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
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

    useEffect(() => {
        setIsSaved(candidate.isSave === "Y");
    }, [candidate.isSave]);

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

    useEffect(() => {
        setCommentList(parseComments(candidate.comments, candidate.id));
    }, [candidate.comments, candidate.id]);

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

    const updateComment = (id, text) => {
        setSrno(id);
        setComment(text);
        setEditingCommentId(id);
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

    const validateInput = (value) => {
        const regex = /^[a-zA-Z0-9\s.,!?()&'":;-]*$/;
        return regex.test(value);
    };

    const handleSubmit = async (appId) => {

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
                setLoading(false);
                setComment("");
                setShowComment(false);
                return;
            }
            onUpdateStatus(appId, ttype)
            setLoading(false);
            setComment("");
            setShowComment(false);

            toast.success(user.message);
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

    const handleDeleteStatus = async (srno, appId) => {

    };
    return (
        <div
            className="candidate-block-three col-lg-6 col-md-12 col-sm-12"

        >
            <div className={`inner-box ${candidate.status != "Applied" ? "show-check" : ""}`}>
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

                        <h4 className="name mb-0">
                            <div className="d-flex justify-content-between align-items-center gap-2">
                                <div>
                                    <input type="checkbox" className="me-2" />
                                    <Link href={`/candidates-single-v1/${candidate.candiUqId}`}>
                                        {candidate.candiName}

                                    </Link>
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
                                <li className="  icon flaticon-briefcase" style={{ paddingLeft: "0" }} >{" "}
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
                    {/* End candidate-info */}


                </div>
                {/* End content */}
                <div className="candidate-row">
                    <div className="label1">Current</div>
                    <div className="value">
                        {candidate.currentCompany}

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
                        {candidate.education}
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


                <div className="candidate-actions d-flex flex-wrap align-items-center">

                    {candidate.status != "Applied" ? (
                        candidate.status === "Shortlisted" ? (
                            <button className="action-btn shortlist-btn" disabled={true} >
                                <i className="la la-check"></i> Shortlisted
                            </button>
                        ) : candidate.status === "Maybe" ? (
                            <button className="action-btn maybe-btn" disabled={true}>
                                <i className="la la-clock-o"></i> Maybe
                            </button>
                        ) : candidate.status === "Rejected" ? (
                            <button className="action-btn reject-btn" disabled={true}>
                                <i className="la la-times"></i> Rejected
                            </button>
                        ) : null
                    ) : (
                        <>

                            <button
                                className="action-btn shortlist-btn"
                                onClick={() => handleStatus("Shortlisted", candidate.candiUqId, candidate.id)}
                            >
                                <i className="la la-check"></i>
                                Shortlist
                            </button>

                            <button
                                className="action-btn maybe-btn"
                                onClick={() => handleStatus("Maybe", candidate.candiUqId, candidate.id)}
                            >
                                <i className="la la-clock-o"></i>
                                Maybe
                            </button>
                            <button
                                className="action-btn reject-btn"
                                onClick={() => handleStatus("Rejected", candidate.candiUqId, candidate.id)}
                            >
                                <i className="la la-times"></i>
                                Reject
                            </button>
                        </>
                    )}

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
                        <button className="icon-circle">
                            <i className="la la-envelope-o"></i>
                        </button>
                        <button className="icon-circle" onClick={() => setShowShareModal(true)}>
                            <i className="la la-share"></i>
                        </button>

                        <button className="icon-circle" style={{ width: "50px", borderRadius: "5%" }} >
                            <i className="la la-eye" style={{ fontSize: "12pt" }}></i> <b className="pe-2">{candidate.viewCount}</b>
                        </button>
                        <div>

                        </div>
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
                                onClick={() => setShowComment(!showComment)}
                            >
                                <i className="la la-comment-o"></i>
                                Add Comment ({commentList.length})
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
                                    onClick={() => handleSubmit(candidate.id)}
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

                </div>

            </div >

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

        </div >

    );
};

export default ApplicantCard;