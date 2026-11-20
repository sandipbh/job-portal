
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

const EmployerSubscriptionOverview = ({ refreshKey = 0 }) => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchWallet = useCallback(async (signal) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/emp-subscription-details", {
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
            console.error("Employer Subscription Details Error:", err);
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

    if (loading) {
        return (
            <div className="employer-wallet-loading">
                <span className="spinner-border spinner-border-sm"></span>
                <span>Loading subscription details...</span>
            </div>
        );
    }

    if (error) {
        return (
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
        );
    }

    if (!wallet) {
        return (
            <div className="employer-wallet-empty">
                <i className="la la-wallet"></i>
                <h5>No Subscription Found</h5>
                <p>Purchase a subscription plan to start using recruitment credits.</p>
            </div>
        );
    }

    const planName = getValue(wallet, "PLAN_NAME") || "Subscription Plan";
    const planId = getValue(wallet, "PLAN_ID");
    const subId = getValue(wallet, "SUB_ID");
    const date = getValue(wallet, "SUBSCRIPTION_DATE");
    const amount = getValue(wallet, "FINAL_AMOUNT");

    const totalViews = Number(getValue(wallet, "TOTAL_VIEW") || 0);
    const usedViews = Number(getValue(wallet, "USE_VIEW") || 0);
    const remainingViews = Number(getValue(wallet, "REMAINING_VIEW") ?? totalViews - usedViews);

    const totalShort = Number(getValue(wallet, "TOTAL_SHORT") || 0);
    const usedShort = Number(getValue(wallet, "USE_SHORT") || 0);
    const remainingShort = Number(getValue(wallet, "REMAINING_SHORT") ?? totalShort - usedShort);

    const currentViews = Number(getValue(wallet, "CURRENT_PLAN_TOTAL_VIEW") || 0);
    const currentShort = Number(getValue(wallet, "CURRENT_PLAN_TOTAL_SHORT") || 0);
    const currentUsedViews = Number(getValue(wallet, "CURRENT_PLAN_USED_VIEW") || 0);
    const currentUsedShort = Number(getValue(wallet, "CURRENT_PLAN_USED_SHORT") || 0);

    const advances = [
        getValue(wallet, "ADVANCE_1"),
        getValue(wallet, "ADVANCE_2"),
        getValue(wallet, "ADVANCE_3")
    ];

    return (
        <div className="employer-subscription-overview">
            {/* <div className="wallet-overview-heading">
                <div>
                    <h3>Subscription Overview</h3>
                    <p>Your subscription and available recruitment credits.</p>
                </div>
                <span className="wallet-active-status">
                    <i className="la la-check-circle"></i> Active Plan
                </span>
            </div> */}

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
                    <h4>Recruitment Wallet</h4>
                    <p>Combined credits from all purchased subscriptions.</p>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-md-4">
                    <div className="wallet-credit-card">
                        <div className="wallet-credit-header">
                            <div className="wallet-credit-icon view-icon">
                                <i className="la la-eye"></i>
                            </div>
                            <div>
                                <h5>Profile Views</h5>
                                <span>Candidate profile access</span>
                            </div>
                        </div>

                        <div className="wallet-progress mt-3">
                            <div className="progress">
                                <div className="progress-bar view-progress" style={{ width: `${getProgress(usedViews, totalViews)}%` }}></div>
                            </div>
                        </div>
                        <div className="wallet-credit-footer">
                            <div>
                                <span>Total:</span>
                                <span className="highlight">{formatNumber(totalViews)}</span>
                            </div>
                            <div>
                                <span>Used:</span>
                                <span className="highlight">{formatNumber(usedViews)}</span>
                            </div>
                            <div className="justify-content-end">
                                <span>Remaining:</span>
                                <span className="wallet-remaining highlight">{formatNumber(remainingViews)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="wallet-credit-card">
                        <div className="wallet-credit-header">
                            <div className="wallet-credit-icon shortlist-icon">
                                <i className="la la-users"></i>
                            </div>
                            <div>
                                <h5>Shortlist Credits</h5>
                                <span>Candidate shortlisting</span>
                            </div>
                        </div>
                        <div className="wallet-progress mt-3">
                            <div className="progress">
                                <div className="progress-bar shortlist-progress" style={{ width: `${getProgress(usedShort, totalShort)}%` }}></div>
                            </div>
                        </div>
                        <div className="wallet-credit-footer">
                            <div>
                                <span>Total</span>
                                <span className="highlight">{formatNumber(totalShort)}</span>
                            </div>
                            <div>
                                <span>Used</span>
                                <span className="highlight">{formatNumber(usedShort)}</span>
                            </div>
                            <div className="justify-content-end">
                                <span>Remaining</span>
                                <span className="wallet-remaining highlight">{formatNumber(remainingShort)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="wallet-credit-card">
                        <div className="wallet-credit-header">
                            <div className="wallet-credit-icon shortlist-icon">
                                <i className="la la-users"></i>
                            </div>
                            <div>
                                <h5>Current Plan Benefits</h5>
                                <span>Features included in your latest subscription.</span>
                            </div>
                        </div>
                        <div className="row g-2 mt-1">
                            {advances.map((value, index) => (
                                <div className="col-md-4 col-sm-4" key={index}>
                                    <div className="plan-feature-item advance-feature">
                                        <i className={`la ${value ? "la-check-circle included" : "la-times-circle excluded"}`}></i>
                                        <div>
                                            <span>Advance {index + 1}</span>
                                            <strong>{value ? "Included" : "Not Included"}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerSubscriptionOverview;
