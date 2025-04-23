/**
 * Represents a Client user in the system.
 * Matches the expected structure from the API/database.
 */
export interface IClient {
    id: string;          // UUID format
    firstName?: string;  // Optional as it can be null in database
    lastName?: string;   // Optional as it can be null in database
    email: string;
    role: 'CLIENT' | 'COACH' | 'ADMIN'; // From the Role enum in Prisma
    createdAt: string;   // ISO date string
    updatedAt: string;   // ISO date string
    
    // These fields are available in the database but not included in API responses by default
    // gymId?: string;
    // coachId?: string;
}
