"use client";

import React, { useEffect, useState } from "react";
import CandidateSubscriptionOverview from "./CandidateSubscriptionOverview";


const PackageDataTable = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyingPlanId, setBuyingPlanId] = useState(null);
  const [confirmPlanId, setConfirmPlanId] = useState(null);
  const [walletRefreshKey, setWalletRefreshKey] = useState(0);
  const [subscriptionNotice, setSubscriptionNotice] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState({
    planId: null,
    type: "",
    text: ""
  });

  const getValue = (plan, key) => {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    return plan?.[key] ?? plan?.[camelKey] ?? plan?.[key.toLowerCase()] ?? null;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notice = params.get("notice");

    if (notice === "subscription-required") {
      setSubscriptionNotice(
        "You don't have an active subscription. Please purchase a subscription plan to shortlist candidates."
      );
    } else if (notice === "shortlist-balance-exhausted") {
      setSubscriptionNotice(
        "Your shortlist balance is exhausted. Please purchase another subscription plan to continue shortlisting candidates."
      );
    }

    if (notice) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const formatPrice = (value) => Number(value || 0).toLocaleString("en-IN");

  const fetchSubscriptionPlans = async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/candi-subscription-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal
      });

      const result = await response.json();
      if (!response.ok || result.success === false || result.Success === false) {
        throw new Error(result.message || result.Message || "Unable to fetch subscription plans.");
      }

      const planData = result.data ?? result.Data ?? [];
      if (!Array.isArray(planData)) {
        throw new Error("Invalid subscription plan response.");
      }

      setPlans(planData);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Subscription Plans Error:", err);
      setError(err.message || "Something went wrong while loading plans.");
      setPlans([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchSubscriptionPlans(controller.signal);
    return () => controller.abort();
  }, []);

  const activePlans = plans.filter((plan) =>
    Number(getValue(plan, "ISACTIVE")) === 1 &&
    String(getValue(plan, "ISDELETE") ?? "N").toUpperCase() !== "Y" &&
    String(getValue(plan, "PLAN_FOR") || "").toUpperCase() === "CANDIDATE"
  );

  const handleSubscribe = (plan) => {
    if (buyingPlanId !== null) return;

    const planId = Number(getValue(plan, "PLAN_ID"));
    if (!planId) return;

    setPurchaseMessage({ planId: null, type: "", text: "" });
    setConfirmPlanId(planId);
  };

  const cancelSubscription = () => {
    if (buyingPlanId !== null) return;
    setConfirmPlanId(null);
    setPurchaseMessage({ planId: null, type: "", text: "" });
  };

  const confirmSubscription = async (plan) => {
    const planId = Number(getValue(plan, "PLAN_ID"));
    if (!planId || buyingPlanId !== null) return;

    try {
      setBuyingPlanId(planId);
      setPurchaseMessage({ planId: null, type: "", text: "" });

      const response = await fetch("/api/candi-buy-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ planId })
      });

      const result = await response.json();

      if (!response.ok || result.success === false || result.Success === false) {
        throw new Error(result.message || result.Message || "Unable to purchase subscription.");
      }

      setPurchaseMessage({
        planId,
        type: "success",
        text: result.message || result.Message || "Subscription purchased successfully!"
      });

      setConfirmPlanId(null);
      setWalletRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error("Buy Subscription Error:", err);
      setPurchaseMessage({
        planId,
        type: "error",
        text: err.message || "Something went wrong while purchasing the subscription."
      });
    } finally {
      setBuyingPlanId(null);
    }
  };

  return (
    <div>
      {subscriptionNotice && (
        <div
          className="alert alert-warning d-flex align-items-start justify-content-between gap-2"
          role="alert"
          style={{
            borderRadius: "8px",
            padding: "15px 18px",
            marginBottom: "20px"
          }}
        >
          <div>
            <i className="la la-exclamation-triangle me-2"></i>
            <strong>Subscription Required!</strong>
            <div className="mt-1">
              {subscriptionNotice}
            </div>
          </div>

          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSubscriptionNotice("")}
          />
        </div>
      )}

      <CandidateSubscriptionOverview refreshKey={walletRefreshKey} />

      <div className="employer-subscription">
        <div className="subscription-heading">
          <div>
            <h3>Choose Your Subscription Plan</h3>
            <p>Find the right recruitment package to grow your team.</p>
          </div>
          <span className="subscription-count">
            {activePlans.length} Plans Available
          </span>
        </div>

        {loading ? (
          <div className="subscription-loading">
            <span className="spinner-border spinner-border-sm"></span>
            <p>Loading subscription plans...</p>
          </div>
        ) : error ? (
          <div className="subscription-error">
            <i className="la la-exclamation-circle"></i>
            <h4>Unable to Load Plans</h4>
            <p>{error}</p>
            <button
              type="button"
              className="subscribe-btn"
              onClick={() => fetchSubscriptionPlans()}
            >
              <i className="la la-refresh"></i> Try Again
            </button>
          </div>
        ) : !activePlans.length ? (
          <div className="subscription-empty">
            <i className="la la-box-open"></i>
            <h4>No Subscription Plans Available</h4>
            <p>Currently, there are no active candidate subscription plans available.</p>
          </div>
        ) : (
          <div className="row g-3 align-items-start">
            {activePlans.map((plan) => {
              const id = getValue(plan, "SRNO");
              const planId = Number(getValue(plan, "PLAN_ID"));
              const name = getValue(plan, "PLAN_NAME");
              const offer = getValue(plan, "OFFER_NAME");
              const description = getValue(plan, "DESCRIPTION");
              const views = getValue(plan, "VIEW_COUNT");
              const applications = getValue(plan, "APPLY_COUNT");
              const amount = Number(getValue(plan, "AMOUNT") || 0);
              const discount = Number(getValue(plan, "DIS_AMOUNT") || 0);
              const finalAmount = Number(getValue(plan, "FINAL_AMOUNT") || 0);
              const popular = String(name || "").toLowerCase().includes("premium");
              const isConfirming = confirmPlanId === planId;
              const isBuying = buyingPlanId === planId;
              const message = purchaseMessage.planId === planId ? purchaseMessage : null;

              return (
                <div className="col-lg-4 col-xl-4 col-sm-12" key={id || planId}>
                  <div className={`subscription-card ${popular ? "popular-plan" : ""}`}>
                    {popular && (
                      <div className="popular-badge">
                        <i className="la la-star"></i> MOST POPULAR
                      </div>
                    )}

                    <div className="subscription-card-header">
                      <div className={`plan-icon ${popular ? "premium-icon" : ""}`}>
                        <i className={`la ${popular ? "la-crown" : "la-briefcase"}`}></i>
                      </div>
                      <div className="plan-title">
                        <h4>{name}</h4>
                        <span>{offer}</span>
                      </div>
                    </div>

                    <p className="plan-description">{description}</p>

                    <div className="plan-price">
                      <div className="price-main">
                        <h2>₹{formatPrice(finalAmount)}</h2>

                        {discount > 0 && (
                          <>
                            <span className="price-period">/</span>
                            <span className="old-price">₹{formatPrice(amount)}</span>
                            <span className="discount-label">
                              SAVE ₹{formatPrice(discount)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="plan-benefits mt-3">
                      <h5>What's Included</h5>
                      <ul>
                        <li>
                          <i className="la la-check-circle"></i>
                          Access to job opportunities
                        </li>
                        <li>
                          <i className="la la-check-circle"></i>
                          {formatPrice(views)} candidate profile views
                        </li>
                        <li>
                          <i className="la la-check-circle"></i>
                          {formatPrice(applications)} job applications
                        </li>
                        <li>
                          <i className="la la-check-circle"></i>
                          Advanced job search and filtering
                        </li>
                        <li>
                          <i className="la la-check-circle"></i>
                          Apply to preferred job openings
                        </li>
                        <li>
                          <i className="la la-check-circle"></i>
                          Candidate profile visibility to employers
                        </li>
                        <li>
                          <i className="la la-check-circle"></i>
                          Dedicated candidate dashboard
                        </li>
                      </ul>
                    </div>

                    <div className="plan-purchase-area">
                      {isConfirming ? (
                        <div className="plan-confirmation">
                          <div className="confirmation-heading">
                            <div>
                              <h5>Confirm Your Subscription</h5>
                              <p>Please review selected package before continuing.</p>
                            </div>
                          </div>

                          <div className="confirmation-details">
                            <div>
                              <span>Selected Plan</span>
                              <strong>{name}</strong>
                            </div>
                            <div className="confirmation-total">
                              <span>Total Amount</span>
                              <strong>₹{formatPrice(finalAmount)}</strong>
                            </div>
                          </div>

                          {message?.text && (
                            <div className={`purchase-message ${message.type}`}>
                              <i className={`la ${message.type === "success" ? "la-check-circle" : "la-exclamation-circle"}`}></i>
                              <span>{message.text}</span>
                            </div>
                          )}

                          <div className="confirmation-actions">
                            <button
                              type="button"
                              className="confirm-purchase-btn"
                              onClick={() =>
                                confirmSubscription(plan)}
                              disabled={buyingPlanId !== null}
                            >
                              {isBuying ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  Confirm & Continue
                                  <i className="la la-arrow-right"></i>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              className="cancel-purchase-btn"
                              onClick={cancelSubscription}
                              disabled={buyingPlanId !== null}
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="confirmation-security">
                            <i className="la la-lock"></i>
                            Your subscription details will be processed securely.
                          </div>
                        </div>
                      ) : (
                        <>
                          {message?.text && (
                            <div className={`purchase-message ${message.type}`}>
                              <i className={`la ${message.type === "success" ? "la-check-circle" : "la-exclamation-circle"}`}></i>
                              <span>{message.text}</span>
                            </div>
                          )}

                          <button
                            type="button"
                            className={`subscribe-btn ${popular ? "premium-btn" : ""}`}
                            onClick={() => handleSubscribe(plan)}
                            disabled={buyingPlanId !== null}
                          >
                            Subscribe Now
                            <i className="la la-arrow-right"></i>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="plan-footer">
                      <i className="la la-shield-alt"></i>
                      Secure subscription & payment
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageDataTable;