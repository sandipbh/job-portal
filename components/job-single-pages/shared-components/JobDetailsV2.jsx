'use client'
import { useState, useEffect } from "react";
import jobs from "@/data/job-featured";
import JobOverView from "@/components/job-single-pages/job-overview/JobOverView";
import JobSkills from "@/components/job-single-pages/shared-components/JobSkills";
import RelatedJobs3 from "@/components/job-single-pages/related-jobs/RelatedJobs3";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import Image from "next/image";
import CompanyInfo from "./CompanyInfo";

const JobDetailsV2 = ({ id }) => {

    let jobId = id ?? 0;
    const [jobDetails, setJobDetails] = useState({});
    const [jobType, setJobType] = useState();

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
            //console.log('Job Details  ', JSON.stringify(listData))

            if (listData) {

                setJobDetails(listData);
            }

        } catch (error) {
            console.error(error);
        }
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

    return (
        <>
            {/* <!-- Job Detail Section --> */}
            <section className="job-detail-section">
                <div className="job-detail-outer">
                    <div className="auto-container">
                        <div className="row">
                            <div className="content-column col-lg-8 col-md-12 col-sm-12">
                                <div className="job-block-outer">
                                    <div className="job-block-seven">
                                        <div className="inner-box">
                                            <div className="content">
                                                <span className="company-logo">
                                                    <Image
                                                        width={100}
                                                        height={98}
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
                                        </div>
                                    </div>
                                    {/* <!-- Job Block --> */}
                                </div>
                                {/* End job-block-outer */}

                                <div className="job-detail">
                                    <h4>Job Description</h4>
                                    <p>
                                        As a Product Designer, you will work within a Product Delivery Team
                                        fused with UX, engineering, product and data talent. You will help the
                                        team design beautiful interfaces that solve business challenges for our
                                        clients. We work with a number of Tier 1 banks on building web-based
                                        applications for AML, KYC and Sanctions List management workflows. This
                                        role is ideal if you are looking to segue your career into the FinTech
                                        or Big Data arenas.
                                    </p>
                                    <h4>Key Responsibilities</h4>
                                    <ul className="list-style-three">
                                        <li>
                                            Be involved in every step of the product design cycle from discovery
                                            to developer handoff and user acceptance testing.
                                        </li>
                                        <li>
                                            Work with BAs, product managers and tech teams to lead the Product
                                            Design
                                        </li>
                                        <li>
                                            Maintain quality of the design process and ensure that when designs
                                            are translated into code they accurately reflect the design
                                            specifications.
                                        </li>
                                        <li>Accurately estimate design tickets during planning sessions.</li>
                                        <li>
                                            Contribute to sketching sessions involving non-designersCreate,
                                            iterate and maintain UI deliverables including sketch files, style
                                            guides, high fidelity prototypes, micro interaction specifications and
                                            pattern libraries.
                                        </li>
                                        <li>
                                            Ensure design choices are data led by identifying assumptions to test
                                            each sprint, and work with the analysts in your team to plan moderated
                                            usability test sessions.
                                        </li>
                                        <li>
                                            Design pixel perfect responsive UI’s and understand that adopting
                                            common interface patterns is better for UX than reinventing the wheel
                                        </li>
                                        <li>
                                            Present your work to the wider business at Show & Tell sessions.
                                        </li>
                                    </ul>
                                    <h4>Skill & Experience</h4>
                                    <ul className="list-style-three">
                                        <li>
                                            You have at least 3 years’ experience working as a Product Designer.
                                        </li>
                                        <li>You have experience using Sketch and InVision or Framer X</li>
                                        <li>
                                            You have some previous experience working in an agile environment –
                                            Think two-week sprints.
                                        </li>
                                        <li>You are familiar using Jira and Confluence in your workflow</li>
                                    </ul>
                                </div>
                                {/* End jobdetails content */}

                                <div className="other-options">
                                    <div className="social-share">
                                        <h5>Share this job</h5>
                                        <a
                                            href="https://www.facebook.com/"
                                            className="facebook"
                                            target="_blank"
                                            rel="noopener noreferrer"

                                        >
                                            <i className='fab fa-facebook-f'></i>Facebook
                                        </a>
                                        <a
                                            href="https://www.twitter.com/"
                                            className="twitter"
                                            target="_blank"
                                            rel="noopener noreferrer"

                                        >
                                            <i className='fab fa-twitter'></i>Twitter
                                        </a>
                                        <a
                                            href="https://www.likedin.com/"
                                            className="linkedin"
                                            target="_blank"
                                            rel="noopener noreferrer"

                                        >
                                            <i className='fab fa-linkedin'></i>Linkedin
                                        </a>
                                    </div>
                                </div>
                                {/* <!-- Other Options --> */}

                                <div className="related-jobs">
                                    <div className="title-box">
                                        <h3>Related Jobs</h3>
                                        <div className="text">
                                            2020 jobs live - 293 added today.
                                        </div>
                                    </div>
                                    {/* End title box */}

                                    <div className="row">
                                        <RelatedJobs3 />
                                    </div>
                                    {/* End .row */}
                                </div>
                                {/* <!-- Related Jobs --> */}
                            </div>
                            {/* End .content-column */}

                            <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                                <aside className="sidebar">
                                    <div className="btn-box">
                                        <a
                                            href="#"
                                            className="theme-btn btn-style-one"
                                            data-bs-toggle="modal"
                                            data-bs-target="#applyJobModal"
                                        >
                                            Apply For Job
                                        </a>
                                        <button className="bookmark-btn">
                                            <i className="flaticon-bookmark"></i>
                                        </button>
                                    </div>
                                    {/* End apply for job btn */}

                                    {/* <!-- Modal --> */}
                                    <div
                                        className="modal fade"
                                        id="applyJobModal"
                                        tabIndex="-1"
                                        aria-hidden="true"
                                    >
                                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                            <div className="apply-modal-content modal-content">
                                                <div className="text-center">
                                                    <h3 className="title">Apply for this job</h3>
                                                    <button
                                                        type="button"
                                                        className="closed-modal"
                                                        data-bs-dismiss="modal"
                                                        aria-label="Close"
                                                    ></button>
                                                </div>
                                                {/* End modal-header */}

                                                <ApplyJobModalContent />
                                                {/* End PrivateMessageBox */}
                                            </div>
                                            {/* End .send-private-message-wrapper */}
                                        </div>
                                    </div>
                                    {/* End .modal */}

                                    <div className="sidebar-widget" style={{ marginBlock: "0px" }}>
                                        {/* <!-- Job Overview --> */}
                                        <h4 className="widget-title">Job Overview</h4>
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
                                                    <span>{jobDetails?.expire_at} </span>
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
                                        <div className=" mt-3"></div>
                                        <h4 className="widget-title">Job Skills </h4>
                                        <div className="widget-content">
                                            <ul className="job-skills">
                                                {(jobDetails?.skills ?? "").split(", ").map((item, index, arr) => (
                                                    <li key={index}>
                                                        {item.replace("*", "")}
                                                        {item.includes("*") && <i className="fa fa-star ms-1"></i>}
                                                        {index < arr.length - 1 && ", "}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* <!-- Job Skills --> */}
                                    </div>
                                    {/* End .sidebar-widget */}

                                    <div className="sidebar-widget company-widget">
                                        <div className="widget-content">
                                            <div className="company-title">
                                                <div className="company-logo">
                                                    <Image
                                                        width={54}
                                                        height={53}
                                                        src={jobDetails?.logo || "/images/defaultLogo.png"}
                                                        alt="resource"
                                                        priority
                                                    />
                                                </div>
                                                <h5 className="company-name">{jobDetails.company}</h5>
                                                <a href="#" className="profile-link">
                                                    View company profile
                                                </a>
                                            </div>
                                            {/* End company title */}

                                            <CompanyInfo />

                                            <div className="btn-box">
                                                <a
                                                    href={jobDetails?.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="theme-btn btn-style-three"
                                                >
                                                    {jobDetails?.link}
                                                </a>
                                            </div>
                                            {/* End btn-box */}
                                        </div>
                                    </div>
                                    {/* End .company-widget */}


                                    {/* End contact-widget */}
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
    );
};

export default JobDetailsV2;
