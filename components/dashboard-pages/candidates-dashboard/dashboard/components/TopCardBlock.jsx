"use client";

import { useEffect, useState } from "react";

const getDashboardData = (payload) =>
  payload?.data ?? payload?.Data ?? payload ?? {};

const TopCardBlock = () => {
  const [dashboard, setDashboard] = useState({
    appliedJobs: 0,
    jobAlerts: 0,
    shortlistedJobs: 0,
    MessageCount: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/candi-get-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          next: { revalidate: 60 }
        });
        const payload = await response.json();

        if (!response.ok) {
          console.log("Dashboard card payload:", payload);
        }


        const data = getDashboardData(payload);
        setDashboard({
          appliedJobs: data?.appliedJobs ?? 0,
          jobAlerts: data?.jobAlerts ?? 0,
          shortlistedJobs: data?.shortlistedJobs ?? 0,
          MessageCount: data?.MessageCount ?? 0,
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
      icon: "flaticon-briefcase",
      countNumber: dashboard.appliedJobs,
      metaName: "Applied Jobs",
      uiClass: "ui-blue",
    },
    {
      id: 2,
      icon: "la-file-invoice",
      countNumber: dashboard.jobAlerts,
      metaName: "Job Alerts",
      uiClass: "ui-red",
    },
    {
      id: 3,
      icon: "la-bookmark-o",
      countNumber: dashboard.shortlistedJobs,
      metaName: "Shortlist",
      uiClass: "ui-green",
    },
    {
      id: 4,
      icon: "la-comment-o",
      countNumber: dashboard.MessageCount,
      metaName: "Messages",
      uiClass: "ui-yellow",
    },
  ];

  return (
    <>
      {cardContent.map((item) => (
        <div
          className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12"
          key={item.id}
        >
          <div className={`ui-item ${item.uiClass}`}>
            <div className="left">
              <i className={`icon la ${item.icon}`}></i>
            </div>
            <div className="right">
              <h4>{item.countNumber}</h4>
              <p>{item.metaName}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TopCardBlock;
