import BreadCrumb from "../../BreadCrumb";
import InterviewList from "./components/interview-list";

const index = () => {
    return (
        <section className="user-dashboard">
            <div className="dashboard-outer">
                <BreadCrumb title="Interview Schedule!" />
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ls-widget">
                            <InterviewList />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default index;
