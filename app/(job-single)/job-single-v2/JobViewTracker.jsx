
"use client";

import { useEffect, useRef } from "react";

export default function JobViewTracker({ jobPostId }) {
    const trackedJobId = useRef(null);

    useEffect(() => {
        const id = Number(jobPostId);
        if (!Number.isSafeInteger(id) || id <= 0 || trackedJobId.current === id) return;
        trackedJobId.current = id;

        const saveJobView = async () => {
            try {
                const response = await fetch("/api/candidate-view-job", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ jobPostId: id }),
                    cache: "no-store"
                });

                const responseText = await response.text();
                let result = {};

                try {
                    result = responseText ? JSON.parse(responseText) : {};
                } catch {
                    throw new Error(`Invalid API response. HTTP ${response.status}: ${responseText.substring(0, 500)}`);
                }

                if (!response.ok || result.success !== true) {
                    console.error("Candidate job view tracking failed:", {
                        status: response.status,
                        statusText: response.statusText,
                        response: result
                    });
                    return;
                }

                console.log("Candidate job view recorded:", result);
            } catch (error) {
                console.error("Candidate job view tracking error:", error);
            }
        };

        saveJobView();
    }, [jobPostId]);

    return null;
}
