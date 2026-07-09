import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import MenuToggler from "../../MenuToggler";
import SearchFilterBox from "./components/SearchFilterBox";

const index = () => {
    return (

        <section className="user-dashboard">
            <div className="dashboard-outer">
                <BreadCrumb title="Search Filters!" />
                {/* breadCrumb */}

                <MenuToggler />
                {/* Collapsible sidebar button */}

                <div className="row">
                    <div className="col-lg-12">
                        <div className="applicants-widget ls-widget">
                            <div className="widget-title">
                                <h4>Search Candidates will appear here</h4>
                                {/* <WidgetToFilterBox /> */}
                            </div>
                            {/* End widget top filter box */}
                            <SearchFilterBox />
                        </div>
                        {/* <!-- applicants Widget --> */}
                    </div>
                </div>
                {/* End .row */}
            </div>
            {/* End dashboard-outer */}
        </section>

    );
};

export default index;
