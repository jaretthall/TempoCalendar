// Backup mock data in case the JSON import doesn't work properly

export const mockShifts = [
  {
    "id": "LE0mKDxPUrosEW7laWeC",
    "providerId": "EgGY3cryFQvV00CPgxmJ",
    "clinicTypeId": "1",
    "startDate": "2026-03-09",
    "endDate": "2026-03-09",
    "isVacation": false,
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "recurrenceEndDate": "2026-03-19",
    "seriesId": "526d29ee-5ba3-49a1-be94-7200f3091fa0",
    "createdAt": "2025-03-19T16:03:19.344Z",
    "updatedAt": "2025-03-19T16:03:19.344Z"
  },
  {
    "id": "Q7hBNMbPvrzdSmH4v8SK",
    "providerId": "7Crq8VIH9onU1e6Y2g5l",
    "clinicTypeId": "1",
    "startDate": "2026-03-09",
    "endDate": "2026-03-09",
    "isVacation": false,
    "isRecurring": true,
    "recurrencePattern": "weekly",
    "recurrenceEndDate": "2026-03-19",
    "seriesId": "8348be9c-4b00-492c-b164-b60d4d016320",
    "createdAt": "2025-03-19T15:36:50.246Z",
    "updatedAt": "2025-03-19T15:36:50.246Z"
  },
  {
    "id": "pF8mN3qRtS5vU2xW7yZ9",
    "providerId": "crkqqHsO12q3GNV2qYGq",
    "clinicTypeId": "2",
    "startDate": "2026-03-10",
    "endDate": "2026-03-10",
    "isVacation": false,
    "isRecurring": false,
    "createdAt": "2025-03-19T15:40:20.246Z",
    "updatedAt": "2025-03-19T15:40:20.246Z"
  },
  {
    "id": "aB1cD2eF3gH4iJ5kL6mN",
    "providerId": "EgGY3cryFQvV00CPgxmJ",
    "clinicTypeId": "3",
    "startDate": "2026-03-12",
    "endDate": "2026-03-12",
    "isVacation": false,
    "isRecurring": false,
    "createdAt": "2025-03-19T15:45:30.246Z",
    "updatedAt": "2025-03-19T15:45:30.246Z"
  },
  {
    "id": "oP7qR8sT9uV0wX1yZ2aB",
    "providerId": "7Crq8VIH9onU1e6Y2g5l",
    "clinicTypeId": "4",
    "startDate": "2026-03-15",
    "endDate": "2026-03-19",
    "isVacation": true,
    "isRecurring": false,
    "createdAt": "2025-03-19T16:00:00.246Z",
    "updatedAt": "2025-03-19T16:00:00.246Z"
  },
  {
    "id": "cD3eF4gH5iJ6kL7mN8oP",
    "providerId": "pRv8sT9uV0wX1yZ2aB3c",
    "clinicTypeId": "5",
    "startDate": "2026-03-16",
    "endDate": "2026-03-16",
    "isVacation": false,
    "isRecurring": true,
    "recurrencePattern": "daily",
    "recurrenceEndDate": "2026-03-26",
    "seriesId": "98a7b6c5-d4e3-f2g1-h0i9-j8k7l6m5n4o3",
    "createdAt": "2025-03-19T16:30:15.246Z",
    "updatedAt": "2025-03-19T16:30:15.246Z"
  }
];

export const mockProviders = [
  { id: "EgGY3cryFQvV00CPgxmJ", name: "Dr. Emily Green", color: "#4CAF50", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "7Crq8VIH9onU1e6Y2g5l", name: "Dr. James Wilson", color: "#2196F3", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "crkqqHsO12q3GNV2qYGq", name: "Dr. Sarah Johnson", color: "#F44336", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "pRv8sT9uV0wX1yZ2aB3c", name: "Dr. Michael Brown", color: "#9C27B0", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "dE4fG5hI6jK7lM8nO9pQ", name: "Dr. Olivia Martinez", color: "#FF9800", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "rS0tU1vW2xY3zAB4CD5e", name: "Dr. Robert Chen", color: "#795548", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "Fj6Gh7Hi8Ij9Jk0Lm1Np", name: "Dr. Lisa Taylor", color: "#607D8B", is_active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const mockClinicTypes = [
  { id: "1", name: "Primary Care", color: "#4CAF50", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "2", name: "Urgent Care", color: "#F44336", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "3", name: "Specialty Clinic", color: "#2196F3", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "4", name: "Surgery", color: "#9C27B0", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "5", name: "Pediatrics", color: "#FF9800", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "6", name: "Geriatrics", color: "#795548", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "7", name: "Mental Health", color: "#607D8B", is_active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const mockData = {
  shifts: mockShifts,
  providers: mockProviders,
  clinic_types: mockClinicTypes,
  profiles: [
    { id: "1", email: "admin@example.com", full_name: "Admin User", role: "admin", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "2", email: "user@example.com", full_name: "Regular User", role: "viewer", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]
}; 