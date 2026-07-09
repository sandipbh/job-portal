import MobileMenu from "../../../header/MobileMenu";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import CvUploader from "./components/CvUploader";
import DashboardCandidatesHeader from "../../../header/DashboardCandidatesHeader";
import MenuToggler from "../../MenuToggler";

const index = () => {
  return (

    <section className="user-dashboard">
      <div className="dashboard-outer">
        <BreadCrumb title="CV Manager!" />
        {/* breadCrumb */}

        {/* <MenuToggler /> */}
        {/* Collapsible sidebar button */}

        <div className="row">
          <div className="col-lg-12">
            {/* <!-- Ls widget --> */}
            <div className="cv-manager-widget ls-widget">
              <div className="widget-title">
                <h4>Cv Manager</h4>
              </div>
              {/* End widget-title */}
              <div className="widget-content">
                <CvUploader />
              </div>
              {/* End widget-content */}
            </div>
            {/* End Ls widget */}
          </div>
          {/* End .col */}
        </div>
        {/* End .row */}
      </div>
      {/* End dashboard-outer */}
    </section>

  );
};

export default index;
