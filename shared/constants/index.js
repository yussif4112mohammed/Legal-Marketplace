const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];

const PRACTICE_AREAS = [
  { id: 1, name: 'Real Estate Law',       icon: '🏠', slug: 'real-estate' },
  { id: 2, name: 'Property Disputes',     icon: '⚖️', slug: 'property-disputes' },
  { id: 3, name: 'Immigration Law',       icon: '🌍', slug: 'immigration' },
  { id: 4, name: 'Business Law',          icon: '💼', slug: 'business' },
  { id: 5, name: 'Family Law',            icon: '👨‍👩‍👧', slug: 'family' },
  { id: 6, name: 'Criminal Defense',      icon: '🛡️', slug: 'criminal-defense' },
  { id: 7, name: 'Personal Injury',       icon: '🏥', slug: 'personal-injury' },
  { id: 8, name: 'Employment Law',        icon: '📋', slug: 'employment' },
  { id: 9, name: 'Estate Planning',       icon: '📜', slug: 'estate-planning' },
  { id: 10, name: 'Intellectual Property',icon: '💡', slug: 'ip' },
  { id: 11, name: 'Tax Law',              icon: '🧾', slug: 'tax' },
  { id: 12, name: 'Civil Litigation',     icon: '⚖️', slug: 'civil-litigation' },
];

const USER_ROLES = { CLIENT: 'client', LAWYER: 'lawyer', ADMIN: 'admin' };

const BOOKING_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW:   'no_show',
};

const LAWYER_APPROVAL = {
  PENDING:   'pending',
  APPROVED:  'approved',
  REJECTED:  'rejected',
  SUSPENDED: 'suspended',
};

module.exports = { US_STATES, PRACTICE_AREAS, USER_ROLES, BOOKING_STATUS, LAWYER_APPROVAL };
