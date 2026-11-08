import {
  DAYS_OF_WEEK,
  DayOfWeek,
  DeliveryFeeBasis,
  OrganizationType,
  Permission,
  RoleName,
  type BranchForm,
  type DeliveryFeeRateForm,
  type OpeningHours,
  type OrderCountFeeRateForm,
} from '@vola/shared';

export interface SeedUser {
  name: string;
  email: string;
  phoneNumber: string;
  role: RoleName;
  teamName?: string;
  permissions?: Permission[];
}

export interface SeedMerchant {
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  deliveryFeeBasis?: DeliveryFeeBasis;
  deliveryFeeRate?: DeliveryFeeRateForm;
  orderCountFeeRate?: OrderCountFeeRateForm;
  branches?: BranchForm[];
}

export interface SeedOrganization {
  name: string;
  type: OrganizationType;
  countryCode: string;
  teamNames: string[];
  users: SeedUser[];
  merchants: SeedMerchant[];
}

function createOpeningHours(
  opensAt: string,
  closesAt: string,
  closedDays: DayOfWeek[] = [],
): OpeningHours[] {
  return DAYS_OF_WEEK.map((day) => {
    if (closedDays.includes(day)) {
      return { day, isOpen: false, opensAt: null, closesAt: null };
    }
    return { day, isOpen: true, opensAt, closesAt };
  });
}

export const PLATFORM_DRIVERS_MERCHANT_NAMES = [
  'Baleadas Doña Mary',
  'Farmacia San Rafael',
  'Panadería El Trigal',
];

