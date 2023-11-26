import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Product from '../components/Product';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import { createSearchParams } from 'react-router-dom';

// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // Se l'azione è di tipo 'FETCH_REQUEST', imposto la proprietà loading a true e mantengo le altre proprietà invariate
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      // Se l'azione è di tipo 'FETCH_SUCCESS', imposto la proprietà loading a false e le proprietà products, page, pages e countProducts al payload dell'azione
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        loading: false,
      };
    case 'FETCH_FAIL':
      // Se l'azione è di tipo 'FETCH_FAIL', imposto la proprietà loading a false, la proprietà error al payload dell'azione e mantengo le altre proprietà invariate
      return { ...state, loading: false, error: action.payload };

    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
};

const prices = [
  {
    name: '1€ to 50€',
    value: '1-50',
  },
  {
    name: '51€ to 200€',
    value: '51-200',
  },
  {
    name: '201€ to 1000€',
    value: '201-1000',
  },
];

// Definisco un array di oggetti che rappresentano le valutazioni dei prodotti
export const ratings = [
  {
    name: '4stars & up',
    rating: 4,
  },

  {
    name: '3stars & up',
    rating: 3,
  },

  {
    name: '2stars & up',
    rating: 2,
  },

  {
    name: '1stars & up',
    rating: 1,
  },
];

