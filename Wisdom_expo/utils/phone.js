export const countryCodeToCallingCode = {
  AR: '54',
  AU: '61',
  AT: '43',
  BE: '32',
  BR: '55',
  BG: '359',
  CA: '1',
  HR: '385',
  CY: '357',
  CZ: '420',
  DK: '45',
  EE: '372',
  FI: '358',
  FR: '33',
  DE: '49',
  GR: '30',
  HK: '852',
  HU: '36',
  IN: '91',
  ID: '62',
  IE: '353',
  IL: '972',
  IT: '39',
  JP: '81',
  LV: '371',
  LT: '370',
  LU: '352',
  MY: '60',
  MT: '356',
  MX: '52',
  NL: '31',
  NZ: '64',
  NO: '47',
  PH: '63',
  PL: '48',
  PT: '351',
  RO: '40',
  SA: '966',
  SG: '65',
  SK: '421',
  SI: '386',
  KR: '82',
  ES: '34',
  SE: '46',
  CH: '41',
  TH: '66',
  AE: '971',
  GB: '44',
  US: '1',
  VN: '84',
};

export function formatE164IfMissing(inputPhone, countryAlpha2) {
  if (!inputPhone || typeof inputPhone !== 'string') return inputPhone;
  const trimmed = inputPhone.trim();
  // If already has +, normalize by keeping + and digits only
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/[^\d]/g, '');
    return `+${digits}`;
  }

  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return inputPhone;

  const iso = (countryAlpha2 || '').toUpperCase();
  const calling = countryCodeToCallingCode[iso];

  if (!calling) {
    // Fallback: just add + in front of the digits provided
    return `+${digits}`;
  }

  // If user already typed with country code but without + (e.g., 349XXXXXXXX)
  if (digits.startsWith(calling)) {
    return `+${digits}`;
  }

  return `+${calling}${digits}`;
}

