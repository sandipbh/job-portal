import BreadCrumb from "../../BreadCrumb";
import PackageDataTable from "./components/PackageDataTable";

const index = () => {
  return (

    <section className="user-dashboard">
      <div className="dashboard-outer">
        <BreadCrumb title="Packages!" />
        <div className="row">
          <div className="col-lg-12">
            <div className="ls-widget">
              <div className="tabs-box">
                <div className="widget-title">
                  <h4>My Packages</h4>
                </div>
                <div className="widget-content">
                  <div className="table-outer">
                    <PackageDataTable />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export default index;
