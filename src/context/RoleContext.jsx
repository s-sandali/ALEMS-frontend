import { createContext, useContext } from "react";

const RoleContext = createContext("User");

export function RoleProvider({ role, children }) {
    return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

/**
 * Returns the current user's role as stored in Clerk public_metadata.
 * Available inside any component rendered within a ProtectedRoute.
 *
 * @example
 * const role = useRole(); // "Admin" | "User" | "Student"
 * if (role === "Admin") { ... }
 */
export function useRole() {
    return useContext(RoleContext);
}
