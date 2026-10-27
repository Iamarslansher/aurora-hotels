export const getRoomImages = (images) => {
  const imageList = Array.isArray(images) ? images : typeof images === 'string' ? [images] : [];
  return imageList.filter((image) => typeof image === 'string' && image.trim());
};
