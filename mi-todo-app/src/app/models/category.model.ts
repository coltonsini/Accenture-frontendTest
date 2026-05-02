export interface Category {
  id: string;
  name: string; 
  emoji: string;
  color: string; 
  bgColor: string;   
  isDefault?: boolean; 
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'trabajo',  name: 'Trabajo',  emoji: '💼', color: '#a100ff', bgColor: '#f3e6ff', isDefault: true },
  { id: 'personal', name: 'Personal', emoji: '🏠', color: '#6f00ff', bgColor: '#ebe0ff', isDefault: true },
  { id: 'estudio',  name: 'Estudio',  emoji: '📚', color: '#008a3c', bgColor: '#e0f2e8', isDefault: true },
  { id: 'otros',    name: 'Otros',    emoji: '🌟', color: '#ff6d00', bgColor: '#ffeede', isDefault: true },
];
