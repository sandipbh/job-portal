
'use client'

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import LoginWithSocial from "./LoginWithSocial";
import FormContent2 from "./FormContent2";
import Link from "next/link";

const Register2 = () => {
  return (
    <div className="form-inner">
      <h3>Create a Free {process.env.NEXT_PUBLIC_APP_NAME} Account  </h3>

      <div>
        <FormContent2 />
      </div>
      {/* End form-group */}


    </div>
  );
};

export default Register2;
