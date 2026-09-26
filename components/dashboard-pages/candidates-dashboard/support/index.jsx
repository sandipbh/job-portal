"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "../../BreadCrumb";
import {
    hasUnsafeSupportText,
    supportTextSecurityMessage,
} from "@/utils/validateSupportDescription";

const initialForm = {
    fullName: "",
    category: "",
    subject: "",
    description: "",
};

const issueCategories = [
    "Account and profile",
    "Resume and documents",
    "Job application",
    "Job alerts",
    "Messages",
    "Technical problem",
    "Other",
];

function formatDate(value) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function CandidateSupport({ candidateFullName }) {
    const [form, setForm] = useState(() => ({
        ...initialForm,
        fullName: candidateFullName || "",
    }));
    const [reports, setReports] = useState([]);
    const [isLoadingReports, setIsLoadingReports] = useState(true);
    const [reportsError, setReportsError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [apiResponse, setApiResponse] = useState(null);
    const [descriptionError, setDescriptionError] = useState("");
    const [subjectError, setSubjectError] = useState("");

    async function loadReports() {
        setIsLoadingReports(true);
        setReportsError("");
        try {
            const response = await fetch("/api/candidate-support", { cache: "no-store" });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to load support reports.");

            const reportData = result.data;
            const savedReports = Array.isArray(reportData)
                ? reportData
                : Array.isArray(reportData?.reports)
                    ? reportData.reports
                    : Array.isArray(reportData?.data)
                        ? reportData.data
                        : [];

            setReports(savedReports);
        } catch (loadError) {
            setReportsError(loadError.message || "Failed to load support reports.");
        } finally {
            setIsLoadingReports(false);
        }
    }

    useEffect(() => {
        loadReports();
    }, []);

    function updateField(event) {
        const { name, value } = event.target;

        if (name === "description" || name === "subject") {
            const setFieldError = name === "description" ? setDescriptionError : setSubjectError;
            if (hasUnsafeSupportText(value)) {
                setFieldError(supportTextSecurityMessage);
                return;
            }
            setFieldError("");
        }

        setForm((current) => ({ ...current, [name]: value }));
    }

    async function submitReport(event) {
        event.preventDefault();
        setError("");
        setApiResponse(null);

        if (hasUnsafeSupportText(form.subject)) {
            setSubjectError(supportTextSecurityMessage);
            return;
        }
        if (hasUnsafeSupportText(form.description)) {
            setDescriptionError(supportTextSecurityMessage);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/candidate-support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const result = await response.json();

            if (!response.ok) {
                const firstFieldError = Object.values(result.errors || {})[0];
                throw new Error(firstFieldError || result.message || "Unable to submit your report.");
            }

            setApiResponse(result);
            await loadReports();
            setForm({
                ...initialForm,
                fullName: candidateFullName || "",
            });

        } catch (submitError) {
            setError(submitError.message || "A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="user-dashboard">
            <div className="dashboard-outer">
                <BreadCrumb title="Candidate Support" />


                <div className="row g-4 align-items-start">
                    <section className="col-lg-7 col-xl-8" aria-labelledby="report-title">
                        <div className="ls-widget">

                            <div className="widget-content">

                                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                                {apiResponse && (
                                    <div className="alert alert-success" role="status">
                                        <strong>{apiResponse.message || apiResponse.Message || "Support API response received."}</strong>
                                        {(apiResponse.refNo || apiResponse.reference || apiResponse.ticketId || apiResponse.id) && (
                                            <div>Reference: {apiResponse.refNo || apiResponse.reference || apiResponse.ticketId || apiResponse.id}</div>
                                        )}
                                        {(apiResponse.Reply || apiResponse.reply || apiResponse.response) && (
                                            <div className="mt-2">
                                                <strong>Support reply:</strong> {apiResponse.Reply || apiResponse.reply || apiResponse.response}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <form className="default-form" onSubmit={submitReport}>
                                    <div className="row">
                                        <div className="form-group col-md-6">
                                            <label htmlFor="support-full-name">Full name <span className="text-danger">*</span></label>
                                            <input
                                                autoComplete="name"
                                                className="form-control"
                                                id="support-full-name"
                                                maxLength={100}
                                                minLength={2}
                                                name="fullName"
                                                placeholder="Your name"
                                                readOnly
                                                required
                                                value={form.fullName}
                                                type="text"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="support-category">Issue type <span className="text-danger">*</span></label>
                                        <select className="form-select" id="support-category" name="category" onChange={updateField} required value={form.category}>
                                            <option value="">Select an issue type</option>
                                            {issueCategories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="support-subject">Subject <span className="text-danger">*</span></label>
                                        <input
                                            aria-describedby="support-subject-error"
                                            aria-invalid={Boolean(subjectError)}
                                            className={`form-control${subjectError ? " is-invalid" : ""}`}
                                            id="support-subject"
                                            maxLength={120}
                                            minLength={5}
                                            name="subject"
                                            onChange={updateField}
                                            placeholder="Briefly summarize the issue"
                                            required
                                            type="text"
                                            value={form.subject}
                                        />
                                        {subjectError && (
                                            <div className="invalid-feedback d-block" id="support-subject-error" role="alert">
                                                {subjectError}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="support-description">What happened? <span className="text-danger">*</span></label>
                                        <textarea
                                            aria-describedby="support-description-error"
                                            aria-invalid={Boolean(descriptionError)}
                                            className={`form-control${descriptionError ? " is-invalid" : ""}`}
                                            id="support-description"
                                            maxLength={2000}
                                            minLength={20}
                                            name="description"
                                            onChange={updateField}
                                            placeholder="Include the steps you took and any message you saw. Please do not include passwords or sensitive financial information."
                                            required
                                            rows={6}
                                            value={form.description}
                                        />
                                        {descriptionError && (
                                            <div className="invalid-feedback d-block" id="support-description-error" role="alert">
                                                {descriptionError}
                                            </div>
                                        )}
                                        <div className="form-text text-end">{form.description.length}/2000</div>
                                    </div>

                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-3">
                                        <button className="theme-btn btn-style-one" disabled={isSubmitting} type="submit">
                                            {isSubmitting ? "Submitting..." : "Submit"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>

                    <aside className="col-lg-5 col-xl-4" aria-labelledby="reports-title">
                        <div className="ls-widget">
                            <div className="widget-title">
                                <h4 id="reports-title" className="mb-0">My reports <span className="badge bg-secondary ms-2">{reports.length}</span></h4>
                            </div>
                            <div className="widget-content">
                                {reportsError && <div className="alert alert-warning" role="alert">{reportsError}</div>}
                                {isLoadingReports ? (
                                    <p className="text-muted text-center py-4 mb-0">Loading reports...</p>
                                ) : reports.length === 0 ? (
                                    <div className="text-center py-4">
                                        <h5>No reports yet</h5>
                                        <p className="text-muted mb-0">After you contact support, your report and our reply will appear here.</p>
                                    </div>
                                ) : (
                                    <div
                                        className="list-group list-group-flush"
                                        style={{ minHeight: "400px", maxHeight: "600px", overflowY: "auto" }}
                                    >
                                        {reports.map((report) => (
                                            <article className="list-group-item px-0" key={report.srno}>
                                                <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                                                    <span className="text-primary fw-semibold small">{report.refNo}</span>
                                                    <span className="badge bg-warning text-dark">{report.status}</span>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center gap-2 mb-0">
                                                    <p className="text-dark small mb-0">{report.issue}  </p>
                                                    <span className="text-muted small mb-0">{formatDate(report.createDate)}</span>
                                                </div>


                                                <h5 className="h6 mb-1">{report.subject}</h5>
                                                <p className="mb-1 text-break">{report.details}  </p>
                                                {report?.reply && (
                                                    <div className="alert alert-light border-start border-success border-1 mb-0 p-1">
                                                        <span>Reply :{report?.reply}</span>
                                                    </div>
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}