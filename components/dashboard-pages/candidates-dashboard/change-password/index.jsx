import MobileMenu from "../../../header/MobileMenu";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardCandidatesSidebar from "../../../header/DashboardCandidatesSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import Form from "./components/Form";
import DashboardCandidatesHeader from "../../../header/DashboardCandidatesHeader";
import MenuToggler from "../../MenuToggler";

const index = () => {
  return (

    <section className="user-dashboard">
      <div className="dashboard-outer">
        <BreadCrumb title="Change Password!" />
        {/* breadCrumb */}

        {/* <MenuToggler /> */}
        {/* Collapsible sidebar button */}

        <div className="ls-widget">

          <div className="widget-content">
            <Form />
          </div>
        </div>
        {/* <!-- Ls widget --> */}
      </div>
      {/* End dashboard-outer */}
    </section>

  );
};

export default index;
