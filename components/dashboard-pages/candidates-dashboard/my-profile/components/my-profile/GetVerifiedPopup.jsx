
'use client';

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const initialIdentity = { documentType: "", documentNumber: "", documentFile: null };

const GetVerifiedPopup = ({ isOpen, onClose }) => {
    const [identity, setIdentity] = useState(initialIdentity);
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setIdentity({ ...initialIdentity });
            setLinkedinUrl("");
            setErrors({});
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen]);

    const handleClose = () => {
        if (!loading) onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!identity.documentType) newErrors.documentType = "Identity document is required.";
        if (!identity.documentNumber.trim()) newErrors.documentNumber = "Document number is required.";
        if (!identity.documentFile) newErrors.documentFile = "Please upload your identity document.";
        if (identity.documentFile) {
            if (!["image/jpeg", "image/png", "application/pdf"].includes(identity.documentFile.type)) newErrors.documentFile = "Only JPG, PNG and PDF files are allowed.";
            else if (identity.documentFile.size > 5 * 1024 * 1024) newErrors.documentFile = "File size must not exceed 5 MB.";
        }

        let validLinkedIn = false;
        try {
            const parsedUrl = new URL(linkedinUrl.trim());
            validLinkedIn = ["http:", "https:"].includes(parsedUrl.protocol) &&
                ["linkedin.com", "www.linkedin.com"].includes(parsedUrl.hostname) &&
                /^\/in\/[a-zA-Z0-9_%~-]+\/?$/.test(parsedUrl.pathname) &&
                !parsedUrl.search && !parsedUrl.hash;
        } catch {
            validLinkedIn = false;
        }

        if (!linkedinUrl.trim()) newErrors.linkedinUrl = "LinkedIn profile URL is required.";
        else if (!validLinkedIn) newErrors.linkedinUrl = "Enter a valid LinkedIn profile URL.";

        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("verificationType", "both");
            formData.append("documentType", identity.documentType);
            formData.append("documentNumber", identity.documentNumber.trim());
            formData.append("documentFile", identity.documentFile);
            formData.append("linkedinUrl", linkedinUrl.trim());

            const response = await fetch("/api/candi-verification", {
                method: "POST",
                body: formData
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Verification submission failed.");
            toast.success(result.message || "Verification submitted successfully.");
            onClose();
        } catch (error) {
            toast.error(error.message || "Unable to submit verification.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="gv-overlay">
            <div className="gv-modal" role="dialog" aria-modal="true" aria-labelledby="gv-title">
                <div className="gv-header">
                    <div className="gv-heading">
                        <i className="la la-user-check"></i>
                        <h5 id="gv-title">Get Verified</h5>
                    </div>
                    <button type="button" className="gv-close" onClick={handleClose} disabled={loading} aria-label="Close">&times;</button>
                </div>
                <div className="gv-body">
                    <div className="gv-info">
                        <i className="la la-shield-alt"></i>
                        <span>Submit your identity document and LinkedIn profile together for verification.</span>
                    </div>
                    <form className="default-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="gv-document-type">Identity Document <span className="text-danger">*</span></label>
                            <select id="gv-document-type" className={`form-select ${errors.documentType ? "gv-invalid" : ""}`} value={identity.documentType} onChange={e => { setIdentity(prev => ({ ...prev, documentType: e.target.value })); setErrors(prev => ({ ...prev, documentType: "" })); }}>
                                <option value="">Select document type</option>
                                <option value="adhaar">Adhaar Card</option>
                                <option value="pan">PAN Card</option>
                                <option value="passport">Passport</option>
                                <option value="driving_license">Driving Licence</option>
                                <option value="voter_id">Voter ID</option>
                                <option value="other">Other accepted ID</option>
                            </select>
                            {errors.documentType && <small className="gv-error">{errors.documentType}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="gv-document-number">Document Number <span className="text-danger">*</span></label>
                            <input id="gv-document-number" type="text" className={`form-control ${errors.documentNumber ? "gv-invalid" : ""}`} autoComplete="off" maxLength={50} value={identity.documentNumber} onChange={e => { setIdentity(prev => ({ ...prev, documentNumber: e.target.value })); setErrors(prev => ({ ...prev, documentNumber: "" })); }} placeholder="Enter document number" />
                            {errors.documentNumber && <small className="gv-error">{errors.documentNumber}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="gv-document-file">Upload Identity Document <span className="text-danger">*</span></label>
                            <input ref={fileInputRef} id="gv-document-file" type="file" className={`form-control ${errors.documentFile ? "gv-invalid" : ""}`} accept=".jpg,.jpeg,.png,.pdf" onChange={e => { setIdentity(prev => ({ ...prev, documentFile: e.target.files?.[0] || null })); setErrors(prev => ({ ...prev, documentFile: "" })); }} />
                            <small className="text-muted">JPG, PNG or PDF. Maximum 5 MB.</small>
                            {errors.documentFile && <small className="gv-error">{errors.documentFile}</small>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="gv-linkedin-url">LinkedIn Profile URL <span className="text-danger">*</span></label>
                            <input id="gv-linkedin-url" type="url" className={`form-control ${errors.linkedinUrl ? "gv-invalid" : ""}`} value={linkedinUrl} onChange={e => { setLinkedinUrl(e.target.value); setErrors(prev => ({ ...prev, linkedinUrl: "" })); }} placeholder="https://www.linkedin.com/in/your-profile/" />
                            {errors.linkedinUrl && <small className="gv-error">{errors.linkedinUrl}</small>}
                        </div>
                        <button type="submit" className="gv-submit" disabled={loading}>{loading ? "Please wait..." : "Submit Verification"}</button>
                    </form>
                </div>
            </div>
            <style jsx>{`
                .gv-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.68);overflow-y:auto}
                .gv-modal{width:100%;max-width:560px;max-height:calc(100vh - 32px);overflow-y:auto;background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.24);margin:auto}
                .gv-header{display:flex;align-items:center;justify-content:space-between;padding:15px 24px;border-bottom:1px solid #eee}
                .gv-heading{display:flex;align-items:center;gap:10px}
                .gv-heading>i{color:#1967d2;font-size:27px}
                .gv-heading h5{margin:0;font-weight:500}
                .gv-close{border:0;background:transparent;font-size:30px;line-height:1;color:#555}
                .gv-body{padding:22px}
                .gv-body .form-group{margin-bottom:18px}
                .gv-body label{display:block;margin-bottom:8px;font-weight:500}
                .gv-body .form-control,.gv-body .form-select{min-height:40px}
                .gv-info{display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:18px;border-radius:7px;background:#f1f6ff;color:#354e73;font-size:13px}
                .gv-info i{color:#1967d2;font-size:25px}
                .gv-error{display:block;margin-top:5px;color:#dc3545;font-size:12px}
                .gv-invalid{border-color:#dc3545!important}
                .gv-submit{width:100%;min-height:40px;padding:8px 16px;border:0;border-radius:6px;background:#1967d2;color:#fff;font-weight:500}
                .gv-submit:disabled,.gv-close:disabled{opacity:.65;cursor:not-allowed}
                @media(max-width:480px){.gv-header,.gv-body{padding:14px}}
            `}</style>
        </div>
    );
};

export default GetVerifiedPopup;
