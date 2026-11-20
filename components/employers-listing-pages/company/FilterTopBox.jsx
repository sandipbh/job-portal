
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  addCategory,
  addDestination,
  addFoundationDate,
  addKeyword,
  addLocation,
  addPerPage,
  addSort
} from "../../../features/filter/employerFilterSlice";
import Pagination from "../components/Pagination";

const FilterTopBox = () => {
  const {
    keyword = "",
    location = "",
    destination = { min: 0, max: 100 },
    category = "",
    foundationDate = { min: 1900, max: 2028 },
    sort = "",
    perPage = { start: 0, end: 10 }
  } = useSelector((state) => state.employerFilter) || {};

  const dispatch = useDispatch();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = perPage.end > 0
    ? perPage.end - perPage.start
    : 10;

  useEffect(() => {
    let isMounted = true;

    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/company-list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            term: keyword || "",
            location: location || "",
            pageNumber: 1,
            pageSize: 100
          })
        });

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(result.message || "Unable to load companies.");
        }

        if (isMounted) {
          setCompanies(result.data || []);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("Company list error:", err);

        if (isMounted) {
          setError(err.message || "Failed to load companies.");
          setCompanies([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCompanies();

    return () => {
      isMounted = false;
    };
  }, [keyword, location]);

  const keywordFilter = (item) =>
    !keyword ||
    item?.name?.toLowerCase().includes(keyword.toLowerCase()) ||
    item?.jobDetails?.toLowerCase().includes(keyword.toLowerCase());

  const locationFilter = (item) =>
    !location ||
    item?.location?.toLowerCase().includes(location.toLowerCase());

  const destinationFilter = (item) =>
    !item?.destination ||
    (item.destination.min >= destination.min &&
      item.destination.max <= destination.max);

  const categoryFilter = (item) =>
    !category ||
    item?.category?.toLowerCase() === category.toLowerCase();

  const foundationDataFilter = (item) =>
    !item?.foundationDate ||
    (item.foundationDate.min >= foundationDate.min &&
      item.foundationDate.max <= foundationDate.max);

  const filteredCompanies = [...companies]
    .filter(keywordFilter)
    .filter(locationFilter)
    .filter(destinationFilter)
    .filter(categoryFilter)
    .filter(foundationDataFilter)
    .sort((a, b) => {
      if (sort === "des") return Number(a.id) - Number(b.id);
      if (sort === "asc") return Number(b.id) - Number(a.id);
      return 0;
    });

  const totalRecords = filteredCompanies.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedCompanies = filteredCompanies.slice(
    startIndex,
    endIndex
  );

  const content = paginatedCompanies.map((company) => (
    <div className="company-block-three" key={company.id}>
      <div className="inner-box">
        <div className="content">
          <div className="content-inner">
            <span className="company-logo">
              <Image
                width={50}
                height={50}
                src={company.img || "/images/resource/company-1.png"}
                alt={company.name || "Company logo"}
                unoptimized
              />
            </span>

            <Link href={`/company/${company.id}`}>
              <div className="company-card">
                <h4 className="mb-0">{company.name}</h4>
              </div>
            </Link>

            <ul className="job-info">
              <li>
                <span className="icon flaticon-map-locator"></span>{" "}
                {company.location || "Location not available"}
              </li>
              <li>
                <span className="icon flaticon-briefcase"></span>{" "}
                {company.jobType || "Company"}
              </li>
            </ul>
          </div>

          <ul className="job-other-info">
            {company.isFeatured && (
              <li className="privacy">Featured</li>
            )}
            <li className="time">
              Open Jobs – {company.openJobCount ?? company.jobNumber ?? 0}
            </li>
          </ul>
        </div>

        <div className="text">
          {company.jobDetails || "No company description available."}
        </div>

        {/* <button type="button" className="bookmark-btn">
          <span className="flaticon-bookmark"></span>
        </button> */}
      </div>
    </div>
  ));

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const perPageHandler = (e) => {
    dispatch(addPerPage(JSON.parse(e.target.value)));
    setCurrentPage(1);
  };

  const sortHandler = (e) => {
    dispatch(addSort(e.target.value));
    setCurrentPage(1);
  };

  const clearAll = () => {
    dispatch(addKeyword(""));
    dispatch(addLocation(""));
    dispatch(addDestination({ min: 0, max: 100 }));
    dispatch(addCategory(""));
    dispatch(addFoundationDate({ min: 1900, max: 2028 }));
    dispatch(addSort(""));
    dispatch(addPerPage({ start: 0, end: 10 }));
    setCurrentPage(1);
  };

  const hasFilters =
    keyword ||
    location ||
    destination.min !== 0 ||
    destination.max !== 100 ||
    category ||
    foundationDate.min !== 1900 ||
    foundationDate.max !== 2028 ||
    sort ||
    perPage.end !== 10;

  return (
    <>
      <div className="ls-switcher">
        <div className="showing-result">
          <div className="text">
            <strong>{totalRecords}</strong> companies
          </div>
        </div>

        <div className="sort-by">
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="btn btn-danger text-nowrap me-2"
              style={{
                minHeight: "45px",
                marginBottom: "15px"
              }}
            >
              <i className="flaticon-close"></i>
              <span className="d-none d-md-inline ms-1">Clear All</span>
            </button>
          )}

          <select
            value={sort}
            className="chosen-single form-select"
            onChange={sortHandler}
          >
            <option value="">Sort by (default)</option>
            <option value="asc">Newest</option>
            <option value="des">Oldest</option>
          </select>

          <select
            onChange={perPageHandler}
            className="chosen-single form-select ms-3"
            value={JSON.stringify(perPage)}
          >
            <option value={JSON.stringify({ start: 0, end: 10 })}>
              10 per page
            </option>
            <option value={JSON.stringify({ start: 0, end: 20 })}>
              20 per page
            </option>
            <option value={JSON.stringify({ start: 0, end: 24 })}>
              24 per page
            </option>
            <option value={JSON.stringify({ start: 0, end: 0 })}>
              All
            </option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          Loading companies...
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && !error && totalRecords === 0 && (
        <div className="text-center py-4">
          No companies found.
        </div>
      )}

      {!loading && !error && content}

      {!loading && !error && totalRecords > 0 && (
        <>
          <div className="text-center mt-3 mb-3">
            Showing {startIndex + 1} -{" "}
            {Math.min(endIndex, totalRecords)} of {totalRecords} companies
          </div>

          <Pagination
            currentPage={currentPage}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
};

export default FilterTopBox;
