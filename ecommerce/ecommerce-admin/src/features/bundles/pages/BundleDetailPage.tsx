import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { PageHeader } from '@/components/layouts/headers';
import { mockBundles } from '../data/bundle.constants';

export default function BundleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find the bundle by ID (using mock data for now)
  const bundle = useMemo(() => {
    return mockBundles.find(b => b.id === id);
  }, [id]);

  if (!bundle) {
    return (
      <div className="flex-1 overflow-auto bg-[#F4F6F9] p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Bundle not found</h2>
          <p className="text-gray-600 mt-2">The requested bundle could not be found.</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Bundles', onClick: () => navigate(ROUTES.BUNDLES.LIST) },
    { label: bundle.title, active: true },
  ];

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title={bundle.title}
        subtitle={`View and manage details for ${bundle.title}`}
        breadcrumbs={breadcrumbs}
        onBack={() => navigate(ROUTES.BUNDLES.LIST)}
      />

      <div className="px-6 lg:px-8 pb-8">
        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Bundle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Bundle Title</label>
                  <p className="text-slate-900 mt-1">{bundle.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <p className="text-slate-900 mt-1">{bundle.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${bundle.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                    bundle.status?.toLowerCase() === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {bundle.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Price Type</label>
                  <p className="text-slate-900 mt-1">{bundle.priceType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Price/Discount</label>
                  <p className="text-slate-900 mt-1 font-medium">
                    {bundle.priceType === 'Fixed Price' ? `₹${bundle.price.toLocaleString()}` : `${bundle.discount}% OFF`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Total Sales</label>
                  <p className="text-slate-900 mt-1">{bundle.totalSales}</p>
                </div>
              </div>
            </div>

            {/* Date Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Schedule Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <p className="text-slate-900 mt-1">{new Date(bundle.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <p className="text-slate-900 mt-1">{new Date(bundle.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Performance Stats Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Sales</span>
                  <span className="text-sm font-medium text-slate-900">{bundle.totalSales}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Revenue</span>
                  <span className="text-sm font-medium text-slate-900">
                    {bundle.priceType === 'Fixed Price' ? `₹${bundle.price.toLocaleString()}` : `${bundle.discount}% OFF`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className={`text-sm font-medium ${bundle.status?.toLowerCase() === 'active' ? 'text-green-600' :
                    bundle.status?.toLowerCase() === 'inactive' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                    {bundle.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Bundle Details Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Bundle Details</h3>
              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Bundle ID:</span> {bundle.id}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Type:</span> {bundle.type}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Price Strategy:</span> {bundle.priceType}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded">
                  Edit Bundle
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded">
                  Duplicate Bundle
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded">
                  View Analytics
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                  Archive Bundle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}