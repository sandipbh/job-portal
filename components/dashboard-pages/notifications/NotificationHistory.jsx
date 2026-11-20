
"use client";

import { useCallback, useEffect, useState } from "react";
import BreadCrumb from "../BreadCrumb";

const getRecords = (payload) => {
    const records = payload?.data ?? payload?.Data ?? payload?.notifications ?? payload?.Notifications ?? payload?.items ?? [];
    return Array.isArray(records) ? records : [];
};

const formatDate = (value) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
};

const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }).format(date);
};

const getDateKey = (value) => {
    if (!value) return "undated";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "undated";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getNotificationIcon = (notification) => {
    if (notification.notificationType === "GLOBAL") return "la-bullhorn";
    switch (notification.status) {
        case "Applied": return "la-paper-plane";
        case "Shortlisted": return "la-star";
        case "Interview": return "la-calendar-check";
        case "Reschedule": return "la-calendar-alt";
        case "Selected Candidate": return "la-trophy";
        case "Offer": return "la-file-alt";
        case "Offer Accept": return "la-check-circle";
        case "Joined": return "la-user-check";
        case "Rejected After Interview": return "la-info-circle";
        default: return "la-bell";
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case "Applied": return "notification-status-applied";
        case "Shortlisted": return "notification-status-shortlisted";
        case "Interview":
        case "Reschedule": return "notification-status-interview";
        case "Selected Candidate":
        case "Offer":
        case "Offer Accept":
        case "Joined": return "notification-status-success";
        case "Rejected After Interview": return "notification-status-rejected";
        default: return "notification-status-default";
    }
};

const NotificationHistory = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = useCallback(async (isRefresh = false) => {
        try {
            setError("");
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const response = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
                cache: "no-store"
            });

            const payload = await response.json();

            if (!response.ok || payload?.isSuccess === false || payload?.IsSuccess === false) {
                throw new Error(payload?.message || payload?.Message || "Unable to load notifications.");
            }

            const records = getRecords(payload).map((item, index) => {
                const createDate = item.createDate ?? item.CreateDate ?? item.tdate ?? item.TDATE;
                const status = item.status ?? item.Status ?? null;
                const notificationType = (item.notificationType ?? item.NotificationType ?? "APPLICATION").toUpperCase();

                return {
                    notificationId: item.notificationId ?? item.NotificationId ?? item.srno ?? item.SRNO ?? `notification-${index}`,
                    createDate,
                    notificationType,
                    title: item.title ?? item.Title ?? (status ? `${status} Update` : "Notification"),
                    details: item.details ?? item.Details ?? item.description ?? item.Description ?? "",
                    status,
                    applicationId: item.applicationId ?? item.ApplicationId ?? item.APPLICATION_ID ?? null,
                    jobPostId: item.jobPostId ?? item.JobPostId ?? item.JOB_POST_ID ?? null,
                    employerUqId: item.employerUqId ?? item.EmployerUqId ?? item.UQ_ID_EMP ?? null
                };
            });

            records.sort((a, b) => new Date(b.createDate || 0) - new Date(a.createDate || 0));
            setNotifications(records);
        } catch (fetchError) {
            setError(fetchError.message || "Unable to load notifications.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const groupedNotifications = notifications.reduce((groups, notification) => {
        const key = getDateKey(notification.createDate);
        if (!groups[key]) {
            groups[key] = {
                dateKey: key,
                dateLabel: formatDate(notification.createDate),
                items: []
            };
        }
        groups[key].items.push(notification);
        return groups;
    }, {});

    return (
        <section className="user-dashboard notification-history-page">
            <div className="dashboard-outer">
                <BreadCrumb title="Notifications" />

                <div className="row">
                    <div className="col-lg-12">
                        <div className="ls-widget notification-widget">
                            <div className="widget-title notification-header">
                                <div>
                                    <h4>Notification History</h4>
                                    <p className="notification-subtitle">
                                        Stay updated with your applications, interviews and platform announcements.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="notification-refresh-button"
                                    onClick={() => loadNotifications(true)}
                                    disabled={refreshing || loading}
                                >
                                    <i className={`la la-refresh ${refreshing ? "notification-spin" : ""}`}></i>
                                    {refreshing ? "Refreshing..." : "Refresh"}
                                </button>
                            </div>

                            <div className="widget-content notification-content">
                                {loading ? (
                                    <div className="notification-state-box">
                                        <span className="notification-loader"></span>
                                        <p>Loading your notifications...</p>
                                    </div>
                                ) : error ? (
                                    <div className="notification-error-box">
                                        <i className="la la-exclamation-circle"></i>
                                        <p>{error}</p>
                                        <button type="button" onClick={() => loadNotifications()}>
                                            Try Again
                                        </button>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="notification-empty-box">
                                        <div className="notification-empty-icon">
                                            <i className="la la-bell-slash"></i>
                                        </div>
                                        <h5>No notifications yet</h5>
                                        <p>
                                            You are all caught up. New application updates and announcements will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="notification-groups">
                                        {Object.values(groupedNotifications).map((group) => (
                                            <section className="notification-date-group" key={group.dateKey}>
                                                <div className="notification-date-heading">
                                                    <span>{group.dateLabel}</span>
                                                    <span className="notification-date-line"></span>
                                                </div>

                                                <div className="notification-list">
                                                    {group.items.map((notification, index) => {
                                                        const isGlobal = notification.notificationType === "GLOBAL";
                                                        const key = `${notification.notificationType}-${notification.notificationId || "NA"}-${group.dateKey}-${index}`;

                                                        return (

                                                            <article className="notification-card" key={key}>
                                                                <div className={`notification-icon-box ${isGlobal ? "notification-global-icon" : "notification-personal-icon"}`}>
                                                                    <i className={`la ${getNotificationIcon(notification)}`}></i>
                                                                </div>
                                                                <div className="notification-body">
                                                                    <div className="notification-card-top">
                                                                        <div className="d-flex gap-2 align-items-center">
                                                                            <h5>{notification.title}</h5>
                                                                            {notification.status && (
                                                                                <span className={`notification-status-badge ${getStatusClass(notification.status)}`}>
                                                                                    {notification.status}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {/* <span className="notification-time">{formatTime(notification.createDate)}</span> */}
                                                                        <span className="notification-date">{formatDate(notification.createDate)}</span>
                                                                    </div>
                                                                    {notification.details && (
                                                                        <p className="notification-description">{notification.details}</p>
                                                                    )}
                                                                </div>
                                                            </article>

                                                        );
                                                    })}
                                                </div>
                                            </section>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NotificationHistory;
