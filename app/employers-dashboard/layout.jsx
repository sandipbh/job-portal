import DashboardHeader from "@/components/header/DashboardHeader";
import DashboardEmployerSidebar from "@/components/header/DashboardEmployerSidebar";
import MobileMenu from "@/components/header/MobileMenu";
import LoginPopup from "@/components/common/form/login/LoginPopup";
import CopyrightFooter from "@/components/dashboard-pages/CopyrightFooter";

export default function EmployerLayout({ children }) {
    return (
        <div className="page-wrapper dashboard">
            <span className="header-span"></span>

            <LoginPopup />

            <DashboardHeader />

            <MobileMenu />

            <DashboardEmployerSidebar />

            {children}

            <CopyrightFooter />
        </div>
    );
}