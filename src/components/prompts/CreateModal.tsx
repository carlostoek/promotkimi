import { useState, useRef, useCallback } from 'react';
import { X, Image as ImageIcon, Loader2, Sparkles, Save } from 'lucide-react';
import { usePromptStore } from '@/stores/promptStore';
import { useUIStore } from '@/stores/uiStore';

export function CreateModal() {
  const { createPrompt } = usePromptStore();
  const { createModalOpen, closeCreateModal, showSuccess, showError, showLoading, removeToast } = useUIStore();
  
  const [content, setContent] = useState('');
  const [analyzeWithAI, setAnalyzeWithAI] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showError('La imagen no debe superar 10MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [showError]);

  const handleRemoveImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (analyze: boolean) => {
    if (!content.trim()) {
      showError('El contenido del prompt es requerido');
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading(analyze ? 'Analizando prompt...' : 'Guardando prompt...');

    try {
      await createPrompt({
        content: content.trim(),
        analyzeWithAI: analyze,
        image: image || undefined,
      });

      removeToast(toastId);
      showSuccess(analyze ? 'Prompt creado y en análisis' : 'Prompt guardado exitosamente');
      
      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      setAnalyzeWithAI(true);
      
      closeCreateModal();
    } catch (error) {
      removeToast(toastId);
      showError(error instanceof Error ? error.message : 'Error creando prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeCreateModal();
    }
  };

  if (!createModalOpen) return null;

  return (
    <div
      className="modal-backdrop flex items-end md:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="modal-content animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A]">
          <h2 className="text-lg font-semibold text-white">Nuevo Prompt</h2>
          <button
            onClick={closeCreateModal}
            className="p-2 rounded-lg text-[#71717A] hover:text-white hover:bg-[#1A1A24] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Prompt Textarea */}
          <div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe o pega tu prompt aquí..."
              className="textarea-dark min-h-[150px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-[#71717A]">
                {content.length}/2000
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-[#2A2A3A] rounded-xl
                         text-[#71717A] hover:text-white hover:border-[#3A3A4A]
                         transition-colors flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-5 h-5" />
                <span>Agregar imagen (opcional)</span>
              </button>
            )}
          </div>

          {/* Analyze Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#1A1A24] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Analizar con IA</p>
                <p className="text-xs text-[#71717A]">Extrae título, tags y metadata</p>
              </div>
            </div>
            <button
              onClick={() => setAnalyzeWithAI(!analyzeWithAI)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                analyzeWithAI ? 'bg-[#8B5CF6]' : 'bg-[#2A2A3A]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  analyzeWithAI ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2A3A] space-y-2">
          <button
            onClick={() => handleSubmit(analyzeWithAI)}
            disabled={isSubmitting || !content.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {analyzeWithAI ? 'Analizar y guardar' : 'Guardar'}
          </button>
          
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !content.trim()}
            className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Guardar sin analizar
          </button>
        </div>
      </div>
    </div>
  );
}
