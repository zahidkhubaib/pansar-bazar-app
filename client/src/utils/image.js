const uploadBase = import.meta.env.VITE_UPLOAD_BASE || '';
export const fallbackImage =
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80';

export const getImageUrl = (url) => {
  if (!url) {
    return fallbackImage;
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `${uploadBase}${url}`;
};
