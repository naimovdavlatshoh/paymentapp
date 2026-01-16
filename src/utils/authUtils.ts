/**
 * Handles authentication errors from API requests
 * @param error - The axios error object
 * @returns true if error was handled, false otherwise
 */
export const handleAuthError = (error: any): boolean => {
    // Check if the error is an authentication error (401 or 403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Clear authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        // Redirect to login page if not already there
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }

        return true;
    }

    return false;
};
