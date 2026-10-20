import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download } from 'lucide-react';

export const PerformanceSection = () => {
  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-[#0e032f] text-white">
      <CardHeader className="pb-2 border-white/10">
        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-white/60 mb-1">Redemptions</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Revenue Generated</p>
            <p className="text-2xl font-bold">₹0.00</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Average Basket Value</p>
            <p className="text-2xl font-bold">₹0.00</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Unique Users Redeeming</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white border-dashed"
        >
          <Download className="w-4 h-4 mr-2" /> Export Analytics
        </Button>
      </CardContent>
    </Card>
  );
};
