
"use client";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import WidgetToFilterBox from "./WidgetTopFilterBox";
import ApplicantCard from "./ApplicantCard";

const getValue = (...values) => {
  const value = values.find(v => v !== null && v !== undefined && String(v).trim() !== "");
  return value === undefined ? "" : String(value).trim();
};

const normalize = value => String(value ?? "").trim().toLowerCase();

const getJobValue = c => getValue(c?.designation, c?.jobTitle, c?.jobName);
const getExperienceValue = c => getValue(c?.experience, c?.totalExperience);
const getQualificationValue = c => getValue(c?.education, c?.qualification);
const getGenderValue = c => getValue(c?.gender);
const getRatingValue = c => getValue(c?.avgRating, c?.rating);
const getCandidateId = c => c?.id ?? c?.candiUqId;

const getLocationValues = c => [
  c?.currentAddress,
  c?.location,
  c?.workingLocation
].map(v => getValue(v)).filter(Boolean);

const getUniqueOptions = values => [
  ...new Set(values.filter(Boolean))
].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

const getExperienceNumber = value => {
  const match = String(value ?? "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const matchesExperience = (candidateValue, selectedValues) => {
  if (!selectedValues.length) return true;
  const experience = getExperienceNumber(candidateValue);
  if (experience === null) return false;

  return selectedValues.some(value =>
    value === "5+" ? experience >= 5 : experience === Number(value)
  );
};

const matchesQualification = (candidateValue, selectedValues) => {
  if (!selectedValues.length) return true;

  const value = normalize(candidateValue);

  return selectedValues.some(selected => {
    const option = normalize(selected);

    if (option === "10th") return value.includes("10th") || value.includes("secondary");
    if (option === "12th") return value.includes("12th") || value.includes("higher secondary");
    if (option === "graduate/diploma") return value.includes("graduate") || value.includes("graduation") || value.includes("diploma") || value.includes("bachelor");
    if (option === "post graduate/master's") return value.includes("post graduate") || value.includes("postgraduate") || value.includes("master") || value.includes("mba");
    if (option === "doctorate/phd") return value.includes("doctorate") || value.includes("phd") || value.includes("doctor of philosophy");

    return value === option;
  });
};

const WidgetContentBox = () => {
  const searchParams = useSearchParams();
  const jobId = Number(searchParams.get("jobId")) || 0;
  const status = searchParams.get("status");

  const getDefaultTab = () => {
    switch (normalize(status)) {
      case "shortlisted": return 1;
      case "maybe": return 2;
      case "rejected": return 3;
      default: return 0;
    }
  };

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedQualification, setSelectedQualification] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedRating, setSelectedRating] = useState([]);
  const [verifiedCandidate, setVerifiedCandidate] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(getDefaultTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(20);

  useEffect(() => {
    setSelectedIndex(getDefaultTab());
  }, [status]);

  // Load applicants from the existing API
  useEffect(() => {
    let isMounted = true;

    const getJobList = async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/emp-job-applied-list?JobPostId=${jobId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
          throw new Error(`Failed to load applicants: ${response.status}`);
        }

        const result = await response.json();
        const listData = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];

        if (isMounted) setCandidates(listData);
      } catch (error) {
        console.error("Applicant loading error:", error);
        if (isMounted) setCandidates([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getJobList();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // Dynamic dropdown options from API records
  const jobOptions = useMemo(
    () => getUniqueOptions(candidates.map(getJobValue)),
    [candidates]
  );

  const locationOptions = useMemo(
    () => getUniqueOptions(candidates.flatMap(getLocationValues)),
    [candidates]
  );

  // Apply applicant filters
  const filteredCandidates = useMemo(() => {
    const search = normalize(searchTerm);

    return candidates.filter(candidate => {
      const candidateLocations = getLocationValues(candidate);
      const rating = Number(getRatingValue(candidate));

      const searchFields = [
        candidate?.candiName,
        candidate?.name,
        candidate?.designation,
        candidate?.jobTitle,
        candidate?.jobName,
        candidate?.currentAddress,
        candidate?.location,
        candidate?.workingLocation,
        candidate?.education,
        candidate?.qualification,
        candidate?.currentCompany,
        candidate?.gender,
        candidate?.experience,
        candidate?.noticePeriod,
        candidate?.candiUqId,
        ...(Array.isArray(candidate?.tags) ? candidate.tags : [])
      ];

      const matchesSearch = !search || searchFields.some(value => normalize(value).includes(search));

      const matchesJob = selectedJobs.length === 0 ||
        selectedJobs.some(value => normalize(value) === normalize(getJobValue(candidate)));

      const matchesLocation = selectedLocation.length === 0 ||
        selectedLocation.some(selected =>
          candidateLocations.some(value => normalize(value) === normalize(selected))
        );

      const matchesRating = selectedRating.length === 0 ||
        selectedRating.some(value => Number.isFinite(rating) && Math.round(rating) === Number(value));

      const matchesVerified = !verifiedCandidate ||
        ["verified", "y"].includes(normalize(candidate?.verifyStatus));

      const matchesExperienceFilter = matchesExperience(
        getExperienceValue(candidate),
        selectedExperience
      );

      const matchesQualificationFilter = matchesQualification(
        getQualificationValue(candidate),
        selectedQualification
      );

      const matchesGender = selectedGender.length === 0 ||
        selectedGender.includes("Both") ||
        selectedGender.some(value => normalize(value) === normalize(getGenderValue(candidate)));

      return (
        matchesSearch &&
        matchesJob &&
        matchesLocation &&
        matchesRating &&
        matchesVerified &&
        matchesExperienceFilter &&
        matchesQualificationFilter &&
        matchesGender
      );
    });
  }, [
    candidates,
    searchTerm,
    selectedJobs,
    selectedLocation,
    selectedExperience,
    selectedQualification,
    selectedGender,
    selectedRating,
    verifiedCandidate
  ]);

  // Status-based lists
  const shortlistedCandidates = useMemo(
    () => filteredCandidates.filter(c => normalize(c.status) === "shortlisted"),
    [filteredCandidates]
  );

  const maybeCandidates = useMemo(
    () => filteredCandidates.filter(c => normalize(c.status) === "maybe"),
    [filteredCandidates]
  );

  const rejectedCandidates = useMemo(
    () => filteredCandidates.filter(c => normalize(c.status) === "rejected"),
    [filteredCandidates]
  );

  const tabCandidates = [
    filteredCandidates,
    shortlistedCandidates,
    maybeCandidates,
    rejectedCandidates
  ];

  const activeCandidates = tabCandidates[selectedIndex] || [];
  const totalPages = Math.max(1, Math.ceil(activeCandidates.length / jobsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * jobsPerPage;
  const currentCandidates = activeCandidates.slice(startIndex, startIndex + jobsPerPage);

  // Reset pagination when filters or tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedJobs,
    selectedLocation,
    selectedExperience,
    selectedQualification,
    selectedGender,
    selectedRating,
    verifiedCandidate,
    selectedIndex,
    jobsPerPage
  ]);

  // Update applicant data locally
  const updateCandidate = (id, changes) => {
    setCandidates(prev => prev.map(candidate =>
      getCandidateId(candidate) === id ? { ...candidate, ...changes } : candidate
    ));
  };

  const updateCandidateStatus = (id, newStatus) => updateCandidate(id, { status: newStatus });
  const updateCandidateCallStatus = (id, callStatus) => updateCandidate(id, { callStatus });
  const updateCandidateComments = (id, comments) => updateCandidate(id, { comments });

  const handleShortlist = id => updateCandidateStatus(id, "Shortlisted");
  const handleMaybe = id => updateCandidateStatus(id, "Maybe");
  const handleReject = id => updateCandidateStatus(id, "Rejected");

  const handleDelete = id => {
    setCandidates(prev => prev.filter(candidate => getCandidateId(candidate) !== id));
  };

  const removeFilter = (setter, selected, item) => {
    setter(selected.filter(value => value !== item));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedJobs([]);
    setSelectedLocation([]);
    setSelectedExperience([]);
    setSelectedQualification([]);
    setSelectedGender([]);
    setSelectedRating([]);
    setVerifiedCandidate(false);
    setCurrentPage(1);
  };

  const hasFilters = Boolean(
    searchTerm ||
    selectedJobs.length ||
    selectedLocation.length ||
    selectedExperience.length ||
    selectedQualification.length ||
    selectedGender.length ||
    selectedRating.length ||
    verifiedCandidate
  );

  const PaginationControls = () => (
    <div className="custom-pagination job-style">
      <div className="page-size">
        <span>Show</span>
        <select value={jobsPerPage} onChange={e => setJobsPerPage(Number(e.target.value))}>
          {[10, 20, 40, 60, 80, 100].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="page-controls">
        <button type="button" disabled={safePage <= 1} onClick={() => setCurrentPage(1)}>
          <i className="la la-angle-double-left"></i>
        </button>
        <button type="button" disabled={safePage <= 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
          <i className="la la-angle-left"></i>
        </button>
        <div className="page-box">Page {safePage} of {totalPages}</div>
        <button type="button" disabled={safePage >= totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
          <i className="la la-angle-right"></i>
        </button>
        <button type="button" disabled={safePage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
          <i className="la la-angle-double-right"></i>
        </button>
      </div>
    </div>
  );

  const renderApplicantCards = () => {
    if (loading) {
      return <div className="col-12 text-center py-5"><h5>Loading applicants...</h5></div>;
    }

    if (currentCandidates.length === 0) {
      return (
        <div className="col-12 text-center py-5">
          <h5>No applicants found</h5>
          <p>Try changing or clearing your filters.</p>
        </div>
      );
    }

    return currentCandidates.map(candidate => (
      <ApplicantCard
        key={getCandidateId(candidate)}
        candidate={candidate}
        onUpdateStatus={updateCandidateStatus}
        onUpdateCallStatus={updateCandidateCallStatus}
        onShortlist={handleShortlist}
        onMaybe={handleMaybe}
        onReject={handleReject}
        onDelete={handleDelete}
        onUpdateComments={updateCandidateComments}
      />
    ));
  };

  const filterGroups = [
    [selectedJobs, setSelectedJobs],
    [selectedLocation, setSelectedLocation],
    [selectedExperience, setSelectedExperience],
    [selectedQualification, setSelectedQualification],
    [selectedGender, setSelectedGender],
    [selectedRating, setSelectedRating]
  ];

  const appliedFilterCount = filterGroups.reduce((total, [items]) => total + items.length, 0) + (verifiedCandidate ? 1 : 0);

  return (
    <div className="widget-content">
      <div className="tabs-box">
        <WidgetToFilterBox
          selectedJobs={selectedJobs}
          setSelectedJobs={setSelectedJobs}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedExperience={selectedExperience}
          setSelectedExperience={setSelectedExperience}
          selectedQualification={selectedQualification}
          setSelectedQualification={setSelectedQualification}
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          verifiedCandidate={verifiedCandidate}
          setVerifiedCandidate={setVerifiedCandidate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          jobOptions={jobOptions}
          locationOptions={locationOptions}
        />

        <div className="selected-filters">
          {filterGroups.map(([items, setter], index) =>
            items.map(item => (
              <span key={`${index}-${item}`} className="filter-tag">
                {item}
                <button
                  type="button"
                  className="tag-close"
                  onClick={() => removeFilter(setter, items, item)}
                >
                  ×
                </button>
              </span>
            ))
          )}

          {verifiedCandidate && (
            <span className="filter-tag">
              Verified Candidate
              <button type="button" className="tag-close" onClick={() => setVerifiedCandidate(false)}>×</button>
            </span>
          )}
        </div>

        <div className="filter-summary">
          <span>{appliedFilterCount} filters applied</span>
          {/* {hasFilters && (
            <button type="button" className="btn btn-sm btn-light ms-2" onClick={clearAllFilters}>
              Clear all
            </button>
          )} */}
        </div>

        <div className="table-header-actions">
          <PaginationControls />
        </div>

        <Tabs selectedIndex={selectedIndex} onSelect={index => setSelectedIndex(index)}>
          <div className="aplicants-upper-bar">
            <h6>{jobId > 0 ? candidates[0]?.jobTitle || "" : ""}</h6>

            <TabList className="aplicantion-status tab-buttons clearfix">
              <Tab className="tab-btn totals">Total(s): {filteredCandidates.length}</Tab>
              <Tab className="tab-btn approved">Shortlisted ({shortlistedCandidates.length})</Tab>
              <Tab className="tab-btn" style={{ color: "#ff9800" }}>Maybe ({maybeCandidates.length})</Tab>
              <Tab className="tab-btn rejected">Rejected(s): {rejectedCandidates.length}</Tab>
            </TabList>
          </div>

          <div className="tabs-content">
            <TabPanel><div className="row">{renderApplicantCards()}</div></TabPanel>
            <TabPanel><div className="row">{renderApplicantCards()}</div></TabPanel>
            <TabPanel><div className="row">{renderApplicantCards()}</div></TabPanel>
            <TabPanel><div className="row">{renderApplicantCards()}</div></TabPanel>
          </div>
        </Tabs>

        <PaginationControls />
      </div>
    </div>
  );
};

export default WidgetContentBox;
