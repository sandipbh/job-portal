import MobileMenu from "../../../header/MobileMenu";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import Resume from "./components";
import DashboardCandidatesHeader from "../../../header/DashboardCandidatesHeader";
import MenuToggler from "../../MenuToggler";

const index = () => {
  return (

    <section className="user-dashboard">
      <div className="dashboard-outer">
        <BreadCrumb title="My Resume!" />
        {/* breadCrumb */}

        {/* <MenuToggler /> */}
        {/* Collapsible sidebar button */}

        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>My Profile</h4>
                </div>
                {/* End widget-title */}

                <div className="widget-content">
                  <Resume />
                </div>
                {/* End widget-content */}
              </div>
            </div>
            {/* End ls-widget */}
          </div>
        </div>
        {/* End .row */}
      </div>
      {/* End dashboard-outer */}
    </section>

  );
};

export default index;
