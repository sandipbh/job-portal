
"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const START_YEAR = 2025;

const ProfileChart = () => {
  const currentYear = new Date().getFullYear();

  const yearList = useMemo(() => {
    return Array.from(
      { length: Math.max(0, currentYear - START_YEAR + 1) },
      (_, i) => currentYear - i
    );
  }, [currentYear]);

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");

  const [reportData, setReportData] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [roleQuery, setRoleQuery] = useState("");
  const [showRoleList, setShowRoleList] = useState(false);

  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState("");

  const roleBoxRef = useRef(null);
  const requestRef = useRef(0);
  const roleSearchTimer = useRef(null);

  // Normalize API response
  const normalizeRecords = (response) => {
    const records =
      response?.data ??
      response?.Data ??
      response?.result ??
      response?.Result ??
      [];

    return Array.isArray(records)
      ? records.map((item) => ({
        year: Number(item.year ?? item.Year ?? 0),
        month: Number(item.month ?? item.Month ?? 0),
        jobPostId: item.jobPostId ?? item.JobPostId,
        jobTitle: item.jobTitle ?? item.JobTitle ?? "",
        jobRoleId: String(item.jobRoleId ?? item.JobRoleId ?? ""),
        jobRole: item.jobRole ?? item.JobRole ?? "",
        applicants: Number(item.applicants ?? item.Applicants ?? 0),
        shortlisted: Number(item.shortlisted ?? item.Shortlisted ?? 0),
        interviewSelected: Number(
          item.interviewSelected ?? item.InterviewSelected ?? 0
        )
      }))
      : [];
  };

  // Fetch analytics from SQL through Next.js API
  const getAnalytics = useCallback(async () => {
    const requestId = ++requestRef.current;

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/emp-recruitment-analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          year: Number(selectedYear),
          month: selectedMonth === "all" ? null : Number(selectedMonth),
          jobRoleId: selectedRole === "all" ? null : Number(selectedRole)
        })
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || "Unable to load recruitment analytics."
        );
      }

      if (requestId === requestRef.current) {
        setReportData(normalizeRecords(result));
      }
    } catch (err) {
      if (requestId === requestRef.current) {
        setReportData([]);
        setError(err.message || "Something went wrong.");
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [selectedYear, selectedMonth, selectedRole]);

  useEffect(() => {
    getAnalytics();
  }, [getAnalytics]);

  // Fetch job roles
  const getJobRoles = async (term = "") => {
    try {
      setRoleLoading(true);

      const response = await fetch("/api/list-job-role-dropdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ term })
      });

      const result = await response.json();

      const records = result?.data ?? result?.Data ?? [];

      setRoleOptions(
        Array.isArray(records)
          ? records.map((item) => ({
            value: String(item.key ?? item.Key ?? item.id ?? item.Id ?? ""),
            label: String(item.value ?? item.Value ?? item.name ?? item.Name ?? "")
          })).filter((item) => item.value && item.label)
          : []
      );
    } catch (err) {
      console.error("Job role dropdown error:", err);
      setRoleOptions([]);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    getJobRoles("");

    return () => {
      if (roleSearchTimer.current) {
        clearTimeout(roleSearchTimer.current);
      }
    };
  }, []);

  const getJobRolesDebounced = (term) => {
    if (roleSearchTimer.current) {
      clearTimeout(roleSearchTimer.current);
    }

    roleSearchTimer.current = setTimeout(() => {
      getJobRoles(term);
    }, 300);
  };

  // Close role dropdown on outside click
  useEffect(() => {
    const handler = (event) => {
      if (
        roleBoxRef.current &&
        !roleBoxRef.current.contains(event.target)
      ) {
        setShowRoleList(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const filteredRoles = useMemo(() => {
    const term = roleQuery.toLowerCase().trim();

    return roleOptions.filter((role) =>
      role.label.toLowerCase().includes(term)
    );
  }, [roleOptions, roleQuery]);

  const selectedRoleName = useMemo(() => {
    return roleOptions.find(
      (role) => role.value === selectedRole
    )?.label || "";
  }, [roleOptions, selectedRole]);

  // Monthly bar chart or selected-month job-wise chart
  const barData = useMemo(() => {
    const grouped = {};

    reportData.forEach((item) => {
      const key = selectedMonth === "all"
        ? item.month
        : `${item.jobTitle || `Job #${item.jobPostId}`} (#${item.jobPostId})`;

      if (!grouped[key]) {
        grouped[key] = {
          applicants: 0,
          shortlisted: 0,
          interviewSelected: 0
        };
      }

      grouped[key].applicants += item.applicants;
      grouped[key].shortlisted += item.shortlisted;
      grouped[key].interviewSelected += item.interviewSelected;
    });

    const labels = selectedMonth === "all"
      ? Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b)
        .map((month) => months[month - 1])
      : Object.keys(grouped);

    const values = selectedMonth === "all"
      ? labels.map((label) => grouped[months.indexOf(label) + 1])
      : labels.map((label) => grouped[label]);

    return {
      labels,
      datasets: [
        {
          label: "Applicants",
          data: values.map((item) => item.applicants),
          backgroundColor: "rgba(91, 151, 218, 0.8)",
          borderRadius: 5
        },
        {
          label: "Shortlisted",
          data: values.map((item) => item.shortlisted),
          backgroundColor: "rgba(83, 164, 125, 0.8)",
          borderRadius: 5
        },
        {
          label: "Interview Selected",
          data: values.map((item) => item.interviewSelected),
          backgroundColor: "rgba(235, 176, 76, 0.8)",
          borderRadius: 5
        }
      ]
    };
  }, [reportData, selectedMonth]);

  // Candidate selection overview
  const pieData = useMemo(() => {
    const totals = reportData.reduce(
      (acc, item) => ({
        applicants: acc.applicants + item.applicants,
        shortlisted: acc.shortlisted + item.shortlisted,
        interviewSelected: acc.interviewSelected + item.interviewSelected
      }),
      {
        applicants: 0,
        shortlisted: 0,
        interviewSelected: 0
      }
    );

    const applied = Math.max(
      0,
      totals.applicants - totals.shortlisted
    );

    const shortlisted = Math.max(
      0,
      totals.shortlisted - totals.interviewSelected
    );

    return {
      labels: [
        "Applied",
        "Shortlisted",
        "Interview Selected"
      ],
      datasets: [
        {
          data: [
            applied,
            shortlisted,
            totals.interviewSelected
          ],
          backgroundColor: [
            "rgba(91, 151, 218, 0.8)",
            "rgba(83, 164, 125, 0.8)",
            "rgba(235, 176, 76, 0.8)"
          ],
          borderWidth: 2,
          borderColor: "#ffffff"
        }
      ]
    };
  }, [reportData]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom"
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom"
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw}`
        }
      }
    }
  };

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>Recruitment Analytics</h4>

        <div className="d-flex gap-2">
          {/* Year filter */}
          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ minWidth: 100 }}
          >
            {yearList.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Month filter */}
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ minWidth: 130 }}
          >
            <option value="all">All Months</option>
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          {/* Job role filter */}
          <div
            className="position-relative"
            style={{ minWidth: 240 }}
            ref={roleBoxRef}
          >
            <input
              type="text"
              className="form-control"
              placeholder={
                selectedRole === "all"
                  ? "All Job Roles"
                  : selectedRoleName || "Select Job Role"
              }
              value={roleQuery}
              onChange={(e) => {
                const value = e.target.value;

                setRoleQuery(value);
                setShowRoleList(true);
                getJobRolesDebounced(value);
              }}
              onFocus={() => setShowRoleList(true)}
            />

            {showRoleList && (
              <ul
                className="list-unstyled bg-white border rounded shadow-sm"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  margin: "4px 0 0",
                  maxHeight: 240,
                  overflowY: "auto",
                  zIndex: 1000
                }}
              >
                <li
                  className="px-3 py-2"
                  style={{
                    cursor: "pointer",
                    background: selectedRole === "all" ? "#eef2ff" : ""
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedRole("all");
                    setRoleQuery("");
                    setShowRoleList(false);
                  }}
                >
                  All Job Roles
                </li>

                {roleLoading ? (
                  <li className="px-3 py-2 text-muted">
                    Loading...
                  </li>
                ) : filteredRoles.length === 0 ? (
                  <li className="px-3 py-2 text-muted">
                    No job roles found
                  </li>
                ) : (
                  filteredRoles.map((role) => (
                    <li
                      key={role.value}
                      className="px-3 py-2"
                      style={{
                        cursor: "pointer",
                        background:
                          selectedRole === role.value ? "#eef2ff" : ""
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedRole(role.value);
                        setRoleQuery("");
                        setShowRoleList(false);
                      }}
                    >
                      {role.label}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="widget-content">
        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={getAnalytics}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2 mb-0">Loading recruitment analytics...</p>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="border rounded p-3 h-100">
                <h6 className="mb-3 fw-medium">
                  {selectedMonth === "all"
                    ? "Monthly Recruitment Performance"
                    : `${months[Number(selectedMonth) - 1]} - Job Post Performance`}
                </h6>

                <div style={{ height: 350, position: "relative" }}>
                  {barData.labels.length > 0 ? (
                    <Bar data={barData} options={barOptions} />
                  ) : (
                    <p className="text-center pt-5">
                      No recruitment data available.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="border rounded p-3 h-100">
                <h6 className="mb-3 fw-medium">
                  Candidate Selection Overview
                </h6>

                <div style={{ height: 350, position: "relative" }}>
                  {pieData.datasets[0].data.some((value) => value > 0) ? (
                    <Doughnut data={pieData} options={pieOptions} />
                  ) : (
                    <p className="text-center pt-5">
                      No recruitment data available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileChart;
