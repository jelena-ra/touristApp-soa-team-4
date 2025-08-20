export interface User {
    id: string;
    username: string;
    role: string;
    isBlocked?: boolean; // Optional property to indicate if the user is blocked
}