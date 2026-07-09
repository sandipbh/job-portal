import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import Form from "./components/Form";
import MenuToggler from "../../MenuToggler";

const index = () => {
  return (


    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <BreadCrumb title="Change Password!" />
          {/* breadCrumb */}

          {/* Collapsible sidebar button */}
        </div>


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
