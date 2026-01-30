export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getMimeType = (file: File): string => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (ext === 'mp3') return 'audio/mp3'; 
  if (ext === 'm4a') return 'audio/m4a'; 
  
  const typeMap: Record<string, string> = {
    'mp3': 'audio/mp3', 
    'wav': 'audio/wav',
    'aac': 'audio/aac',
    'flac': 'audio/flac',
    'ogg': 'audio/ogg',
    'm4a': 'audio/m4a', 
    'wma': 'audio/x-ms-wma', 
    'aiff': 'audio/aiff',
    'opus': 'audio/ogg',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'wmv': 'video/x-ms-wmv',
    'webm': 'video/webm',
    'flv': 'video/x-flv',
    '3gp': 'video/3gpp',
    'mpg': 'video/mpeg',
    'mpeg': 'video/mpeg',
    'mkv': 'video/webm' 
  };

  if (ext && typeMap[ext]) {
    return typeMap[ext];
  }

  if (file.type && file.type !== 'application/octet-stream') {
     if (file.type === 'audio/mpeg') return 'audio/mp3';
     if (file.type === 'audio/mp4') return 'audio/m4a';
     return file.type;
  }

  return 'video/mp4'; 
};