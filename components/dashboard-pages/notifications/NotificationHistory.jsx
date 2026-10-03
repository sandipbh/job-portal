"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "../BreadCrumb";

const getRecords = (payload) => {
    if (Array.isArray(payload)) return payload;

    const records =
        payload?.data ??
        payload?.Data ??
        payload?.notifications ??
        payload?.Notifications ??
        payload?.items ??
        payload?.result;

    if (Array.isArray(records)) return records;
    if (records && typeof records === "object") return getRecords(records);
    return [];
};

const getDate = (notification) =>
    notification?.createDate ??
    notification?.CreateDate ??
    notification?.createdAt ??
    notification?.CreatedAt ??
    notification?.notificationDate ??
    notification?.NotificationDate ??
    notification?.date ??
    notification?.Date ??
    null;

const NotificationHistory = ({ role }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await fetch(`/api/notifications?role=${role}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                    cache: "no-store",
                });
                const payload = await response.json();

                console.log("Payload:", payload);

                if (!response.ok) {
                    throw new Error(payload?.message || "Unable to load notifications.");
                }

                const grouped = new Map();
                getRecords(payload).forEach((notification) => {
                    const rawDate = getDate(notification);
                    const parsedDate = rawDate ? new Date(rawDate) : null;
                    const validDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
                    const dateKey = validDate ? validDate.toISOString().slice(0, 10) : "undated";
                    const dateLabel = validDate
                        ? new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(validDate)
                        : "Date unavailable";

                    if (!grouped.has(dateKey)) grouped.set(dateKey, { dateKey, dateLabel, items: [] });
                    grouped.get(dateKey).items.push(notification);
                });

                setGroups(
                    [...grouped.values()].sort((first, second) => second.dateKey.localeCompare(first.dateKey))
                );
            } catch (fetchError) {
                setError(fetchError.message || "Unable to load notifications.");
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [role]);

    return (
        <section className="user-dashboard">
            <div className="dashboard-outer">
                <BreadCrumb title="Notifications" />
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ls-widget">
                            <div className="widget-title">
                                <h4>Notification History</h4>
                            </div>
                            <div className="widget-content">
                                {loading ? (
                                    <p role="status">Loading notifications...</p>
                                ) : error ? (
                                    <p role="alert">{error}</p>
                                ) : groups.length === 0 ? (
                                    <p>No notifications yet.</p>
                                ) : (
                                    groups.map((group) => (
                                        <section className="mb-2" key={group.dateKey}>
                                            <ul className="notification-list">
                                                {group.items.map((notification, index) => (
                                                    <li key={notification.srno ?? notification.Srno ?? notification.id ?? notification.Id ?? `${group.dateKey}-${index}`}>
                                                        <span className="icon la la-bell" aria-hidden="true"></span>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <strong>
                                                                {notification.title ?? notification.Title ?? notification.type ?? notification.Type ?? "Notification"}
                                                            </strong>
                                                            <span className="mb-1">{group.dateLabel}</span>
                                                        </div>
                                                        {notification.details ?? notification.Details ?? notification.message ?? notification.Message ?? notification.description ?? notification.Description ?? ""}
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    ))
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