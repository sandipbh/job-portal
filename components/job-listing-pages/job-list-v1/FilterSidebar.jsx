
'use client'

import { useState } from "react";
import CallToActions from "../components/CallToActions";
import Categories from "../components/Categories";
import DatePosted from "../components/DatePosted";
import DestinationRangeSlider from "../components/DestinationRangeSlider";
import ExperienceLevel from "../components/ExperienceLevel";
import JobType from "../components/JobType";
import LocationBox from "../components/LocationBox";
import SalaryRangeSlider from "../components/SalaryRangeSlider";
import SearchBox from "../components/SearchBox";
import Tag from "../components/Tag";
import CompanyType from "../components/CompanyType";
import Skills from "../components/Skills";
import Education from "../components/Education";
import Industry from "../components/Industry";

const FilterSidebar = () => {
  return (

    <div className="inner-column">
      <div className="filters-outer">
        <button
          type="button"
          className="btn-close text-reset close-filters show-1023"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
        {/* End .close filter */}


        <div className="filter-block">
          <h4>Department</h4>
          <div className="form-group">
            <Categories />
          </div>
        </div>
        {/* <!-- Filter Block --> */}



        <div className="filter-block">
          <h4>Location</h4>
          <div className="form-group">
            <LocationBox />
          </div>
          {/* <p>Radius around selected destination</p>
          <DestinationRangeSlider /> */}
        </div>
        {/* <!-- Filter Block --> */}


        <div className="filter-block">
          <h4>Annual Salary (in lakhs)</h4>

          <SalaryRangeSlider />
        </div>
        {/* <!-- Filter Block --> */}

        <div className="switchbox-outer">
          <h4>Job type</h4>
          <JobType />
        </div>

        <div className="switchbox-outer">
          <h4>Company type</h4>
          <CompanyType />
        </div>
        {/* <!-- Switchbox Outer --> */}

        <div className="checkbox-outer">
          <h4>Skills</h4>
          <Skills />
        </div>


        <div className="checkbox-outer">
          <h4>Date Posted</h4>
          <DatePosted />
        </div>



        <div className="checkbox-outer">
          <h4>Education</h4>
          <Education />
        </div>

        <div className="switchbox-outer">
          <h4>Industry</h4>
          <Industry />
        </div>

        <div className="checkbox-outer">
          <h4>Experience Level</h4>
          <ExperienceLevel />
        </div>
        {/* <!-- Checkboxes Ouer --> */}


        <div className="filter-block">
          <h4>Search by Keywords</h4>
          <div className="form-group">
            <SearchBox />
          </div>
        </div>
        {/* <!-- Filter Block --> */}

        <div className="filter-block">
          <h4>Tags</h4>
          <Tag />
        </div>
        {/* <!-- Filter Block --> */}
      </div>
      {/* Filter Outer */}

      <CallToActions />
      {/* <!-- End Call To Action --> */}
    </div>
  );
};

export default FilterSidebar;
