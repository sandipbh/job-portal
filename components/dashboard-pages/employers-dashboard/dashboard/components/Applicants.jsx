'use client'
import Link from "next/link";
import candidatesData from "../../../../../data/candidates";
import Image from "next/image";
import { useState, useEffect } from "react";

const Applicants = () => {

  const jobId = 0;
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    getJobList();
  }, []);

  const getJobList = async () => {
    try {
      const response = await fetch(`/api/emp-job-applied-list?JobPostId=${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();
      const listData = result?.data;
      //console.log('listData  ', listData) 
      if (listData) {

        setCandidates(listData);

      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {candidates.slice(1, 6).map((candidate) => (
        <div
          className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
          key={candidate.id}
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
                  <div className="d-flex  ">

                    <Link href={`/candidates-single-v1/${candidate.candiUqId}`}>
                      {candidate.candiName}
                    </Link>

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

            </div>
            {/* End admin options box */}
          </div >
        </div >
      ))}
    </>
  );
};

export default Applicants;
