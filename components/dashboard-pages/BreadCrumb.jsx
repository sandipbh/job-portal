
import MenuToggler from "@/components/dashboard-pages/MenuToggler";
const BreadCrumb = ({ title = "" }) => {



  return (
    <div className="upper-title-box">
      <div className="d-flex justify-content-between">
        <h3>{title}</h3>
        <MenuToggler />
      </div>
      {/* <div className="text">Ready to jump back in?</div> */}
    </div>
  );
};

export default BreadCrumb;
