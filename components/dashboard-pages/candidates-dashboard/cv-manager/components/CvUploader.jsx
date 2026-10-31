'use client';
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPE = "application/pdf";

const CvUploader = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadedResume, setUploadedResume] = useState("");
    const inputRef = useRef(null);

    const cvManagerHandler = (e) => {
        const file = e.target.files?.[0];
        setError("");
        setMessage("");
        if (!file) return;
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (extension !== "pdf" || file.type !== ALLOWED_TYPE) {
            setSelectedFile(null);
            setError("Only PDF files are allowed.");
            e.target.value = "";
            return;
        }
        if (file.size === 0 || file.size > MAX_FILE_SIZE) {
            setSelectedFile(null);
            setError("Resume must be a valid PDF file not exceeding 5 MB.");
            e.target.value = "";
            return;
        }
        setSelectedFile(file);
    };

    const deleteHandler = () => {
        setSelectedFile(null);
        setError("");
        setMessage("");
        if (inputRef.current) inputRef.current.value = "";
    };

    const uploadResume = async () => {
        if (!selectedFile) {
            setError("Please select a PDF resume to upload.");
            setMessage("");
            return;
        }

        setUploading(true);
        setError("");
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("resume", selectedFile);

            const response = await fetch("/api/candi-resume", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            const rawSuccess = result.Success ?? false;
            const success = rawSuccess === true || ["true", "1"].includes(String(rawSuccess).toLowerCase());
            const responseMessage = result.message ?? result.Message ?? "";

            console.log("Resume Upload result:", result);
            console.log("Resume Upload rawSuccess:", rawSuccess);
            console.log("Resume Upload success:", success);
            console.log("Resume Upload responseMessage:", responseMessage);

            if (responseMessage == "Resume uploaded successfully") {
                setError("");
                setMessage(responseMessage || "Resume uploaded successfully.");
                setUploadedResume(selectedFile.name);
                setSelectedFile(null);
                if (inputRef.current) inputRef.current.value = "";
            } else {
                setMessage("");
                setError(responseMessage || "Resume upload failed.");
            }
        } catch (err) {
            setMessage("");
            setError(err.message || "Unable to upload resume. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            setMessage("");
            setUploadedResume("");
        }, 3000);
        return () => clearTimeout(timer);
    }, [message]);

    return (
        <div className="uploading-resume">
            <div className="uploadButton">
                <input
                    ref={inputRef}
                    className="uploadButton-input"
                    type="file"
                    name="resume"
                    accept=".pdf,application/pdf"
                    id="upload"
                    onChange={cvManagerHandler}
                    disabled={uploading}
                />
                <label className="cv-uploadButton" htmlFor="upload">
                    <span className="title">Select your resume to upload</span>
                    <span className="text">Maximum file size: 5 MB. Allowed format: PDF only</span>
                    <span className="theme-btn btn-style-one">Choose Resume</span>
                </label>
            </div>

            {selectedFile && (
                <div className="files-outer mt-3">
                    <div className="file-edit-box align-items-center justify-content-between gap-2">
                        <span className="title text-break">
                            <i className="la la-file-pdf me-2"></i>
                            {selectedFile.name}
                            <small className="d-block text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</small>
                        </span>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={deleteHandler} disabled={uploading} aria-label="Remove selected resume">
                            <i className="la la-trash"></i>
                        </button>
                    </div>
                    <button type="button" className="theme-btn btn-style-one mt-3" onClick={uploadResume} disabled={uploading}>
                        {uploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <i className="la la-upload me-2"></i>
                                Upload Resume
                            </>
                        )}
                    </button>
                </div>
            )}

            {uploadedResume && !selectedFile && (
                <div className="files-outer mt-3">
                    <div className="file-edit-box">
                        <span className="title text-break">
                            <i className="la la-check-circle text-success me-2"></i>
                            {uploadedResume}
                        </span>
                    </div>
                </div>
            )}

            {error && (<div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>)}
            {message && (<div className="alert alert-success mt-3 mb-0" role="status">{message}</div>)}

        </div>
    );
};

export default CvUploader;