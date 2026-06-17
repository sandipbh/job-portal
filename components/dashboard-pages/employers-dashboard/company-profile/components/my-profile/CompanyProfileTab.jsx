'use client';

import { useState } from "react";
import LogoCoverUploader from "./LogoCoverUploader";
import FormInfoBox from "./FormInfoBox";
import { FaUser, FaBuilding, FaFileAlt, FaCheck } from "react-icons/fa";
import PersonalDetailsForm from "./PersonalDetailForm";
import SocialNetworkBox from "./SocialNetworkBox";
import { useRef } from "react";
import Link from "next/link";
import { FaBriefcase } from "react-icons/fa";


const CompanyProfileTabs = () => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = [
        { title: "Personal Details", icon: <FaUser /> },
        { title: "Company Details", icon: <FaBuilding /> },
        { title: "Post a Job", icon: <FaFileAlt /> },
    ];


    const formRef = useRef();
    return (
        <div className="tabs-wrapper-main">

            {/* Tabs */}
            <div className="tabs-wrapper">
                {tabs.map((tab, index) => {
                    const isCompleted = index < activeTab;
                    const isActive = index === activeTab;

                    return (
                        <div
                            key={index}
                            className={`tab-item 
              ${isActive ? "active" : ""} 
              ${isCompleted ? "completed" : ""}`}
                            onClick={() => {
                                if (index <= activeTab) setActiveTab(index);
                            }}
                        >
                            <div
                                className={`tab-circle 
                ${isActive ? "active" : ""} 
                ${isCompleted ? "completed" : ""}`}
                            >
                                {isCompleted ? <FaCheck /> : tab.icon}
                            </div>

                            <p className={`tab-text ${isActive ? "active" : ""}`}>
                                {tab.title}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 0 && (
                    <PersonalDetailsForm onNext={() => setActiveTab(1)} />
                )}

                {activeTab === 1 && (
                    <div>
                        <FormInfoBox ref={formRef} />
                        <LogoCoverUploader />
                        <SocialNetworkBox
                            onNext={() => {
                                if (formRef.current.validate()) {
                                    setActiveTab(2);
                                }
                            }}
                        />
                    </div>
                )}

                {activeTab === 2 && (
                    <div className="cta-box mt-4 p-4 text-center">
                        <h5>🎉 You're ready to hire!</h5>
                        <p className="text-muted">
                            Complete setup. Now start posting jobs and attract candidates.
                        </p>

                        <Link href="/employers-dashboard/post-jobs">
                            <button className="theme-btn btn-style-one mt-2 gap-2">
                                <FaBriefcase />
                                Post Your First Job
                            </button>
                        </Link>
                    </div>
                )}
            </div>

        </div>
    );
};

export default CompanyProfileTabs;