export const extractFramesFromVideo = async (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const frames = [];
    const url = URL.createObjectURL(file);

    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const timestamps = [0.5, duration / 2, duration - 0.5];
      canvas.width = 512; 
      canvas.height = 512;

      for (let time of timestamps) {
        video.currentTime = time;
        await new Promise(r => { video.onseeked = r; });
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]; 
        frames.push(base64);
      }
      URL.revokeObjectURL(url);
      resolve(frames);
    };
    video.onerror = reject;
  });
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};