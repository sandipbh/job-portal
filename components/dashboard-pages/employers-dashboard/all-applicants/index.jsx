import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import WidgetContentBox from "./components/WidgetContentBox";
import MenuToggler from "../../MenuToggler";

const index = () => (

  <section className="user-dashboard">
    <div className="dashboard-outer">
      <BreadCrumb title="All Applicants!" />

      <div className="row">
        <div className="col-lg-12">
          <div className="ls-widget">
            <div className="tabs-box">
              <div className="widget-title">
                <h4>Applicant</h4>
              </div>
              <WidgetContentBox />
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

);

export default index;
