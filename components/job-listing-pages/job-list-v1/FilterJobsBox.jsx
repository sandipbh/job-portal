

'use client'

import Link from "next/link";
import { encodeJobId } from "@/lib/jobIdCrypto";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getTimeAgo } from "@/lib/dateUtils";

import {
  addCategory,
  addDatePosted,
  addDestination,
  addKeyword,
  addLocation,
  addLocationKey,
  addPerPage,
  addSalary,
  addSort,
  addTag,
  clearExperience,
  clearJobType,
  clearCompanyType,
  clearSkills,
  clearEducation,
  addIndustry,
  clearIndustry,
} from "../../../features/filter/filterSlice";
import {
  clearDatePostToggle,
  clearExperienceToggle,
  clearJobTypeToggle,
  clearCompanyTypeToggle,
} from "../../../features/job/jobSlice";
import Image from "next/image";

const getSalaryRange = (job) => {
  const range = job?.totalSalary ?? job?.salaryRange;
  if (range && typeof range === "object") {
    const min = Number(range.min ?? range.minimum ?? range.from);
    const max = Number(range.max ?? range.maximum ?? range.to);
    if (Number.isFinite(min) && Number.isFinite(max)) return { min, max };
  }

  const salaryText = typeof job?.salary === "object"
    ? `${job.salary.min ?? ""} ${job.salary.max ?? ""}`
    : String(job?.salary ?? "");
  const amounts = [...salaryText.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|lpa|k)?/gi)];
  if (!amounts.length) return null;

  const lastUnit = [...amounts].reverse().find((match) => match[2])?.[2];
  const multiplierFor = (unit) => {
    if (/^(?:crores?|cr)$/i.test(unit || "")) return 10000000;
    if (/^(?:lakhs?|lacs?|lpa)$/i.test(unit || "")) return 100000;
    if (/^k$/i.test(unit || "")) return 1000;
    return 1;
  };
  const values = amounts.map((match) =>
    Number(match[1].replace(/,/g, "")) * multiplierFor(match[2] || lastUnit)
  );

  return { min: Math.min(...values), max: Math.max(...values) };
};

const getPostedAgeHours = (value) => {
  if (value == null || value === "") return null;

  const normalized = String(value).trim().toLowerCase().replace(/[_-]/g, " ");
  if (/^(?:just now|today)$/.test(normalized)) return 0;
  if (normalized === "yesterday") return 24;
  if (normalized === "last hour") return 1;

  const relativeMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)\b/
  );
  if (relativeMatch) {
    const amount = Number(relativeMatch[1]);
    const unit = relativeMatch[2];
    if (/^(?:minute|min)/.test(unit)) return amount / 60;
    if (/^(?:hour|hr)/.test(unit)) return amount;
    if (/^day/.test(unit)) return amount * 24;
    if (/^week/.test(unit)) return amount * 24 * 7;
    if (/^month/.test(unit)) return amount * 24 * 30;
    return amount * 24 * 365;
  }

  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
  return ageHours >= 0 ? ageHours : null;
};

