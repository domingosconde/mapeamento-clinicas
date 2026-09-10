import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
  preview?: string;
  onRemove?: () => void;
}

export default function PhotoUploader({
  onUpload,
  isLoading = false,
  preview,
  onRemove,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);

  useEffect(() => {
    setPreviewUrl(preview || null);
  }, [preview]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error("Apenas imagens JPEG, PNG ou WebP são permitidas");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("A imagem deve ter menos de 5MB");
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      await onUpload(file);
      toast.success("Foto enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar foto");
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Foto da Clínica
      </h3>

      {previewUrl ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-slate-100 h-64">
            <img
              src={previewUrl}
              alt="Foto atual da clínica"
              onError={() => setPreviewUrl(null)}
              className="w-full h-full object-cover"
            />
              <button
              type="button"
              aria-label="Remover foto da clínica"
              onClick={handleRemove}
              disabled={isLoading}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            Alterar Foto
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Selecionar foto da clínica"
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-slate-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-900 font-medium mb-1">
            Arraste a foto aqui ou clique para selecionar
          </p>
          <p className="text-sm text-slate-600">
            Formatos suportados: JPEG, PNG, WebP (máx. 5MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Ficheiro de foto da clínica"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-slate-700">
        <p className="font-medium mb-1">💡 Dica:</p>
        <p>
          Use uma foto clara e bem iluminada da fachada ou interior da clínica
          para melhor apresentação.
        </p>
      </div>
    </Card>
  );
}
