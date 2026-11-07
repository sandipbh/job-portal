"use client";
import Applicants from "./Applicants";
import { useState, useEffect, useMemo } from "react";
import WidgetToFilterBox from "./WidgetToFilterBox";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const WidgetContentBox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedQualification, setSelectedQualification] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedRating, setSelectedRating] = useState([]);
  const [verifiedCandidate, setVerifiedCandidate] = useState(false);

  const searchParams = useSearchParams();
  const jobId = Number(searchParams.get("jobId"));

  const [candidatesData, setCandidatesData] = useState([]);

  useEffect(() => {
    getJobList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const getJobList = async () => {
    try {
      const response = await fetch(
        `/api/emp-job-interview-list?JobPostId=${jobId}`,
        { method: "GET" }
      );

      const result = await response.json();
      const listData = result?.data;

      if (listData) {
        setCandidatesData(listData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------------------------------------------------------
   * Derive unique + sorted filter options from the loaded candidates
   * --------------------------------------------------------------- */

  const getJobValue = (c) =>
    (c?.designation ?? c?.jobTitle ?? "").toString().trim();
  const getLocationValue = (c) =>
    (c?.location ?? c?.currentAddress ?? "").toString().trim();

  const jobOptions = useMemo(() => {
    const set = new Set();
    candidatesData.forEach((c) => {
      const v = getJobValue(c);
      if (v) set.add(v);
    });
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [candidatesData]);

  const locationOptions = useMemo(() => {
    const set = new Set();
    candidatesData.forEach((c) => {
      const v = getLocationValue(c);
      if (v) set.add(v);
    });
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [candidatesData]);

  const ratingOptions = useMemo(() => ["5", "4", "3", "2", "1"], []);

  /* ---------------------------------------------------------------
   * Filtering
   * --------------------------------------------------------------- */

  const isCandidateVerified = (candidate) => {
    const value = candidate?.verifyStatus ??
      candidate?.verificationStatus ??
      candidate?.verifiedStatus ??
      candidate?.isVerified;

    if (typeof value === "boolean") return value;

    return ["verified", "yes", "y", "true", "1"]
      .includes(String(value ?? "").trim().toLowerCase());
  };

  const filteredCandidates = candidatesData.filter((candidate) => {
    const jobValue = getJobValue(candidate);
    const locValue = getLocationValue(candidate);

    const matchesJob =
      selectedJobs.length === 0 || selectedJobs.includes(jobValue);

    const matchesLocation =
      selectedLocation.length === 0 || selectedLocation.includes(locValue);

    const matchesExperience =
      selectedExperience.length === 0 ||
      selectedExperience.includes(String(candidate.experience ?? ""));

    const matchesQualification =
      selectedQualification.length === 0 ||
      selectedQualification.includes(String(candidate.qualification ?? ""));

    const matchesGender =
      selectedGender.length === 0 ||
      selectedGender.includes(String(candidate.gender ?? ""));

    const candidateRating = Math.round(Number(candidate.avgRating) || 0);

    const matchesRating =
      selectedRating.length === 0 ||
      selectedRating.includes(String(candidateRating));

    const matchesVerified =
      !verifiedCandidate || isCandidateVerified(candidate);

    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      search === "" ||
      [
        candidate?.name,
        candidate?.candiName,
        candidate?.candiUqId,
        candidate?.designation,
        candidate?.jobTitle,
        candidate?.currentCompany,
        candidate?.currentAddress,
        candidate?.location,
        candidate?.education,
        candidate?.qualification
      ].some((value) => String(value ?? "").toLowerCase().includes(search));

    return (
      matchesSearch &&
      matchesJob &&
      matchesLocation &&
      matchesExperience &&
      matchesQualification &&
      matchesGender &&
      matchesRating &&
      matchesVerified
    );
  });

  /* ---------------------------------------------------------------
   * Status / comment state updates
   * --------------------------------------------------------------- */

  const updateCandidateStatus = (id, status) => {
    setCandidatesData((prev) =>
      prev.map((candidate) =>
        candidate.id === id ? { ...candidate, status } : candidate
      )
    );
  };

  const handleCallStatus = (id, ttype) => {
    updateCandidateCallStatus(id, ttype);
  };

  const updateCandidateCallStatus = (id, callStatus) => {
    setCandidatesData((prev) =>
      prev.map((candidate) =>
        candidate.id === id ? { ...candidate, callStatus } : candidate
      )
    );
  };

  const handleStatus = (id, ttype) => {
    updateCandidateStatus(id, ttype);
  };

  const updateCandidateComments = (id, comments) => {
    setCandidatesData((prev) =>
      prev.map((candidate) =>
        candidate.id === id ? { ...candidate, comments } : candidate
      )
    );
  };

  /* ---------------------------------------------------------------
   * Pagination
   * --------------------------------------------------------------- */

  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(20);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / jobsPerPage)
  );
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredCandidates.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedLocation,
    selectedJobs,
    selectedExperience,
    selectedQualification,
    selectedGender,
    selectedRating,
    verifiedCandidate
  ]);

  const PaginationControls = () => {
    const getPages = () => {
      const pages = [];
      const maxVisible = 5;

      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = Math.min(totalPages, maxVisible);
      }

      if (currentPage >= totalPages - 2) {
        start = Math.max(1, totalPages - (maxVisible - 1));
        end = totalPages;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    };

    return (
      <div className="custom-pagination job-style">
        <div className="page-size">
          <span>Show</span>
          <select
            value={jobsPerPage}
            onChange={(e) => {
              setJobsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="page-controls">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            <i className="la la-angle-double-left"></i>
          </button>

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <i className="la la-angle-left"></i>
          </button>

          <div className="page-box">
            Page {currentPage} of {totalPages || 1}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <i className="la la-angle-right"></i>
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            <i className="la la-angle-double-right"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="widget-content">
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
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        location={location}
        setLocation={setLocation}
        jobOptions={jobOptions}
        locationOptions={locationOptions}
        ratingOptions={ratingOptions}
        categoryOptions={[]}
        verifiedCandidate={verifiedCandidate}
        setVerifiedCandidate={setVerifiedCandidate}
      />

      <div className="selected-filters">
        {selectedJobs.map((item) => (
          <span key={`job-${item}`} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedJobs(selectedJobs.filter((s) => s !== item))
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedLocation.map((item) => (
          <span key={`loc-${item}`} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedLocation(
                  selectedLocation.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedExperience.map((item) => (
          <span key={`exp-${item}`} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedExperience(
                  selectedExperience.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedQualification.map((item) => (
          <span key={`qual-${item}`} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedQualification(
                  selectedQualification.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedGender.map((item) => (
          <span key={`gen-${item}`} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedGender(selectedGender.filter((s) => s !== item))
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedCategory.map((item) => (
          <span key={`cat-${item}`} className="filter-tag">
            {item}
            <button
              className="tag-close"
              onClick={() =>
                setSelectedCategory(
                  selectedCategory.filter((s) => s !== item)
                )
              }
            >
              ×
            </button>
          </span>
        ))}

        {selectedRating.map((item) => (
          <span key={`rating-${item}`} className="filter-tag">
            {item} ★
            <button
              className="tag-close"
              onClick={() =>
                setSelectedRating(selectedRating.filter((s) => s !== item))
              }
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="filter-summary">
        {selectedJobs.length +
          selectedLocation.length +
          selectedExperience.length +
          selectedQualification.length +
          selectedGender.length +
          selectedCategory.length +
          selectedRating.length}{" "}
        filters applied
      </div>

      <div className="table-header-actions">
        <PaginationControls />
      </div>

      <div className="row align-items-start">
        {currentJobs.length > 0 ? (
          currentJobs.map((candidate, index) => (
            <Applicants
              key={`${candidate.id || "unknown"}-${candidate.candiUqId || "unknown"}-${index}`}
              candidate={candidate}
              onUpdateComments={updateCandidateComments}
              onUpdateStatus={handleStatus}
              onUpdateCallStatus={handleCallStatus}
            />
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <h5>No applicants found</h5>
          </div>
        )}
      </div>
      <PaginationControls />
    </div>
  );
};

export default WidgetContentBox;