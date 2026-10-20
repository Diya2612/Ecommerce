import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile } from "../types";
import { CustomerImageUpload } from "../../customers/components/CustomerImageUpload";

interface PersonalInformationProps {
  formData: Partial<UserProfile & { phoneNumber?: string }>;
  errors: Record<string, string>;
  onInputChange: (field: any, value: string) => void;
  onImageChange: (file: File | null) => void;
  imagePreview?: string | null;
}

export default function PersonalInformation({
  formData,
  errors,
  onInputChange,
  onImageChange,
  imagePreview,
}: PersonalInformationProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-sm">
            <CustomerImageUpload
              onFileChange={onImageChange}
              preview={imagePreview}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName || ''}
              onChange={(e) => onInputChange("firstName", e.target.value)}
              placeholder="Enter your first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName || ''}
              onChange={(e) => onInputChange("lastName", e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => onInputChange("email", e.target.value)}
              placeholder="Enter your email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={formData.phoneNumber || ""}
              onChange={(e) => onInputChange("phoneNumber", e.target.value)}
              placeholder="Enter 10 digit phone number"
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => onInputChange("timezone", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">India (Asia/Kolkata)</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (America/New_York)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (America/Chicago)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (America/Denver)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</SelectItem>
                <SelectItem value="Europe/London">London (Europe/London)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}