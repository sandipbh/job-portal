'use client'

import FormContent2 from "./FormContent2";
import MobileMenu from "@/components/header/MobileMenu";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import LoginWithSocial from "./LoginWithSocial";
import Link from "next/link";
import Header from "../../reg-confirm/Header";


export default function RegistrationConfirmation() {
  // Replace with dynamic user data from your auth/session
  const userName = "Alex Johnson";
  const userEmail = "alex.johnson@example.com";

  return (
    <div className="form-inner">
      <h3>Create a Free {process.env.NEXT_PUBLIC_APP_NAME} Account</h3>

      <Tabs>
        <div className="form-group register-dual">
          <TabList className="btn-box row">
            <Tab className="col-lg-6 col-md-12">
              <button className="theme-btn btn-style-four">
                <i className="la la-user"></i> Candidate
              </button>
            </Tab>

            <Tab className="col-lg-6 col-md-12">
              <button className="theme-btn btn-style-four">
                <i className="la la-briefcase"></i> Employer
              </button>
            </Tab>
          </TabList>
        </div>
        {/* End .form-group */}

        <TabPanel>
          <FormContent2 />
        </TabPanel>
        {/* End cadidates Form */}

        <TabPanel>
          <FormContent2 />
        </TabPanel>
        {/* End Employer Form */}
      </Tabs>
      {/* End form-group */}

      <div className="bottom-box">
        <div className="text">
          Already have an account?{" "}
          <Link href="/login" className="call-modal login">
            LogIn
          </Link>
        </div>
        <div className="divider">
          <span>or</span>
        </div>
        <LoginWithSocial />
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
}