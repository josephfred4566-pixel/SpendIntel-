export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  country: string;
  flag: string;
  decimals?: number;
}

// Master Sovereign Currency Registry - Sorted Alphabetically by Currency Name (A to Z)
export const WORLD_CURRENCIES: CurrencyInfo[] = [
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', country: 'Afghanistan', flag: '🇦🇫' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek', country: 'Albania', flag: '🇦🇱', decimals: 0 },
  { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar', country: 'Algeria', flag: '🇩🇿' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza', country: 'Angola', flag: '🇦🇴' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', country: 'Argentina', flag: '🇦🇷' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram', country: 'Armenia', flag: '🇦🇲', decimals: 0 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BSD', symbol: 'B$', name: 'Bahamian Dollar', country: 'Bahamas', flag: '🇧🇸' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar', country: 'Bahrain', flag: '🇧🇭', decimals: 3 },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', country: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar', country: 'Barbados', flag: '🇧🇧' },
  { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar', country: 'Belize', flag: '🇧🇿' },
  { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano', country: 'Bolivia', flag: '🇧🇴' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia & Herzegovina Mark', country: 'Bosnia & Herzegovina', flag: '🇧🇦' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula', country: 'Botswana', flag: '🇧🇼' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil', flag: '🇧🇷' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar', country: 'Brunei', flag: '🇧🇳' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', country: 'Bulgaria', flag: '🇧🇬' },
  { code: 'BIF', symbol: 'FBu', name: 'Burundian Franc', country: 'Burundi', flag: '🇧🇮', decimals: 0 },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', country: 'Cambodia', flag: '🇰🇭', decimals: 0 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦' },
  { code: 'CVE', symbol: 'Esc', name: 'Cape Verdean Escudo', country: 'Cape Verde', flag: '🇨🇻' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', country: 'Cameroon, Gabon, Congo, Chad, etc.', flag: '🌍', decimals: 0 },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', country: 'Chile', flag: '🇨🇱', decimals: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan Renminbi', country: 'China', flag: '🇨🇳' },
  { code: 'COP', symbol: 'CO$', name: 'Colombian Peso', country: 'Colombia', flag: '🇨🇴', decimals: 0 },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón', country: 'Costa Rica', flag: '🇨🇷', decimals: 0 },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', country: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark', flag: '🇩🇰' },
  { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc', country: 'Djibouti', flag: '🇩🇯', decimals: 0 },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso', country: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt', flag: '🇪🇬' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', country: 'Ethiopia', flag: '🇪🇹' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union (Germany, France, Italy, Spain, etc.)', flag: '🇪🇺' },
  { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar', country: 'Fiji', flag: '🇫🇯' },
  { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi', country: 'Gambia', flag: '🇬🇲' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari', country: 'Georgia', flag: '🇬🇪' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', country: 'Ghana', flag: '🇬🇭' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal', country: 'Guatemala', flag: '🇬🇹' },
  { code: 'GNF', symbol: 'FG', name: 'Guinean Franc', country: 'Guinea', flag: '🇬🇳', decimals: 0 },
  { code: 'GYD', symbol: 'G$', name: 'Guyanese Dollar', country: 'Guyana', flag: '🇬🇾', decimals: 0 },
  { code: 'HTG', symbol: 'G', name: 'Haitian Gourde', country: 'Haiti', flag: '🇭🇹' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira', country: 'Honduras', flag: '🇭🇳' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong', flag: '🇭🇰' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', country: 'Hungary', flag: '🇭🇺', decimals: 0 },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna', country: 'Iceland', flag: '🇮🇸', decimals: 0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India', flag: '🇮🇳' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia', flag: '🇮🇩', decimals: 0 },
  { code: 'IQD', symbol: 'IQD', name: 'Iraqi Dinar', country: 'Iraq', flag: '🇮🇶', decimals: 0 },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', country: 'Israel', flag: '🇮🇱' },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar', country: 'Jamaica', flag: '🇯🇲' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵', decimals: 0 },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar', country: 'Jordan', flag: '🇯🇴', decimals: 3 },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', country: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya', flag: '🇰🇪' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', country: 'Kuwait', flag: '🇰🇼', decimals: 3 },
  { code: 'KGS', symbol: 'с', name: 'Kyrgyzstani Som', country: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'LAK', symbol: '₭', name: 'Lao Kip', country: 'Laos', flag: '🇱🇦', decimals: 0 },
  { code: 'LBP', symbol: 'L£', name: 'Lebanese Pound', country: 'Lebanon', flag: '🇱🇧', decimals: 0 },
  { code: 'LSL', symbol: 'L', name: 'Lesotho Loti', country: 'Lesotho', flag: '🇱🇸' },
  { code: 'LYD', symbol: 'LD', name: 'Libyan Dinar', country: 'Libya', flag: '🇱🇾', decimals: 3 },
  { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca', country: 'Macau', flag: '🇲🇴' },
  { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary', country: 'Madagascar', flag: '🇲🇬', decimals: 0 },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha', country: 'Malawi', flag: '🇲🇼' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia', flag: '🇲🇾' },
  { code: 'MUR', symbol: 'Rs', name: 'Mauritian Rupee', country: 'Mauritius', flag: '🇲🇺' },
  { code: 'MRU', symbol: 'UM', name: 'Mauritanian Ouguiya', country: 'Mauritania', flag: '🇲🇷' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', country: 'Mexico', flag: '🇲🇽' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu', country: 'Moldova', flag: '🇲🇩' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tögrög', country: 'Mongolia', flag: '🇲🇳', decimals: 0 },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', country: 'Morocco', flag: '🇲🇦' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical', country: 'Mozambique', flag: '🇲🇿' },
  { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', country: 'Myanmar', flag: '🇲🇲', decimals: 0 },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar', country: 'Namibia', flag: '🇳🇦' },
  { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee', country: 'Nepal', flag: '🇳🇵' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', country: 'Taiwan', flag: '🇹🇼' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand', flag: '🇳🇿' },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba', country: 'Nicaragua', flag: '🇳🇮' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria', flag: '🇳🇬' },
  { code: 'MKD', symbol: 'ден', name: 'North Macedonian Denar', country: 'North Macedonia', flag: '🇲🇰' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway', flag: '🇳🇴' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', country: 'Oman', flag: '🇴🇲', decimals: 3 },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', country: 'Pakistan', flag: '🇵🇰' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa', country: 'Panama', flag: '🇵🇦' },
  { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina', country: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'PYG', symbol: '₲', name: 'Paraguayan Guaraní', country: 'Paraguay', flag: '🇵🇾', decimals: 0 },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol', country: 'Peru', flag: '🇵🇪' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines', flag: '🇵🇭' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', country: 'Poland', flag: '🇵🇱' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', country: 'Qatar', flag: '🇶🇦' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', country: 'Romania', flag: '🇷🇴' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', country: 'Rwanda', flag: '🇷🇼', decimals: 0 },
  { code: 'WST', symbol: 'WS$', name: 'Samoan Tālā', country: 'Samoa', flag: '🇼🇸' },
  { code: 'STN', symbol: 'Db', name: 'São Tomé and Príncipe Dobra', country: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'RSD', symbol: 'дин.', name: 'Serbian Dinar', country: 'Serbia', flag: '🇷🇸' },
  { code: 'SCR', symbol: 'SR', name: 'Seychellois Rupee', country: 'Seychelles', flag: '🇸🇨' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore', flag: '🇸🇬' },
  { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar', country: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'SOS', symbol: 'Sh', name: 'Somali Shilling', country: 'Somalia', flag: '🇸🇴', decimals: 0 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa', flag: '🇿🇦' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea', flag: '🇰🇷', decimals: 0 },
  { code: 'SSP', symbol: 'SS£', name: 'South Sudanese Pound', country: 'South Sudan', flag: '🇸🇸' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SRD', symbol: 'Sr$', name: 'Surinamese Dollar', country: 'Suriname', flag: '🇸🇷' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden', flag: '🇸🇪' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland', flag: '🇨🇭' },
  { code: 'SZL', symbol: 'E', name: 'Eswatini Lilangeni', country: 'Eswatini', flag: '🇸🇿' },
  { code: 'TJS', symbol: 'ЅМ', name: 'Tajikistani Somoni', country: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', country: 'Tanzania', flag: '🇹🇿', decimals: 0 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭' },
  { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga', country: 'Tonga', flag: '🇹🇴' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad and Tobago Dollar', country: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar', country: 'Tunisia', flag: '🇹🇳', decimals: 3 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey', flag: '🇹🇷' },
  { code: 'TMT', symbol: 'm', name: 'Turkmenistan Manat', country: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', country: 'Uganda', flag: '🇺🇬', decimals: 0 },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', country: 'Ukraine', flag: '🇺🇦' },
  { code: 'AED', symbol: 'AED', name: 'United Arab Emirates Dirham', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso', country: 'Uruguay', flag: '🇺🇾' },
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', flag: '🇺🇸' },
  { code: 'UZS', symbol: 'soʻm', name: 'Uzbekistani Som', country: 'Uzbekistan', flag: '🇺🇿', decimals: 0 },
  { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu', country: 'Vanuatu', flag: '🇻🇺', decimals: 0 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Đồng', country: 'Vietnam', flag: '🇻🇳', decimals: 0 },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', country: 'Ivory Coast, Senegal, Mali, Benin, etc.', flag: '🌍', decimals: 0 },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial', country: 'Yemen', flag: '🇾🇪' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha', country: 'Zambia', flag: '🇿🇲' },
];

// Currencies sorted strictly alphabetically by 3-letter ISO Code (A to Z)
export const WORLD_CURRENCIES_BY_CODE: CurrencyInfo[] = [...WORLD_CURRENCIES].sort((a, b) => 
  a.code.localeCompare(b.code)
);

// Currencies sorted strictly alphabetically by Country Name (A to Z)
export const WORLD_CURRENCIES_BY_COUNTRY: CurrencyInfo[] = [...WORLD_CURRENCIES].sort((a, b) => 
  a.country.localeCompare(b.country)
);

// Currencies sorted strictly alphabetically by Currency Name (A to Z)
export const WORLD_CURRENCIES_BY_NAME: CurrencyInfo[] = [...WORLD_CURRENCIES].sort((a, b) => 
  a.name.localeCompare(b.name)
);

export const POPULAR_CURRENCY_CODES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'ZAR', 'NGN', 'SGD', 'MXN', 'AED'
];

/**
 * Robust financial currency formatter
 */
export function formatMoney(amount: number, currencyCode: string | CurrencyInfo = 'USD'): string {
  const safeCode: string = typeof currencyCode === 'string'
    ? currencyCode
    : (currencyCode && typeof currencyCode === 'object' && 'code' in currencyCode && typeof (currencyCode as any).code === 'string')
      ? (currencyCode as any).code
      : 'USD';

  const currency = WORLD_CURRENCIES.find(c => c.code.toUpperCase() === safeCode.toUpperCase()) || {
    code: safeCode,
    symbol: safeCode,
    decimals: 2
  };

  const dec = currency.decimals !== undefined ? currency.decimals : 2;
  const numFormatted = (Number(amount) || 0).toLocaleString('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });

  return `${currency.symbol}${numFormatted}`;
}

export function getCurrencyInfo(code?: string | CurrencyInfo | null): CurrencyInfo {
  const safeCode: string = typeof code === 'string'
    ? code
    : (code && typeof code === 'object' && 'code' in code && typeof (code as any).code === 'string')
      ? (code as any).code
      : 'USD';

  return (
    WORLD_CURRENCIES.find(c => c.code.toUpperCase() === safeCode.toUpperCase()) || {
      code: safeCode,
      symbol: safeCode,
      name: `${safeCode} Currency`,
      country: 'International',
      flag: '🌐',
      decimals: 2
    }
  );
}
