import { useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
// import data from '../data';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // Se l'azione è di tipo 'FETCH_REQUEST', imposto la proprietà loading a true e mantengo le altre proprietà invariate
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      // Se l'azione è di tipo 'FETCH_SUCCESS', imposto la proprietà products al payload dell'azione, la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      // Se l'azione è di tipo 'FETCH_FAIL', imposto la proprietà error al payload dell'azione, la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, loading: false, error: action.payload };
    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
};
// Definisco un componente React chiamato HomeScreen che non accetta props
function HomeScreen() {
  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con tre proprietà: products, loading e error
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  // Uso il componente logger per avvolgere la funzione riduttrice e registrare le azioni e lo stato
  const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    error: '',
  });

  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Definisco una funzione asincrona che richiede i dati dei prodotti tramite axios e aggiorna lo stato in base al risultato
    const fetchData = async () => {
      // Invio un'azione di tipo 'FETCH_REQUEST' alla funzione riduttrice
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        // Richiedo i dati dei prodotti all'API del server
        const result = await axios.get('/api/products');
        // Invio un'azione di tipo 'FETCH_SUCCESS' alla funzione riduttrice con i dati dei prodotti come payload
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        // Se la richiesta fallisce, catturo l'errore e invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice con l'errore come payload
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    // Invoco la funzione asincrona
    fetchData();
  }, []); // Eseguo l'effetto solo una volta dopo il primo rendering
  // Restituisco il componente React che mostra i prodotti e le eventuali informazioni di caricamento o errore
  return (
    <div>
      <Helmet>
        <title>SportPoint</title>
      </Helmet>
      <h1>Prodotti</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
