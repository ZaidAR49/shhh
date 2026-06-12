// ============================================================
// Shhh — Secret Type Configurations
// Defines icons, labels (i18n keys), colors, and fields for
// all 9 supported secret types.
// ============================================================

export type SecretType =
  | 'password'
  | 'visa'
  | 'env_variable'
  | 'api_key'
  | 'license'
  | 'identity'
  | 'bank_account'
  | 'secure_note'
  | 'wifi';

export interface SecretField {
  key: string;
  labelKey: string;
  type: 'text' | 'password' | 'number' | 'textarea' | 'date' | 'select';
  masked: boolean;       // Whether to show MaskToggle
  copyable: boolean;     // Whether to show CopyButton
  monospace: boolean;    // Whether to render in mono font
  required: boolean;
  selectOptions?: { value: string; labelKey: string }[];
  placeholder?: string;
}

export interface SecretTypeConfig {
  type: SecretType;
  labelKey: string;        // i18n key e.g. 'secretTypes.password'
  descriptionKey: string;
  iconName: string;        // react-icons identifier (from 'ri' set)
  badgeColor: string;      // Tailwind bg class for the type badge
  primaryField: string;    // The key of the "main" field shown in card preview
  fields: SecretField[];
}

export const SECRET_TYPE_CONFIGS: SecretTypeConfig[] = [
  {
    type: 'password',
    labelKey: 'secretTypes.password',
    descriptionKey: 'secretTypes.passwordDesc',
    iconName: 'RiLockPasswordLine',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    primaryField: 'password',
    fields: [
      { key: 'site_url',  labelKey: 'fields.siteUrl',  type: 'text',     masked: false, copyable: false, monospace: false, required: false },
      { key: 'username',  labelKey: 'fields.username',  type: 'text',     masked: false, copyable: true,  monospace: false, required: true  },
      { key: 'password',  labelKey: 'fields.password',  type: 'password', masked: true,  copyable: true,  monospace: true,  required: true  },
      { key: 'notes',     labelKey: 'fields.notes',     type: 'textarea', masked: false, copyable: false, monospace: false, required: false },
    ],
  },
  {
    type: 'visa',
    labelKey: 'secretTypes.visa',
    descriptionKey: 'secretTypes.visaDesc',
    iconName: 'RiBankCardLine',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    primaryField: 'card_number',
    fields: [
      { key: 'card_holder',     labelKey: 'fields.cardHolder',     type: 'text',     masked: false, copyable: false, monospace: false, required: true  },
      { key: 'card_number',     labelKey: 'fields.cardNumber',     type: 'text',     masked: true,  copyable: true,  monospace: true,  required: true, placeholder: '4111 1111 1111 1111' },
      { key: 'expiry_date',     labelKey: 'fields.expiryDate',     type: 'text',     masked: false, copyable: false, monospace: true,  required: true, placeholder: 'MM/YY' },
      { key: 'cvv',             labelKey: 'fields.cvv',            type: 'password', masked: true,  copyable: false, monospace: true,  required: true  },
      { key: 'billing_address', labelKey: 'fields.billingAddress', type: 'textarea', masked: false, copyable: false, monospace: false, required: false },
    ],
  },
  {
    type: 'env_variable',
    labelKey: 'secretTypes.env_variable',
    descriptionKey: 'secretTypes.envVariableDesc',
    iconName: 'RiTerminalLine',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    primaryField: 'content',
    fields: [
      { key: 'content', labelKey: 'fields.content', type: 'textarea', masked: true, copyable: true, monospace: true, required: true, placeholder: 'API_KEY=123\nDB_PASS=abc' },
      { key: 'project',       labelKey: 'fields.project',      type: 'text',     masked: false, copyable: false, monospace: false, required: false },
      { key: 'notes',         labelKey: 'fields.notes',        type: 'textarea', masked: false, copyable: false, monospace: false, required: false },
    ],
  },
  {
    type: 'api_key',
    labelKey: 'secretTypes.api_key',
    descriptionKey: 'secretTypes.apiKeyDesc',
    iconName: 'RiKey2Line',
    badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    primaryField: 'api_key',
    fields: [
      { key: 'service_name', labelKey: 'fields.serviceName', type: 'text',     masked: false, copyable: false, monospace: false, required: true  },
      { key: 'api_key',      labelKey: 'fields.apiKey',      type: 'password', masked: true,  copyable: true,  monospace: true,  required: true  },
      { key: 'key_alias',    labelKey: 'fields.keyAlias',    type: 'text',     masked: false, copyable: false, monospace: false, required: false },
      { key: 'expiry_date',  labelKey: 'fields.expiryDate',  type: 'date',     masked: false, copyable: false, monospace: false, required: false },
      { key: 'notes',        labelKey: 'fields.notes',       type: 'textarea', masked: false, copyable: false, monospace: false, required: false },
    ],
  },
  {
    type: 'license',
    labelKey: 'secretTypes.license',
    descriptionKey: 'secretTypes.licenseDesc',
    iconName: 'RiFileTextLine',
    badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    primaryField: 'license_key',
    fields: [
      { key: 'software_name', labelKey: 'fields.softwareName', type: 'text',     masked: false, copyable: false, monospace: false, required: true  },
      { key: 'license_key',   labelKey: 'fields.licenseKey',   type: 'password', masked: true,  copyable: true,  monospace: true,  required: true  },
      { key: 'licensed_to',   labelKey: 'fields.licensedTo',   type: 'text',     masked: false, copyable: false, monospace: false, required: false },
      { key: 'purchase_date', labelKey: 'fields.purchaseDate', type: 'date',     masked: false, copyable: false, monospace: false, required: false },
      { key: 'expiry_date',   labelKey: 'fields.expiryDate',   type: 'date',     masked: false, copyable: false, monospace: false, required: false },
    ],
  },
  {
    type: 'identity',
    labelKey: 'secretTypes.identity',
    descriptionKey: 'secretTypes.identityDesc',
    iconName: 'RiPassportLine',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    primaryField: 'document_number',
    fields: [
      {
        key: 'document_type', labelKey: 'fields.documentType', type: 'select', masked: false, copyable: false, monospace: false, required: true,
        selectOptions: [
          { value: 'passport',         labelKey: 'fields.docTypePassport' },
          { value: 'national_id',      labelKey: 'fields.docTypeNationalId' },
          { value: 'drivers_license',  labelKey: 'fields.docTypeDrivers' },
          { value: 'residence_permit', labelKey: 'fields.docTypeResidence' },
        ],
      },
      { key: 'full_name',       labelKey: 'fields.fullName',      type: 'text', masked: false, copyable: false, monospace: false, required: true  },
      { key: 'document_number', labelKey: 'fields.documentNumber', type: 'text', masked: true,  copyable: true,  monospace: true,  required: true  },
      { key: 'issue_date',      labelKey: 'fields.issueDate',      type: 'date', masked: false, copyable: false, monospace: false, required: false },
      { key: 'expiry_date',     labelKey: 'fields.expiryDate',     type: 'date', masked: false, copyable: false, monospace: false, required: false },
      { key: 'issuing_country', labelKey: 'fields.issuingCountry', type: 'text', masked: false, copyable: false, monospace: false, required: false },
    ],
  },
  {
    type: 'bank_account',
    labelKey: 'secretTypes.bank_account',
    descriptionKey: 'secretTypes.bankAccountDesc',
    iconName: 'RiBankLine',
    badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    primaryField: 'account_number',
    fields: [
      { key: 'bank_name',      labelKey: 'fields.bankName',      type: 'text', masked: false, copyable: false, monospace: false, required: true  },
      { key: 'account_holder', labelKey: 'fields.accountHolder', type: 'text', masked: false, copyable: false, monospace: false, required: true  },
      { key: 'account_number', labelKey: 'fields.accountNumber', type: 'text', masked: true,  copyable: true,  monospace: true,  required: true  },
      { key: 'iban',           labelKey: 'fields.iban',          type: 'text', masked: true,  copyable: true,  monospace: true,  required: false, placeholder: 'GB29 NWBK 6016 1331 9268 19' },
      { key: 'swift_bic',      labelKey: 'fields.swiftBic',      type: 'text', masked: false, copyable: true,  monospace: true,  required: false },
      { key: 'currency',       labelKey: 'fields.currency',      type: 'text', masked: false, copyable: false, monospace: true,  required: false, placeholder: 'USD' },
    ],
  },
  {
    type: 'secure_note',
    labelKey: 'secretTypes.secure_note',
    descriptionKey: 'secretTypes.secureNoteDesc',
    iconName: 'RiStickyNoteLine',
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    primaryField: 'content',
    fields: [
      { key: 'title',   labelKey: 'fields.title',   type: 'text',     masked: false, copyable: false, monospace: false, required: true  },
      { key: 'content', labelKey: 'fields.content', type: 'textarea', masked: true,  copyable: true,  monospace: false, required: true  },
      { key: 'tags',    labelKey: 'fields.tags',    type: 'text',     masked: false, copyable: false, monospace: false, required: false },
    ],
  },
  {
    type: 'wifi',
    labelKey: 'secretTypes.wifi',
    descriptionKey: 'secretTypes.wifiDesc',
    iconName: 'RiWifiLine',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    primaryField: 'password',
    fields: [
      { key: 'network_name',  labelKey: 'fields.networkName',  type: 'text',     masked: false, copyable: false, monospace: false, required: true  },
      { key: 'password',      labelKey: 'fields.password',     type: 'password', masked: true,  copyable: true,  monospace: true,  required: true  },
      {
        key: 'security_type', labelKey: 'fields.securityType', type: 'select',   masked: false, copyable: false, monospace: false, required: true,
        selectOptions: [
          { value: 'WPA3', labelKey: 'fields.secWPA3' },
          { value: 'WPA2', labelKey: 'fields.secWPA2' },
          { value: 'WEP',  labelKey: 'fields.secWEP'  },
          { value: 'open', labelKey: 'fields.secOpen'  },
        ],
      },
      { key: 'notes', labelKey: 'fields.notes', type: 'textarea', masked: false, copyable: false, monospace: false, required: false },
    ],
  },
];

export const SECRET_TYPE_CONFIG_MAP = Object.fromEntries(
  SECRET_TYPE_CONFIGS.map((c) => [c.type, c])
) as Record<SecretType, SecretTypeConfig>;
