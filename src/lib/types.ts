export interface Incident {
  id: string;
  incident_date: string;
  incident_time: string;
  location: string;
  reporter_name: string;
  incident_type: string;
  severity: "minor" | "moderate" | "serious";
  description: string;
  immediate_action: string;
  follow_up_needed: boolean;
  follow_up_completed: boolean;
  follow_up_notes: string;
  resolved_at: string | null;
  created_at: string;
}

export interface Observation {
  id: string;
  observation_type: string;
  location: string;
  observer_name: string;
  description: string;
  corrective_action: string;
  created_at: string;
}

export interface AppData {
  incidents: Incident[];
  observations: Observation[];
}
