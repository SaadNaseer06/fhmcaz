export const site = {
  name: 'Fountain Hills Emergency Room and Medical Center',
  shortName: 'FHMC AZ',
  tagline: '24/7 Emergency Room & Medical Clinic',
  url: 'http://localhost/fhmcaz',
  email: 'info@fhmcaz.com',
  phones: {
    er: '(602) 671-7990',
    erTel: '6026717990',
    clinic: '(602) 671-7981',
    clinicTel: '6026717981',
    billing: '(480) 339-4825',
    billingTel: '4803394825',
  },
  address: {
    line1: '9700 N. Saguaro Blvd, Suite 100',
    city: 'Fountain Hills, AZ 85268',
    full: '9700 N. Saguaro Blvd, Fountain Hills, AZ 85268',
  },
  social: {
    facebook: 'https://www.facebook.com/FHMCAZ',
    instagram: 'https://www.instagram.com/fountainhillsemergencyroom',
  },
  payBill: 'https://www.paystatementonline.com/login',
  maps: 'https://www.google.com/maps/search/?api=1&query=9700+N+Saguaro+Blvd+Fountain+Hills+AZ',
  healthpass: '/contact-us/',
  wpApi:
    import.meta.env.WP_API_URL ||
    'http://localhost/fhmcaz/blog/wp-json/wp/v2',
};

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: { label: string; href: string }[];
};

/** Matches WP main-menu structure */
export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about-fountain-hills-medical-center/',
    children: [
      { label: 'Billing Questions', href: '/billing-questions/' },
      { label: 'Contact Us', href: '/contact-us/' },
      { label: 'Meet our Physicians', href: '/meet-our-physicians/' },
      { label: 'Blogs', href: '/blogs/' },
    ],
  },
  {
    label: '24/7 Emergency Room',
    href: '/fountain-hills-24-7emergency-room/',
    children: [
      {
        label: '24/7 Emergency Room',
        href: '/fountain-hills-24-7emergency-room/',
      },
      {
        label: 'ER Frequently Asked Questions',
        href: '/emergency-room-frequently-asked-questions/',
      },
    ],
  },
  {
    label: 'Primary Care & Urgent Care',
    href: '/fountain-hills-primary-care-clinic/',
    children: [
      {
        label: 'Primary Care & Urgent Care',
        href: '/primary-care-urgent-care/',
      },
      { label: 'Book Appointment', href: '/book-appointments/' },
      {
        label: 'Medical Clinic FAQs',
        href: '/frequently-asked-questions/',
      },
    ],
  },
  {
    label: 'Pay Bill',
    href: 'https://www.paystatementonline.com/login',
    external: true,
  },
];
