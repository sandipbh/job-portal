'use client'
import Link from "next/link";
import jobs from "../../../../../data/job-featured.js";
import Image from "next/image.js";
import { useState, useEffect } from "react";

const JobListingsTable = () => {


  const [jobList, setJobList] = useState([]);

  useEffect(() => {
    getJobList();
  }, []);

  const getJobList = async () => {
    try {
      const response = await fetch("/api/emp-job-post-list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      const listData = result?.data;
      console.log('listData  ', listData)

      if (listData) {

        setJobList(listData);

      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };



  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Job Listings </h4>

        <div className="chosen-outer">
          {/* <!--Tabs Box--> */}
          <select className="chosen-single form-select">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Last 16 Months</option>
            <option>Last 24 Months</option>
            <option>Last 5 year</option>
          </select>
        </div>
      </div>
      {/* End filter top bar */}

      {/* Start table widget content */}
      <div className="widget-content">
        <div className="table-outer">
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Applications</th>
                <th>Created & Expired</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {jobList.map((item) => (
                <tr key={item.id}>
                  <td>
                    {/* <!-- Job Block --> */}
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content">
                          <span className="company-logo">
                            <Image
                              width={50}
                              height={49}
                              src={item.logo}
                              alt="logo"
                            />
                          </span>
                          <h4>
                            <Link href={`/job-single-v3/${item.id}`}>
                              {item.jobTitle}
                            </Link>
                          </h4>
                          <ul className="job-info">
                            <li>
                              <span className="icon flaticon-briefcase"></span>
                              {item.company}
                            </li>
                            <li>
                              <span className="icon flaticon-map-locator"></span>
                              {item.location}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="applied">
                    <a href="#">{item.applyCount} Applied</a>
                  </td>
                  <td>
                    {formatDate(item.created_at)} <br />
                    {formatDate(item.expire_at)}
                  </td>
                  <td className="status">{item.status} </td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li>
                          <button data-text="View Aplication">
                            <span className="la la-eye"></span>
                          </button>
                        </li>
                        <li>
                          <Link
                            href={`/employers-dashboard/post-jobs?jobid=${item.id}`}
                          >
                            <button data-text="Edit Job">
                              <span className="la la-pencil"></span>
                            </button>
                          </Link>

                        </li>
                        <li>
                          <button data-text="Delete Aplication">
                            <span className="la la-trash"></span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* End table widget content */}
    </div>
  );
};

export default JobListingsTable;
