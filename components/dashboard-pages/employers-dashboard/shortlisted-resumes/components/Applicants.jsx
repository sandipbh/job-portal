'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const Applicants = ({ candidate,
  onUpdateStatus,
  onUpdateCallStatus,
  onUpdateComments

}) => {

  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [srno, setSrno] = useState("0");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(candidate.status || "");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentList, setCommentList] = useState([]);

  console.log(JSON.stringify(candidate.comments))

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
                  onClick={() => handleStatus("Deleted", candidate.candiUqId, candidate.id)}
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

          </div>
          {/* End admin options box */}
        </div>
      </div>

    </>
  );
};

export default Applicants;
