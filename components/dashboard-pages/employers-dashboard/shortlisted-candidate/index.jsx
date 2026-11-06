import BreadCrumb from "../../BreadCrumb";
import WidgetContentBox from "./components/WidgetContentBox";

const index = () => {
    return (
        <section className="user-dashboard">
            <div className="dashboard-outer">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="applicants-widget ls-widget">
                            <div className="widget-title">
                                <h4>Shortlisted Candidate</h4>
                            </div>
                            <WidgetContentBox />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default index;
