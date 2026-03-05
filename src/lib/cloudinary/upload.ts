export async function uploadToCloudinary(
  file: File | Blob,
  onProgress?: (pct: number) => void
): Promise<{ url: string; publicId: string }> {
  // 1. Get a signed upload token from our API (tiny request, no file)
  const signRes = await fetch("/api/upload/sign", { method: "POST" });
  if (!signRes.ok) {
    throw new Error("Failed to get upload signature");
  }
  const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

  // 2. Upload directly to Cloudinary from the browser
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("resource_type", "auto");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url, publicId: data.public_id });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
}
