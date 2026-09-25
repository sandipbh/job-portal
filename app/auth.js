import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import { headers } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({

    providers: [

        // =====================================================
        // GOOGLE
        // =====================================================

        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,

            authorization: {
                params: {
                    scope:
                        "openid email profile https://www.googleapis.com/auth/user.phonenumbers.read",
                },
            },
        }),


        // =====================================================
        // LINKEDIN
        // =====================================================

        LinkedIn({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,

            authorization: {
                params: {
                    scope: "openid profile email",
                },
            },
        }),
    ],


    // =========================================================
    // CALLBACKS
    // =========================================================

    callbacks: {

        // =====================================================
        // SIGN IN
        // =====================================================

        async signIn({ user, account, profile }) {

            // Only handle Google and LinkedIn
            if (
                account?.provider !== "google" &&
                account?.provider !== "linkedin"
            ) {
                return true;
            }


            const headersList = await headers();


            // =================================================
            // COMMON DATA
            // =================================================

            let provider = account?.provider;

            let userId = null;
            let name = null;
            let email = null;
            let image = null;
            let contactNumber = null;


            // =================================================
            // GOOGLE DATA
            // =================================================

            if (provider === "google") {

                userId = profile?.sub;

                name = profile?.name;

                email = profile?.email;

                image = profile?.picture;


                // ---------------------------------------------
                // GOOGLE PHONE NUMBER
                // ---------------------------------------------

                try {

                    if (account?.access_token) {

                        const peopleResponse = await fetch(
                            "https://people.googleapis.com/v1/people/me?personFields=phoneNumbers",
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${account.access_token}`,
                                },
                            }
                        );


                        if (peopleResponse.ok) {

                            const peopleData =
                                await peopleResponse.json();


                            contactNumber =
                                peopleData
                                    ?.phoneNumbers?.[0]
                                    ?.canonicalForm ||

                                peopleData
                                    ?.phoneNumbers?.[0]
                                    ?.value ||

                                null;
                        }
                    }

                } catch (error) {

                    console.error(
                        "Unable to get Google contact number:",
                        error
                    );
                }
            }


            // =================================================
            // LINKEDIN DATA
            // =================================================

            if (provider === "linkedin") {

                /*
                 * NextAuth LinkedIn with OpenID Connect normally
                 * provides:
                 *
                 * profile.sub
                 * profile.name
                 * profile.email
                 * profile.picture
                 */

                userId =
                    profile?.sub ||
                    profile?.id ||
                    user?.id;


                name =
                    profile?.name ||
                    user?.name ||
                    "";


                email =
                    profile?.email ||
                    user?.email ||
                    "";


                image =
                    profile?.picture ||
                    user?.image ||
                    null;


                // LinkedIn normally does not provide phone number
                contactNumber = null;
            }


            // =================================================
            // LOG USER DATA
            // =================================================

            console.log("================================");
            console.log("LOGIN PROVIDER:", provider);
            console.log("USER ID:", userId);
            console.log("NAME:", name);
            console.log("EMAIL:", email);
            console.log("IMAGE:", image);
            console.log("PHONE:", contactNumber);
            console.log("================================");


            // =================================================
            // API
            // =================================================

            try {

                const externalApiBaseUrl =
                    process.env.API_BASE_URL;


                if (!externalApiBaseUrl) {

                    console.error(
                        "API_BASE_URL is not configured."
                    );

                    return false;
                }


                const apiUrl =
                    externalApiBaseUrl.replace(/\/+$/, "");


                // =================================================
                // LOGIN IP
                // =================================================

                const LoginIp =
                    headersList
                        .get("x-forwarded-for")
                        ?.split(",")[0]
                        ?.trim() ||

                    headersList.get("x-real-ip") ||

                    headersList.get("cf-connecting-ip") ||

                    "Unknown";


                // =================================================
                // CHECK EMAIL
                // =================================================

                const checkResponse = await fetch(
                    `${apiUrl}/authLogin/checkEmail`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({

                            email: email,

                            googleId:
                                provider === "google"
                                    ? userId
                                    : "",

                            linkedinId:
                                provider === "linkedin"
                                    ? userId
                                    : "",

                            RegBy:
                                provider === "google"
                                    ? "Google"
                                    : "LinkedIn",
                        }),
                    }
                );


                if (!checkResponse.ok) {

                    console.error(
                        "checkEmail API failed:",
                        checkResponse.status
                    );

                    return false;
                }


                const checkResult =
                    await checkResponse.json();


                console.log(
                    "CHECK RESULT:",
                    checkResult
                );


                // =================================================
                // EXISTING USER
                // =================================================

                if (checkResult.success === true) {

                    console.log(
                        "Existing user - performing login"
                    );


                    // ---------------------------------------------
                    // LOGIN BODY
                    // ---------------------------------------------

                    const loginBody = {

                        googleId:
                            provider === "google"
                                ? userId
                                : "",

                        linkedinId:
                            provider === "linkedin"
                                ? userId
                                : "",

                        email: email,

                        LoginIp: LoginIp,

                        RegBy:
                            provider === "google"
                                ? "Google"
                                : "LinkedIn",
                    };


                    console.log(
                        "LOGIN BODY:",
                        loginBody
                    );


                    // ---------------------------------------------
                    // EXTERNAL LOGIN API
                    // ---------------------------------------------

                    const externalApiUrl =
                        `${apiUrl}/authLogin/login`;


                    const externalResponse =
                        await fetch(
                            externalApiUrl,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",
                                },

                                body:
                                    JSON.stringify(
                                        loginBody
                                    ),
                            }
                        );


                    const externalData =
                        await externalResponse.json();


                    console.log(
                        "External API response:",
                        externalData
                    );


                    // ---------------------------------------------
                    // LOGIN FAILED
                    // ---------------------------------------------

                    if (!externalResponse.ok) {

                        console.error(
                            "External login failed:",
                            externalData
                        );

                        return false;
                    }


                    // ---------------------------------------------
                    // STORE EXTERNAL DATA IN ACCOUNT
                    // ---------------------------------------------

                    account.externalData =
                        externalData;


                    account.loginProvider =
                        provider;


                    console.log(
                        "External login successful"
                    );


                    return true;
                }


                // =================================================
                // NEW USER
                // =================================================

                console.log(
                    "New user - registering"
                );


                const registerResponse =
                    await fetch(
                        `${apiUrl}/authLogin/newRegister`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({

                                    googleId:
                                        provider === "google"
                                            ? userId
                                            : "",

                                    linkedinId:
                                        provider === "linkedin"
                                            ? userId
                                            : "",

                                    name: name,

                                    email: email,

                                    image: image,

                                    regBy:
                                        provider === "google"
                                            ? "Google"
                                            : "LinkedIn",

                                    mobile:
                                        contactNumber || "",

                                    LoginIp:
                                        LoginIp,
                                }),
                        }
                    );


                if (!registerResponse.ok) {

                    console.error(
                        "Registration failed:",
                        registerResponse.status
                    );

                    return false;
                }


                const registerResult =
                    await registerResponse.json();


                console.log(
                    "REGISTRATION RESULT:",
                    registerResult
                );


                // Store registration response
                account.externalData =
                    registerResult;


                account.loginProvider =
                    provider;


                return true;


            } catch (error) {

                console.error(
                    "Authentication error:",
                    error
                );

                return false;
            }
        },


        // =====================================================
        // JWT
        // =====================================================

        async jwt({ token, account, profile }) {

            // ---------------------------------------------
            // First OAuth login
            // ---------------------------------------------

            if (account) {

                token.provider =
                    account.provider;


                token.providerId =
                    profile?.sub;


                token.externalData =
                    account.externalData || null;


                token.dataAccessToken =
                    account.externalData
                        ?.dataAccessToken || null;


                token.dataRefreshToken =
                    account.externalData
                        ?.dataRefreshToken || null;


                token.dataUqId =
                    account.externalData
                        ?.dataUqId || null;


                token.isVefity =
                    account.externalData
                        ?.isVefity;


                token.isActive =
                    account.externalData
                        ?.isActive;
            }


            return token;
        },


        // =====================================================
        // SESSION
        // ===================================================== 

        async session({ session, token }) {
            session.user.provider =
                token.provider;
            session.user.providerId =
                token.providerId;
            session.user.dataAccessToken =
                token.dataAccessToken;
            session.user.dataRefreshToken =
                token.dataRefreshToken;
            session.user.dataUqId =
                token.dataUqId;
            session.user.isVefity =
                token.isVefity;
            session.user.isActive =
                token.isActive;
            session.user.externalData =
                token.externalData;
            return session;
        },

        // =====================================================
        // REDIRECT
        // =====================================================

        async redirect({ url, baseUrl }) {

            // After successful Google/LinkedIn login
            return `${baseUrl}/candidates-dashboard/dashboard`;
        },
    },
});