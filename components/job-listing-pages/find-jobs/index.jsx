"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FooterDefault from "../../footer/common-footer";
import Breadcrumb from "../../common/Breadcrumb";
import LoginPopup from "../../common/form/login/LoginPopup";
import DefaulHeader2 from "../../header/DefaulHeader2";
import MobileMenu from "../../header/MobileMenu";

const SEARCH_APIS = {
  category: "/api/public-industry-search",
  keyword: "/api/public-keyword-search",
  location: "/api/public-location-search",
};

const FindJobsPage = ({ entry }) => {
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const lookup = await fetch(SEARCH_APIS[entry.kind], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ term: entry.term }),
        });
        const lookupResult = await lookup.json();
        const list = Array.isArray(lookupResult?.data) ? lookupResult.data : [];
        const wanted = entry.term.toLowerCase();
        const match =
          list.find((x) => String(x?.value ?? "").toLowerCase() === wanted) ||
          list.find((x) => String(x?.value ?? "").toLowerCase().includes(wanted));

        if (!match || match.key == null) {
          if (active) setNotFound(true);
          return;
        }

        const body = { keywords: [], location: "", category: "" };
        if (entry.kind === "category") body.category = match.key;
        else if (entry.kind === "location") body.location = match.key;
        else body.keywords = [match];

        const response = await fetch("/api/job-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await response.json();
        if (!response.ok || !result?.token) {
          throw new Error(result?.message || "Could not prepare your search.");
        }

        if (active) {
          router.replace(
            `/job-list-v1?${new URLSearchParams({ search: result.token })}`
          );
        }
      } catch (e) {
        if (active) setError(e.message || "Could not load jobs.");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [entry, router]);

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
              No jobs found for “{entry.name}” right now.{" "}
              <Link href="/job-list-v1">Browse all jobs</Link>
            </p>
          ) : (
            <p>Loading {entry.name}...</p>
          )}
        </div>
      </section>

      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default FindJobsPage;
