import { Bell, Mail, Phone } from 'lucide-react';
import { FormSection } from '@/components/forms';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PreferencesSectionProps {
  marketingPreferences: boolean;
  setMarketingPreferences: (value: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  smsNotifications: boolean;
  setSmsNotifications: (value: boolean) => void;
  whatsappNotifications: boolean;
  setWhatsappNotifications: (value: boolean) => void;
  emailSubscription: boolean;
  setEmailSubscription: (value: boolean) => void;
}

export function PreferencesSection({
  marketingPreferences,
  setMarketingPreferences,
  emailNotifications,
  setEmailNotifications,
  smsNotifications,
  setSmsNotifications,
  whatsappNotifications,
  setWhatsappNotifications,
  emailSubscription,
  setEmailSubscription
}: PreferencesSectionProps) {
  return (
    <FormSection icon={Bell} title="Preferences & Communication">

      <div className="space-y-5">
        {/* Marketing Preferences */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Label className="text-sm font-medium text-slate-900 block mb-1">
              Marketing Preferences
            </Label>
            <p className="text-xs text-slate-600">Allow promotional communications</p>
          </div>
          <Switch checked={marketingPreferences} onCheckedChange={setMarketingPreferences} />
        </div>

        <div className="h-px bg-slate-200" />

        {/* Communication Channels */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">
            Communication Channels
          </Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-slate-400" />
                <span className="text-sm text-slate-700">Email</span>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-slate-400" />
                <span className="text-sm text-slate-700">SMS</span>
              </div>
              <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2">
                <svg className="size-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="text-sm text-slate-700">WhatsApp</span>
              </div>
              <Switch checked={whatsappNotifications} onCheckedChange={setWhatsappNotifications} />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* Email Subscription */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Label className="text-sm font-medium text-slate-900 block mb-1">
              Newsletter Subscription
            </Label>
            <p className="text-xs text-slate-600">Subscribe to newsletters and updates</p>
          </div>
          <Switch checked={emailSubscription} onCheckedChange={setEmailSubscription} />
        </div>
      </div>
    </FormSection>
  );
}
