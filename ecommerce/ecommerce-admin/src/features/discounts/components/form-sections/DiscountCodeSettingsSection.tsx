import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { DiscountFormData } from '../../types/discount.types';

interface DiscountCodeSettingsSectionProps {
  formData: DiscountFormData;
  updateField: <K extends keyof DiscountFormData>(field: K, value: DiscountFormData[K]) => void;
}

export const DiscountCodeSettingsSection = ({ formData, updateField }: DiscountCodeSettingsSectionProps) => {
  if (formData.genType === 'auto') return null;

  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-[#253154]">
          Discount Code Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.genType === "single" ? (
          <div className="space-y-2">
            <Label>Code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="SUMMER2025"
                className="h-12 font-mono uppercase"
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value)}
              />
              <Button variant="outline" className="h-12 px-4">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Codes</Label>
                <Input type="number" placeholder="100" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Code Length</Label>
                <Input
                  type="number"
                  value={formData.codeLength}
                  onChange={(e) => updateField('codeLength', e.target.value)}
                  className="h-12"
                  placeholder="8"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prefix</Label>
                <Input placeholder="SUM-" className="h-12 font-mono uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Suffix</Label>
                <Input placeholder="-25" className="h-12 font-mono uppercase" />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
