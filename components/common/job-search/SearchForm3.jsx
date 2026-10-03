'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SearchForm3 = () => {
  const router = useRouter();
  const keywordInputRef = useRef(null);

  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [location, setLocation] = useState("");
  const [locationKey, setLocationKey] = useState("");
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryTerm, setCategoryTerm] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [showLocationList, setShowLocationList] = useState(false);
  const [keywordList, setKeywordList] = useState([]);
  const [showKeywordList, setShowKeywordList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addKeywordTag = (item) => {
    if (item?.key == null || !item?.value) return;

    const alreadySelected = keywords.some(
      (keywordItem) =>
        String(keywordItem.key) === String(item.key) &&
        keywordItem.type === item.type
    );

    if (!alreadySelected) {
      setKeywords([...keywords, item]);
    }
    setKeyword("");
    setKeywordList([]);
    keywordInputRef.current?.focus();
  };

  const removeKeywordTag = (selectedItem) => {
    setKeywords(keywords.filter((item) => item !== selectedItem));
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
    } else if (e.key === "Backspace" && !keyword && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1));
    }
  };

  // auto-dismiss the validation alert, like a bootstrap alert timeout
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  // debounce category suggestions while typing
  useEffect(() => {
    if (!categoryTerm) {
      setCategoryList([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch("/api/public-industry-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ term: categoryTerm }),
        });

        const result = await response.json();
        console.log(JSON.stringify(result));
        setCategoryList(result?.data || []);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [categoryTerm]);

  // debounce location suggestions while typing
  useEffect(() => {
    if (!location) {
      setLocationList([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch("/api/public-location-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ term: location }),
        });

        const result = await response.json();
        console.log(JSON.stringify(result));
        setLocationList(result?.data || []);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [location]);

  // debounce keyword suggestions while typing
  useEffect(() => {
    if (!keyword) {
      setKeywordList([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch("/api/public-keyword-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ term: keyword }),
        });

        const result = await response.json();
        console.log(JSON.stringify(result));
        setKeywordList(result?.data || []);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (keywords.length === 0 && !locationKey && !category) {
      setError("Please select a keyword, location, or category from the suggestions to search.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/job-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          location: locationKey,
          category,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result?.token) {
        throw new Error(result?.message || "Could not prepare your search.");
      }

      const params = new URLSearchParams({ search: result.token });
      router.push(`/job-list-v1?${params.toString()}`);
    } catch (error) {
      setError(error.message || "Could not prepare your search.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="search-form-wrap">
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show search-form-alert"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}
      <div className="row">
        {/* <!-- Form Group --> */}
        <div className="form-group col-lg-4 col-md-12 col-sm-12">
          <span className="icon flaticon-search-1"></span>
          <div className="keyword-tags-input">
            {keywords.map((tag) => (
              <span
                className="keyword-tag"
                key={`${tag.type}-${tag.key}`}
              >
                {tag.value}
                <i
                  className="fa fa-times"
                  onClick={() => removeKeywordTag(tag)}
                ></i>
              </span>
            ))}
            <input
              ref={keywordInputRef}
              type="text"
              name="keyword"
              placeholder={
                keywords.length ? "" : "Job title, keywords, or company"
              }
              value={keyword}
              autoComplete="off"
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onFocus={() => setShowKeywordList(true)}
              onBlur={() => setTimeout(() => setShowKeywordList(false), 200)}
            />
          </div>
          {showKeywordList && keywordList.length > 0 && (
            <ul className="ui-autocomplete keyword-autocomplete">
              {keywordList.map((item, i) => (
                <li
                  key={`${item.key ?? "kw"}-${i}`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    addKeywordTag(item);
                  }}
                >
                  {item.value}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* <!-- Form Group --> */}
        <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
          <span className="icon flaticon-map-locator"></span>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={location}
            autoComplete="off"
            onChange={(e) => {
              setLocation(e.target.value);
              setLocationKey("");
            }}
            onFocus={() => setShowLocationList(true)}
            onBlur={() => setTimeout(() => setShowLocationList(false), 200)}
          />
          {showLocationList && locationList.length > 0 && (
            <ul className="ui-autocomplete">
              {locationList.map((item, i) => (
                <li
                  key={`${item.key ?? "loc"}-${i}`}
                  onMouseDown={() => {
                    setLocation(item.value);
                    setLocationKey(item.key);
                    setShowLocationList(false);
                  }}
                >
                  {item.value}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* <!-- Form Group --> */}
        <div className="form-group col-lg-3 col-md-12 col-sm-12 category">
          <span className="icon flaticon-briefcase"></span>
          <input
            type="text"
            name="category"
            placeholder="All Categories"
            value={categoryInput}
            autoComplete="off"
            onChange={(e) => {
              setCategoryInput(e.target.value);
              setCategoryTerm(e.target.value);
              setCategory("");
              setShowCategoryList(true);
            }}
            onFocus={() => setShowCategoryList(true)}
            onBlur={() => setTimeout(() => setShowCategoryList(false), 200)}
          />
          {showCategoryList && categoryList.length > 0 && (
            <ul className="ui-autocomplete">
              {categoryList.map((item, i) => (
                <li
                  key={`${item.key ?? "cat"}-${i}`}
                  onMouseDown={() => {
                    setCategory(item.key);
                    setCategoryInput(item.value);
                    setCategoryTerm("");
                    setCategoryList([]);
                    setShowCategoryList(false);
                  }}
                >
                  {item.value}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* <!-- Form Group --> */}
        <div className="form-group col-lg-2 col-md-12 col-sm-12 text-right">
          <button
            type="submit"
            className="theme-btn btn-style-one"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Searching..." : "Find Jobs"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm3;
