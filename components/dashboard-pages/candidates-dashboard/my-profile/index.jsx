
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "../../BreadCrumb";
import MyProfile from "./components/my-profile";
import GetVerifiedPopup from "./components/my-profile/GetVerifiedPopup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Index = () => {
    const router = useRouter();
    const [showVerification, setShowVerification] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteProfile = () => {
        if (isDeleting) return;

        toast.info(
            <div>
                <p className="mb-2 fw-semibold">Are you sure you want to delete your profile?</p>
                <p className="mb-3 small">Your candidate account will be deactivated and you will be logged out.</p>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                            toast.dismiss();
                            confirmDeleteProfile();
                        }}
                    >
                        Yes, Delete
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => toast.dismiss()}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: true
            }
        );
    };

    const confirmDeleteProfile = async () => {
        if (isDeleting) return;

        try {
            setIsDeleting(true);

            const response = await fetch("/api/candi-delete-profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const result = await response.json();

            if (!response.ok || !result?.status) {
                toast.error(result?.message || "Unable to delete your profile.");
                return;
            }

            toast.success(result.message || "Profile deleted successfully.");

            setTimeout(() => {
                router.replace("/login");
                router.refresh();
            }, 1500);
        } catch (error) {
            console.error("Delete profile error:", error);
            toast.error("Something went wrong while deleting your profile.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className="user-dashboard">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="colored"
            />

            <div className="dashboard-outer">
                <BreadCrumb title="My Profile!" />
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ls-widget">
                            <div className="tabs-box">
                                <div className="widget-title d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <h4>Complete your profile</h4>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="add-language-btn"
                                            onClick={() => setShowVerification(true)}
                                        >
                                            <i className="la la-user-check"></i>
                                            Get Verified
                                        </button>

                                        <button
                                            type="button"
                                            className="add-language-btn delete-profile-btn"
                                            onClick={handleDeleteProfile}
                                            disabled={isDeleting}
                                        >
                                            <i className="la la-trash"></i>
                                            {isDeleting ? "Deleting..." : "Delete Profile"}
                                        </button>
                                    </div>
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
