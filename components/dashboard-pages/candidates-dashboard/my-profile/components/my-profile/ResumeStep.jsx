'use client'

import { useRouter } from "next/navigation";

const ResumeStep = ({ formData, setFormData }) => {
    const router = useRouter();

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                resume: file,
            }));
        }
    };

    return (
        <div className="widget-content">

            <div className="resume-card-ui">

                {/* IMAGE */}
                <div className="resume-image">
                    <img src="/images/background/2.png" alt="resume" />
                </div>

                {/* TEXT */}
                <h2 className="resume-title">Add your resume</h2>

                <ul className="resume-points">
                    <li>Showcase your skills and get discovered</li>
                    <li>Easily apply to jobs faster</li>
                    <li>Get personalised job suggestions</li>
                </ul>

                <p className="resume-terms">
                    By continuing, you agree to receive job opportunities.
                </p>

                {/* BUTTONS */}
                <div className="resume-actions">

                    <button
                        className="theme-btn btn-style-one"
                        onClick={() =>
                            router.push("/candidates-dashboard/my-resume")
                        }
                    >
                        Build Resume
                    </button>

                    <label className="theme-btn btn-style-two">
                        Upload Resume
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            hidden
                            onChange={handleUpload}
                        />
                    </label>

                </div>

            </div>

            {/* SKIP */}
            {/* <div className="resume-skip">
                <span onClick={() => alert("Skipped")}>
                    Skip for now
                </span>
            </div> */}

        </div>
    );
};

export default ResumeStep;