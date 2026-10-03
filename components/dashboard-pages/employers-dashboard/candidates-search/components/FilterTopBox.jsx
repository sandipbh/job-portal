

'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import ListingShowing from "@/components/candidates-listing-pages/components/ListingShowing";
import { useSelector } from "react-redux";
import Image from "next/image";
const FilterTopBox = ({
  selectedCandidates,
  setSelectedCandidates,
  onResultsChange,
}) => {
  const {
    keyword,
    location,
    category,
    skills,
    industries,
    minExperience,
    sort,
    perPage,
  } = useSelector((state) => state.candidateFilter);

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  const handleBookmarkToggle = async (candiUqId) => {
    try {
      setLoadingBookmark(true);
      const res = await fetch("/api/emp-application-profile-bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: 0,
          jobpostId: 0,
          candiUqId,
        }),
      });

      if (!res.ok) return;

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.candiUqId === candiUqId
            ? { ...candidate, isSave: candidate.isSave === "Y" ? "N" : "Y" }
            : candidate
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBookmark(false);
    }
  };

  // client-side fallback filters, applied on top of the API results using the
  // real field names returned by /api/candidates-search
  const keywordFilter = (item) =>
    keyword
      ? item?.candiName?.toLowerCase().includes(keyword.toLowerCase())
      : true;

  const locationFilter = (item) =>
    location
      ? `${item?.city || ""} ${item?.state || ""} ${item?.workingLocation || ""}`
        .toLowerCase()
        .includes(location.toLowerCase())
      : true;

  const skillsFilter = (item) =>
    skills?.length
      ? skills.some((skill) =>
        (item?.skills || "").toLowerCase().includes(skill.toLowerCase())
      )
      : true;

  // sort filter - API has no created_at field, fall back to sorting by name
  const sortFilter = (a, b) => {
    if (sort === "des") return (b?.candiName || "").localeCompare(a?.candiName || "");
    if (sort === "asc") return (a?.candiName || "").localeCompare(b?.candiName || "");
    return 0;
  };

  const getData = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        KEYWORDS: keyword || null,
        LOCATION: location || null,
        SKILLS: skills?.length ? skills.join(",") : null,
        DEPARTMENT_IDS: category || null,
        INDUSTRY_IDS: industries?.length ? industries.join(",") : null,
        MIN_EXPERIENCE: minExperience || 0,
        PAGE_NO: 1,
        PAGE_SIZE: perPage?.end || 20,
      };

      const response = await fetch("/api/candidates-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Your login has expired. Please login again to search candidates.");
        setCandidates([]);
        return;
      }

      if (!response.ok) {
        setError(data?.message || "Failed to fetch candidates.");
        setCandidates([]);
        return;
      }

      setCandidates(data?.data || []);
    } catch (error) {
      console.error("API Error:", error);
      setError("Failed to fetch candidates. Please try again.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }

  // refetch whenever a search-relevant filter changes (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getData();
    }, 400);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, location, category, skills, industries, minExperience, perPage]);

  let content = candidates
    ?.filter(keywordFilter)
    .filter(locationFilter)
    .filter(skillsFilter)
    ?.sort(sortFilter)
    ?.map((candidate) => (
      <div className="na-card" key={candidate.candiUqId}>
        {/* Left Section */}
        <div className="na-left">

          <div className="candidate-top">

            <div className="candidate-top">
              <div className="candidate-checkbox">
                <input
                  type="checkbox"
                  className="check-input"
                  id={`candidate-${candidate.candiUqId}`}
                  checked={selectedCandidates.includes(candidate.candiUqId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCandidates(prev => [...prev, candidate.candiUqId]);
                    } else {
                      setSelectedCandidates(prev =>
                        prev.filter(id => id !== candidate.candiUqId)
                      );
                    }
                  }}
                />
              </div>

              <div className="candidate-basic">
                <h4>
                  <Link href={`/candidates-single-v1/${candidate.candiUqId}`}>
                    {candidate.candiName}
                  </Link>
                </h4>

                <div className="top-meta">
                  <span>
                    <i className="flaticon-briefcase"></i>
                    {candidate.experience}
                  </span>

                  <span>
                    <i className="flaticon-money"></i>
                    {candidate.curentSalary}
                  </span>

                  <span>
                    <i className="flaticon-map-locator"></i>
                    {[candidate.city, candidate.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="candidate-row">
            <div className="label1">Current</div>
            <div className="value">
              <strong>{candidate.currentCompany}</strong>
            </div>
          </div>

          <div className="candidate-row">
            <div className="label1">Education</div>

            <div className="value">
              {candidate.education}
            </div>
          </div>

          <div className="candidate-row">
            <div className="label1">Pref. Location</div>
            <div className="value">
              {candidate.workingLocation}
            </div>
          </div>

          <div className="candidate-row">
            <div className="label1">Notice Period</div>
            <div className="value">
              {candidate.noticePeriod}
            </div>
          </div>

          <div className="candidate-row skills-row">
            <div className="label1">Key Skills</div>

            <div className="value">
              {(candidate.skills || "")
                .split(",")
                .filter(Boolean)
                .map((skill, index) => (
                  <span className="skill-pill" key={index}>
                    {skill.trim()}
                  </span>
                ))}
            </div>
          </div>

        </div>

        {/* Right Section */}

        <div className="na-right">

          <div className="profile-image">
            <Image
              src={candidate.avatar || "/images/resource/candidate-1.png"}
              width={90}
              height={90}
              alt=""
            />
          </div>
          <div className="profile-section">
            <div className="candidate-side-actions">
              <button className="action-icon-btn">
                <i className="las la-comment"></i>
              </button>

              <button
                type="button"
                className="action-icon-btn"
                onClick={() => handleBookmarkToggle(candidate.candiUqId)}
                disabled={loadingBookmark}
              >
                <i className={candidate.isSave === "Y" ? "fas fa-bookmark" : "lar la-bookmark"}></i>
              </button>

              <button className="action-icon-btn">
                <i className="las la-paper-plane"></i>
              </button>

              <button className="action-icon-btn">
                <i className="las la-folder-plus"></i>
              </button>

              <button className="action-icon-btn">
                <i className="las la-bell"></i>
              </button>
            </div>
          </div>

          <p className="profile-summary">
            {candidate.profileDesc}
          </p>

          <div className="candidate-action-buttons">
            <Link
              href={`/candidates-single-v1/${candidate.candiUqId}`}
              className="theme-btn btn-style-one w-100 butn"
            >
              View Profile
            </Link>

            <button className="theme-btn btn-style-one w-100 butn">
              Call Candidate
            </button>
          </div>



        </div>
      </div >
    ))

  // // sort handler
  // const sortHandler = (e) => {
  //   dispatch(addSort(e.target.value));
  // };

  // // per page handler
  // const perPageHandler = (e) => {
  //   const pageData = JSON.parse(e.target.value);
  //   dispatch(addPerPage(pageData));
  // };

  // notify the parent about the result count (for "Select All" / toolbar text)
  useEffect(() => {
    onResultsChange?.(candidates?.length || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates]);

  return (
    <>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">Loading candidates...</div>
      ) : content && content.length > 0 ? (
        content
      ) : (
        !error && (
          <div className="text-center py-5">
            No candidates found matching your filters.
          </div>
        )
      )}

      <ListingShowing />
      {/* <!-- Listing Show More --> */}
    </>
  );
};

export default FilterTopBox;
