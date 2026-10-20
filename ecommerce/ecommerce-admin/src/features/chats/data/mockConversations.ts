import type { Conversation } from '../types/conversation.types';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'CONV-001',
    customerName: 'Alice Smith',
    customerEmail: 'alice@example.com',
    subject: 'Missing package delivery - Order #ORD-7829',
    preview: "Hi, I'm having trouble with my recent order...",
    status: 'open',
    priority: 'high',
    tags: [
      { id: 'tag-1', label: 'shipping', color: 'blue' },
      { id: 'tag-2', label: 'missing', color: 'red' }
    ],
    created_at: '2026-01-07T10:30:00Z',
    updated_at: '2026-01-07T10:30:00Z',
    unreadCount: 2
  },
  {
    id: 'CONV-002',
    customerName: 'Bob Jones',
    customerEmail: 'bob@example.com',
    subject: 'Login issues on mobile app',
    preview: 'I tried resetting my password but...',
    status: 'open',
    tags: [
      { id: 'tag-3', label: 'technical', color: 'purple' },
      { id: 'tag-4', label: 'mobile', color: 'green' }
    ],
    created_at: '2026-01-07T09:15:00Z',
    updated_at: '2026-01-07T09:45:00Z',
    unreadCount: 1
  },
  {
    id: 'CONV-003',
    customerName: 'Charlie Day',
    customerEmail: 'charlie@example.com',
    subject: 'Refund request for subscription',
    preview: 'Thanks for the update. Waiting for...',
    status: 'pending',
    tags: [
      { id: 'tag-5', label: 'billing', color: 'yellow' }
    ],
    created_at: '2026-01-06T14:20:00Z',
    updated_at: '2026-01-07T08:10:00Z',
    unreadCount: 0
  },
  {
    id: 'CONV-004',
    customerName: 'Diana Prince',
    customerEmail: 'diana@example.com',
    subject: 'Feature request: Dark mode',
    preview: 'That is great news! details...',
    status: 'solved',
    tags: [
      { id: 'tag-6', label: 'feature-request', color: 'indigo' }
    ],
    created_at: '2026-01-05T11:30:00Z',
    updated_at: '2026-01-06T16:45:00Z',
    unreadCount: 0
  },
  {
    id: 'CONV-005',
    customerName: 'Evan Wright',
    customerEmail: 'evan@example.com',
    subject: 'Integration with Slack not working',
    preview: 'Our team is completely blocked by this...',
    status: 'open',
    priority: 'urgent',
    tags: [
      { id: 'tag-7', label: 'technical', color: 'purple' },
      { id: 'tag-8', label: 'integration', color: 'pink' }
    ],
    created_at: '2026-01-05T08:00:00Z',
    updated_at: '2026-01-07T07:20:00Z',
    unreadCount: 3
  },
  {
    id: 'CONV-006',
    customerName: 'Fiona Green',
    customerEmail: 'fiona@example.com',
    subject: 'Payment method update',
    preview: 'I need to update my credit card...',
    status: 'pending',
    tags: [
      { id: 'tag-9', label: 'billing', color: 'yellow' }
    ],
    created_at: '2026-01-04T16:30:00Z',
    updated_at: '2026-01-06T12:15:00Z',
    unreadCount: 0
  },
  {
    id: 'CONV-007',
    customerName: 'George Hill',
    customerEmail: 'george@example.com',
    subject: 'Account verification issue',
    preview: 'Please help me verify my account...',
    status: 'open',
    tags: [
      { id: 'tag-10', label: 'account', color: 'teal' }
    ],
    created_at: '2026-01-04T10:00:00Z',
    updated_at: '2026-01-06T09:30:00Z',
    unreadCount: 1
  },
  {
    id: 'CONV-008',
    customerName: 'Hannah Lee',
    customerEmail: 'hannah@example.com',
    subject: 'Product recommendation needed',
    preview: 'Can you suggest which plan is best...',
    status: 'solved',
    tags: [
      { id: 'tag-11', label: 'sales', color: 'green' }
    ],
    created_at: '2026-01-03T14:45:00Z',
    updated_at: '2026-01-05T11:20:00Z',
    unreadCount: 0
  }
];

export const CONVERSATION_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'solved', label: 'Solved' },
  { value: 'urgent', label: 'Urgent' }
];

export const CONVERSATION_PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' }
];
