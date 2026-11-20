
"use client";
import { useEffect, useState } from "react";

const getDashboardData = (payload) => payload?.data ?? payload?.Data ?? payload ?? {};

const TopCardBlock = () => {
  const [dashboard, setDashboard] = useState({
    appliedJobs: 0,
    jobAlerts: 0,
    shortlistedJobs: 0,
    MessageCount: 0,
    InterviewSchedule: 0,
    InterviewSelected: 0,
    JobOffers: 0,
    JobOffersWithdrawal: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/candi-get-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const payload = await response.json();
        if (!response.ok) {
          return;
        }
        const data = getDashboardData(payload);
        setDashboard({
          appliedJobs: data?.appliedJobs ?? 0,
          jobAlerts: data?.jobAlerts ?? 0,
          shortlistedJobs: data?.shortlistedJobs ?? 0,
          MessageCount: data?.messageCount ?? 0,
          InterviewSchedule: data?.interviewSchedule ?? 0,
          InterviewSelected: data?.interviewSelected ?? 0,
          JobOffers: data?.jobOffers ?? 0,
          JobOffersWithdrawal: data?.jobOffersWithdrawal ?? 0,
        });
      } catch (error) {
        console.error("Dashboard card error:", error);
      }
    };
    loadDashboard();
  }, []);

  const cardContent = [
    { id: 1, icon: "la-briefcase", countNumber: dashboard.appliedJobs, metaName: "Applied Jobs", uiClass: "ui-blue" },
    { id: 2, icon: "la-bell", countNumber: dashboard.jobAlerts, metaName: "Job Alerts", uiClass: "ui-red" },
    { id: 3, icon: "la-bookmark", countNumber: dashboard.shortlistedJobs, metaName: "Shortlisted Jobs", uiClass: "ui-green" },
    { id: 4, icon: "la-comments", countNumber: dashboard.MessageCount, metaName: "Messages", uiClass: "ui-yellow" },
    { id: 5, icon: "la-calendar-check", countNumber: dashboard.InterviewSchedule, metaName: "Interviews Scheduled", uiClass: "ui-blue" },
    { id: 6, icon: "la-user-check", countNumber: dashboard.InterviewSelected, metaName: "Interviews Selected", uiClass: "ui-green" },
    { id: 7, icon: "la-file-signature", countNumber: dashboard.JobOffers, metaName: "Job Offers Received", uiClass: "ui-yellow" },
    { id: 8, icon: "la-undo-alt", countNumber: dashboard.JobOffersWithdrawal, metaName: "Offer Withdrawals", uiClass: "ui-red" },
  ];

  return (
    <>
      {cardContent.map((item) => (
        <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-6" key={item.id}>
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
