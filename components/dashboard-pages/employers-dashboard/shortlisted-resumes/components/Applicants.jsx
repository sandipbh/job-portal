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

  console.log(JSON.stringify(candidate));


  const review = candidate.review?.split('^') || [];

  const [ratings, setRatings] = useState({
    communication: review[0] || 0,
    interviewFeedback: review[1] || 0,
    culturalFit: review[2] || 0,
    overall: review[3] || 0,
  });

  const [fileName, setFileName] = useState(candidate.reviewFile || "");
  const [file, setFile] = useState(null);
  const [remark, setRemark] = useState(candidate.reviewRemark || "");




  const setRating = (type, value) => {
    setRatings((prev) => ({
      ...prev,
      [type]: value
    }));
  };

  useEffect(() => {
    setCommentList(parseComments(candidate.comments, candidate.id));
  }, [candidate.comments, candidate.id]);


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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("applicationId", candidate.id);
    formData.append("jobpostId", candidate.jobId);
    formData.append("communication", ratings.communication);
    formData.append("interviewFeedback", ratings.interviewFeedback);
    formData.append("culturalFit", ratings.culturalFit);
    formData.append("overall", ratings.overall);
    formData.append("remark", remark || "");

    if (file) {
      formData.append("file", file);
    }

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
      applicationId: candidate.id,
      jobpostId: candidate.jobId,
      communication: ratings.communication,
      interviewFeedback: ratings.interviewFeedback,
      culturalFit: ratings.culturalFit,
      overall: ratings.overall,
      remark: remark,
      fileData: base64File,
    };

    console.log("Payload for review submission:", formData);
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

      setRatings({
        communication: 0,
        interviewFeedback: 0,
        culturalFit: 0,
        overall: 0
      });

      setFile(null);
      setRemark("");

      toast.success("Feedback submitted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Request failed. Please try again.");
    } finally {
      setLoadingReview(false);
    }
  };

  const StarRating = ({ label, type }) => {
    return (
      <div className="mb-1 d-flex align-items-center gap-2">
        <label className="fs-6" style={{ fontWeight: "400" }}>
          {label} :
        </label>

        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(type, star)}
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
      </div >
    );
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
                <div className="d-flex">
                  <input type="checkbox" className="me-2" />
                  <Link href={`/candidates-single-v1/${candidate.candiUqId}`}>
                    {candidate.candiName}
                  </Link>
                </div>
                <ul className="candidate-info">
                  <li className="icon flaticon-briefcase" style={{ paddingLeft: "0" }}>
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
                  onClick={() => onUpdateStatus("Shortlisted", candidate.candiUqId, candidate.id)}
                >
                  <i className="la la-check"></i>
                  Shortlist
                </button>

                <button
                  className="action-btn maybe-btn"
                  onClick={() => onUpdateStatus("Maybe", candidate.candiUqId, candidate.id)}
                >
                  <i className="la la-clock-o"></i>
                  Maybe
                </button>
                <button
                  className="action-btn reject-btn"
                  onClick={() => onUpdateStatus("Rejected", candidate.candiUqId, candidate.id)}
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
                  onClick={() => onUpdateStatus("Deleted", candidate.candiUqId, candidate.id)}
                >
                  <i className="la la-trash"></i>
                </button>
              ) : (<button className="action-btn reject-btn" disabled={true}>
                <i className="la la-times"></i> Deleted
              </button>)}
              <button className="icon-circle">
                <i className="la la-envelope-o"></i>
              </button>

              <button className="icon-circle">
                <i className="la la-share"></i>
              </button>
            </div>

          </div>

          {/* Bottom Extra Section */}
          <div className="candidate-extra">

            {/* Row 2 */}
            <div className="mb-2">  <h6>Job Title : {candidate.jobTitle}</h6></div>
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
                  {showComment ? "Hide Comment" : "Add Comment"}
                  ({commentList.length})
                </button>

                <button
                  className="comment-link ms-2"
                  onClick={() => setShowReview(!showReview)}
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
                                <button  >
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

                    <form onSubmit={handleReviewSubmit}>

                      {/* Communication */}
                      <StarRating
                        label="Communication"
                        type="communication"
                      />

                      {/* Interview Feedback */}
                      <StarRating
                        label="Interview Feedback"
                        type="interviewFeedback"
                      />

                      {/* Cultural Fit */}
                      <StarRating
                        label="Cultural Fit"
                        type="culturalFit"
                      />

                      {/* Overall */}
                      <StarRating
                        label="Overall"
                        type="overall"
                      />

                      {/* File Upload */}
                      <div className="form-group  mb-1 mt-2 ">
                        <label className="fs-6" style={{ fontWeight: "400" }}>
                          File attachment for test result {fileName && (
                            <a href={`/candiReview/${fileName}`} target="_blank" rel="noopener noreferrer">
                              (View Current File)
                            </a>
                          )}
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            setFile(e.target.files[0])
                          }
                        />
                      </div>

                      {/* Remark */}
                      <div className="form-group mb-1">
                        <label className="fs-6" style={{ fontWeight: "400" }}>
                          Remark / Feedback
                        </label>

                        <textarea
                          className=" about-input-company"
                          style={{ height: "70px" }}
                          maxLength={700}
                          rows="3"
                          accept=".pdf"
                          placeholder="Enter your feedback..."
                          value={remark}
                          onChange={(e) =>
                            setRemark(e.target.value || null)
                          }
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

          </div>
          {/* End admin options box */}
        </div>
      </div>

    </>
  );
};

export default Applicants;
