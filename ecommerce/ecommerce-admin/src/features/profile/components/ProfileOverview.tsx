import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import type { UserProfile } from "../types";
import profileImg from "@/assets/Frame 3562.jpg";
import { uploadService } from "@/services/uploadService";
import { makePutRequest } from "@/lib/api/baseApi";
import { toast } from "sonner";

interface ProfileOverviewProps {
  profile: UserProfile;
  onEditClick: () => void;
}

export default function ProfileOverview({ profile, onEditClick }: ProfileOverviewProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile.profileImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Please select an image smaller than 10MB");
      return;
    }

    setUploading(true);

    try {
      // Upload the file
      const uploadResponse = await uploadService.uploadFile(file);

      console.log('Upload response:', uploadResponse);
      console.log('Updating user profile with URL:', uploadResponse.file_url);

      // Update user profile with new image URL
      const updateResponse = await makePutRequest(`/users/${profile.id}`, {
        profile_image_url: uploadResponse.file_url,
      });

      console.log('Update response:', updateResponse);

      // Update local state
      setAvatarUrl(uploadResponse.file_url);

      // Dispatch custom event to update header avatar
      window.dispatchEvent(new CustomEvent('profilePictureUpdated', {
        detail: { profileImageUrl: uploadResponse.file_url }
      }));

      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setUploading(false);
      // Reset input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Profile Overview</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onEditClick}>
          Edit Profile
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={avatarUrl || (profileImg as unknown as string)}
                alt={`${profile.firstName} ${profile.lastName}`}
              />
              <AvatarFallback className="text-lg">
                {getInitials(profile.firstName, profile.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>

            {/* Pencil Icon Overlay */}
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              aria-label="Change profile picture"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Pencil className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload profile picture"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {profile.firstName} {profile.lastName}
            </h3>
            {/* <p className="text-sm text-gray-500">{profile.role}</p> */}
            <div className="flex items-center justify-center mt-2">
              <Badge variant={profile.status === "active" ? "default" : "secondary"}>
                {profile.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{profile.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-gray-600">Member since</span>
            <span className="font-medium text-gray-900">{profile.memberSince}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-gray-600">Last login</span>
            <span className="font-medium text-gray-900">{profile.lastLogin}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
