"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileMenu from "../../../header/MobileMenu";
import DashboardHeader from "../../../header/DashboardHeader";
import LoginPopup from "../../../common/form/login/LoginPopup";
import DashboardEmployerSidebar from "../../../header/DashboardEmployerSidebar";
import BreadCrumb from "../../BreadCrumb";
import CopyrightFooter from "../../CopyrightFooter";
import PostJobSteps from "./components/PostJobSteps";
import MenuToggler from "../../MenuToggler";
import PostBoxForm from "./components/PostBoxForm";

const index = () => {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();


  return (

    <section className="user-dashboard">
      <div className="dashboard-outer">
        <BreadCrumb title="Post a Job" />
        {/* breadCrumb */}

        {/* <MenuToggler /> */}
        {/* Collapsible sidebar button */}

        <div className="row">
          <div className="col-lg-12">
            {/* <!-- Ls widget --> */}
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>Fill the job-post form</h4>
                </div>

                <div className="widget-content">
                  {/* <PostJobSteps /> */}
                  {/* End job steps form */}
                  <PostBoxForm activeTab={activeTab} setActiveTab={setActiveTab}></PostBoxForm>
                  {/* <Verification activeTab={activeTab} setActiveTab={setActiveTab} /> */}
                  {/* End post box form */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End .row */}
      </div>
      {/* End dashboard-outer */}
    </section>

  );
};

export default index;
