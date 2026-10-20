import { Mail, Plus, Trash2, Check } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomerEmail } from '../../types/customer.types';
import { emailTypeOptions } from '../../constants/options';

interface EmailAddressesSectionProps {
  emails: CustomerEmail[];
  handleAddEmail: () => void;
  handleRemoveEmail: (id: string) => void;
  handleEmailChange: (id: string, field: keyof CustomerEmail, value: any) => void;
  handleSetPrimaryEmail: (id: string) => void;
  handleVerifyEmail: (id: string) => void;
  handleVerifyOtp: (id: string) => void;
}

export function EmailAddressesSection({
  emails,
  handleAddEmail,
  handleRemoveEmail,
  handleEmailChange,
  handleSetPrimaryEmail,
  handleVerifyEmail,
  handleVerifyOtp
}: EmailAddressesSectionProps) {
  const addAction = (
    <Button onClick={handleAddEmail} size="sm" variant="outline" className="rounded-xl">
      <Plus className="size-4 mr-2" />
      Add Email
    </Button>
  );

  return (
    <FormSection icon={Mail} title="Email Addresses" actions={addAction}>

      <div className="space-y-4">
        {emails.map((emailItem) => (
          <div key={emailItem.id} className="p-4 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={emailItem.email}
                      onChange={(e) => handleEmailChange(emailItem.id, 'email', e.target.value)}
                      className="rounded-xl"
                      disabled={emailItem.isVerified}
                    />
                    {emailItem.isVerified && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600" />
                    )}
                  </div>

                  <Select
                    value={emailItem.type}
                    onValueChange={(value: any) => handleEmailChange(emailItem.id, 'type', value)}
                  >
                    <SelectTrigger className="rounded-xl w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {emailTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!emailItem.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyEmail(emailItem.id)}
                      disabled={!emailItem.email}
                      className="rounded-xl whitespace-nowrap"
                    >
                      Verify
                    </Button>
                  )}

                  {emails.length > 1 && (
                    <button
                      onClick={() => handleRemoveEmail(emailItem.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </button>
                  )}
                </div>

                {/* OTP Field */}
                {emailItem.showOtp && !emailItem.isVerified && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={emailItem.otpValue}
                        onChange={(e) =>
                          handleEmailChange(
                            emailItem.id,
                            'otpValue',
                            e.target.value.replace(/\D/g, '').slice(0, 6)
                          )
                        }
                        className="rounded-xl"
                        maxLength={6}
                      />
                      <Button
                        onClick={() => handleVerifyOtp(emailItem.id)}
                        disabled={emailItem.otpValue.length !== 6}
                        size="sm"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                      >
                        <Check className="size-4 mr-2" />
                        Verify
                      </Button>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Code sent to {emailItem.email}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {emailItem.isPrimary ? (
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg">
                      Primary
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetPrimaryEmail(emailItem.id)}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Set as Primary
                    </button>
                  )}
                  {emailItem.isVerified && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
