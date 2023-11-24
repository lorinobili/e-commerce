const mongoose = require('mongoose');
const Product = require('./models/product'); // Importa il modello del tuo prodotto

// Connetti a MongoDB
mongoose.connect('mongodb://localhost:27017/tuo_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definisci i dati da inserire o aggiornare
const newData = [
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
];

// Esegui le operazioni di inserimento o aggiornamento
Product.insertMany(newData)
  .then(() => {
    console.log('Dati sincronizzati con successo!');
    mongoose.connection.close(); // Chiudi la connessione dopo l'operazione
  })
  .catch((error) => {
    console.error('Errore durante la sincronizzazione:', error);
    mongoose.connection.close(); // Chiudi la connessione in caso di errore
  });
