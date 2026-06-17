import React from "react";

import Home from "@/components/home";

export const metadata = {
  title: "Home || {process.env.NEXT_PUBLIC_APP_NAME} - Job Borad",
  description: "{process.env.NEXT_PUBLIC_APP_NAME} - Job Borad",
};

const index = () => {
  return (
    <>
      <Home />
    </>
  );
};

export default index;
