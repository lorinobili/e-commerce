import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { Button } from 'react-bootstrap';

// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // Se l'azione è di tipo 'FETCH_REQUEST', imposto la proprietà loading a true e mantengo le altre proprietà invariate
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      // Se l'azione è di tipo 'FETCH_SUCCESS', imposto la proprietà orders al payload dell'azione, la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      // Se l'azione è di tipo 'FETCH_FAIL', imposto la proprietà error al payload dell'azione, la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, loading: false, error: action.payload };
    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
};

// Definisco un componente React chiamato OrderHistoryScreen che non accetta props
export default function OrderHistoryScreen() {
  // Uso l'hook useContext per accedere allo stato del contesto Store
  const { state } = useContext(Store);
  // Estraggo la proprietà userInfo dallo stato, che contiene le informazioni dell'utente
  const { userInfo } = state;
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();

  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con tre proprietà: loading, error e orders
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Definisco una funzione asincrona che richiede i dati degli ordini dell'utente tramite axios e aggiorna lo stato in base al risultato
    const fetchData = async () => {
      // Invio un'azione di tipo 'FETCH_REQUEST' alla funzione riduttrice
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        // Richiedo i dati degli ordini dell'utente all'API del server usando il token dell'utente come header di autorizzazione
        const { data } = await axios.get(
          `/api/orders/mine`,

          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        // Invio un'azione di tipo 'FETCH_SUCCESS' alla funzione riduttrice con i dati degli ordini come payload
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        // Se la richiesta fallisce, catturo l'errore e invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice con l'errore come payload
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    // Invoco la funzione asincrona
    fetchData();
  }, [userInfo]); // Eseguo l'effetto solo quando userInfo cambia
  // Restituisco il componente React che mostra gli ordini dell'utente e le eventuali informazioni di caricamento o errore
  return (
    <div>
      <Helmet>
        <title>Cronologia Ordini</title>
      </Helmet>

      <h1>Cronologia Ordini</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATA</th>
              <th>TOTALE</th>
              <th>PAGATO</th>
              <th>CONSEGNATO</th>
              <th>AZIONI</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>{order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                <td>
                  {order.isDelivered
                    ? order.deliveredAt.substring(0, 10)
                    : 'No'}
                </td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
