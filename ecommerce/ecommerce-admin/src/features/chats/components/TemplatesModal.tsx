import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Trash2, X, FileText, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { notifyInfo } from '@/utils';
import { Label } from '@/components/ui/label';

export type Template = {
  id: string;
  title: string;
  category: string;
  body: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  { id: 't1', title: 'Order Not Received', category: 'Order Issues', body: 'Hi {{customer_name}},\n\nI\'m sorry to hear about your order not arriving. I have checked the tracking and will escalate to the carrier. I will update you shortly.' },
  { id: 't2', title: 'Shipping Delay', category: 'Shipping Delay', body: 'Hello {{customer_name}},\n\nWe\'re currently experiencing delays due to high volume. We expect delivery in 3-5 business days. Thank you for your patience.' },
  { id: 't3', title: 'Refund Processed', category: 'Refunds', body: 'Hi {{customer_name}},\n\nYour refund has been processed and will reflect in your account within 3-5 business days.' },
  { id: 't4', title: 'Product Inquiry', category: 'General', body: 'Hi {{customer_name}},\n\nThank you for your interest in our products. Regarding your question...' },
  { id: 't5', title: 'Out of Stock', category: 'Order Issues', body: 'Hello {{customer_name}},\n\nUnfortunately, the item you ordered is currently out of stock. We expect to restock by...' }
];

const TEMPLATES_KEY = 'anant_chat_templates_v1';

interface Props {
  onInsert: (body: string) => void;
  onClose?: () => void;
}

const TemplatesModal: React.FC<Props> = ({ onInsert }) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_TEMPLATES;
    } catch (e) {
      return DEFAULT_TEMPLATES;
    }
  });

  useEffect(() => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }, [templates]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    templates.forEach(t => set.add(t.category || 'Custom'));
    return ['All Templates', ...Array.from(set)];
  }, [templates]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Templates');

  const filtered = useMemo(() => templates.filter(t => {
    if (selectedCategory !== 'All Templates' && t.category !== selectedCategory) return false;
    if (!search) return true;
    return t.title.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
  }), [templates, selectedCategory, search]);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Custom');
  const [newBody, setNewBody] = useState('');

  const createTemplate = () => {
    if (!newTitle || !newBody) return notifyInfo('Please enter title and body');
    const t: Template = { id: `t${Date.now()}`, title: newTitle, category: newCategory || 'Custom', body: newBody };
    setTemplates(prev => [t, ...prev]);
    setShowCreate(false);
    setNewTitle(''); setNewBody(''); setNewCategory('Custom');
    notifyInfo('Template saved');
  };

  const deleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      notifyInfo('Template deleted');
    }
  };

  // Create Mode
  if (showCreate) {
    return (
      <div className="flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Create New Template</h3>
            <p className="text-sm text-slate-500">Add a new response template for quick replies</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Title *</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Order Missing"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Shipping"
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Template Body *</Label>
            <div className="text-xs text-slate-500 mb-1">Use {'{{customer_name}}'} for dynamic content</div>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              className="w-full h-40 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none"
              placeholder="Hi {{customer_name}}, ..."
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
          <Button className="bg-[#0E042F] text-white hover:bg-[#0E042F]/90" onClick={createTemplate}>
            <Check className="size-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>
    );
  }

  // Browse Mode
  return (
    <div className="flex -m-6 h-[85vh] max-h-[800px]">
      {/* Sidebar - Categories (Fixed width 250px) */}
      <div className="w-[250px] flex-shrink-0 border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-1 overflow-y-auto">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Categories</h4>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group flex-shrink-0 ${selectedCategory === cat ? 'bg-white shadow-sm text-purple-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="truncate block max-w-[180px]" title={cat}>{cat}</span>
            {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0" />}
          </button>
        ))}
      </div>

      {/* Main Content - Templates List */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Sticky Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 rounded-lg w-full"
            />
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-[#0E042F] text-white hover:bg-[#0E042F]/90 flex-shrink-0"
          >
            <Plus className="size-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <div
                key={t.id}
                className="group border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-all cursor-pointer relative flex flex-col"
                onClick={() => onInsert(t.body)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0 pr-6">
                    <div className="p-1.5 rounded-md bg-purple-50 text-purple-600 flex-shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate" title={t.title}>{t.title}</h4>
                      <div className="text-xs text-slate-500 truncate">{t.category}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteTemplate(t.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all absolute top-3 right-3 z-10"
                    title="Delete template"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="text-sm text-slate-600 line-clamp-4 leading-relaxed break-words">
                  {t.body}
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="group-hover:text-purple-600 transition-colors">Click to insert</span>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                <FileText className="size-12 mb-3 text-slate-200" />
                <p>No templates found</p>
                <Button variant="link" onClick={() => setShowCreate(true)} className="text-purple-600 mt-2">
                  Create a new one?
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplatesModal;
