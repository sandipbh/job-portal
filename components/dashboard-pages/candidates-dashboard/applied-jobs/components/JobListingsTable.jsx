'use client';

import { useEffect, useState } from "react";

import Link from "next/link.js";
import { formatDate, getTimeAgo } from "@/lib/dateUtils";
import Image from "next/image.js";

const JobListingsTable = () => {

  const [jobList, setJobList] = useState([]);


  useEffect(() => {
    getAppliedJobs();
  }, []);

  const getAppliedJobs = async () => {
    try {
      const response = await fetch("/api/candi-applied-jobs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const result = await response.json();
      const listData = result?.data;

      console.log("Applied Jobs Data:", listData);
      if (listData) {
        setJobList(listData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const [openCardId, setOpenCardId] = useState(null); // Track which card is open

  // const toggleDetails = (cardId) => {
  //   setOpenCardId(prev => prev === cardId ? null : cardId);
  // };

  // const isOpen = openCardId === 1 // Assume each job has a unique `id`


  const toggleDetails = (e) => {
    const card = e.currentTarget; // This is the correct way to get the clicked card

    const allCards = document.querySelectorAll('.job-card-apply');
    const detail = card.querySelector('.detail-section-apply');

    // Close others
    allCards.forEach(c => {
      if (c !== card) {
        c.classList.remove('active');
        c.querySelector('.detail-section-apply')?.classList.remove('show');
      }
    });

    // Toggle current
    const isOpen = detail.classList.contains('show');
    card.classList.toggle('active', !isOpen);
    detail.classList.toggle('show', !isOpen);
  };

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Applied Jobs</h4>

        <div className="chosen-outer">
          {/* <!--Tabs Box--> */}
          <select className="chosen-single form-select">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Last 16 Months</option>
            <option>Last 24 Months</option>
            <option>Last 5 year</option>
          </select>
        </div>
      </div>
      {/* End filter top bar */}
      <div className="row">

        <div className="col-lg-12 col-xl-12 sidebar-apply p-0">
          <div className="p-3 border-bottom">
            {jobList.map((item) => (
              <div
                className={`job-card-apply border-bottom  `}
                onClick={toggleDetails}
              >
                <div className="d-flex flex-column gap-3" style={{ width: '100%' }}>
                  <div className="p-2">

                    <div className="d-flex align-items-start">
                      <div style={{ width: "75px", flexShrink: 0 }}>
                        <Image
                          width={75}
                          height={49}
                          src={item.logo}
                          alt="logo"
                        />
                      </div>

                      <div className="flex-grow-1 ms-3">
                        <div className="d-flex justify-content-between align-items-start">

                          <div>
                            <h6 className="mb-1 fw-semibold">
                              {item.jobTitle}
                            </h6>

                            <p className="text-muted mb-1 small">
                              {item.company}
                            </p>

                            <div className="d-flex align-items-center gap-1 text-warning">
                              ★ 2.6
                              <span className="text-muted ms-1">(48 Reviews)</span>
                            </div>
                          </div>

                          <span className="text-muted rounded-pill px-3 py-2">
                            {getTimeAgo(item.apply_at)}
                          </span>

                        </div>

                        <div className="mt-2 text-success small d-flex align-items-center gap-2">
                          <i className="fas fa-check-circle"></i>
                          {item.status}
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="detail-section-apply">
                    <div className=" pb-1">
                      <div className="border rounded-3 bg-white p-3">
                        <div className="timeline">

                          <div className="timeline-item">
                            <div className="timeline-number">1</div>

                            <div className="timeline-content  shadow-sm">
                              <div className="">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="text-dark">Application Submitted</h6>
                                  <small className="text-muted">04 Jul 2026</small>
                                </div>
                                <p className="mb-0 text-muted">
                                  Candidate successfully submitted the job application.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="timeline-item">
                            <div className="timeline-number">2</div>
                            <div className="timeline-content  shadow-sm">
                              <div className="">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="text-dark">Resume Reviewed</h6>
                                  <small className="text-muted">11:15 AM</small>
                                </div>

                                <p className="mb-0 text-muted">
                                  HR reviewed the submitted resume.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="timeline-item">
                            <div className="timeline-number">3</div>

                            <div className="timeline-content  shadow-sm">
                              <div className="">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="text-dark">Interview Scheduled</h6>
                                  <small className="text-muted">06 Jul 2026</small>
                                </div>

                                <p className="mb-0 text-muted">
                                  Technical interview scheduled for 08 Jul 2026.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>


      </div>

    </div>
  );
};


export default JobListingsTable;
