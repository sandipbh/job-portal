import ForgetPassword from "../../common/form/login/ForgetPassword";
import MobileMenu from "../../header/MobileMenu";
import Header from "./Header";

const index = () => {
  return (
    <>
      <Header />
      {/* <!--End Main Header -->  */}

      <MobileMenu />
      {/* End MobileMenu */}

      <div className="login-section">
        <div
          className="image-layer"
          style={{ backgroundImage: "url(/images/background/12.jpg)" }}
        ></div>
        <div className="outer-box">
          {/* <!-- Login Form --> */}
          <div className="login-form default-form"  style={{ minHeight: "50vh" }}> 
            <ForgetPassword /> 
          </div>
          {/* <!--End Login Form --> */}
        </div>
      </div>
      {/* <!-- End Info Section --> */}
    </>
  );
};

export default index;
