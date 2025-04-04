
// Find and update the Robot interface to ensure 'type' is compatible with the expected values
export interface Robot {
  id: string;
  name: string;
  description: string;
  type: string; // Make sure this matches what's expected in RobotManagement.tsx
  price: number;
  features: string[];
  image_url?: string;
  currency: string;
  category: string;
  imageUrl?: string;
  created_at: string;
}
