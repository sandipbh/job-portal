import KycForm from "@/components/dashboard-pages/employers-dashboard/kyc-verification";

export const metadata = {
    title: "Employeers Dashboard || RatinGrow - Hiring Verified",
    description: "RatinGrow - Hiring Verified",
};

const index = () => {
    return (
        <>
            <KycForm />
        </>
    );
};

export default index;
