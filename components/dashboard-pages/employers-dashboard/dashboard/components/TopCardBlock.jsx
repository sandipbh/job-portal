
"use client";

import { useEffect, useState } from "react";

const getDashboardData = (payload) => payload?.data ?? payload?.Data ?? payload ?? {};

const TopCardBlock = () => {
  const [dashboard, setDashboard] = useState({
    postedJobs: 0,
    applications: 0,
    shortlistedJobs: 0,
    MessageCount: 0,
    ActiveJob: 0,
    VerifiedCandidates: 0,
    TotalReviews: 0,
    AverageCandidateRating: 0,
    OfferBackoutAlerts: 0,
    PendingReviews: 0,
    HiringSuccessRate: 0,
    RiskCandidates: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/emp-get-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const payload = await response.json();

        if (!response.ok) {
          console.error("Dashboard card payload:", payload);
          return;
        }

        const data = getDashboardData(payload);

        setDashboard({
          postedJobs: data?.postedJobs ?? 0,
          applications: data?.applications ?? 0,
          shortlistedJobs: data?.shortlist ?? 0,
          MessageCount: data?.messageCount ?? 0,
          ActiveJob: data?.activeJob ?? 0,
          VerifiedCandidates: data?.verifiedCandidates ?? 0,
          TotalReviews: data?.totalReviews ?? 0,
          AverageCandidateRating: data?.averageCandidateRating ?? 0,
          OfferBackoutAlerts: data?.offerBackoutAlerts ?? 0,
          PendingReviews: data?.pendingReviews ?? 0,
          HiringSuccessRate: data?.hiringSuccessRate ?? 0,
          RiskCandidates: data?.riskCandidates ?? 0,
        });
      } catch (error) {
        console.error("Dashboard card error:", error);
      }
    };

    loadDashboard();
  }, []);

  const cardContent = [
    {
      id: 1,
      icon: "la-briefcase",
      countNumber: dashboard.postedJobs,
      metaName: "Posted Jobs",
      uiClass: "ui-blue",
    },
    {
      id: 2,
      icon: "la-file-alt",
      countNumber: dashboard.applications,
      metaName: "Applications",
      uiClass: "ui-red",
    },
    {
      id: 3,
      icon: "la-user-check",
      countNumber: dashboard.shortlistedJobs,
      metaName: "Shortlisted Candidates",
      uiClass: "ui-green",
    },
    {
      id: 4,
      icon: "la-comments",
      countNumber: dashboard.MessageCount,
      metaName: "Messages",
      uiClass: "ui-yellow",
    },
    {
      id: 5,
      icon: "la-toggle-on",
      countNumber: dashboard.ActiveJob,
      metaName: "Active Jobs",
      uiClass: "ui-purple",
    },
    {
      id: 6,
      icon: "la-user-shield",
      countNumber: dashboard.VerifiedCandidates,
      metaName: "Verified Candidates",
      uiClass: "ui-teal",
    },
    {
      id: 7,
      icon: "la-star",
      countNumber: dashboard.TotalReviews,
      metaName: "Total Reviews",
      uiClass: "ui-orange",
    },
    {
      id: 8,
      icon: "la-star-half-alt",
      countNumber: Number(dashboard.AverageCandidateRating || 0),
      metaName: "Average Candidate Rating",
      uiClass: "ui-pink",
      isDecimal: true,
    },
    {
      id: 9,
      icon: "la-exclamation-triangle",
      countNumber: dashboard.OfferBackoutAlerts,
      metaName: "Offer Backout Alerts",
      uiClass: "ui-pink",
    },
    {
      id: 10,
      icon: "la-clipboard-list",
      countNumber: dashboard.PendingReviews,
      metaName: "Pending Reviews",
      uiClass: "ui-orange",
    },
    {
      id: 11,
      icon: "la-chart-bar",
      countNumber: Number(dashboard.HiringSuccessRate || 0),
      metaName: "Hiring Success Rate",
      uiClass: "ui-green",
      isDecimal: true,
      isPercentage: true,
    },
    {
      id: 12,
      icon: "la-user-times",
      countNumber: dashboard.RiskCandidates,
      metaName: "Risk Candidates",
      uiClass: "ui-red",
    },
  ];

  return (
    <>
      {cardContent.map((item) => (
        <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12" key={item.id}>
          <div className={`ui-item ${item.uiClass}`}>
            <div className="left">
              <i className={`icon la ${item.icon}`}></i>
            </div>
            <div className="right">
              <h4 style={{ whiteSpace: "nowrap" }}>
                {item.isDecimal ? (
                  <>
                    <span>{Math.floor(Number(item.countNumber)).toString()}</span>
                    <span style={{ fontSize: "15px", fontWeight: "400", marginLeft: "2px" }}>.{Number(item.countNumber).toFixed(2).split(".")[1]}</span>
                    {item.isPercentage && (
                      <span style={{ fontSize: "15px", fontWeight: "400", marginLeft: "2px" }}>%</span>
                    )}
                  </>
                ) : (
                  item.countNumber
                )}
              </h4>
              <p>{item.metaName}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TopCardBlock;
