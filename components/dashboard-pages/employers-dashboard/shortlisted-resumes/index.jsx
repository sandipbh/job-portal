import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import WidgetToFilterBox from "./components/WidgetToFilterBox";
import WidgetContentBox from "./components/WidgetContentBox";
import MenuToggler from "../../MenuToggler";

const index = () => {
  return (

    <section className="user-dashboard">
      <div className="dashboard-outer">
        <BreadCrumb title="Shortlisted Resumes!" />
        {/* breadCrumb */}

        {/* <MenuToggler /> */}
        {/* Collapsible sidebar button */}

        <div className="row">
          <div className="col-lg-12">
            <div className="applicants-widget ls-widget">
              <div className="widget-title">
                <h4>Shorlist Resumes</h4>
                {/* <WidgetToFilterBox /> */}
              </div>
              {/* End widget top filter box */}
              <WidgetContentBox />
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
