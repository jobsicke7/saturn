// utils/imageUploader.ts
export async function uploadImage(file: File): Promise<string> {
    try {
      // FormData 객체 생성
      const formData = new FormData();
      formData.append('file', file);
      
      // 서버 API 엔드포인트를 통해 업로드
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Image upload failed');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }
  
  export async function deleteImage(url: string): Promise<void> {
    try {
      // URL에서 파일 이름 추출
      const filename = url.split('/').pop();
      
      if (!filename) {
        throw new Error('Invalid image URL');
      }
      
      // 삭제 요청
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Image deletion failed');
      }
      
      console.log(`Successfully deleted image: ${filename}`);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }
  