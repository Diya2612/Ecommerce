import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layouts/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Trash2,
  Link as LinkIcon,
  Globe,
  FileText,
  Plus,
  MoreVertical
} from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Switch } from '@/components/ui/switch';
import { UnsavedChangesGuard } from '@/components/guards/UnsavedChangesGuard';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifySuccess } from '@/utils';

const CustomPolicyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    content: '',
    publishToFooter: true,
    urlMapping: ''
  });

  const [initialData, setInitialData] = useState({ ...formData });
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (isEdit) {
      // In a real app, fetch policy by ID. Using mock data here.
      const mockPolicy = {
        name: 'Digital Product Policy',
        status: 'active',
        content: '<p>This policy governs digital products...</p>',
        publishToFooter: true,
        urlMapping: 'digital-product-policy'
      };
      setFormData(mockPolicy);
      setInitialData(mockPolicy);
      setInitialFetchDone(true);
      setTimeout(() => { isMountedRef.current = true; }, 100);
    } else {
      setInitialFetchDone(true);
      isMountedRef.current = true;
    }
  }, [id, isEdit]);

  const hasChanges = isMountedRef.current && initialFetchDone && JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleBack = () => {
    navigate('/settings/policies');
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    notifySuccess(isEdit ? 'Policy updated successfully' : 'Policy created successfully');
    setInitialData({ ...formData });
    navigate('/settings/policies');
  };

  const handleDelete = async () => {
    setIsSaving(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    notifySuccess('Policy deleted successfully');
    navigate('/settings/policies');
  };

  return (
    <UnsavedChangesGuard hasChanges={hasChanges && !isSaving}>
      <div className="flex-1 w-full space-y-6 bg-slate-50/50 min-h-screen">

        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => {
            setShowDeleteDialog(false);
            handleDelete();
          }}
          title="Delete Custom Policy"
          description="Are you sure you want to delete this custom policy? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />

        <PageHeader
          title={isEdit ? `Edit ${initialData.name}` : "Add Custom Policy"}
          subtitle={isEdit ? "Update your custom store policy details." : "Create a new custom policy for your business."}
          breadcrumbs={[
            { label: 'Settings', onClick: () => navigate('/settings') },
            { label: 'Policies', onClick: handleBack },
            { label: isEdit ? 'Edit Policy' : 'New Policy', active: true }
          ]}
          backIcon="arrow"
          onBack={handleBack}
          actions={
            <div className="flex items-center gap-3">
              {hasChanges && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="rounded-xl h-[44px] px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-[#0E042F] hover:bg-[#1A0D3D] text-white h-[44px] px-6 gap-2 shadow-sm"
                  >
                    {isSaving ? "Saving..." : isEdit ? "Save Changes" : (
                      <>
                        <Plus className="size-[18px]" />
                        Add Policy
                      </>
                    )}
                  </Button>
                </>
              )}

              {isEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-[44px] w-[44px] rounded-xl border-slate-200">
                      <MoreVertical className="size-5 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl">
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg m-1"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Policy
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          }
        />

        <div className="w-full px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="flex flex-row items-center gap-3 p-0 mb-5">
                  <div className="size-10 flex items-center justify-center text-slate-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Policy Details</CardTitle>
                    <CardDescription>Main content and identity of your policy.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Policy Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Terms of Service"
                        className="rounded-xl bg-[#F3F4F6] border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Policy Content</Label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      placeholder="Enter the full text of your policy..."
                      minHeight={400}
                    />
                  </div>


                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-4">
              <Card className="border-slate-200 shadow-sm rounded-[16px] overflow-hidden bg-white p-6">
                <CardHeader className="bg-white p-0 mb-5 flex flex-row gap-3 items-start">
                  <div className="text-slate-400 mt-1">
                    <Globe size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-semibold text-slate-900">Visibility & Links</CardTitle>
                    <CardDescription className="text-[11px]">Control where this policy appears.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">URL Mapping</Label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors">
                            <LinkIcon size={16} />
                          </div>
                          <Input
                            value={formData.urlMapping}
                            onChange={(e) => setFormData({ ...formData, urlMapping: e.target.value })}
                            placeholder="e.g. terms-of-service"
                            className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">Final URL: <span className="text-slate-600 font-medium">/policies/{formData.urlMapping || "[mapping]"}</span></p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100 w-full justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-semibold text-slate-900 leading-none">Status</Label>
                          <p className="text-[10px] text-slate-500">{formData.status === 'active' ? 'Published' : 'Hidden'}</p>
                        </div>
                        <Switch
                          checked={formData.status === 'active'}
                          onCheckedChange={(val) => setFormData(prev => ({ ...prev, status: val ? 'active' : 'inactive' }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UnsavedChangesGuard>
  );
};

export default CustomPolicyPage;
