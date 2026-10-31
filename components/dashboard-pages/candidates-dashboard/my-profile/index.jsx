
'use client';

import { useState } from "react";
import BreadCrumb from "../../BreadCrumb";
import MyProfile from "./components/my-profile";
import GetVerifiedPopup from "./components/my-profile/GetVerifiedPopup";

const Index = () => {
    const [showVerification, setShowVerification] = useState(false);

    return (
        <section className="user-dashboard">
            <div className="dashboard-outer">
                <BreadCrumb title="My Profile!" />
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ls-widget">
                            <div className="tabs-box">
                                <div className="widget-title d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <h4>Complete your profile</h4>
                                    <button
                                        type="button"
                                        className="add-language-btn"
                                        onClick={() => setShowVerification(true)}
                                    >
                                        <i className="la la-user-check"></i>
                                        Get Verified
                                    </button>
                                </div>
                                <MyProfile />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <GetVerifiedPopup
                isOpen={showVerification}
                onClose={() => setShowVerification(false)}
            />
        </section>
    );
};

export default Index;
