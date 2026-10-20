import { User, Upload, X, Eye } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { SingleDatePicker } from '@/components/forms/inputs/single-date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { genderOptions } from '../../constants/options';

interface BasicInformationSectionProps {
  profilePreview: string | null;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  fullName: string;
  customerId: string;
  gender: string;
  setGender: (value: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (value: string) => void;
  handleProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
}

export function BasicInformationSection({
  profilePreview,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  displayName,
  setDisplayName,
  fullName,
  customerId,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  handleProfileImageChange,
  handleRemoveImage
}: BasicInformationSectionProps) {
  return (
    <FormSection icon={User} title="Basic Information">

      <div className="space-y-5">
        {/* Profile Image Upload */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">Profile Photo</Label>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative group">
              {profilePreview ? (
                <>
                  <div className="size-24 rounded-full overflow-hidden border-2 border-slate-200">
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="size-6 text-white" />
                      </button>
                    </DialogTrigger>
                    <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-4xl bg-transparent border-0 shadow-none p-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="relative pointer-events-auto w-full flex justify-center">
                        <DialogClose className="absolute top-2 right-2 sm:-top-12 sm:-right-12 p-2 bg-white/90 hover:bg-white rounded-full text-slate-900 transition-colors z-50">
                          <X className="size-6" />
                        </DialogClose>
                        <img
                          src={profilePreview}
                          alt="Profile Preview"
                          className="max-h-[80vh] max-w-full w-auto rounded-md shadow-2xl"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                  <User className="size-10 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload className="size-4" />
                    Upload Photo
                  </span>
                </label>
                {profilePreview && (
                  <button
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <X className="size-4" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">First Name <span className="text-red-500">*</span></Label>
            <Input
              id="field-firstName"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Last Name <span className="text-red-500">*</span></Label>
            <Input
              id="field-lastName"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Auto-generated fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Full Name</Label>
            <Input value={fullName} disabled className="rounded-xl bg-slate-50" />
            <p className="text-xs text-slate-500 mt-1.5">Auto-generated from first and last name</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Customer ID</Label>
            <Input value={customerId} disabled className="rounded-xl bg-slate-50" />
            <p className="text-xs text-slate-500 mt-1.5">Auto-generated unique identifier (e.g., CUST-XXXXXX)</p>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Display Name / Nickname
          </Label>
          <Input
            placeholder="Enter display name or nickname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-xl"
          />
          <p className="text-xs text-slate-500 mt-1.5">How this customer prefers to be addressed</p>
        </div>

        {/* Gender & Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {genderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Date of Birth</Label>
            <SingleDatePicker
              value={dateOfBirth ? new Date(dateOfBirth) : null}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setDateOfBirth(`${year}-${month}-${day}`);
                } else {
                  setDateOfBirth('');
                }
              }}
              placeholder="Select date of birth"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Language & Customer Type - Commented Out */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Language</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !language.includes(value)) {
                    setLanguage([...language, value]);
                  }
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Add language..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {languageOptions.filter(opt => !language.includes(opt.value)).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2 mt-2">
                {language.map((lang) => (
                  <div key={lang} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                    <span className="text-sm text-slate-700 capitalize">{lang}</span>
                    <button
                      onClick={() => setLanguage(language.filter((l) => l !== lang))}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Customer Type</Label>
            <Select
              value={customerType}
              onValueChange={(value: any) => setCustomerType(value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {customerTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div> */}
      </div>
    </FormSection>
  );
}
