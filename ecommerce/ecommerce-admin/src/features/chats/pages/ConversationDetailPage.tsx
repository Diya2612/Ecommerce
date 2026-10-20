import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants/routes';
import { MOCK_CONVERSATIONS } from '../data/mockConversations';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
import TemplatesModal from '@/features/chats/components/TemplatesModal';
import { notifyInfo } from '@/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Tag, Plus, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';

const AVAILABLE_TAGS = [
  { label: 'Bug', value: 'bug' },
  { label: 'Feature Request', value: 'feature_request' },
  { label: 'Billing', value: 'billing' },
  { label: 'Account Issue', value: 'account_issue' },
  { label: 'Return', value: 'return' },
];

const ConversationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const conversation = useMemo(() => MOCK_CONVERSATIONS.find(c => c.id === id) ?? MOCK_CONVERSATIONS[0], [id]);

  // Simple mock message thread for now
  const [messages, setMessages] = useState(() => [
    {
      id: 'm1',
      authorName: conversation.customerName,
      authorType: 'customer',
      avatar: conversation.customerAvatar,
      content: conversation.preview,
      created_at: conversation.created_at,
      meta: { via: 'Email', channel: 'Email' }
    },
    {
      id: 'm2',
      authorName: 'John Doe',
      authorType: 'agent',
      avatar: null,
      content: "Hello Alice, I'm sorry to hear that. I'll look into this right away for you. I've checked the tracking and it shows it was left at the front porch.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      meta: { via: 'Chat', seen: true }
    },
    {
      id: 'm3',
      authorName: 'John Doe',
      authorType: 'internal',
      avatar: null,
      content: "Customer called to ask for update. Informed her we are contacting the carrier.",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      meta: { internal: true }
    }
  ]);

  const [composer, setComposer] = useState('');
  const [isTemplatesOpen, setTemplatesOpen] = useState(false);
  const [replyType, setReplyType] = useState<'public' | 'internal'>('public');
  const [tags, setTags] = useState(conversation.tags);
  const [isTagPopoverOpen, setTagPopoverOpen] = useState(false);

  const insertTemplate = (text: string) => {
    setComposer(prev => prev + (prev ? "\n" : '') + text);
    setTemplatesOpen(false);
  };

  const sendMessage = () => {
    if (!composer.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      authorName: 'John Doe',
      authorType: replyType === 'public' ? 'agent' : 'internal',
      avatar: null,
      content: composer.trim(),
      created_at: new Date().toISOString(),
    } as any;
    setMessages(prev => [...prev, newMsg]);
    setComposer('');
    notifyInfo('Message sent (mock)');
  };

  const handleAddTag = (label: string) => {
    if (!tags.find(t => t.label === label)) {
      setTags([...tags, { id: `tag-${Date.now()}`, label, color: 'gray' }]);
      notifyInfo(`Tag "${label}" added`);
    }
    setTagPopoverOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F6F9]">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 lg:p-6">
        <div className="flex items-center gap-4">
          {/* Back Button - Left Side */}
          <button
            onClick={() => navigate(ROUTES.CHATS.LIST)}
            className="inline-flex items-center justify-center size-10 hover:bg-white rounded-lg transition-colors shadow-sm border border-slate-200 bg-white"
            title="Go back"
          >
            <ArrowLeft className="size-5 text-slate-600" />
          </button>

          {/* Title and Info - Center/Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-semibold leading-tight text-slate-900 truncate">{conversation.subject}</h3>
              <Badge className="bg-green-50 text-green-700 border-green-100 text-sm py-1 px-2 flex-shrink-0">{conversation.status.toUpperCase()}</Badge>
            </div>
            <div className="text-sm text-slate-500 mt-1 truncate">#{conversation.id} • via Email • Last updated {new Date(conversation.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Grid */}
      <div className="flex-1 overflow-hidden px-4 lg:px-6 pb-4 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left column - thread (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              {/* Messages Area - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map(msg => (
                  <div key={msg.id} className="flex items-start gap-4">
                    {/* left side avatar for customer/internal; right for agent */}
                    {msg.authorType === 'customer' && (
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback>{msg.authorName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`flex-1 ${msg.authorType === 'agent' ? 'ml-auto max-w-[70%]' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm text-slate-800 font-semibold">{msg.authorName}</div>
                        <div className="text-xs text-slate-400">{msg.authorType === 'customer' ? 'Customer' : msg.authorType === 'agent' ? 'Agent' : 'Internal Note'} • {new Date(msg.created_at).toLocaleString()}</div>
                      </div>

                      <div className={`p-4 rounded-lg border ${msg.authorType === 'customer' ? 'bg-slate-50 border-slate-100 text-slate-800' : msg.authorType === 'agent' ? 'bg-white border-slate-100 shadow' : 'bg-yellow-50 border-yellow-100 text-slate-800'}`}>
                        {msg.content}
                      </div>
                    </div>

                    {msg.authorType === 'agent' && (
                      <div className="flex items-center justify-end flex-shrink-0">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>J</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}

                <div className="text-center text-xs text-slate-400 py-2">NEW MESSAGES</div>
              </div>

              {/* Composer - Fixed at Bottom */}
              <div className="flex-shrink-0 border-t border-slate-200 p-6 bg-slate-50">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <button className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${replyType === 'public' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`} onClick={() => setReplyType('public')}>Public Reply</button>
                    <button className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${replyType === 'internal' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`} onClick={() => setReplyType('internal')}>Internal Note</button>
                  </div>
                  <div className="ml-auto text-sm text-slate-500">SLA: <span className="font-medium">2h 15m</span></div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <Input value={''} onChange={() => { }} placeholder={`To: ${conversation.customerEmail}`} className="bg-white rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={isTemplatesOpen} onOpenChange={setTemplatesOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="px-3 text-sm">Templates</Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-7xl w-full max-w-7xl">
                          <DialogHeader>
                            <DialogTitle>Templates</DialogTitle>
                          </DialogHeader>

                          <TemplatesModal onInsert={(t) => insertTemplate(t)} />
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" className="px-3 text-sm" onClick={() => notifyInfo('Add CC/BCC')}>Add CC/BCC</Button>
                      <Button className="px-4 bg-[#0E042F] text-white hover:bg-[#0E042F]/90" onClick={sendMessage}>Send</Button>
                    </div>
                  </div>

                  <textarea value={composer} onChange={(e) => setComposer(e.target.value)} className="w-full h-24 border border-slate-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400" placeholder="Type your reply to the customer..."></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - sidebar (1/3 width) - Scrollable */}
          <div className="space-y-6 overflow-y-auto h-full">
            {/* Ticket information */}
            <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Ticket Information</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <Select>
                    <SelectTrigger className="rounded-lg bg-white h-10 text-sm">
                      <SelectValue placeholder={conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="solved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-1">Priority</div>
                  <Select>
                    <SelectTrigger className="rounded-lg bg-white h-10 text-sm">
                      <SelectValue placeholder={conversation.priority ?? 'Normal'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-500 mb-2">Tags</div>
                <div className="flex gap-2 flex-wrap items-center">
                  {tags.map(t => (
                    <div key={t.id} className="flex items-center bg-slate-50 border px-2 py-1 rounded-md">
                      <span className="text-xs">{t.label}</span>
                      <button
                        onClick={() => setTags(tags.filter(tag => tag.id !== t.id))}
                        className="ml-1.5 text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <Popover open={isTagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button className="text-xs text-purple-600 ml-1 hover:bg-purple-50 px-2 py-1 rounded-md transition-colors">+ Add tag</button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[200px]" align="start">
                      <Command>
                        <CommandInput placeholder="Search tags..." autoFocus />
                        <CommandList>
                          <CommandEmpty>No tags found.</CommandEmpty>
                          <CommandGroup heading="Available Tags">
                            {AVAILABLE_TAGS.map((tag) => {
                              const isSelected = tags.some(t => t.label === tag.label);
                              return (
                                <CommandItem
                                  key={tag.value}
                                  value={tag.label}
                                  onSelect={() => handleAddTag(tag.label)}
                                  className="cursor-pointer"
                                  disabled={isSelected}
                                >
                                  <Tag className="mr-2 size-3.5 text-slate-400" />
                                  <span>{tag.label}</span>
                                  {isSelected && <Check className="ml-auto size-3.5" />}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem onSelect={() => notifyInfo('Create new tag (mock)')} className="cursor-pointer font-medium text-purple-600">
                              <Plus className="mr-2 size-3.5" />
                              Add new tag
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                <div>
                  <div className="mb-1">Created At</div>
                  <div className="font-medium text-slate-700">{new Date(conversation.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="mb-1">Last Updated</div>
                  <div className="font-medium text-slate-700">{new Date(conversation.updated_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-700">
                <div className="font-semibold mb-1">Channel</div>
                <div className="text-sm text-slate-500 flex items-center gap-2">Email (support@example.com)</div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Customer Information</h4>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>{conversation.customerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-slate-900">{conversation.customerName}</div>
                  <div className="text-sm text-slate-500">Acme Corp</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-700">
                <div className="text-slate-500">{conversation.customerEmail}</div>
                <div className="text-slate-500 mt-1">+1 (555) 123-4567</div>
                <div className="text-slate-500 mt-1">San Francisco, CA</div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Tickets</div>
                    <div className="font-semibold">12</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">CSAT</div>
                    <div className="font-semibold text-green-600">98%</div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-purple-600 cursor-pointer" onClick={() => notifyInfo('View profile')}>Unlink | View Profile</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetailPage;
