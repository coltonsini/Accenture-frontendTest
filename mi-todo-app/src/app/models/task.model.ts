// Definition of the category type and the Task interface, which represents a task in the application.

export type TaskCategory = string;

export interface Task {
  id: string;            
  title: string;         
  description?: string; 
  completed: boolean; 
  category: TaskCategory;
  createdAt: number;
}