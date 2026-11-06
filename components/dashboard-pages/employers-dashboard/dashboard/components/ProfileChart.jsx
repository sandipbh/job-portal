
"use client";
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Replace this sample data with your API response.
// Each record represents one job post in one month.
const sampleData = [
  { year: 2026, month: 1, jobPostId: 101, jobTitle: "React Developer", jobRole: "Developer", applicants: 85, shortlisted: 32, interviewSelected: 12 },
  { year: 2026, month: 1, jobPostId: 102, jobTitle: "HR Executive", jobRole: "HR", applicants: 45, shortlisted: 18, interviewSelected: 7 },
  { year: 2026, month: 2, jobPostId: 101, jobTitle: "React Developer", jobRole: "Developer", applicants: 110, shortlisted: 40, interviewSelected: 18 },
  { year: 2026, month: 2, jobPostId: 102, jobTitle: "HR Executive", jobRole: "HR", applicants: 60, shortlisted: 25, interviewSelected: 10 },
  { year: 2026, month: 3, jobPostId: 101, jobTitle: "React Developer", jobRole: "Developer", applicants: 95, shortlisted: 38, interviewSelected: 15 },
  { year: 2026, month: 3, jobPostId: 103, jobTitle: "UI/UX Designer", jobRole: "Designer", applicants: 70, shortlisted: 28, interviewSelected: 9 },
  { year: 2026, month: 4, jobPostId: 101, jobTitle: "React Developer", jobRole: "Developer", applicants: 125, shortlisted: 52, interviewSelected: 22 },
  { year: 2026, month: 4, jobPostId: 103, jobTitle: "UI/UX Designer", jobRole: "Designer", applicants: 90, shortlisted: 35, interviewSelected: 14 },
  { year: 2025, month: 1, jobPostId: 104, jobTitle: "Backend Developer", jobRole: "Developer", applicants: 75, shortlisted: 30, interviewSelected: 11 },
  { year: 2025, month: 2, jobPostId: 104, jobTitle: "Backend Developer", jobRole: "Developer", applicants: 95, shortlisted: 42, interviewSelected: 16 },
];

const ProfileChart = ({ reportData = sampleData }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");

  const years = useMemo(
    () => [...new Set(reportData.map(item => item.year))].sort((a, b) => b - a),
    [reportData]
  );

  const roles = useMemo(
    () => [...new Set(reportData.map(item => item.jobRole))].sort(),
    [reportData]
  );

  const filteredData = useMemo(() => {
    return reportData.filter(item =>
      String(item.year) === selectedYear &&
      (selectedRole === "all" || item.jobRole === selectedRole)
    );
  }, [reportData, selectedYear, selectedRole]);

  // Bar chart: monthly trend or individual job-post comparison.
  const barData = useMemo(() => {
    const grouped = {};

    filteredData
      .filter(item => selectedMonth === "all" || item.month === Number(selectedMonth))
      .forEach(item => {
        const key = selectedMonth === "all"
          ? item.month
          : `${item.jobTitle} (#${item.jobPostId})`;

        if (!grouped[key]) {
          grouped[key] = { applicants: 0, shortlisted: 0, interviewSelected: 0 };
        }

        grouped[key].applicants += Number(item.applicants || 0);
        grouped[key].shortlisted += Number(item.shortlisted || 0);
        grouped[key].interviewSelected += Number(item.interviewSelected || 0);
      });

    const labels = selectedMonth === "all"
      ? Object.keys(grouped).map(Number).sort((a, b) => a - b).map(month => months[month - 1])
      : Object.keys(grouped);

    const values = selectedMonth === "all"
      ? labels.map(label => grouped[months.indexOf(label) + 1])
      : labels.map(label => grouped[label]);

    return {
      labels,
      datasets: [
        {
          label: "Applicants",
          data: values.map(item => item.applicants),
          backgroundColor: "rgba(91, 151, 218, 0.8)",
          borderRadius: 5,
        },
        {
          label: "Shortlisted",
          data: values.map(item => item.shortlisted),
          backgroundColor: "rgba(83, 164, 125, 0.8)",
          borderRadius: 5,
        },
        {
          label: "Interview Selected",
          data: values.map(item => item.interviewSelected),
          backgroundColor: "rgba(235, 176, 76, 0.8)",
          borderRadius: 5,
        },
      ],
    };
  }, [filteredData, selectedMonth]);

  // Doughnut chart: candidate funnel for selected month or entire year.
  const pieData = useMemo(() => {
    const totals = filteredData
      .filter(item => selectedMonth === "all" || item.month === Number(selectedMonth))
      .reduce((acc, item) => ({
        applicants: acc.applicants + Number(item.applicants || 0),
        shortlisted: acc.shortlisted + Number(item.shortlisted || 0),
        interviewSelected: acc.interviewSelected + Number(item.interviewSelected || 0),
      }), { applicants: 0, shortlisted: 0, interviewSelected: 0 });

    // Assumes shortlisted and interview-selected candidates are subsets
    // of the previous recruitment stages.
    const applied = Math.max(0, totals.applicants - totals.shortlisted);
    const shortlisted = Math.max(0, totals.shortlisted - totals.interviewSelected);
    const interviewSelected = Math.max(0, totals.interviewSelected);

    return {
      labels: ["Applied", "Shortlisted", "Interview Selected"],
      datasets: [{
        data: [applied, shortlisted, interviewSelected],
        backgroundColor: [
          "rgba(91, 151, 218, 0.8)",
          "rgba(83, 164, 125, 0.8)",
          "rgba(235, 176, 76, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      }],
    };
  }, [filteredData, selectedMonth]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: context => `${context.label}: ${context.raw}`,
        },
      },
    },
  };

  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>Recruitment Analytics</h4>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {months.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
          >
            <option value="all">All Job Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="widget-content">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="border rounded p-3 h-100">
              <h6 className="mb-3 fw-medium">
                {selectedMonth === "all"
                  ? "Monthly Recruitment Performance"
                  : `${months[Number(selectedMonth) - 1]} - Job Post Performance`}
              </h6>
              <div style={{ height: "350px", position: "relative" }}>
                {barData.labels.length > 0
                  ? <Bar data={barData} options={barOptions} />
                  : <p className="text-center pt-5">No recruitment data available.</p>}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="border rounded p-3 h-100">
              <h6 className="mb-3 fw-medium">
                Candidate Selection Overview
              </h6>
              <div style={{ height: "350px", position: "relative" }}>
                {pieData.datasets[0].data.some(value => value > 0)
                  ? <Doughnut data={pieData} options={pieOptions} />
                  : <p className="text-center pt-5">No recruitment data available.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileChart;
