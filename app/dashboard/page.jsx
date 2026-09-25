import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";

export default async function Dashboard() {

    const session = await auth();

    if (!session) {
        return (
            <div>
                Please login
            </div>
        );
    }

    console.log("Google User:", session.user);

    return (
        <div>

            <h1>Google User Information</h1>

            <p>
                Google ID: {session.user.googleId}
            </p>

            <p>
                Name: {session.user.name}
            </p>

            <p>
                Email: {session.user.email}
            </p>

            <p>
                Email Verified: {String(session.user.emailVerified)}
            </p>

            {session.user.image && (
                <img
                    src={session.user.image}
                    alt={session.user.name}
                    width="100"
                    height="100"
                />
            )}

            <br />

            <LogoutButton />

        </div>
    );
}