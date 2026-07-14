'use client'

import { useState, useRef, useEffect } from "react";
import candidates from "@/data/candidates";
import candidateResume from "@/data/candidateResume";
import RelatedJobs3 from "@/components/job-single-pages/related-jobs/RelatedJobs3";
import ApplyJobModalContent from "@/components/job-single-pages/shared-components/ApplyJobModalContent";
import Image from "next/image";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";
import { formatDate, getTimeAgo } from "@/lib/dateUtils";

import ResumeTemplate from "./ResumeTemplate";



import Contact from "@/components/candidates-single-pages/shared-components/Contact";
import GalleryBox from "@/components/candidates-single-pages/shared-components/GalleryBox";
import Social from "@/components/candidates-single-pages/social/Social";
import JobSkills from "@/components/candidates-single-pages/shared-components/JobSkills";
import AboutVideo from "@/components/candidates-single-pages/shared-components/AboutVideo";


const CandidateDetailsV2 = ({ id }) => {

    let candiId = id ?? 0;

    const resumeRef = useRef(null);

    const [candidate, setCandidate] = useState({});
    const [loading, setLoading] = useState(true);

    const [shareUrl, setShareUrl] = useState("");
    useEffect(() => {
        setShareUrl(window.location.href);
    }, []);

    const [fullName, setFullName] = useState("");
    const [loginType, setLoginType] = useState("");
    const [loginUqid, setLoginUqid] = useState("");

    useEffect(() => {
        getCandidateDetails();
    }, [candiId]);

    useEffect(() => {
        getCookiesValue();
    }, []);

    const getCandidateDetails = async () => {
        try {

            const response = await fetch(`/api/candidate-full-details?candiId=${candiId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            const result = await response.json();

            const listData = result?.data;
            //console.log('Candidate Details  ', JSON.stringify(listData))

            if (listData) {

                setCandidate(listData);
                setLoading(false);

                // console.log(JSON.stringify(listData[0]))
            }

        } catch (error) {
            console.error(error);
        }
    };
    const getCookiesValue = async () => {
        try {
            const response = await fetch("/api/cookies-details", {
                method: "GET"
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

    const months = [
        { key: 1, value: "January" },
        { key: 2, value: "February" },
        { key: 3, value: "March" },
        { key: 4, value: "April" },
        { key: 5, value: "May" },
        { key: 6, value: "June" },
        { key: 7, value: "July" },
        { key: 8, value: "August" },
        { key: 9, value: "September" },
        { key: 10, value: "October" },
        { key: 11, value: "November" },
        { key: 12, value: "December" }
    ];

    const getMonthName = (month) => {
        return months.find(m => m.key === Number(month))?.value || month;
    };

    const formatYear = (text) => {
        if (!text || text.trim() === "") return "";

        text = text.trim();

        // Single year: "2014"
        if (/^\d{4}$/.test(text)) {
            return text;
        }

        // Year range: "2024 - 2027"
        if (/^\d{4}\s*-\s*\d{4}$/.test(text)) {
            return text;
        }

        // Month-Year range: "3 2019 - 12 2022" or "3 2023 - Present"
        const parts = text.split(" - ");

        if (parts.length === 2) {
            const formatPart = (part) => {
                part = part.trim();

                if (part.toLowerCase() === "present") {
                    return "Present";
                }

                const arr = part.split(/\s+/);

                if (arr.length === 2 && !isNaN(arr[0]) && /^\d{4}$/.test(arr[1])) {
                    return `${getMonthName(arr[0])} ${arr[1]}`;
                }

                return part;
            };

            return `${formatPart(parts[0])} - ${formatPart(parts[1])}`;
        }

        return text;
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


    const handleApplyClick = () => {
        const modal = new Modal(document.getElementById("applyJobModal"));
        modal.show();
    };

    const handleDownloadResume = async () => {
        if (typeof resumeRef.current?.downloadPDF === "function") {
            await resumeRef.current.downloadPDF();
        }
    };

    return (
        <>
            {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                ))
                : (
                    <>
                        <section className="candidate-detail-section">
                            <div className="upper-box">
                                <div className="auto-container">


                                    <div className="candidate-block-five">
                                        <div className="inner-box">
                                            <div className="content">
                                                <figure className="image">
                                                    <Image
                                                        width={75}
                                                        height={75}
                                                        src={candidate.personal?.photoPath || ""}
                                                        alt="photo"
                                                    />

                                                </figure>
                                                <h4 className="name">{candidate.personal?.fullName}  </h4>

                                                <ul className="candidate-info">
                                                    <li className="designation">{candidate.personal?.currentCompany}</li>
                                                    <li>
                                                        <span className="icon flaticon-map-locator"></span>
                                                        {candidate.personal?.currentAddress}
                                                    </li>

                                                    <li>
                                                        <span className="icon flaticon-clock"></span>
                                                        {candidate.personal?.totalExperience}
                                                    </li>
                                                    <li>
                                                        &#8377; {candidate.personal?.currentSalary}
                                                    </li>
                                                </ul>

                                                <ul className="post-tags">
                                                    {candidate?.skills?.map((val, i) => (
                                                        <li key={i}>{val.skillName}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="btn-box">
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        left: "-99999px",
                                                        width: "210mm",
                                                    }}
                                                >
                                                    <ResumeTemplate ref={resumeRef} id={candiId} />
                                                </div>
                                                <button
                                                    type="button"
                                                    className="theme-btn btn-style-one"
                                                    onClick={handleDownloadResume}
                                                >
                                                    Download CV
                                                </button>
                                                <button className="bookmark-btn">
                                                    <i className="flaticon-bookmark"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/*  <!-- Candidate block Five --> */}
                                </div>
                            </div>
                            {/* <!-- Upper Box --> */}

                            <div className="candidate-detail-outer">
                                <div className="auto-container">
                                    <div className="row align-items-start">
                                        <div className="content-column col-lg-8 col-md-12 col-sm-12">
                                            <div className="job-detail">
                                                <h4>Candidates About</h4>
                                                <p>
                                                    {candidate.personal?.profileSummary}
                                                </p>

                                                {/* <!-- Candidate Resume Start --> */}
                                                {candidate?.response?.sections?.map((resume) => (
                                                    <div
                                                        className={`resume-outer ${resume.themeColor}`}
                                                        key={resume.id}
                                                    >
                                                        <div className="upper-title">
                                                            <h4>{resume?.title}</h4>
                                                        </div>

                                                        {/* <!-- Start Resume BLock --> */}
                                                        {resume?.blockList?.map((item) => (
                                                            <div className="resume-block" key={item.id}>
                                                                <div className="inner">
                                                                    <span className="name">{item.meta}</span>
                                                                    <div className="title-box">
                                                                        <div className="info-box">
                                                                            <h3>{item.name}</h3>
                                                                            <span>{item.industry}</span>
                                                                        </div>
                                                                        <div className="edit-box">
                                                                            <span className="year">{formatYear(item.year)}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text">{item.text}</div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* <!-- End Resume BLock --> */}
                                                    </div>
                                                ))}
                                                {/* <!-- Candidate Resume End --> */}

                                            </div>
                                        </div>
                                        {/* End .content-column */}

                                        <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                                            <aside className="sidebar">
                                                <div className="sidebar-widget">
                                                    <div className="widget-content">
                                                        <ul className="job-overview">
                                                            <li>
                                                                <i className="icon icon-calendar"></i>
                                                                <h5>Experience:</h5>
                                                                <span>{candidate.personal?.totalExperience}</span>
                                                            </li>

                                                            <li>
                                                                <i className="icon icon-expiry"></i>
                                                                <h5>Age:</h5>
                                                                <span>{candidate.personal?.age} Years</span>
                                                            </li>

                                                            <li>
                                                                <i className="icon icon-rate"></i>
                                                                <h5>Current Salary:</h5>
                                                                <span> &#8377; {candidate.personal?.currentSalary}</span>
                                                            </li>

                                                            <li>
                                                                <i className="icon icon-salary"></i>
                                                                <h5>Expected Salary:</h5>
                                                                <span> &#8377; {candidate.personal?.expectedSalary}</span>
                                                            </li>

                                                            <li>
                                                                <i className="icon icon-user-2"></i>
                                                                <h5>Gender:</h5>
                                                                <span>{candidate.personal?.gender}</span>
                                                            </li>

                                                            <li>
                                                                <i className="icon icon-language"></i>
                                                                <h5>Language:</h5>
                                                                <span>{candidate.personal?.languages?.split("#")
                                                                    .filter(item => item.trim() !== "")
                                                                    .map(item => item.split("^")[1])
                                                                    .join(", ")}</span>
                                                            </li>

                                                            <li>
                                                                <i className="icon icon-degree"></i>
                                                                <h5>Education Level:</h5>
                                                                <span>{candidate.personal?.education}</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                {/* End .sidebar-widget conadidate overview */}

                                                {/* <div className="sidebar-widget social-media-widget">
                                                    <h4 className="widget-title">Social media</h4>
                                                    <div className="widget-content">
                                                        <div className="social-links">
                                                            <Social />
                                                        </div>
                                                    </div>
                                                </div> */}
                                                {/* End .sidebar-widget social-media-widget */}

                                                {/* <div className="sidebar-widget">
                                                    <h4 className="widget-title candidate-row skills-row">Professional Skills</h4>
                                                    <div className="widget-content">
                                                        <ul className="job-skills">
                                                            <JobSkills />
                                                        </ul>
                                                    </div>
                                                </div> */}
                                                {/* End .sidebar-widget skill widget */}

                                                {/* <div className="sidebar-widget contact-widget">
                                                    <h4 className="widget-title">Contact Us</h4>
                                                    <div className="widget-content">
                                                        <div className="default-form">
                                                            <Contact />
                                                        </div>
                                                    </div>
                                                </div> */}
                                                {/* End .sidebar-widget contact-widget */}
                                            </aside>
                                            {/* End .sidebar */}
                                        </div>
                                        {/* End .sidebar-column */}
                                    </div>
                                </div>
                            </div>
                            {/* <!-- job-detail-outer--> */}
                        </section>

                    </>
                )
            }
        </>
    );
};


export default CandidateDetailsV2;
