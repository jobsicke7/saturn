import React, { useRef, useState } from 'react';
import { Image } from 'lucide-react';

interface ImageUploaderProps {
  onImageUrl: (url: string) => void;
}

export default function ImageUploader({ onImageUrl }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Send to upload API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const data = await response.json();
      
      // Pass the URL back to the parent component
      onImageUrl(data.url);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: isUploading ? 'wait' : 'pointer',
          padding: '5px',
        }}
        title="이미지 업로드"
      >
        <Image size={18} color={isUploading ? '#999' : '#000'} />
        {isUploading && <span style={{ marginLeft: '5px', fontSize: '12px' }}>업로드 중...</span>}
        이미지 업로드
      </button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
}