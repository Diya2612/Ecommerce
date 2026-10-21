import { ServiceHero } from '@/components/services/ServiceHero';
import { ServiceCategories } from '@/components/services/ServiceCategories';
import { InstallationServices } from '@/components/services/InstallationServices';
import { RepairServices } from '@/components/services/RepairServices';
import { AMCServices } from '@/components/services/AMCServices';
import { FilterReplacement } from '@/components/services/FilterReplacement';
import { WhyChooseUs } from '@/components/services/WhyChooseUs';
import { CommercialServices } from '@/components/services/CommercialServices';

export default function ServicesPage() {

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <ServiceHero />
      <ServiceCategories />
      <InstallationServices />
      <RepairServices />
      <AMCServices />
      <FilterReplacement />
      <CommercialServices />
      <WhyChooseUs />
    </div>
  );
}
