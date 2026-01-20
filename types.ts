
export type TaskStatus = 'available' | 'claimed' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  canCreateTasks: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdBy: string;
  claimedBy?: string;
  claimedByName?: string;
  createdAt: number;
}

export type ViewTab = 'available' | 'my-tasks' | 'completed';
