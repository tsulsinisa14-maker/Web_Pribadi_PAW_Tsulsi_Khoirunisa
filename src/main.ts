import './style.css';
import type { Task, TaskInput, TaskStatus, Priority, Filter } from './types';
import { loadFromStorage, saveToStorage, findById } from './storage';

const STORAGE_KEY: string = 'tugas-kuliah-v1';
let editingId: string | null = null;
let isFormValid: boolean = false;
let totalTugas: number = 0;
let activeFilter: Filter = 'semua';

const sampleTasks: Task[] = [
  {
    id: 'contoh-1',
    title: 'Tugas Pertemuan 6: Git, npm, TypeScript, Vite',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-20',
    priority: 'tinggi',
    status: 'belum',
    createdAt: 1,
  },
  {
    id: 'contoh-2',
    title: 'Lembar kerja studi kasus fitnah digital',
    course: 'ICT dan Islam',
    deadline: '2026-11-10',
    priority: 'sedang',
    status: 'selesai',
    createdAt: 2,
  },
];

let tasks: Task[] = loadFromStorage<Task[]>(STORAGE_KEY, sampleTasks);

function $<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Elemen tidak ditemukan: ${selector}`);
  return element;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const form = $<HTMLFormElement>('#task-form');
const inputTitle = $<HTMLInputElement>('#task-title');
const inputCourse = $<HTMLInputElement>('#task-course');
const inputDeadline = $<HTMLInputElement>('#task-deadline');
const inputPriority = $<HTMLSelectElement>('#task-priority');
const btnSubmit = $<HTMLButtonElement>('#task-submit');
const btnCancel = $<HTMLButtonElement>('#task-cancel');
const formError = $<HTMLParagraphElement>('#form-error');
const listEl = $<HTMLUListElement>('#task-list');
const emptyEl = $<HTMLParagraphElement>('#task-empty');
const summaryEl = $<HTMLParagraphElement>('#task-summary');
const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function save(): void {
  saveToStorage<Task[]>(STORAGE_KEY, tasks);
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isOverdue(task: Task): boolean {
  const today: string = new Date().toISOString().slice(0, 10);
  return task.status === 'belum' && task.deadline < today;
}

function statusLabel(status: TaskStatus): string {
  return status === 'selesai' ? 'Selesai' : 'Belum Selesai';
}

function priorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' };
  return labels[priority];
}

function addTask(input: TaskInput): void {
  const newTask: Task = { ...input, id: generateId(), status: 'belum', createdAt: Date.now() };
  tasks = [newTask, ...tasks];
}

function updateTask(id: string, input: TaskInput): void {
  tasks = tasks.map((task) => (task.id === id ? { ...task, ...input } : task));
}

function deleteTask(id: string): void {
  tasks = tasks.filter((task) => task.id !== id);
}

function toggleStatus(id: string): void {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, status: task.status === 'selesai' ? 'belum' : 'selesai' } : task,
  );
}

function readForm(): TaskInput {
  return {
    title: inputTitle.value.trim(),
    course: inputCourse.value.trim(),
    deadline: inputDeadline.value,
    priority: inputPriority.value as Priority,
  };
}

function validate(input: TaskInput): string {
  if (input.title === '') return 'Nama tugas wajib diisi.';
  if (input.course === '') return 'Mata kuliah wajib diisi.';
  if (input.deadline === '') return 'Tenggat wajib diisi.';
  return '';
}

function resetForm(): void {
  form.reset();
  inputPriority.value = 'sedang';
  editingId = null;
  btnSubmit.textContent = 'Tambah Tugas';
  btnCancel.hidden = true;
  formError.textContent = '';
}

function startEdit(id: string): void {
  const task = findById<Task>(tasks, id);
  if (!task) return;
  editingId = id;
  inputTitle.value = task.title;
  inputCourse.value = task.course;
  inputDeadline.value = task.deadline;
  inputPriority.value = task.priority;
  btnSubmit.textContent = 'Simpan Perubahan';
  btnCancel.hidden = false;
  formError.textContent = '';
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  inputTitle.focus();
}

function visibleTasks(): Task[] {
  return activeFilter === 'semua' ? tasks : tasks.filter((task) => task.status === activeFilter);
}

function buildItem(task: Task): HTMLLIElement {
  const li = el('li', `task-item${task.status === 'selesai' ? ' is-done' : ''}`);

  const main = el('div', 'task-main');
  main.append(el('strong', 'task-title', task.title));

  const meta = el('p', 'task-meta');
  meta.textContent = `${task.course} • Tenggat ${formatDate(task.deadline)}`;
  main.append(meta);

  const badges = el('div', 'badges');
  badges.append(el('span', `badge status-${task.status}`, statusLabel(task.status)));
  badges.append(el('span', `badge prio-${task.priority}`, `Prioritas ${priorityLabel(task.priority)}`));
  if (isOverdue(task)) badges.append(el('span', 'badge overdue', 'Terlambat'));
  main.append(badges);

  const actions = el('div', 'task-actions');
  const mkButton = (label: string, action: string, extra: string = ''): HTMLButtonElement => {
    const b = el('button', `btn btn-sm ${extra}`.trim(), label);
    b.type = 'button';
    b.dataset.action = action;
    b.dataset.id = task.id;
    return b;
  };
  actions.append(
    mkButton(task.status === 'selesai' ? 'Batalkan Selesai' : 'Tandai Selesai', 'toggle'),
    mkButton('Edit', 'edit'),
    mkButton('Hapus', 'delete', 'btn-danger'),
  );

  li.append(main, actions);
  return li;
}

function render(): void {
  const list: Task[] = visibleTasks();
  listEl.replaceChildren(...list.map(buildItem));
  emptyEl.hidden = list.length > 0;

  totalTugas = tasks.length;
  const selesai: number = tasks.filter((task) => task.status === 'selesai').length;
  summaryEl.textContent = `${totalTugas} tugas • ${selesai} selesai • ${totalTugas - selesai} belum selesai`;

  filterButtons.forEach((btn) => {
    const active: boolean = btn.dataset.filter === activeFilter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

form.addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault();
  const input: TaskInput = readForm();
  const message: string = validate(input);
  isFormValid = message === '';
  formError.textContent = message;
  if (!isFormValid) return;

  if (editingId !== null) updateTask(editingId, input);
  else addTask(input);

  save();
  resetForm();
  render();
});

btnCancel.addEventListener('click', resetForm);

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    activeFilter = (btn.dataset.filter as Filter) ?? 'semua';
    render();
  });
});

listEl.addEventListener('click', (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
  if (!target) return;
  const id: string = target.dataset.id ?? '';

  switch (target.dataset.action) {
    case 'toggle':
      toggleStatus(id);
      break;
    case 'edit':
      startEdit(id);
      return;
    case 'delete':
      if (confirm('Hapus tugas ini?')) {
        deleteTask(id);
        if (editingId === id) resetForm();
      } else {
        return;
      }
      break;
    default:
      return;
  }
  save();
  render();
});

render();