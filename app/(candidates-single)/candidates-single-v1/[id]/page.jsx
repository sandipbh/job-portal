

import LoginPopup from "@/components/common/form/login/LoginPopup";
import FooterDefault from "@/components/footer/common-footer";
import DefaulHeader from "@/components/header/DefaulHeader";
import MobileMenu from "@/components/header/MobileMenu";


import CandidateDetailsV2 from "@/components/candidates-single/CandidateDetailsV2";

export const metadata = {
  title:
    "Candidate Single Dyanmic V1 || Superio - Job Borad React NextJS Template",
  description: "Superio - Job Borad React NextJS Template",
};

const CandidateSingleDynamicV1 = ({ params }) => {

  //alert()

  const id = params?.id ?? 0;

  return (
    <>
      {/* <!-- Header Span --> */}
      <span className="header-span"></span>

      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader />
      {/* <!--End Main Header --> */}

      <MobileMenu />
      {/* End MobileMenu */}
      <CandidateDetailsV2 id={id} />
      {/* <!-- Job Detail Section --> */}

      {/* <!-- End Job Detail Section --> */}

      <FooterDefault footerStyle="alternate5" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default CandidateSingleDynamicV1;
