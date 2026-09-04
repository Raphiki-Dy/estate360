export type UserRole = "ADMIN" | "RESIDENT" | "SECURITY";
export type AccessCodeStatus = "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";
export type AlertStatus = "PENDING" | "RESOLVED";

export interface Unit {
  id: string;
  unit_number: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  unit_id: string | null;
  rent_expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessCode {
  id: string;
  code: string;
  visitor_name: string;
  visitor_phone: string | null;
  vehicle_plate: string | null;
  resident_id: string;
  unit_id: string;
  status: AccessCodeStatus;
  expires_at: string;
  created_at: string;
  used_at: string | null;
}

export interface EmergencyAlert {
  id: string;
  unit_id: string;
  resident_id: string;
  status: AlertStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface ValidateCodeResult {
  result: "VALID" | "USED" | "EXPIRED" | "INVALID" | "REVOKED";
  visitor_name: string | null;
  visitor_phone: string | null;
  unit_number: string | null;
  resident_name: string | null;
  expires_at: string | null;
  vehicle_plate: string | null;
}

export interface OccupantRow extends Profile {
  units: Pick<Unit, "unit_number"> | null;
}

export interface AccessCodeWithUnit extends AccessCode {
  units: Pick<Unit, "unit_number"> | null;
  profiles: Pick<Profile, "full_name"> | null;
}

export interface EmergencyAlertWithDetails extends EmergencyAlert {
  units: Pick<Unit, "unit_number"> | null;
  profiles: Pick<Profile, "full_name" | "phone"> | null;
}

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  ADMIN: "/admin",
  RESIDENT: "/resident",
  SECURITY: "/security",
};

export const LOGIN_ROUTES: Record<UserRole, string> = {
  ADMIN: "/admin/login",
  RESIDENT: "/login",
  SECURITY: "/security/login",
};