const FilterJobsBox = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreController = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.toString();
  const { jobList, jobSort } = useSelector((state) => state.filter);
  const {
    destination,
    location,
    locationKey,
    jobType,
    companyType,
    skills,
    education,
    datePosted,
    experience,
    salary,
    industry,
    tag,
  } = jobList || {};
  const { sort, perPage } = jobSort;
  const dispatch = useDispatch();

  useEffect(() => {
    let isCurrent = true;
    const controller = new AbortController();

    const getJobs = async () => {
      setLoading(true);
      setFetchError("");
      setLoadMoreError("");
      setJobs([]);
      setPage(1);
      setTotalCount(null);
      setHasMore(false);

      try {
        const params = new URLSearchParams(searchQuery);
        if (locationKey != null && locationKey !== "") {
          params.set("location", String(locationKey));
        }
        params.set("page", "1");
        const response = await fetch(
          `/api/job-search?${params.toString()}`,
          { signal: controller.signal }
        );
        const result = await response.json();
        console.log("Job Search Result:", JSON.stringify(result));
        if (!response.ok) {
          throw new Error(result?.message || "Failed to fetch jobs.");
        }

        if (isCurrent) {
          setJobs(Array.isArray(result?.data) ? result.data : []);
          setPage(Number(result?.page) || 1);
          setTotalCount(result?.totalCount != null && Number.isFinite(Number(result.totalCount))
            ? Number(result.totalCount)
            : null);
          setHasMore(Boolean(result?.hasMore));
        }
      } catch (error) {
        if (isCurrent && error.name !== "AbortError") {
          setJobs([]);
          setFetchError(error.message || "Failed to fetch jobs.");
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    getJobs();
    return () => {
      isCurrent = false;
      controller.abort();
      loadMoreController.current?.abort();
    };
  }, [searchQuery, locationKey]);

  const loadMoreJobs = async () => {
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    const controller = new AbortController();
    loadMoreController.current = controller;
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const params = new URLSearchParams(searchQuery);
      if (locationKey != null && locationKey !== "") {
        params.set("location", String(locationKey));
      }
      params.set("page", String(nextPage));
      const response = await fetch(`/api/job-search?${params.toString()}`, {
        signal: controller.signal,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load more jobs.");
      }

      const nextJobs = Array.isArray(result?.data) ? result.data : [];
      const existingIds = new Set(
        jobs
          .map((job) => job.id ?? job.jobId ?? job.jobPostId)
          .filter((id) => id != null)
          .map(String)
      );
      const uniqueNextJobs = nextJobs.filter((job) => {
        const id = job.id ?? job.jobId ?? job.jobPostId;
        if (id == null) return true;
        if (existingIds.has(String(id))) return false;
        existingIds.add(String(id));
        return true;
      });
      setJobs((currentJobs) => [...currentJobs, ...uniqueNextJobs]);
      setPage(Number(result?.page) || nextPage);
      if (result?.totalCount != null && Number.isFinite(Number(result.totalCount))) {
        setTotalCount(Number(result.totalCount));
      }
      setHasMore(uniqueNextJobs.length > 0 && Boolean(result?.hasMore));
    } catch (error) {
      if (error.name !== "AbortError") {
        setLoadMoreError(error.message || "Failed to load more jobs.");
      }
    } finally {
      if (loadMoreController.current === controller) {
        loadMoreController.current = null;
        setLoadingMore(false);
      }
    }
  };

  const locationFilter = (item) => {
    const selectedLocation = String(location ?? "").trim().toLocaleLowerCase();
    if (!selectedLocation) return item;

    const jobLocation = String(item?.location ?? "").trim().toLocaleLowerCase();
    if (!jobLocation) return false;

    const selectedCity = selectedLocation.split(",")[0].trim();
    const jobCity = jobLocation.split(",")[0].trim();
    return jobLocation.includes(selectedLocation) ||
      selectedLocation.includes(jobLocation) ||
      jobCity.includes(selectedCity) ||
      selectedCity.includes(jobCity);
  };

  // destination filter
  const destinationFilter = (item) =>
    !item?.destination ||
    (item.destination.min >= destination?.min &&
      item.destination.max <= destination?.max);

  // job-type filter
  const jobTypeFilter = (item) =>
    jobType?.length !== 0 && item?.jobType !== undefined
      ? jobType?.includes(
        item?.jobType[0]?.type.toLocaleLowerCase().split(" ").join("-")
      )
      : item;

  // company-type filter
  const companyTypeFilter = (item) =>
    companyType?.length !== 0
      ? companyType?.includes(
        item?.companyType?.toLowerCase().split(" ").join("-")
      )
      : item;

  // skills filter
  const skillsFilter = (item) =>
    skills?.length
      ? skills.some((skill) =>
        item?.skills?.includes(skill)
      )
      : item;

  // education filter
  const educationFilter = (item) =>
    education?.length
      ? education.includes(item?.education)
      : item;

  // date-posted filter
  const datePostedFilter = (item) => {
    if (!datePosted || datePosted === "all") return item;

    const maxAgeHours = {
      "last-hour": 1,
      "last-24-hour": 24,
      "last-7-days": 24 * 7,
      "last-14-days": 24 * 14,
      "last-30-days": 24 * 30,
    }[datePosted];
    if (maxAgeHours == null) return item;

    const ageHours = [item?.created_at, item?.createdAt, item?.postedAt, item?.time]
      .map(getPostedAgeHours)
      .find((age) => age != null);

    return ageHours != null && ageHours <= maxAgeHours;
  };

  // experience level filter
  const experienceFilter = (item) =>
    experience
      ? Number(item.experience) >= experience
      : item;

  // industry level filter
  const industryFilter = (item) =>
    industry?.length
      ? industry.includes(item?.industry)
      : item;

  // salary filter
  const salaryFilter = (item) => {
    const range = getSalaryRange(item);
    const minimum = Number(salary?.min ?? 0);
    const maximum = Number(salary?.max ?? 5000000);

    if (!range) return minimum === 0 && maximum >= 5000000;
    return range.max >= minimum && range.min <= maximum;
  };

  // tag filter
  const tagFilter = (item) => (tag !== "" ? item?.tag === tag : item);

  // sort filter
  const sortFilter = (a, b) =>
    sort === "des" ? a.id > b.id && -1 : a.id < b.id && -1;

  let content = jobs
    ?.filter(locationFilter)
    ?.filter(destinationFilter)
    ?.filter(jobTypeFilter)
    ?.filter(companyTypeFilter)
    ?.filter(skillsFilter)
    ?.filter(educationFilter)
    ?.filter(industryFilter)
    ?.filter(datePostedFilter)
    ?.filter(experienceFilter)
    ?.filter(salaryFilter)
    ?.filter(tagFilter)
    ?.sort(sortFilter)
    .slice(perPage.start, Math.max(jobs.length, perPage.end))
    ?.map((item) => (
      <div className="job-block" key={item.id}>
        <div className="inner-box">
          <div className="content">
            <span className="company-logo">
              <Image width={50} height={70} src={item.logo} alt="item brand" />
            </span>
            <h4>
              <Link href={`/job-single-v2/${encodeJobId(item.id)}`}>{item.jobTitle}</Link>
            </h4>

            <ul className="job-info">
              <li>
                <span className="icon flaticon-briefcase"></span>
                {item.company}
              </li>
              {/* compnay info */}
              <li>
                <span className="icon flaticon-map-locator"></span>
                {item.location}
              </li>
              {/* location info */}
              <li>
                <span className="icon flaticon-clock-3"></span>{" "}
                {getTimeAgo(item.created_at || item.time)}
              </li>
              {/* time info */}
              <li>
                <span className="icon flaticon-money"></span> {item.salary}
              </li>
              {/* salary info */}
            </ul>
            {/* End .job-info */}

            <ul className="job-other-info">
              {item?.jobType?.map((val, i) => (
                <li key={i} className={`${val.styleClass}`}>
                  {val.type}
                </li>
              ))}
            </ul>
            {/* End .job-other-info */}

            {/* <button className="bookmark-btn">
              <span className="flaticon-bookmark"></span>
            </button> */}
          </div>
        </div>
      </div>
      // End all jobs
    ));

  // sort handler
  const sortHandler = (e) => {
    dispatch(addSort(e.target.value));
  };

  // per page handler
  const perPageHandler = (e) => {
    const pageData = JSON.parse(e.target.value);
    dispatch(addPerPage(pageData));
  };

  // clear all filters
  const clearAll = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    dispatch(addLocationKey(""));
    dispatch(addDestination({ min: 0, max: 100 }));
    dispatch(addCategory(""));
    dispatch(clearJobType());
    dispatch(clearJobTypeToggle());
    dispatch(clearCompanyType());
    dispatch(clearCompanyTypeToggle());
    dispatch(clearSkills());
    dispatch(clearEducation());
    dispatch(clearIndustry());
    dispatch(addDatePosted(""));
    dispatch(clearDatePostToggle());
    dispatch(clearExperience());
    dispatch(clearExperienceToggle());
    dispatch(addSalary({ min: 0, max: 500000 }));
    dispatch(addTag(""));
    dispatch(addSort(""));
    dispatch(addPerPage({ start: 0, end: 0 }));
    router.push("/job-list-v1");
  };

  return (
    <>
      <div className="ls-switcher">
        <div className="show-result">
          <div className="show-1023">
            <button
              type="button"
              className="theme-btn toggle-filters "
              data-bs-toggle="offcanvas"
              data-bs-target="#filter-sidebar"
            >
              <span className="icon icon-filter"></span> Filter
            </button>
          </div>
          {/* Collapsible sidebar button */}

          <div className="text">
            Show <strong>{content?.length}</strong> jobs
          </div>
        </div>
        {/* End show-result */}

        <div className="sort-by">
          {searchParams.has("keyword") ||
            searchParams.has("location") ||
            searchParams.has("category") ||
            destination?.min !== 0 ||
            destination?.max !== 100 ||
            jobType?.length !== 0 ||
            skills?.length !== 0 ||
            education?.length !== 0 ||
            companyType?.length !== 0 ||
            datePosted !== "" ||
            experience?.length !== 0 ||
            salary?.min !== 0 ||
            salary?.max !== 500000 ||
            tag !== "" ||
            sort !== "" ||
            perPage.start !== 0 ||
            perPage.end !== 0 ? (
            <button
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{ minHeight: "45px", marginBottom: "15px" }}
            >
              Clear All
            </button>
          ) : undefined}

          <select
            value={sort}
            className="chosen-single form-select"
            onChange={sortHandler}
          >
            <option value="">Sort by (default)</option>
            <option value="asc">Newest</option>
            <option value="des">Oldest</option>
          </select>
          {/* End select */}

          {/* <select
            onChange={perPageHandler}
            className="chosen-single form-select ms-3 "
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
                end: 10,
              })}
            >
              10 per page
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
                end: 30,
              })}
            >
              30 per page
            </option>
          </select> */}
          {/* End select */}
        </div>
      </div>
      {/* End top filter bar box */}
      {loading ? (
        <p>Loading jobs...</p>
      ) : fetchError ? (
        <p role="alert">{fetchError}</p>
      ) : content.length > 0 ? (
        content
      ) : (
        <p>No jobs found for the selected search.</p>
      )}
      {loadMoreError && <p role="alert">{loadMoreError}</p>}
      {!loading && !fetchError && jobs.length > 0 && (hasMore || totalCount != null) && (
        <div className="ls-show-more">
          {/* <p>
            Showing {jobs.length}
            {totalCount != null ? ` of ${totalCount}` : ""} Jobs
          </p>
          {totalCount > 0 && (
            <div className="bar">
              <span
                className="bar-inner"
                style={{
                  width: `${Math.min((jobs.length / totalCount) * 100, 100)}%`,
                }}
              ></span>
            </div>
          )} */}
          {hasMore && (
            <button
              type="button"
              className="show-more"
              onClick={loadMoreJobs}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Show More"}
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default FilterJobsBox;
