export type TaskId = string;

export type TaskStatus = 'belum' | 'selesai';
export type Priority = 'rendah' | 'sedang' | 'tinggi';
export type Filter = 'semua' | TaskStatus;

export interface Task {
  id: TaskId;
  title: string;      
  course: string;     
  deadline: string;  
  priority: Priority;
  status: TaskStatus;
  createdAt: number;  
}

export type TaskInput = Omit<Task, 'id' | 'status' | 'createdAt'>;