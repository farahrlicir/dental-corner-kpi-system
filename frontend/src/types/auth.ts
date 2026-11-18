
export type Role = "ADMIN" | "DENTIST" | "ASSISTANT";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  roles: Role[];
}
