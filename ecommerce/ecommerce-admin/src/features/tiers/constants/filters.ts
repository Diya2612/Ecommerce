import { TIER_STATUSES } from './statuses';

/**
 * Tier Filter Values
 */
export const TIER_FILTER_VALUES = {
  STATUS: TIER_STATUSES,
  LEVEL: {
    LEVEL_1: '1',
    LEVEL_2: '2',
    LEVEL_3: '3',
    LEVEL_4: '4',
  },
  USAGE: {
    USED: 'used',
    UNUSED: 'unused',
  },
} as const;

/**
 * Tier Filter Options Factory
 */
export const TIER_FILTER_OPTIONS = {
  /**
   * Status filter group
   */
  STATUS: (
    status: string[],
    setStatus: (status: string[]) => void,
    setPage: (page: number) => void
  ) => ({
    id: 'status',
    label: 'Status',
    options: [
      {
        label: 'All Status',
        value: '',
        onSelect: () => {
          setStatus([]);
          setPage(1);
        },
        isActive: status.length === 0,
      },
      {
        label: 'Active',
        value: TIER_FILTER_VALUES.STATUS.ACTIVE,
        onSelect: () => {
          const newStatus = status.includes(TIER_FILTER_VALUES.STATUS.ACTIVE)
            ? status.filter((s) => s !== TIER_FILTER_VALUES.STATUS.ACTIVE)
            : [...status, TIER_FILTER_VALUES.STATUS.ACTIVE];
          setStatus(newStatus);
          setPage(1);
        },
        isActive: status.includes(TIER_FILTER_VALUES.STATUS.ACTIVE),
      },
      {
        label: 'Inactive',
        value: TIER_FILTER_VALUES.STATUS.INACTIVE,
        onSelect: () => {
          const newStatus = status.includes(TIER_FILTER_VALUES.STATUS.INACTIVE)
            ? status.filter((s) => s !== TIER_FILTER_VALUES.STATUS.INACTIVE)
            : [...status, TIER_FILTER_VALUES.STATUS.INACTIVE];
          setStatus(newStatus);
          setPage(1);
        },
        isActive: status.includes(TIER_FILTER_VALUES.STATUS.INACTIVE),
      },
    ],
  }),

  /**
   * Level filter group
   */
  LEVEL: (
    level: string[],
    setLevel: (level: string[]) => void,
    setPage: (page: number) => void
  ) => ({
    id: 'level',
    label: 'Hierarchy Level',
    options: [
      {
        label: 'All Levels',
        value: '',
        onSelect: () => {
          setLevel([]);
          setPage(1);
        },
        isActive: level.length === 0,
      },
      {
        label: 'Level 1',
        value: TIER_FILTER_VALUES.LEVEL.LEVEL_1,
        onSelect: () => {
          const newLevel = level.includes(TIER_FILTER_VALUES.LEVEL.LEVEL_1)
            ? level.filter((l) => l !== TIER_FILTER_VALUES.LEVEL.LEVEL_1)
            : [...level, TIER_FILTER_VALUES.LEVEL.LEVEL_1];
          setLevel(newLevel);
          setPage(1);
        },
        isActive: level.includes(TIER_FILTER_VALUES.LEVEL.LEVEL_1),
      },
      {
        label: 'Level 2',
        value: TIER_FILTER_VALUES.LEVEL.LEVEL_2,
        onSelect: () => {
          const newLevel = level.includes(TIER_FILTER_VALUES.LEVEL.LEVEL_2)
            ? level.filter((l) => l !== TIER_FILTER_VALUES.LEVEL.LEVEL_2)
            : [...level, TIER_FILTER_VALUES.LEVEL.LEVEL_2];
          setLevel(newLevel);
          setPage(1);
        },
        isActive: level.includes(TIER_FILTER_VALUES.LEVEL.LEVEL_2),
      },
      {
        label: 'Level 3',
        value: TIER_FILTER_VALUES.LEVEL.LEVEL_3,
        onSelect: () => {
          const newLevel = level.includes(TIER_FILTER_VALUES.LEVEL.LEVEL_3)
            ? level.filter((l) => l !== TIER_FILTER_VALUES.LEVEL.LEVEL_3)
            : [...level, TIER_FILTER_VALUES.LEVEL.LEVEL_3];
          setLevel(newLevel);
          setPage(1);
        },
        isActive: level.includes(TIER_FILTER_VALUES.LEVEL.LEVEL_3),
      },
      {
        label: 'Level 4',
        value: TIER_FILTER_VALUES.LEVEL.LEVEL_4,
        onSelect: () => {
          const newLevel = level.includes(TIER_FILTER_VALUES.LEVEL.LEVEL_4)
            ? level.filter((l) => l !== TIER_FILTER_VALUES.LEVEL.LEVEL_4)
            : [...level, TIER_FILTER_VALUES.LEVEL.LEVEL_4];
          setLevel(newLevel);
          setPage(1);
        },
        isActive: level.includes(TIER_FILTER_VALUES.LEVEL.LEVEL_4),
      },
    ],
  }),

  /**
   * Usage filter group
   */
  USAGE: (
    usage: string[],
    setUsage: (usage: string[]) => void,
    setPage: (page: number) => void
  ) => ({
    id: 'usage',
    label: 'Usage',
    options: [
      {
        label: 'All Usage',
        value: '',
        onSelect: () => {
          setUsage([]);
          setPage(1);
        },
        isActive: usage.length === 0,
      },
      {
        label: 'In Use',
        value: TIER_FILTER_VALUES.USAGE.USED,
        onSelect: () => {
          const newUsage = usage.includes(TIER_FILTER_VALUES.USAGE.USED)
            ? usage.filter((u) => u !== TIER_FILTER_VALUES.USAGE.USED)
            : [...usage, TIER_FILTER_VALUES.USAGE.USED];
          setUsage(newUsage);
          setPage(1);
        },
        isActive: usage.includes(TIER_FILTER_VALUES.USAGE.USED),
      },
      {
        label: 'Not In Use',
        value: TIER_FILTER_VALUES.USAGE.UNUSED,
        onSelect: () => {
          const newUsage = usage.includes(TIER_FILTER_VALUES.USAGE.UNUSED)
            ? usage.filter((u) => u !== TIER_FILTER_VALUES.USAGE.UNUSED)
            : [...usage, TIER_FILTER_VALUES.USAGE.UNUSED];
          setUsage(newUsage);
          setPage(1);
        },
        isActive: usage.includes(TIER_FILTER_VALUES.USAGE.UNUSED),
      },
    ],
  }),
};
