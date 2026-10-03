import NotificationHistory from "@/components/dashboard-pages/notifications/NotificationHistory";

export const metadata = {
    title: "Notifications || RatinGrow - Hiring Verified",
    description: "Notification history",
};

export default function CandidateNotificationsPage() {
    return <NotificationHistory role="candidate" />;
}