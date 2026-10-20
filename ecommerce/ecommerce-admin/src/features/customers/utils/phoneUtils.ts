export const extractLocalPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    const withoutPlus = cleaned.substring(1);
    if (withoutPlus.startsWith('91') && withoutPlus.length >= 11) {
      return withoutPlus.slice(-10);
    }
    return withoutPlus;
  }

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.substring(2);
  }

  return cleaned;
};

export const formatPhoneForDisplay = (phone: string): { countryCode: string; number: string } => {
  if (!phone) return { countryCode: '+91', number: '' };

  const cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    const withoutPlus = cleaned.substring(1);
    if (withoutPlus.startsWith('91')) {
      return { countryCode: '+91', number: withoutPlus.substring(2) };
    }
    return { countryCode: '+' + withoutPlus.substring(0, withoutPlus.length - 10), number: withoutPlus.slice(-10) };
  }

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return { countryCode: '+91', number: cleaned.substring(2) };
  }

  if (cleaned.length === 10) {
    return { countryCode: '+91', number: cleaned };
  }

  return { countryCode: '+91', number: cleaned };
};
