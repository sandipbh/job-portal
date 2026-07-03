'use client'

import { useState, useEffect } from "react";

import RelatedJobs3 from "@/components/job-single-pages/related-jobs/RelatedJobs3";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import Image from "next/image";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";

const JobDetailsV2 = ({ id }) => {

    let jobId = id ?? 0;
    const [jobDetails, setJobDetails] = useState({});
    const [loading, setLoading] = useState(true);

    const [shareUrl, setShareUrl] = useState("");
    useEffect(() => {
        setShareUrl(window.location.href);
    }, []);

    const [fullName, setFullName] = useState("");
    const [loginType, setLoginType] = useState("");
    const [loginUqid, setLoginUqid] = useState("");


    useEffect(() => {
        getCookiesValue();
    }, []);

    const getCookiesValue = async () => {
        try {
            const response = await fetch("/api/cookies-details", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            const fullname = data?.fullname ?? "";
            const role = data?.role ?? "";
            const uqid = data?.uqid ?? "";

            setFullName(fullname);
            setLoginType(role);
            setLoginUqid(uqid);


        } catch (error) {
            console.error(error);
        }
    };

    const checkloginType = () => {
        if (loginType == "") {
            toast.error("Login your account.");
            return;
        }
        if (loginType != "candidate") {
            toast.error("Login information is missing. Please log in as candidate.");
            return;
        }
    }



    useEffect(() => {
        getJobDetails();
    }, []);

    const getJobDetails = async () => {
        try {

            const response = await fetch(`/api/job-details?JobPostId=${jobId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const result = await response.json();

            const listData = result?.data;
            // console.log('Job Details  ', JSON.stringify(listData))

            if (listData) {

                setJobDetails(listData);
                setLoading(false);
            }

        } catch (error) {
            console.error(error);
        }
    };
    const handleApplyClick = () => {
        const modal = new Modal(document.getElementById("applyJobModal"));
        modal.show();
    };
    const getTimeAgo = (date) => {
        const now = new Date();
        const posted = new Date(date);

        const seconds = Math.floor((now - posted) / 1000);

        if (seconds < 60) {
            return "Just now";
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours} hr${hours > 1 ? "s" : ""} ago`;
        }

        const days = Math.floor(hours / 24);
        if (days === 1) {
            return "Yesterday";
        }
        if (days < 7) {
            return `${days} days ago`;
        }

        const weeks = Math.floor(days / 7);
        if (weeks < 5) {
            return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        }

        const months = Math.floor(days / 30);
        if (months < 12) {
            return `${months} month${months > 1 ? "s" : ""} ago`;
        }

        const years = Math.floor(days / 365);
        return `${years} year${years > 1 ? "s" : ""} ago`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };
    return (
        <>
            {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                ))
                : (
                    <>
                        <section className="job-detail-section">
                            <div className="job-detail-outer">
                                <div className="auto-container">
                                    <div className="row align-items-start">
                                        <div className="upper-box" style={{ padding: "10px 0 10px" }}>
                                            <div className="auto-container">
                                                <div className="job-block-seven">
                                                    <div className="inner-box">
                                                        <div className="content">
                                                            <span className="company-logo">
                                                                <Image
                                                                    width={100}
                                                                    height={80}
                                                                    src={jobDetails?.logo || "/images/defaultLogo.png"}
                                                                    alt="logo"
                                                                    priority
                                                                />
                                                            </span>
                                                            <h4>{jobDetails?.jobTitle}</h4>
                                                            <ul className="job-info">
                                                                <li>
                                                                    <span className="icon flaticon-briefcase"></span>
                                                                    {jobDetails?.company}
                                                                </li>
                                                                {/* compnay info */}
                                                                <li>
                                                                    <span className="icon flaticon-map-locator"></span>
                                                                    {jobDetails?.location}
                                                                </li>
                                                                {/* location info */}
                                                                <li>
                                                                    <span className="icon flaticon-clock-3"></span>{" "}
                                                                    {getTimeAgo(jobDetails?.time)}
                                                                </li>
                                                                {/* time info */}
                                                                <li>
                                                                    <span className="icon flaticon-money"></span>{" "}
                                                                    {jobDetails?.salary}
                                                                </li>
                                                                {/* salary info */}
                                                            </ul>
                                                            {/* End .job-info */}

                                                            <ul className="job-other-info">
                                                                {jobDetails?.jobType?.map((val, i) => (
                                                                    <li key={i} className={`${val.styleClass}`}>
                                                                        {val.type}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            {/* End .job-other-info */}
                                                        </div>
                                                        {/* End .content */}

                                                        {loginType == "candidate" ? (
                                                            <div className="btn-box">

                                                                <button
                                                                    type="button"
                                                                    className="theme-btn btn-style-one"
                                                                    onClick={handleApplyClick}
                                                                >
                                                                    Apply For Job
                                                                </button>


                                                                <button className="bookmark-btn">
                                                                    <i className="flaticon-bookmark"></i>
                                                                </button>
                                                            </div>
                                                        ) : (<div className="btn-box">
                                                            <button

                                                                onClick={() => {
                                                                    checkloginType()
                                                                }}
                                                                className="theme-btn btn-style-one"
                                                            >
                                                                Apply For Job
                                                            </button>
                                                            <button className="bookmark-btn">
                                                                <i className="flaticon-bookmark"></i>
                                                            </button>
                                                        </div>)}

                                                        {/* End apply for job btn */}

                                                        {/* <!-- Modal --> */}
                                                        <div
                                                            className="modal fade"
                                                            id="applyJobModal"
                                                            tabIndex="-1"
                                                            aria-hidden="true"
                                                        >
                                                            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                                                <div className="apply-modal-content modal-content" style={{ overflowY: "auto" }}>
                                                                    <div className="text-center">
                                                                        <h3 className="title">Apply for this job  </h3>
                                                                        <button
                                                                            id="applyModalCloseBtn"
                                                                            type="button"
                                                                            className="closed-modal"
                                                                            data-bs-dismiss="modal"
                                                                            aria-label="Close"
                                                                        ></button>
                                                                    </div>
                                                                    {/* End modal-header */}

                                                                    <ApplyJobModalContent id={jobId} hasQue={jobDetails?.hasQue || false} />
                                                                    {/* End PrivateMessageBox */}
                                                                </div>
                                                                {/* End .send-private-message-wrapper */}
                                                            </div>
                                                        </div>
                                                        {/* End .modal */}
                                                        {/* End .modal */}
                                                    </div>
                                                </div>
                                                {/* <!-- Job Block --> */}
                                            </div>
                                        </div>
                                        <div className="content-column col-lg-8 col-md-12 col-sm-12">


                                            <div className="job-block-outer">
                                                <div className="job-block-seven">
                                                    <div className="inner-box">

                                                        {/* End .content */}
                                                    </div>
                                                </div>
                                                {/* <!-- Job Block --> */}
                                            </div>
                                            {/* End job-block-outer */}

                                            <div className="job-detail">
                                                <h4 style={{ marginBottom: "0px" }}>Job Description</h4>

                                                <div className="ql-snow">
                                                    <div
                                                        className="ql-editor" style={{ padding: "5px 0px" }}
                                                        dangerouslySetInnerHTML={{ __html: jobDetails?.jobDesc || "" }}
                                                    />
                                                </div>


                                            </div>
                                            {/* End jobdetails content */}
                                            <div className="job-detail">
                                                <h4 className="mt-2 mb-2">Skills</h4>
                                                <ul className="job-skills">
                                                    {(jobDetails?.skills ?? "").split(", ").map((item, index, arr) => (
                                                        <li key={index}>
                                                            {item.replace("*", "")}
                                                            {item.includes("*") && <sup className="fa fa-star" style={{
                                                                fontSize: "xx-small", color: "#d66a22", top: "-0.9em"
                                                            }}></sup>}
                                                            {index < arr.length - 1 && ", "}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="other-options" style={{ marginBottom: "10px", marginTop: "10px" }}>
                                                <div className="social-share">
                                                    <h5>Share this job  </h5>
                                                    <a
                                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                        className="facebook"
                                                        target="_blank"
                                                        rel="noopener noreferrer"

                                                    >
                                                        <i className='fab fa-facebook-f'></i>Facebook
                                                    </a>
                                                    <a
                                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl
                                                        )}&text=${encodeURIComponent(jobDetails?.jobTitle || "Check out this job!")}`}
                                                        className="twitter"
                                                        target="_blank"
                                                        rel="noopener noreferrer"

                                                    >
                                                        <i className='fab fa-twitter'></i>Twitter
                                                    </a>
                                                    <a
                                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                                        className="linkedin"
                                                        target="_blank"
                                                        rel="noopener noreferrer"

                                                    >
                                                        <i className='fab fa-linkedin'></i>Linkedin
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="row mt-3">
                                                <div className="col-6 col-12 col-lg-6 col-md-6 align-self-start  mt-3">
                                                    <h4 style={{
                                                        fontWeight: "500",
                                                        fontSize: "18px",
                                                        lineHeight: "24px",
                                                        color: "rgb(32, 33, 36)",
                                                        marginBottom: "20px",

                                                    }}>Job Overview</h4>
                                                    <div className="widget-content">
                                                        <ul className="job-overview">
                                                            <li>
                                                                <i className="icon icon-calendar"></i>
                                                                <h5>Date Posted:</h5>
                                                                <span>Posted  {getTimeAgo(jobDetails?.time)} </span>
                                                            </li>
                                                            <li>
                                                                <i className="icon icon-expiry"></i>
                                                                <h5>Expiration date:</h5>
                                                                <span>{formatDate(jobDetails?.expire_at)} </span>
                                                            </li>
                                                            <li>
                                                                <i className="icon icon-location"></i>
                                                                <h5>Location:</h5>
                                                                <span>{jobDetails?.location}</span>
                                                            </li>
                                                            <li>
                                                                <i className="icon icon-user-2"></i>
                                                                <h5>Job Title:</h5>
                                                                <span>{jobDetails?.jobTitle}</span>
                                                            </li>


                                                            <li>
                                                                <i className="icon icon-salary"></i>
                                                                <h5>Salary:</h5>
                                                                <span>{jobDetails?.salary}  </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg-6 col-md-6 align-self-start  mt-3">
                                                    <div className="widget-content">
                                                        <h4 style={{
                                                            fontWeight: "500",
                                                            fontSize: "18px",
                                                            lineHeight: "24px",
                                                            color: "rgb(32, 33, 36)",
                                                            marginBottom: "20px",

                                                        }}>Company Details</h4>
                                                        <div className="company-title">
                                                            <div className="company-logo">
                                                                <Image
                                                                    width={100}
                                                                    height={80}
                                                                    src={jobDetails?.logo || "/images/defaultLogo.png"}
                                                                    alt="resource"
                                                                    priority
                                                                />
                                                            </div>
                                                            <h6 className="company-name">{jobDetails.company}</h6>
                                                            <a href="#" className="profile-link">
                                                                View company profile
                                                            </a>

                                                            <div>
                                                                <ul className="company-info" style={{ marginBottom: "10px" }}>
                                                                    <li style={{ paddingTop: "8px" }}>
                                                                        Primary industry: <span>{jobDetails?.indistry}</span>
                                                                    </li>
                                                                    <li style={{ paddingTop: "8px" }}>
                                                                        Company size: <span>{jobDetails?.compSize}</span>
                                                                    </li>
                                                                    {/* <li style={{ paddingTop: "8px"}}>
                                                                        Phone: <span>123 456 7890</span>
                                                                    </li>
                                                                    <li style={{ paddingTop: "8px"}}>
                                                                        Email: <span>info@joio.com</span>
                                                                    </li>   */}
                                                                    <li style={{ paddingTop: "8px" }}>
                                                                        Location: <span>{jobDetails?.compCity}, {jobDetails?.compState}</span>
                                                                    </li>
                                                                    {/* <li>
                                                        Social media:
                                                        <Social />
                                                    </li> */}
                                                                </ul>
                                                                {

                                                                    jobDetails?.compWebsite && (
                                                                        <div className="btn-box">
                                                                            <a
                                                                                href={jobDetails?.compWebsite}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-sm btn-outline-primary w-100"

                                                                            >
                                                                                Visit Website
                                                                            </a>
                                                                        </div>
                                                                    )
                                                                }

                                                            </div>
                                                        </div>
                                                        {/* End company title */}


                                                        {/* End btn-box */}
                                                    </div>
                                                </div>
                                            </div>


                                            {/* <!-- Other Options --> */}



                                            {/* <!-- Related Jobs --> */}
                                        </div>
                                        {/* End .content-column */}

                                        <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                                            <aside className="sidebar">


                                                <div className="sidebar-widget" style={{ marginBlock: "0px", "padding": "20px 10px 20px" }}>
                                                    <div className="related-jobs ">
                                                        <div className="title-box">
                                                            <h3>Related Jobs</h3>
                                                            {/* <div className="text">
                                            2020 jobs live - 293 added today.
                                        </div> */}
                                                        </div>
                                                        {/* End title box */}

                                                        <div className="row">
                                                            <RelatedJobs3 id={jobDetails?.indistryList} />
                                                        </div>
                                                        {/* End .row */}
                                                    </div>
                                                </div>
                                                {/* End .sidebar-widget */}


                                            </aside>
                                            {/* End .sidebar */}
                                        </div>
                                        {/* End .sidebar-column */}
                                    </div>
                                </div>
                            </div>
                            {/* <!-- job-detail-outer--> */}
                        </section>
                        {/* <!-- End Job Detail Section --> */}

                    </>
                )
            }
        </>
    );
};


export default JobDetailsV2;
