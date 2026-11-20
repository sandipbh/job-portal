
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader";
import MobileMenu from "@/components/header/MobileMenu";
import RelatedJobs from "@/components/employer-single-pages/related-jobs/RelatedJobs";
import Social from "@/components/employer-single-pages/social/Social";
import PrivateMessageBox from "@/components/employer-single-pages/shared-components/PrivateMessageBox";

const PAGE_SIZE = 4;

const CompanyDetails = () => {
  const params = useParams();
  const id = params?.id;

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const loadCompany = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/company-details?id=${encodeURIComponent(id)}`,
          { cache: "no-store", signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Company not found.");
        }

        setCompany(result.data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load company details.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadCompany();
    return () => controller.abort();
  }, [id]);

  const loadJobs = useCallback(async (pageNumber, companyUqId) => {
    if (!companyUqId || jobsLoading) return;

    setJobsLoading(true);

    try {
      const response = await fetch(
        `/api/job-search?companyUqId=${encodeURIComponent(companyUqId)}&page=${pageNumber}&pageSize=${PAGE_SIZE}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to load company jobs.");
      }

      const newJobs = Array.isArray(result?.data) ? result.data : [];

      setJobs(prev => pageNumber === 1 ? newJobs : [...prev, ...newJobs]);
      setPage(pageNumber);
      setHasMore(newJobs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Company jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  }, [jobsLoading]);

  useEffect(() => {
    if (!company?.uqId) return;

    setJobs([]);
    setPage(1);
    setHasMore(true);
    loadJobs(1, company.uqId);
  }, [company?.uqId]);

  const handleViewMore = () => {
    if (!jobsLoading && hasMore && company?.uqId) {
      loadJobs(page + 1, company.uqId);
    }
  };

  if (loading) {
    return (
      <>
        <DefaulHeader />
        <div className="auto-container" style={{ padding: "80px 0" }}>
          Loading company details...
        </div>
        <FooterDefault footerStyle="alternate5" />
      </>
    );
  }

  if (error || !company) {
    return (
      <>
        <DefaulHeader />
        <div className="auto-container" style={{ padding: "80px 0" }}>
          <h4>{error || "Company not found."}</h4>
        </div>
        <FooterDefault footerStyle="alternate5" />
      </>
    );
  }

  return (
    <>
      <span className="header-span"></span>
      <LoginPopup />
      <DefaulHeader />
      <MobileMenu />

      <section className="job-detail-section">
        <div className="upper-box">
          <div className="auto-container">
            <div className="job-block-seven">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    {company.img ? (
                      <Image
                        src={company.img}
                        width={100}
                        height={100}
                        alt={company.name || "Company"}
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <span>{company.name?.charAt(0)}</span>
                    )}
                  </span>
                  <h4>{company.name}</h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-map-locator"></span>
                      {company.location || "Location not available"}
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span>
                      {company.jobType || "Company"}
                    </li>
                  </ul>
                  <ul className="job-other-info">
                    <li className="time">
                      Open Jobs – {company.jobNumber ?? jobs.length}
                    </li>
                  </ul>
                </div>

                {/* <div className="btn-box">
                  <button
                    className="theme-btn btn-style-one"
                    data-bs-toggle="modal"
                    data-bs-target="#privateMessage"
                  >
                    Private Message
                  </button>
                </div> */}

                <div className="modal fade" id="privateMessage" tabIndex="-1" aria-hidden="true">
                  <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="apply-modal-content modal-content">
                      <div className="text-center">
                        <h3 className="title">Send message to {company.name}</h3>
                        <button
                          type="button"
                          className="closed-modal"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <PrivateMessageBox />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row align-items-start">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-details">
                  <h4>About {company.name}</h4>
                  <div className="text">
                    {company.description || "Company description not available."}
                  </div>
                </div>

                <div className="related-jobs">
                  <div className="title-box">
                    <h3>Current Job Openings</h3>
                    <div className="text">
                      {company.jobNumber ?? jobs.length} jobs available at {company.name}
                    </div>
                  </div>

                  {jobs.length > 0 ? (
                    <>
                      <RelatedJobs jobs={jobs} />
                      {hasMore && (
                        <div className="text-center mt-4">
                          <button
                            type="button"
                            className="theme-btn btn-style-one"
                            onClick={handleViewMore}
                            disabled={jobsLoading}
                          >
                            {jobsLoading ? "Loading..." : "View More"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>
                      {jobsLoading ? "Loading jobs..." : "No active job openings available."}
                    </p>
                  )}
                </div>
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <ul className="company-info mt-0">
                        <li>Company Name: <span>{company.name}</span></li>
                        <li>Company Type: <span>{company.jobType || "N/A"}</span></li>
                        <li>Company Size: <span>{company.companySize || "N/A"}</span></li>
                        <li>Address: <span>{company.address || "N/A"}</span></li>
                        <li>Location: <span>{company.location || "N/A"}</span></li>
                        <li>Website: <span>{company.website || "N/A"}</span></li>
                        <li>Open Jobs: <span>{company.jobNumber ?? jobs.length}</span></li>
                        <li>Social Media: <Social /></li>
                      </ul>

                      {company.website && (
                        <div className="btn-box">
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                          >
                            Company Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default CompanyDetails;
