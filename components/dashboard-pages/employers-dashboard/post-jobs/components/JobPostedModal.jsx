'use client'
import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";


const JobPostedModal = ({
    isOpen,
    onClose,
    jobTitle,
    companyName,
    jobLink,
}) => {


    const pathname = usePathname();


    const shareLink =
        typeof window !== "undefined"
            ? `${window.location.origin}${jobLink}`
            : "";

    if (!isOpen) return null;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);

        toast.success("Link copied!");
    };


    return (
        <div className="job-success-overlay">
            <div className="job-success-modal">
                <button className="close-btn" onClick={onClose}>
                    ✕
                </button>

                <div className="success-header">
                    <div className="success-circle">
                        <i className="las la-check"></i>
                    </div>

                    <h2>Great! Your job is live</h2>
                </div>

                <p className="share-text">
                    Share it with your network
                </p>

                <div className="job-card">
                    <div className="job-icon">
                        <i className="la la-building"></i>
                    </div>

                    <div>
                        <h4>{jobTitle}</h4>
                        <p style={{ marginBottom: "0" }}>{companyName}</p>
                    </div>
                </div>
                <div className="share-icons">
                    <button onClick={handleCopyLink}>
                        <i className="la la-link"></i>
                        <span>Copy Link</span>
                    </button>

                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="lab la-linkedin"></i>
                        <span>LinkedIn</span>
                    </a>

                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="lab la-facebook-f"></i>
                        <span>Facebook</span>
                    </a>
                </div>

                <div className="bottom-note">
                    Manage this job's responses directly from your phone.
                </div>
            </div>
        </div>
    );
};

export default JobPostedModal;