
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FooterDefault from "../../footer/common-footer";
import Breadcrumb from "../../common/Breadcrumb";
import LoginPopup from "../../common/form/login/LoginPopup";
import DefaulHeader2 from "../../header/DefaulHeader2";
import MobileMenu from "../../header/MobileMenu";

const FindJobsPage = ({ entry }) => {
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entry?.kind || !entry?.term) return;

    let active = true;
    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setError("");

        let body = {
          keywords: [],
          location: "",
          category: "",
          jobTitleKeyword: "",
          keywordKeyword: ""
        };

        // CATEGORY FILTER
        if (entry.kind === "category") {
          body.jobTitleKeyword = entry.term;
        }

        // DATABASE KEYWORD FILTER
        else if (entry.kind === "keyword") {
          body.keywordKeyword = entry.term;
        }

        // LOCATION FILTER
        else if (entry.kind === "location") {
          const lookup = await fetch("/api/public-location-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ term: entry.term }),
            cache: "no-store",
            signal: controller.signal
          });

          const lookupResult = await lookup.json();

          if (!lookup.ok) {
            throw new Error(lookupResult?.message || "Location lookup failed.");
          }

          const list = Array.isArray(lookupResult?.data)
            ? lookupResult.data
            : [];

          const normalize = value => String(value ?? "").trim().toLowerCase();
          const wanted = normalize(entry.term);

          const match =
            list.find(x => normalize(x.value) === wanted) ||
            list.find(x => normalize(x.value).includes(wanted));

          if (!match || match.key == null) {
            if (active) {
              setNotFound(true);
              setLoading(false);
            }
            return;
          }

          body.location = String(match.key);
        }

        console.log("FINAL SEARCH FILTER:", body);

        // CREATE ENCRYPTED SEARCH TOKEN
        const response = await fetch("/api/job-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body),
          cache: "no-store",
          signal: controller.signal
        });

        const result = await response.json();

        if (!response.ok || !result?.token) {
          throw new Error(result?.message || "Could not prepare your search.");
        }

        if (active) {
          router.replace(
            `/job-list-v1?${new URLSearchParams({
              search: result.token
            })}`
          );
        }
      } catch (e) {
        if (active && e.name !== "AbortError") {
          setError(e.message || "Could not load jobs.");
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
      controller.abort();
    };
  }, [entry?.kind, entry?.term, router]);

  return (
    <>
      <span className="header-span"></span>
      <LoginPopup />
      <DefaulHeader2 />
      <MobileMenu />
      <Breadcrumb title={entry.name} meta="Find Jobs" />

      <section className="ls-section">
        <div className="auto-container text-center">
          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : notFound ? (
            <p>
              No jobs found for "{entry.name}" right now.{" "}
              <Link href="/job-list-v1">Browse all jobs</Link>
            </p>
          ) : loading ? (
            <p>Loading {entry.name}...</p>
          ) : null}
        </div>
      </section>

      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default FindJobsPage;
