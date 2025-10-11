export interface User {
    id: string;
    username: string;
    role: string;
    isBlocked?: boolean;
}