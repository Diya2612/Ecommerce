"use client";
import { Button } from "@/components/ui/button";
import { Camera, Edit } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/queries/useUser";
import { Loader2 } from "lucide-react";

export function ProfileEditButton({
  className,
  minimal,
}: {
  className?: string;
  minimal?: boolean;
}) {
  return (
    <Link href="/profile/account">
      <Button
        className={`w-fit mx-auto md:mx-0 bg-white text-[#0B1F51] hover:bg-gray-50 border-0 rounded-full ${minimal ? "px-4 h-9 text-xs" : "px-6 h-11 text-[15px]"} font-semibold shadow-md transition-all duration-300 ${className || ""}`}
      >
        <Edit className={`${minimal ? "w-3 h-3 mr-1.5" : "w-4 h-4 mr-2"}`} />
        {minimal ? "Edit" : "Edit Profile"}
      </Button>
    </Link>
  );
}



import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export function ProfileAvatarButton() {
  const { updateProfile, isUpdating } = useUser();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const toastId = toast.loading("Uploading profile photo...");
    setIsUploading(true);

    try {
      // 1. Create client-side preview immediately (Optimistic UI)
      const objectUrl = URL.createObjectURL(file);
      // We can optionally pass this to a local state or context to show immediately if we had access to the image component
      // For now, we rely on the fast upload, but this place is where we'd set a preview url state

      // 2. Upload to backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const token = session?.access_token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/uploads`, {
        method: "POST",
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized. Please login again.");
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const fileUrl = data.data.file_url || data.file_url;

      // 3. Update Profile with new URL
      await updateProfile({ profile_image_url: fileUrl });

      toast.success("Profile photo updated", { id: toastId });

      // Cleanup preview
      URL.revokeObjectURL(objectUrl);

    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast.error(error.message || "Failed to upload photo", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
      />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUpdating || isUploading}
        className="absolute bottom-2 right-2 w-12 h-12 bg-[#00C4CC] rounded-full flex items-center justify-center shadow-lg hover:bg-[#00d4dc] transition-colors disabled:opacity-70 cursor-pointer z-20"
      >
        {isUpdating || isUploading ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Camera className="w-5 h-5 text-white" />
        )}
      </motion.button>
    </>
  );
}
