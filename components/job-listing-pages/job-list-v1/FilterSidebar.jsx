
'use client';

import { useEffect, useState } from "react";
import Categories from "../components/Categories";
import DatePosted from "../components/DatePosted";
import DestinationRangeSlider from "../components/DestinationRangeSlider";
import ExperienceLevel from "../components/ExperienceLevel";
import JobType from "../components/JobType";
import LocationBox from "../components/LocationBox";
import SalaryRangeSlider from "../components/SalaryRangeSlider";
import Skills from "../components/Skills";
import Education from "../components/Education";
import Industry from "../components/Industry";

const LOGIN_URL = "/login";
const PACKAGE_URL = "/candidates-dashboard/packages";

const normalizeKey = value => String(value ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

const getValue = (obj, key) => {
  if (!obj || typeof obj !== "object") return null;
  const actualKey = Object.keys(obj).find(k => normalizeKey(k) === normalizeKey(key));
  return actualKey ? obj[actualKey] : null;
};

const findRole = obj => {
  if (!obj || typeof obj !== "object") return "";

  const role = getValue(obj, "role");
  if (role) return String(role);

  for (const key of ["data", "result", "user", "external"]) {
    const nested = getValue(obj, key);
    if (nested && typeof nested === "object") {
      const found = findRole(nested);
      if (found) return found;
    }
  }

  return "";
};

const findSubscriptionRows = obj => {
  if (Array.isArray(obj)) return obj;
  if (!obj || typeof obj !== "object") return [];

  if (getValue(obj, "TOTAL_VIEW") !== null) return [obj];

  for (const key of ["data", "result", "subscriptions"]) {
    const nested = getValue(obj, key);
    if (nested !== null) {
      const rows = findSubscriptionRows(nested);
      if (rows.length) return rows;
    }
  }

  return [];
};

const FilterSidebar = () => {
  const [filterAccess, setFilterAccess] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    const checkFilterAccess = async () => {
      try {
        const loginResponse = await fetch("/api/cookies-details", {
          method: "GET",
          cache: "no-store"
        });

        if (!loginResponse.ok) {
          if (isMounted) setFilterAccess("guest");
          return;
        }

        const loginData = await loginResponse.json();
        const role = findRole(loginData).trim().toLowerCase();

        if (!role || role === "guest") {
          if (isMounted) setFilterAccess("guest");
          return;
        }

        if (role !== "candidate") {
          if (isMounted) setFilterAccess("candidate");
          return;
        }

        const subscriptionResponse = await fetch("/api/candi-subscription-details", {
          method: "GET",
          cache: "no-store",
          headers: { "Content-Type": "application/json" }
        });

        if (subscriptionResponse.status === 404) {
          if (isMounted) setFilterAccess("subscription");
          return;
        }

        if (!subscriptionResponse.ok) {
          throw new Error("Unable to verify subscription.");
        }

        const subscriptionData = await subscriptionResponse.json();

        if (
          subscriptionData?.success === false ||
          subscriptionData?.Success === false
        ) {
          throw new Error(subscriptionData?.message || subscriptionData?.Message || "Subscription verification failed.");
        }

        const subscriptions = findSubscriptionRows(subscriptionData);

        if (!subscriptions.length) {
          if (isMounted) setFilterAccess("subscription");
          return;
        }

        const remainingViews = subscriptions.reduce((total, item) => {
          const totalView = Number(getValue(item, "TOTAL_VIEW") ?? 0);
          const usedView = Number(getValue(item, "USE_VIEW") ?? 0);
          const remainingValue = getValue(item, "REMAINING_VIEW");

          const remaining = remainingValue !== null
            ? Number(remainingValue)
            : Math.max(0, totalView - usedView);

          return total + (Number.isFinite(remaining) ? Math.max(0, remaining) : 0);
        }, 0);

        if (isMounted) {
          setFilterAccess(remainingViews >= 1 ? "allowed" : "balance");
        }
      } catch (error) {
        console.error("Filter subscription validation error:", error);
        if (isMounted) setFilterAccess("error");
      }
    };

    checkFilterAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const getLockMessage = () => {
    switch (filterAccess) {
      case "guest":
        return {
          message: "Please log in as a candidate to access Job Type, Experience, Skills, Date Posted, Education and Industry filters.",
          button: "Login as Candidate",
          link: LOGIN_URL
        };
      case "candidate":
        return {
          message: "These filters are available only to candidates. Please log in with a candidate account.",
          button: "Login as Candidate",
          link: LOGIN_URL
        };
      case "subscription":
        return {
          message: "You need an active subscription plan to unlock Job Type, Experience, Skills, Date Posted, Education and Industry filters.",
          button: "View Subscription Plans",
          link: PACKAGE_URL
        };
      case "balance":
        return {
          message: "Your company profile view balance is exhausted. Purchase or upgrade your subscription to unlock all job filters.",
          button: "Buy Subscription",
          link: PACKAGE_URL
        };
      default:
        return {
          message: "Unable to verify your subscription. Please try again.",
          button: "Try Again",
          link: null
        };
    }
  };

  const lockedFilters = [
    "Job Type",
    "Experience Level",
    "Skills",
    "Date Posted",
    "Education",
    "Industry"
  ];

  const renderLockedFilters = () => {
    const lock = getLockMessage();

    return (
      <div className="locked-filters-container">
        <div className="job-type-locked text-center p-3 mb-3">
          <i className="la la-lock mb-2" style={{ fontSize: "36px", color: "#6c757d" }} />
          <h5>Premium Filters Locked</h5>
          <p className="mb-3">{lock.message}</p>

          {lock.link ? (
            <a href={lock.link} className="btn btn-sm btn-outline-primary">
              {lock.button}
            </a>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => window.location.reload()}
            >
              {lock.button}
            </button>
          )}
        </div>

        {lockedFilters.map(filter => (
          <div className="filter-block locked-filter-item" key={filter}>
            <h4 className="d-flex align-items-center justify-content-between">
              {filter}
              <i className="la la-lock text-muted" />
            </h4>
            <div className="text-muted small">
              <i className="la la-lock me-1" />
              Unlock with an active subscription
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="inner-column">
      <div className="filters-outer">
        <button
          type="button"
          className="btn-close text-reset close-filters show-1023"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />

        {/* Accessible filters */}
        <div className="filter-block">
          <h4>Department</h4>
          <div className="form-group">
            <Categories />
          </div>
        </div>

        <div className="filter-block">
          <h4>Location</h4>
          <div className="form-group">
            <LocationBox />
          </div>
          <DestinationRangeSlider />
        </div>

        <div className="filter-block">
          <h4>Annual Salary (in lakhs)</h4>
          <SalaryRangeSlider />
        </div>

        {/* Subscription-protected filters */}
        {filterAccess === "checking" ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status" />
            <span className="ms-2">Checking filter access...</span>
          </div>
        ) : filterAccess === "allowed" ? (
          <>
            <div className="switchbox-outer">
              <h4>Job type</h4>
              <JobType />
            </div>

            <div className="checkbox-outer">
              <h4>Experience Level</h4>
              <ExperienceLevel />
            </div>

            <div className="checkbox-outer">
              <h4>Skills</h4>
              <Skills />
            </div>

            <div className="checkbox-outer">
              <h4>Date Posted</h4>
              <DatePosted />
            </div>

            <div className="checkbox-outer">
              <h4>Education</h4>
              <Education />
            </div>

            <div className="switchbox-outer">
              <h4>Industry</h4>
              <Industry />
            </div>
          </>
        ) : (
          renderLockedFilters()
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