// Definisco un componente React chiamato SearchScreen che non accetta props
export default function SearchScreen() {
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();
  // Uso l'hook useLocation per ottenere l'URL corrente
  const { search } = useLocation();
  // Creo un oggetto URLSearchParams con la stringa di ricerca dell'URL
  const sp = new URLSearchParams(search);
  // Ottengo il valore dei parametri 'category', 'query', 'price', 'rating' e 'order' dall'oggetto URLSearchParams o 'all' se non esistono
  const category = sp.get('category') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  // Ottengo il valore del parametro 'page' dall'oggetto URLSearchParams o 1 se non esiste
  const page = sp.get('page') || 1;

  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con cinque proprietà: loading, error, products, pages e countProducts
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });
  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Definisco una funzione asincrona che richiede i dati dei prodotti tramite axios e aggiorna lo stato in base al risultato
    const fetchData = async () => {
      try {
        // Creo un oggetto con i parametri di ricerca da inviare all'API
        const queryParams = {
          page: page,
          query: query,
          category: category,
          price: price,
          rating: rating,
          order: order,
        };

        // Creo una stringa con i parametri di ricerca usando il metodo createSearchParams
        const queryStringParams = createSearchParams(queryParams).toString();

        // Richiedo i dati dei prodotti all'API del server usando la stringa di ricerca
        const { data } = await axios.get(
          `/api/products/search?${queryStringParams}`
        );
        // Invio un'azione di tipo 'FETCH_SUCCESS' alla funzione riduttrice con i dati dei prodotti, il numero di pagina, il numero di pagine e il numero totale dei prodotti come payload
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // Se la richiesta fallisce, catturo l'errore e invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice con l'errore come payload
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    // Invoco la funzione asincrona per richiedere i dati dei prodotti
    fetchData();
  }, [category, error, order, page, price, query, rating]); // Eseguo l'effetto solo quando una di queste dipendenze cambia
  // Restituisco il componente React che mostra i prodotti filtrati in base ai parametri di ricerca

  // Dichiara una variabile di stato chiamata categories e una funzione per aggiornarla
  const [categories, setCategories] = useState([]);

  // Usa l'hook useEffect per eseguire una funzione quando il componente si monta o si aggiorna
  useEffect(() => {
    // Definisce una funzione asincrona per recuperare le categorie dei prodotti dal server
    const fetchCategories = async () => {
      try {
        // Usa axios per fare una richiesta GET all'endpoint /api/products/categories
        const { data } = await axios.get(`/api/products/categories`);
        // Usa la funzione setCategories per aggiornare lo stato delle categorie con i dati ricevuti
        setCategories(data);
      } catch (err) {
        // In caso di errore, mostra un messaggio con la funzione toast.error
        toast.error(getError(err));
      }
    };
    // Chiama la funzione fetchCategories
    fetchCategories();
    // Aggiunge dispatch come dipendenza dell'hook useEffect, in modo che la funzione venga rieseguita quando cambia il valore di dispatch
  }, [dispatch]);

  // Definisce una funzione per creare un URL di filtro in base ai parametri passati
  const getFilterUrl = (filter) => {
    // Assegna i valori dei parametri di filtro alle variabili corrispondenti, usando i valori di default se i parametri sono vuoti
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;

    // Crea un oggetto queryParams con le chiavi e i valori dei parametri di filtro
    const queryParams = {
      category: filterCategory,
      query: filterQuery,
      price: filterPrice,
      rating: filterRating,
      order: sortOrder,
      page: filterPage,
    };

    // Usa la funzione createSearchParams per creare una stringa di query con i parametri
    const queryStringParams = createSearchParams(queryParams).toString();

    // Restituisce un oggetto con il pathname e la stringa di query per l'URL di filtro
    return {
      pathname: '/search',
      search: queryStringParams,
    };
  };

  return (
    <div>
      <Helmet>
        <title>Cerca Prodotti </title>
      </Helmet>
      <Row>
        <Col md={3}>
          <h3>Categoria</h3>
          <div>
            <ul>
              <li>
                <Link
                  className={'all' === category ? 'text-bold' : ''}
                  to={getFilterUrl({ category: 'all' })}
                >
                  Qualsiasi
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === category ? 'text-bold' : ''}
                    to={getFilterUrl({ category: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Prezzo</h3>
            <ul>
              <li>
                <Link
                  className={'all' === price ? 'text-bold' : ''}
                  to={getFilterUrl({ price: 'all' })}
                >
                  Qualsiasi
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    to={getFilterUrl({ price: p.value })}
                    className={p.value === price ? 'text-bold' : ''}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Media Recensioni</h3>
            <ul>
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    to={getFilterUrl({ rating: r.rating })}
                    className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}
                  >
                    <Rating caption={' & up'} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={getFilterUrl({ rating: 'all' })}
                  className={rating === 'all' ? 'text-bold' : ''}
                >
                  <Rating caption={' & up'} rating={0}></Rating>
                </Link>
              </li>
            </ul>
          </div>
        </Col>
        <Col md={9}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={6}>
                  <div>
                    {countProducts === 0 ? 'No' : countProducts} Risultati
                    {query !== 'all' && ' : ' + query}
                    {category !== 'all' && ' : ' + category}
                    {price !== 'all' && ' : Price ' + price}
                    {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                    {query !== 'all' ||
                    category !== 'all' ||
                    rating !== 'all' ||
                    price !== 'all' ? (
                      <Button
                        variant="light"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-times-circle"></i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
                <Col className="text-end">
                  Ordine per{' '}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value }));
                    }}
                  >
                    <option value="newest">Nuovi Arrivi</option>
                    <option value="lowest">Prezzo: Basso a Alto</option>
                    <option value="highest">Prezzo: Alto a Basso</option>
                    <option value="toprated">Media Recensioni</option>
                  </select>
                </Col>
              </Row>
              {products.length === 0 && (
                <MessageBox>Nessun prodotto trovato</MessageBox>
              )}

              <Row>
                {products.map((product) => (
                  <Col sm={6} lg={4} className="mb-3" key={product._id}>
                    <Product product={product}></Product>
                  </Col>
                ))}
              </Row>

              <div>
                {[...Array(pages).keys()].map((x) => (
                  <LinkContainer
                    key={x + 1}
                    className="mx-1"
                    to={getFilterUrl({ page: x + 1 })}
                  >
                    <Button
                      className={Number(page) === x + 1 ? 'text-bold' : ''}
                      variant="light"
                    >
                      {x + 1}
                    </Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
