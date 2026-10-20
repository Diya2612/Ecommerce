/**
 * Converts a File object to a Base64 string
 * 
 * @param file - The file to convert
 * @returns Promise that resolves to Base64 string
 * 
 * @example
 * const base64 = await convertFileToBase64(file);
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error("Invalid file object"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};
