
import BreadCrumb from "../../BreadCrumb";
import WidgetContentBox from "./components/WidgetContentBox";

const index = () => {
    return (

        <section className="user-dashboard">
            <div className="dashboard-outer">
                <BreadCrumb title="Saved Candidate!" />
                {/* breadCrumb */}

                {/* <MenuToggler /> */}
                {/* Collapsible sidebar button */}

                <div className="row">
                    <div className="col-lg-12">
                        <div className="applicants-widget ls-widget">
                            <div className="widget-title">
                                <h4>Saved Candidate</h4>
                                {/* <WidgetToFilterBox /> */}
                            </div>
                            {/* End widget top filter box */}
                            <WidgetContentBox />
                        </div>
                        {/* <!-- applicants Widget --> */}
                    </div>
                </div>
                {/* End .row */}
            </div>
            {/* End dashboard-outer */}
        </section>

    );
};

export default index;
