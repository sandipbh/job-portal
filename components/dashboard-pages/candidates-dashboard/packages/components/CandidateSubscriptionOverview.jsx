
"use client";

import React, { useCallback, useEffect, useState } from "react";

const getValue = (data, key) => {
    if (!data || typeof data !== "object") return null;
    const normalize = value => String(value).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const targetKey = normalize(key);
    const actualKey = Object.keys(data).find(property => normalize(property) === targetKey);
    return actualKey !== undefined ? data[actualKey] : null;
};

const formatNumber = value => Number(value ?? 0).toLocaleString("en-IN");

const formatDate = value => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const getProgress = (used, total) => {
    if (Number(total) <= 0) return 0;
    return Math.min(100, Math.max(0, (Number(used || 0) / Number(total)) * 100));
};

const CandidateSubscriptionOverview = ({ refreshKey = 0 }) => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [subscriptionNotice, setSubscriptionNotice] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const notice = params.get("notice");

        const notices = {
            "subscription-required": "You don't have an active subscription. Please purchase a subscription plan to start using job application credits.",
            "apply-balance-exhausted": "Your job application balance is exhausted. Please purchase or upgrade your subscription plan to continue applying for jobs.",
            "shortlist-balance-exhausted": "Your shortlist balance is exhausted. Please purchase another subscription plan to continue shortlisting candidates."
        };

        if (notice && notices[notice]) {
            setSubscriptionNotice(notices[notice]);
        }

        if (notice) {
            params.delete("notice");
            const queryString = params.toString();
            const newUrl = window.location.pathname + (queryString ? `?${queryString}` : "") + window.location.hash;
            window.history.replaceState({}, "", newUrl);
        }
    }, []);

    const fetchWallet = useCallback(async signal => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/candi-subscription-details", {
                method: "GET",
                cache: "no-store",
                signal
            });

            const result = await response.json();

            if (response.status === 404) {
                setWallet(null);
                return;
            }

            if (!response.ok || result.success === false || result.Success === false) {
                throw new Error(result.message || result.Message || `API Error: ${response.status}`);
            }

            let data = result.data ?? result.Data ?? result;
            if (data?.data || data?.Data) data = data.data ?? data.Data;
            if (Array.isArray(data)) data = data.length ? data[0] : null;

            if (!data || typeof data !== "object") {
                setWallet(null);
                return;
            }

            setWallet(data);
        } catch (err) {
            if (err.name === "AbortError") return;
            console.error("Candidate Subscription Details Error:", err);
            setError(err.message || "Unable to retrieve subscription details.");
            setWallet(null);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchWallet(controller.signal);
        return () => controller.abort();
    }, [fetchWallet, refreshKey]);

    const handleRetry = () => fetchWallet();

    return (
        <div className="employer-subscription-overview">

            {subscriptionNotice && (
                <div className="alert alert-warning d-flex align-items-start justify-content-between gap-3 mb-4" role="alert">
                    <div className="d-flex align-items-start gap-2">
                        <i className="la la-exclamation-triangle fs-4"></i>
                        <div>
                            <strong>Subscription Notice</strong>
                            <p className="mb-0 mt-1">{subscriptionNotice}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setSubscriptionNotice("")}
                    ></button>
                </div>
            )}

            {loading ? (
                <div className="employer-wallet-loading">
                    <span className="spinner-border spinner-border-sm"></span>
                    <span>Loading subscription details...</span>
                </div>
            ) : error ? (
                <div className="employer-wallet-error">
                    <div>
                        <i className="la la-exclamation-circle"></i>
                        <strong>Unable to load subscription details</strong>
                        <p>{error}</p>
                    </div>
                    <button type="button" onClick={handleRetry}>
                        <i className="la la-refresh"></i> Retry
                    </button>
                </div>
            ) : !wallet ? (
                <div className="employer-wallet-empty">
                    <i className="la la-wallet"></i>
                    <h5>No Subscription Found</h5>
                    <p>Purchase a subscription plan to start using profile views and job application credits.</p>
                </div>
            ) : (
                <>
                    {(() => {
                        const planName = getValue(wallet, "PLAN_NAME") || "Subscription Plan";
                        const date = getValue(wallet, "SUBSCRIPTION_DATE");
                        const amount = getValue(wallet, "FINAL_AMOUNT");

                        const totalViews = Number(getValue(wallet, "TOTAL_VIEW") || 0);
                        const usedViews = Number(getValue(wallet, "USE_VIEW") || 0);
                        const remainingViews = Number(getValue(wallet, "REMAINING_VIEW") ?? totalViews - usedViews);

                        const totalApply = Number(getValue(wallet, "TOTAL_APPLY") || 0);
                        const usedApply = Number(getValue(wallet, "USE_APPLY") || 0);
                        const remainingApply = Number(getValue(wallet, "REMAINING_APPLY") ?? totalApply - usedApply);

                        const credits = [
                            {
                                title: "Profile Views",
                                subtitle: "Candidate profile access",
                                icon: "la-eye",
                                className: "view-icon",
                                progressClass: "view-progress",
                                total: totalViews,
                                used: usedViews,
                                remaining: remainingViews
                            },
                            {
                                title: "Job Applications",
                                subtitle: "Application credits",
                                icon: "la-file-alt",
                                className: "shortlist-icon",
                                progressClass: "shortlist-progress",
                                total: totalApply,
                                used: usedApply,
                                remaining: remainingApply
                            }
                        ];

                        return (
                            <>
                                <div className="current-plan-panel">
                                    <div className="current-plan-main">
                                        <div className="current-plan-icon">
                                            <i className="la la-crown"></i>
                                        </div>
                                        <div className="current-plan-info">
                                            <span className="current-plan-label">CURRENT SUBSCRIPTION</span>
                                            <h4>{planName}</h4>
                                        </div>
                                    </div>
                                    <div className="current-plan-price">
                                        <span>Purchase Amount</span>
                                        <h3>₹{formatNumber(amount)}</h3>
                                        <small>{formatDate(date)}</small>
                                    </div>
                                </div>

                                <div className="wallet-section-heading">
                                    <div>
                                        <h4>Candidate Wallet</h4>
                                        <p>Combined credits from all purchased subscriptions.</p>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    {credits.map((credit, index) => (
                                        <div className="col-md-6" key={index}>
                                            <div className="wallet-credit-card">
                                                <div className="wallet-credit-header">
                                                    <div className={`wallet-credit-icon ${credit.className}`}>
                                                        <i className={`la ${credit.icon}`}></i>
                                                    </div>
                                                    <div>
                                                        <h5>{credit.title}</h5>
                                                        <span>{credit.subtitle}</span>
                                                    </div>
                                                </div>

                                                <div className="wallet-progress mt-3">
                                                    <div className="progress">
                                                        <div
                                                            className={`progress-bar ${credit.progressClass}`}
                                                            style={{ width: `${getProgress(credit.used, credit.total)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="wallet-credit-footer">
                                                    <div>
                                                        <span>Total:</span>
                                                        <span className="highlight">{formatNumber(credit.total)}</span>
                                                    </div>
                                                    <div>
                                                        <span>Used:</span>
                                                        <span className="highlight">{formatNumber(credit.used)}</span>
                                                    </div>
                                                    <div className="justify-content-end">
                                                        <span>Remaining:</span>
                                                        <span className="wallet-remaining highlight">{formatNumber(credit.remaining)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        );
                    })()}
                </>
            )}
        </div>
    );
};

export default CandidateSubscriptionOverview;
