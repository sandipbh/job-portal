"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {

    const handleLogout = async () => {

        await signOut({
            callbackUrl: "/login"
        });

    };

    return (
        <button
            type="button"
            onClick={handleLogout}
        >
            Sign Out
        </button>
    );
}