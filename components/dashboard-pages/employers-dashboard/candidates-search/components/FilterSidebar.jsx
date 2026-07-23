import Categories from "@/components/candidates-listing-pages/components/CandidatesGender";
import DestinationRangeSlider from "@/components/candidates-listing-pages/components/DestinationRangeSlider";
import CandidatesGender from "@/components/candidates-listing-pages/components/CandidatesGender";
import LocationBox from "@/components/candidates-listing-pages/components/LocationBox";
import SearchBox from "@/components/candidates-listing-pages/components/SearchBox";
import DatePosted from "@/components/candidates-listing-pages/components/DatePosted";
import Experience from "@/components/candidates-listing-pages/components/Experience";
import Qualification from "@/components/candidates-listing-pages/components/Qualification";
import Skills from "@/components/candidates-listing-pages/components/Skills";
import ExperienceLevel from "@/components/candidates-listing-pages/components/ExperienceLevel";
import Industry from "@/components/candidates-listing-pages/components/Industry";
import Education from "@/components/candidates-listing-pages/components/Education";

const FilterSidebar = () => {
    return (
        <div className="inner-column pe-0 candidate-filter-sidebar">
            <div className="filters-outer">
                {/* <button
                    type="button"
                    className="btn-close text-reset close-filters show-1023"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button> */}
                {/* End .close filter */}

                <div className="filter-block">
                    <h4>Search by Keywords</h4>
                    <div className="form-group">
                        <SearchBox />
                    </div>
                </div>

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
                    <h4>Category</h4>
                    <div className="form-group">
                        <Categories />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="filter-block">
                    <h4>Candidate Gender</h4>
                    <div className="form-group">
                        <CandidatesGender />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="checkbox-outer">
                    <h4>Date Posted</h4>
                    <DatePosted />
                </div>
                {/* <!-- Filter Block --> */}

                <div className="checkbox-outer">
                    <h4>Experience</h4>
                    <Experience />
                </div>
                {/* <!-- Filter Block --> */}
                <div className="checkbox-outer">
                    <h4>Skills</h4>
                    <Skills />
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

                <div className=" checkbox-outer">
                    <h4>Qualification</h4>
                    <Qualification />
                </div>
                {/* <!-- Filter Block --> */}
            </div>
            {/* Filter Outer */}
        </div>
    );
};

export default FilterSidebar;
