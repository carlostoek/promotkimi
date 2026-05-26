import { Plus } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function FAB() {
  const { openCreateModal } = useUIStore();

  return (
    <button
      onClick={openCreateModal}
      className="fab md:hidden"
      aria-label="Crear nuevo prompt"
    >
      <Plus className="w-6 h-6 text-white" />
    </button>
  );
}
