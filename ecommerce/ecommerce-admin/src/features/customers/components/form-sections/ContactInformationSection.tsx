import { useState } from 'react';
import { Mail, Phone, Plus, Trash2, Check, Contact } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import type { CustomerEmail, CustomerPhone } from '../../types/customer.types';
import { emailTypeOptions, phoneTypeOptions } from '../../constants/options';
import { Separator } from '@/components/ui/separator';

interface ContactInformationSectionProps {
  emails: CustomerEmail[];
  handleAddEmail: () => void;
  handleRemoveEmail: (id: string) => void;
  handleEmailChange: (id: string, field: keyof CustomerEmail, value: any) => void;
  handleSetPrimaryEmail: (id: string) => void;
  handleVerifyEmail: (id: string) => void;
  handleVerifyOtp: (id: string) => void;

  phones: CustomerPhone[];
  handleAddPhone: () => void;
  handleRemovePhone: (id: string) => void;
  handlePhoneChange: (id: string, field: keyof CustomerPhone, value: any) => void;
  handleSetPrimaryPhone: (id: string) => void;
  handleVerifyPhone: (id: string) => void;
  handleVerifyPhoneOtp: (id: string) => void;
}

export function ContactInformationSection({
  emails,
  handleAddEmail,
  handleRemoveEmail,
  handleEmailChange,
  handleSetPrimaryEmail,
  handleVerifyEmail,
  handleVerifyOtp,
  phones,
  handleAddPhone,
  handleRemovePhone,
  handlePhoneChange,
  handleSetPrimaryPhone,
  handleVerifyPhoneOtp
}: ContactInformationSectionProps) {
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const [phoneToDelete, setPhoneToDelete] = useState<string | null>(null);

  return (
    <>
      <FormSection icon={Contact} title="Contact Information">

        <div className="space-y-8">
          {/* Email Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Email Addresses <span className="text-red-500">*</span></h3>
              </div>
              <Button onClick={handleAddEmail} size="sm" variant="outline" className="rounded-xl h-8" disabled={emails.length >= 2}>
                <Plus className="size-3 mr-1.5" />
                Add Email
              </Button>
            </div>

            <div className="space-y-4">
              {emails.map((emailItem) => (
                <div key={emailItem.id} className="p-4 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1 w-full">
                          <Input
                            id={emailItem.isPrimary ? "field-email" : undefined}
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

                        {emails.length > 1 && !emailItem.isPrimary && (
                          <button
                            onClick={() => setEmailToDelete(emailItem.id)}
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
                          <p className="text-xs text-slate-600 mt-2">Code sent to {emailItem.email}.</p>
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Phone Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-700">Phone Numbers</h3>
              </div>
              <Button onClick={handleAddPhone} size="sm" variant="outline" className="rounded-xl h-8" disabled={phones.length >= 2}>
                <Plus className="size-3 mr-1.5" />
                Add Phone
              </Button>
            </div>

            <div className="space-y-4">
              {phones.map((phoneItem) => (
                <div key={phoneItem.id} className="p-4 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1 w-full flex items-center">
                      <span className="absolute left-3 text-sm text-slate-500 font-medium select-none">+91</span>
                      <Input
                        id={phoneItem.isPrimary ? "field-phone" : undefined}
                        type="tel"
                        placeholder="9876543210"
                        value={phoneItem.phone}
                        onChange={(e) => handlePhoneChange(phoneItem.id, 'phone', e.target.value)}
                        className="rounded-xl pl-14"
                        disabled={phoneItem.isVerified}
                        maxLength={10}
                      />
                      {phoneItem.isVerified && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600" />
                      )}
                    </div>

                    <Select
                      value={phoneItem.type}
                      onValueChange={(value: any) => handlePhoneChange(phoneItem.id, 'type', value)}
                    >
                      <SelectTrigger className="rounded-xl w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {phoneTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* {!phoneItem.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyPhone(phoneItem.id)}
                      disabled={!phoneItem.phone}
                      className="rounded-xl whitespace-nowrap"
                    >
                      Verify
                    </Button>
                  )} */}

                    {phones.length > 1 && !phoneItem.isPrimary && (
                      <button
                        onClick={() => setPhoneToDelete(phoneItem.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </button>
                    )}
                  </div>

                  {/* OTP Field */}
                  {phoneItem.showOtp && !phoneItem.isVerified && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={phoneItem.otpValue}
                          onChange={(e) =>
                            handlePhoneChange(
                              phoneItem.id,
                              'otpValue',
                              e.target.value.replace(/\D/g, '').slice(0, 6)
                            )
                          }
                          className="rounded-xl"
                          maxLength={6}
                        />
                        <Button
                          onClick={() => handleVerifyPhoneOtp(phoneItem.id)}
                          disabled={phoneItem.otpValue.length !== 6}
                          size="sm"
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
                        >
                          <Check className="size-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">Code sent via SMS to {phoneItem.phone}.</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {phoneItem.isPrimary ? (
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg">
                        Primary
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetPrimaryPhone(phoneItem.id)}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      {/* Delete Email Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!emailToDelete}
        onClose={() => setEmailToDelete(null)}
        onConfirm={() => {
          if (emailToDelete) {
            handleRemoveEmail(emailToDelete);
            setEmailToDelete(null);
          }
        }}
        title="Remove Email Address"
        description="Are you sure you want to remove this email address? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Delete Phone Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!phoneToDelete}
        onClose={() => setPhoneToDelete(null)}
        onConfirm={() => {
          if (phoneToDelete) {
            handleRemovePhone(phoneToDelete);
            setPhoneToDelete(null);
          }
        }}
        title="Remove Phone Number"
        description="Are you sure you want to remove this phone number? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}
