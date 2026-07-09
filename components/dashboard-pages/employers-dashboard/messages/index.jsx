
'use client'
import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import ChatBox from "./components";
import MenuToggler from "../../MenuToggler";
import { useSelector } from "react-redux";

const Index = () => {
  const { chatSidebar } = useSelector((state) => state.toggle);
  return (

    <section className="user-dashboard">
      <div className="dashboard-outer">
        <BreadCrumb title="Messages!" />
        {/* breadCrumb */}

        {/* <MenuToggler /> */}
        {/* Collapsible sidebar button */}

        <div className="row">
          <div
            className={`col-lg-12 ${chatSidebar ? "active-chat-contacts" : ""
              }`}
          >
            <div className="chat-widget">
              <div className="widget-content">
                <ChatBox />
              </div>
            </div>
            {/* <!-- Chat Widget --> */}
          </div>
        </div>
        {/* End row */}
      </div>
      {/* End dashboard-outer */}
    </section>

  );
};

export default Index;
