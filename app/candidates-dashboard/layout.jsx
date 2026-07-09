import MobileMenu from "@/components/header/MobileMenu";
import DashboardCandidatesHeader from "@/components/header/DashboardCandidatesHeader";
import DashboardCandidatesSidebar from "@/components/header/DashboardCandidatesSidebar";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import CopyrightFooter from "@/components/dashboard-pages/CopyrightFooter";

export default function CandidateDashboardLayout({ children }) {
    return (
        <div className="page-wrapper dashboard">
            <span className="header-span"></span>

            {/* Login Popup */}
            <LoginPopup />

            {/* Header */}
            <DashboardCandidatesHeader />

            {/* Mobile Menu */}
            <MobileMenu />

            {/* Sidebar */}
            <DashboardCandidatesSidebar />

            {/* Page Content */}
            {children}

            {/* Footer */}
            <CopyrightFooter />
        </div>
    );
}