

'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import ListingShowing from "../components/ListingShowing";
import candidatesData from "../../../data/candidatedata";
import { useDispatch, useSelector } from "react-redux";
import {
  addCandidateGender,
  addCategory,
  addDatePost,
  addDestination,
  addKeyword,
  addLocation,
  addPerPage,
  addSort,
  clearExperienceF,
  clearQualificationF,
  clearSkills,
  clearEducation,
  clearIndustry,
  clearExperienceLevel,
} from "../../../features/filter/candidateFilterSlice";
import {
  clearDatePost,
  clearExperience,
  clearQualification,
} from "../../../features/candidate/candidateSlice";
import Image from "next/image";

const FilterTopBox = () => {
  const {
    keyword,
    location,
    destination,
    category,
    candidateGender,
    datePost,
    experiences,
    qualifications,
    skills,
    education,
    industries,
    experienceLevels,
    sort,
    perPage,
  } = useSelector((state) => state.candidateFilter);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const dispatch = useDispatch();
  const skillsFilter = (item) =>
    skills?.length
      ? skills.some((skill) =>
        item.skills.some((s) =>
          s.toLowerCase().includes(skill.toLowerCase())
        )
      )
      : true;
  // keyword filter
  const keywordFilter = (item) =>
    keyword !== ""
      ? item?.name?.toLowerCase().includes(keyword?.toLowerCase()) && item
      : item;

  // location filter
  const locationFilter = (item) =>
    location !== ""
      ? item?.location?.toLowerCase().includes(location?.toLowerCase())
      : item;

  // destination filter
  const destinationFilter = (item) =>
    item?.destination?.min >= destination?.min &&
    item?.destination?.max <= destination?.max;

  // category filter
  const categoryFilter = (item) =>
    category !== ""
      ? item?.category?.toLocaleLowerCase() === category?.toLocaleLowerCase()
      : item;

  // gender filter
  const genderFilter = (item) =>
    candidateGender !== ""
      ? item?.gender.toLocaleLowerCase() ===
      candidateGender.toLocaleLowerCase() && item
      : item;

  // date-posted filter
  const datePostedFilter = (item) =>
    datePost !== "all" && datePost !== ""
      ? item?.created_at
        ?.toLocaleLowerCase()
        .split(" ")
        .join("-")
        .includes(datePost)
      : item;

  // experience filter
  const experienceFilter = (item) =>
    experiences?.length !== 0
      ? experiences?.includes(
        item?.experience?.split(" ").join("-").toLocaleLowerCase()
      )
      : item;

  // qualification filter
  const qualificationFilter = (item) =>
    qualifications?.length !== 0
      ? qualifications?.includes(
        item?.qualification?.split(" ").join("-").toLocaleLowerCase()
      )
      : item;

  // sort filter
  const sortFilter = (a, b) =>
    sort === "des" ? a.id > b.id && -1 : a.id < b.id && -1;



  const educationFilter = (item) =>
    education?.length
      ? education.some((edu) =>
        item.education.some((e) =>
          e.toLowerCase().includes(edu.toLowerCase())
        )
      )
      : true;

  const industryFilter = (item) =>
    industries?.length
      ? industries.includes(item.industry)
      : true;

  const experienceLevelFilter = (item) =>
    experienceLevels?.length
      ? experienceLevels.includes(item.experienceLevel)
      : true;



  let content = candidatesData
    ?.slice(perPage.start, perPage.end === 0 ? 10 : perPage.end)
    .filter(keywordFilter)
    .filter(locationFilter)
    .filter(destinationFilter)
    .filter(categoryFilter)
    .filter(genderFilter)
    .filter(datePostedFilter)
    .filter(experienceFilter)
    .filter(qualificationFilter)
    .filter(skillsFilter)
    .filter(educationFilter)
    .filter(industryFilter)
    .filter(experienceLevelFilter)
    ?.sort(sortFilter)
    ?.map((candidate) => (
      <div className="na-card" key={candidate.id}>
        {/* Left Section */}
        <div className="na-left">

          <div className="candidate-top">

            <div className="candidate-top">
              <div className="candidate-checkbox">
                <input
                  type="checkbox"
                  className="check-input"
                  id={`candidate-${candidate.id}`}
                  checked={selectedCandidates.includes(candidate.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCandidates(prev => [...prev, candidate.id]);
                    } else {
                      setSelectedCandidates(prev =>
                        prev.filter(id => id !== candidate.id)
                      );
                    }
                  }}
                />
              </div>

              <div className="candidate-basic">
                <h4>
                  <Link href={`/candidates-single-v1/${candidate.id}`}>
                    {candidate.name}
                  </Link>
                </h4>

                <div className="top-meta">
                  <span>
                    <i className="flaticon-briefcase"></i>
                    {candidate.experience}
                  </span>

                  <span>
                    <i className="flaticon-money"></i>
                    {candidate.salary}
                  </span>

                  <span>
                    <i className="flaticon-map-locator"></i>
                    {candidate.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="candidate-row">
            <div className="label1">Current</div>
            <div className="value">
              {candidate.currentDesignation} at{" "}
              <strong>{candidate.currentCompany}</strong>
            </div>
          </div>

          <div className="candidate-row">
            <div className="label1">Previous</div>
            <div className="value">
              {candidate.previousDesignation} at{" "}
              <strong>{candidate.previousCompany}</strong>
            </div>
          </div>

          <div className="candidate-row">
            <div className="label1">Education</div>

            <div className="value">
              {candidate.education.map((edu, index) => (
                <div key={index}>{edu}</div>
              ))}
            </div>
          </div>

          <div className="candidate-row">
            <div className="label1">Pref. Location</div>
            <div className="value">
              {candidate.preferredLocation}
            </div>
          </div>

          <div className="candidate-row skills-row">
            <div className="label1">Key Skills</div>

            <div className="value">
              {candidate.skills.map((skill, index) => (
                <span className="skill-pill" key={index}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Section */}

        <div className="na-right">

          <div className="profile-image">
            <Image
              src={candidate.avatar}
              width={90}
              height={90}
              alt=""
            />
          </div>

          <p className="profile-summary">
            {candidate.profileSummary}
          </p>

          <div className="candidate-action-buttons">
            <Link
              href={`/candidates-single-v1/${candidate.id}`}
              className="theme-btn btn-style-one w-100"
            >
              View Profile
            </Link>

            <button className="theme-btn btn-style-one w-100">
              Call Candidate
            </button>
          </div>

          {candidate.verified && (
            <small className="verified-text">
              ✔ Verified phone & email
            </small>
          )}

          <div className="candidate-bottom-actions">
            <button className="action-icon-btn" title="Comment">
              <i className="las la-comment"></i>
            </button>

            <button className="action-icon-btn" title="Save">
              <i className="las la-bookmark"></i>
            </button>

            <button className="action-icon-btn" title="Forward">
              <i className="las la-paper-plane"></i>
            </button>

            <button className="action-icon-btn" title="Add to Folder">
              <i className="las la-folder-plus"></i>
            </button>

            <button className="action-icon-btn" title="Set Reminder">
              <i className="las la-bell"></i>
            </button>

          </div>
        </div>
      </div >
    ))

  // sort handler
  const sortHandler = (e) => {
    dispatch(addSort(e.target.value));
  };

  // per page handler
  const perPageHandler = (e) => {
    const pageData = JSON.parse(e.target.value);
    dispatch(addPerPage(pageData));
  };

  // clear handler
  const clearHandler = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    dispatch(addDestination({ min: 0, max: 100 }));
    dispatch(addCategory(""));
    dispatch(addCandidateGender(""));
    dispatch(addDatePost(""));

    dispatch(clearExperienceF());
    dispatch(clearQualificationF());

    dispatch(clearSkills());
    dispatch(clearEducation());
    dispatch(clearIndustry());
    dispatch(clearExperienceLevel());

    dispatch(clearDatePost());
    dispatch(clearExperience());
    dispatch(clearQualification());
    setSelectedCandidates([]);
    dispatch(addSort(""));
    dispatch(addPerPage({ start: 0, end: 0 }));
  };


  useEffect(() => {
    setSelectedCandidates(prev =>
      prev.filter(id =>
        contentData.some(candidate => candidate.id === id)
      )
    );
  }, [candidatesData]);
  return (
    <>
      <div className="ls-switcher">
        <div className="showing-result">
        </div>
        {/* End showing-result */}

        <div className="sort-by">
          {keyword !== "" ||
            location !== "" ||
            destination.min !== 0 ||
            destination.max !== 100 ||
            category !== "" ||
            candidateGender !== "" ||
            datePost !== "" ||
            experiences?.length !== 0 ||
            qualifications?.length !== 0 ||
            skills?.length !== 0 ||
            education?.length !== 0 ||
            industries?.length !== 0 ||
            experienceLevels?.length !== 0 ||
            sort !== "" ||
            perPage?.start !== 0 ||
            perPage?.end !== 0 ? (
            <button
              className="btn btn-danger text-nowrap me-2"
              style={{ minHeight: "45px", marginBottom: "15px" }}
              onClick={clearHandler}
            >
              Clear All
            </button>
          ) : undefined}

          <select
            onChange={sortHandler}
            className="chosen-single form-select"
            value={sort}
          >
            <option value="">Sort by (default)</option>
            <option value="asc">Newest</option>
            <option value="des">Oldest</option>
          </select>
          {/* End select */}

          <select
            className="chosen-single form-select ms-3 "
            onChange={perPageHandler}
            value={JSON.stringify(perPage)}
          >
            <option
              value={JSON.stringify({
                start: 0,
                end: 0,
              })}
            >
              All
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 15,
              })}
            >
              15 per page
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 20,
              })}
            >
              20 per page
            </option>
            <option
              value={JSON.stringify({
                start: 0,
                end: 25,
              })}
            >
              25 per page
            </option>
          </select>
          {/* End select */}
        </div>
      </div>

      <div className="candidate-toolbar">
        <div className="toolbar-left">
          <label className="select-all">
            <input
              type="checkbox"
              checked={
                candidatesData.length > 0 &&
                selectedCandidates.length === candidatesData.length
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedCandidates(candidatesData.map(item => item.id));
                } else {
                  setSelectedCandidates([]);
                }
              }}
            />
            <span>Select All</span>
          </label>
          <button className="toolbar-btn">
            <i className="las la-folder-plus"></i>
            Add To
            <i className="las la-angle-down ms-2"></i>
          </button>

          <button className="toolbar-btn">
            <i className="las la-bell"></i>
            Set Reminder
            <i className="las la-angle-down ms-2"></i>
          </button>
        </div>

        <div className="toolbar-right">
          <span>{candidatesData.length} Candidates</span>
        </div>
      </div>
      {/* End top filter bar box */}

      {content}

      <ListingShowing />
      {/* <!-- Listing Show More --> */}
    </>
  );
};

export default FilterTopBox;
