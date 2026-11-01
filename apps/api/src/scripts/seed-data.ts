import { OrganizationType, RoleName } from '@vola/shared';

export interface SeedUser {
  name: string;
  email: string;
  phoneNumber: string;
  role: RoleName;
  teamName?: string;
}

export interface SeedOrganization {
  name: string;
  type: OrganizationType;
  countryCode: string;
  teamNames: string[];
  users: SeedUser[];
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
