import BreadCrumb from "../../BreadCrumb";
import TopCardBlock from "./components/TopCardBlock";
import ProfileChart from "./components/ProfileChart";
import Notification from "./components/Notification";
import Applicants from "./components/Applicants";
import { cookies } from "next/headers";

const Index = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("regToken")?.value;
  let user = {};
  try {
    user = token ? JSON.parse(token) : {};
  } catch (err) {
    user = {};
  }

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="Dashboard" />
          <div className="row">
            <TopCardBlock />
          </div>
          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="graph-widget ls-widget">
                <ProfileChart />
              </div>
            </div>
            <div className="col-lg-12">
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Recent Applicants</h4>
                </div>
                <div className="widget-content">
                  <div className="row">
                    <Applicants />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