export const SEED_ORGANIZATIONS: SeedOrganization[] = [
  {
    name: 'Volá!',
    type: OrganizationType.Platform,
    countryCode: 'HN',
    teamNames: ['Operaciones', 'Soporte a comercios'],
    merchants: [],
    users: [
      {
        name: 'Andrea Castillo',
        email: 'andrea.castillo@vola.hn',
        phoneNumber: '+50433451287',
        role: RoleName.Superadmin,
      },
      {
        name: 'José Luis Zelaya',
        email: 'jose.zelaya@vola.hn',
        phoneNumber: '+50497812054',
        role: RoleName.Administrator,
        teamName: 'Operaciones',
      },
      {
        name: 'Dania Rivera',
        email: 'dania.rivera@vola.hn',
        phoneNumber: '+50432987610',
        role: RoleName.Agent,
        teamName: 'Soporte a comercios',
        permissions: [
          Permission.ViewOrganizations,
          Permission.ManageDeliveryFees,
          Permission.ManageMerchants,
          Permission.CreateOrders,
          Permission.AssignOrders,
          Permission.ManageOrders,
        ],
      },
      {
        name: 'Marvin Turcios',
        email: 'marvin.turcios@vola.hn',
        phoneNumber: '+50495530218',
        role: RoleName.Driver,
      },
      {
        name: 'Kevin Ordóñez',
        email: 'kevin.ordonez@vola.hn',
        phoneNumber: '+50488217743',
        role: RoleName.Driver,
      },
      {
        name: 'Wilmer Cruz',
        email: 'wilmer.cruz@vola.hn',
        phoneNumber: '+50431906625',
        role: RoleName.Driver,
      },
    ],
  },
  {
    name: 'Baleadas Doña Mary',
    type: OrganizationType.Merchant,
    countryCode: 'HN',
    teamNames: ['Cocina', 'Despacho'],
    merchants: [
      {
        name: 'Baleadas Doña Mary',
        contactName: 'María Elena Banegas',
        contactEmail: 'maria.banegas@baleadasdonamary.hn',
        contactPhone: '+50499614402',
        branches: [
          {
            name: 'Col. Palmira',
            address: 'Col. Palmira, avenida República de Chile, Tegucigalpa',
            latitude: 14.098915,
            longitude: -87.190721,
            openingHours: createOpeningHours('07:00', '20:00'),
          },
          {
            name: 'Col. Kennedy',
            address: 'Col. Kennedy, bulevar Kennedy, Tegucigalpa',
            latitude: 14.059627,
            longitude: -87.177145,
            openingHours: createOpeningHours('07:00', '19:00', [
              DayOfWeek.Sunday,
            ]),
          },
        ],
        deliveryFeeBasis: DeliveryFeeBasis.Distance,
        deliveryFeeRate: {
          ranges: [
            { upToKm: 3, fee: 30 },
            { upToKm: 6, fee: 45 },
            { upToKm: null, fee: 60 },
          ],
          extraFeePerKm: null,
        },
      },
      {
        name: 'Licuados Doña Mary',
        contactName: 'Cindy Flores',
        contactEmail: 'cindy.flores@baleadasdonamary.hn',
        contactPhone: '+50433087719',
      },
    ],
    users: [
      {
        name: 'María Elena Banegas',
        email: 'maria.banegas@baleadasdonamary.hn',
        phoneNumber: '+50499614402',
        role: RoleName.Administrator,
      },
      {
        name: 'Cindy Flores',
        email: 'cindy.flores@baleadasdonamary.hn',
        phoneNumber: '+50433087719',
        role: RoleName.Agent,
        teamName: 'Despacho',
        permissions: [
          Permission.CreateOrders,
          Permission.AssignOrders,
          Permission.ManageOrders,
          Permission.ManageMerchants,
        ],
      },
      {
        name: 'Óscar Mendoza',
        email: 'oscar.mendoza@baleadasdonamary.hn',
        phoneNumber: '+50494425861',
        role: RoleName.Driver,
      },
    ],
  },
  {
    name: 'Farmacia San Rafael',
    type: OrganizationType.Merchant,
    countryCode: 'HN',
    teamNames: ['Mostrador'],
    merchants: [
      {
        name: 'Farmacia San Rafael',
        contactName: 'Gabriela Maradiaga',
        contactEmail: 'gabriela.maradiaga@farmaciasanrafael.hn',
        contactPhone: '+50432215508',
        branches: [
          {
            name: 'Barrio Abajo',
            address: 'Barrio Abajo, calle La Fuente, Tegucigalpa',
            latitude: 14.106402,
            longitude: -87.204338,
            openingHours: createOpeningHours('08:00', '21:00'),
          },
        ],
        deliveryFeeBasis: DeliveryFeeBasis.Distance,
        deliveryFeeRate: {
          ranges: [{ upToKm: 2, fee: 0 }],
          extraFeePerKm: 10,
        },
      },
    ],
    users: [
      {
        name: 'Gabriela Maradiaga',
        email: 'gabriela.maradiaga@farmaciasanrafael.hn',
        phoneNumber: '+50432215508',
        role: RoleName.Administrator,
      },
      {
        name: 'Héctor Funes',
        email: 'hector.funes@farmaciasanrafael.hn',
        phoneNumber: '+50498870136',
        role: RoleName.Agent,
        teamName: 'Mostrador',
      },
      {
        name: 'Iris Aguilar',
        email: 'iris.aguilar@farmaciasanrafael.hn',
        phoneNumber: '+50487310944',
        role: RoleName.Agent,
        teamName: 'Mostrador',
      },
    ],
  },
  {
    name: 'Panadería El Trigal',
    type: OrganizationType.Merchant,
    countryCode: 'HN',
    teamNames: ['Producción', 'Ventas'],
    merchants: [
      {
        name: 'Panadería El Trigal',
        contactName: 'Fernando Paz',
        contactEmail: 'fernando.paz@eltrigal.hn',
        contactPhone: '+50495048217',
        deliveryFeeBasis: DeliveryFeeBasis.CompletedOrders,
        orderCountFeeRate: {
          ranges: [
            { upToOrderCount: 100, fee: 30 },
            { upToOrderCount: 300, fee: 25 },
            { upToOrderCount: null, fee: 20 },
          ],
        },
        deliveryFeeRate: {
          ranges: [{ upToKm: 4, fee: 25 }],
          extraFeePerKm: 7.5,
        },
      },
    ],
    users: [
      {
        name: 'Fernando Paz',
        email: 'fernando.paz@eltrigal.hn',
        phoneNumber: '+50495048217',
        role: RoleName.Administrator,
      },
      {
        name: 'Rosa Velásquez',
        email: 'rosa.velasquez@eltrigal.hn',
        phoneNumber: '+50433761190',
        role: RoleName.Agent,
        teamName: 'Ventas',
      },
      {
        name: 'Edwin Rodas',
        email: 'edwin.rodas@eltrigal.hn',
        phoneNumber: '+50489125573',
        role: RoleName.Driver,
      },
      {
        name: 'Nelson Ávila',
        email: 'nelson.avila@eltrigal.hn',
        phoneNumber: '+50431449082',
        role: RoleName.Driver,
      },
    ],
  },
  {
    name: 'Pupusería La Ceibita',
    type: OrganizationType.Merchant,
    countryCode: 'SV',
    teamNames: ['Cocina'],
    merchants: [
      {
        name: 'Pupusería La Ceibita',
        contactName: 'Marta Hernández',
        contactEmail: 'marta.hernandez@laceibita.com.sv',
        contactPhone: '+50376128840',
        deliveryFeeBasis: DeliveryFeeBasis.Distance,
        deliveryFeeRate: {
          ranges: [
            { upToKm: 3, fee: 1.5 },
            { upToKm: 6, fee: 2.5 },
            { upToKm: null, fee: 3.5 },
          ],
          extraFeePerKm: null,
        },
      },
    ],
    users: [
      {
        name: 'Marta Hernández',
        email: 'marta.hernandez@laceibita.com.sv',
        phoneNumber: '+50376128840',
        role: RoleName.Administrator,
      },
      {
        name: 'Carlos Alvarado',
        email: 'carlos.alvarado@laceibita.com.sv',
        phoneNumber: '+50378054413',
        role: RoleName.Driver,
      },
    ],
  },
  {
    name: 'Café Las Lomas',
    type: OrganizationType.Merchant,
    countryCode: 'GT',
    teamNames: ['Barra'],
    merchants: [
      {
        name: 'Café Las Lomas',
        contactName: 'Lucía Barrios',
        contactEmail: 'lucia.barrios@cafelaslomas.com.gt',
        contactPhone: '+50255870326',
      },
    ],
    users: [
      {
        name: 'Lucía Barrios',
        email: 'lucia.barrios@cafelaslomas.com.gt',
        phoneNumber: '+50255870326',
        role: RoleName.Administrator,
      },
      {
        name: 'Byron Cifuentes',
        email: 'byron.cifuentes@cafelaslomas.com.gt',
        phoneNumber: '+50242169975',
        role: RoleName.Agent,
        teamName: 'Barra',
      },
    ],
  },
];
