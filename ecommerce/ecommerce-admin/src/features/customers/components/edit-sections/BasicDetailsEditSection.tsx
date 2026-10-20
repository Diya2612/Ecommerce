import { User, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SingleDatePicker } from '@/components/forms/inputs/single-date-picker';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSection } from '@/components/forms';
import type { CustomerFormData } from '../../types/customer.types';

interface BasicDetailsEditSectionProps {
  formData: CustomerFormData;
  setFormData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  isEditing: boolean;
}

export function BasicDetailsEditSection({ formData, setFormData, isEditing }: BasicDetailsEditSectionProps) {
  const badge = isEditing ? (
    <Badge className="bg-green-100 text-green-700 border-green-200">
      <Edit className="size-3 mr-1" />
      Editing
    </Badge>
  ) : (
    <Badge variant="outline" className="text-slate-600">View Only</Badge>
  );

  return (
    <FormSection icon={User} title="Basic Customer Details" badge={badge}>
      {/* Profile Image */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">
          Profile Image
        </Label>
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
          {formData.firstName?.[0]}{formData.lastName?.[0]}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Customer Name *
          </Label>
          <Input
            value={`${formData.firstName} ${formData.lastName} `}
            onChange={(e) => {
              const parts = e.target.value.split(' ');
              setFormData(prev => ({
                ...prev,
                firstName: parts[0] || '',
                lastName: parts.slice(1).join(' ') || ''
              }));
            }}
            disabled={!isEditing}
            readOnly={!isEditing}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Email Address *
          </Label>
          <Input
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={!isEditing}
            readOnly={!isEditing}
            className="rounded-xl"
          />
        </div>
        {/* Phone */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Phone Number *
          </Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            disabled={!isEditing}
            readOnly={!isEditing}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Gender
          </Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
            disabled={!isEditing}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* DOB */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Date of Birth</Label>
          <SingleDatePicker
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
            onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date ? date.toISOString().split('T')[0] : '' }))}
            placeholder="Select date of birth"
            disabled={!isEditing}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <Label className="text-sm font-medium text-slate-700 mb-2 block">Languages</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(formData.language || []).map((lang: string) => (
            <Badge key={lang} variant="secondary" className="bg-indigo-100 text-indigo-700 rounded-lg px-2 py-1">
              {lang}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    language: prev.language?.filter(l => l !== lang) || []
                  }))}
                  className="ml-1 text-indigo-500 hover:text-indigo-700"
                >
                  ×
                </button>
              )}
            </Badge>
          ))}
        </div>
        {isEditing && (
          <Select
            onValueChange={(value) => {
              if (!formData.language?.includes(value)) {
                setFormData(prev => ({
                  ...prev,
                  language: [...(prev.language || []), value]
                }));
              }
            }}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Add language..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Malayalam', 'Punjabi']
                .filter(lang => !formData.language?.includes(lang))
                .map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        )}
      </div>
    </FormSection>
  );
}
