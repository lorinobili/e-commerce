import bcrypt from 'bcryptjs';
const data = {
  users: [
    {
      name: 'Lorenzo',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      name: 'John',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],
  products: [
    {
      name: 'Racchetta Babolat',
      slug: 'racchetta-babolat',
      category: 'Racchette',
      image: '/images/racbab.jpg',
      price: 150,
      countInStock: 10,
      brand: 'Babolat',
      rating: 4.5,
      numReviews: 10,
      description: 'RACCHETTA NADAL OFFICIAL ROLAND GARROS',
    },
    {
      name: 'Racchetta Dunlop',
      slug: 'racchetta-dunlop',
      category: 'Racchette',
      image: '/images/racdun.jpg',
      price: 120,
      countInStock: 0,
      brand: 'Dunlop',
      rating: 4.5,
      numReviews: 10,
      description: 'RACCHETTA SX 300 LTD WHITE (300 GR) (EDIZIONE LIMITATA))',
    },
    {
      name: 'Racchetta Head',
      slug: 'racchetta-head',
      category: 'Racchette',
      image: '/images/rachead.webp',
      price: 100,
      countInStock: 10,
      brand: 'Head',
      rating: 4.5,
      numReviews: 10,
      description: 'RACCHETTA GRAPHENE XT RADICAL PRO (310 GR)',
    },
  ],
};
export default data;
