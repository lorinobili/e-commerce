import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // Se l'azione è di tipo 'FETCH_REQUEST', imposto la proprietà loading a true e mantengo le altre proprietà invariate
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      // Se l'azione è di tipo 'FETCH_SUCCESS', imposto la proprietà loading a false e aggiorno la proprietà orders con i dati ricevuti
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      // Se l'azione è di tipo 'FETCH_FAIL', imposto la proprietà loading a false e aggiorno la proprietà error con il messaggio di errore ricevuto
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      // Se l'azione è di tipo 'DELETE_REQUEST', imposto le proprietà loadingDelete a true e successDelete a false
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      // Se l'azione è di tipo 'DELETE_SUCCESS', imposto le proprietà loadingDelete e successDelete a false
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      // Se l'azione è di tipo 'DELETE_FAIL', imposto la proprietà loadingDelete a false
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      // Se l'azione è di tipo 'DELETE_RESET', imposto le proprietà loadingDelete e successDelete a false
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
};

// Definisco un componente React chiamato OrderListScreen che non accetta props
export default function OrderListScreen() {
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();
  // Uso l'hook useContext per accedere allo stato e alla funzione dispatch del contesto Store
  const { state } = useContext(Store);
  // Estraggo la proprietà userInfo dallo stato, che contiene le informazioni dell'utente
  const { userInfo } = state;
  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con due proprietà: loading e error
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  // Uso l'hook useEffect per eseguire una funzione quando il componente si monta o si aggiorna
  useEffect(() => {
    // Definisco una funzione asincrona che recupera gli ordini dal server
    const fetchData = async () => {
      try {
        // Invio un'azione di tipo 'FETCH_REQUEST' alla funzione riduttrice
        dispatch({ type: 'FETCH_REQUEST' });
        // Uso axios per ottenere gli ordini usando il metodo get con il token dell'utente come header di autorizzazione
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Invio un'azione di tipo 'FETCH_SUCCESS' alla funzione riduttrice con i dati ricevuti
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // Invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice con il messaggio di errore
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    // Se l'azione di cancellazione è andata a buon fine, invio un'azione di tipo 'DELETE_RESET' alla funzione riduttrice
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      // Altrimenti, chiamo la funzione fetchData per recuperare gli ordini
      fetchData();
    }
  }, [userInfo, successDelete]); // La funzione useEffect dipende dalle variabili userInfo e successDelete

  // Definisco una funzione asincrona che gestisce la cancellazione di un ordine
  const deleteHandler = async (order) => {
    // Chiedo conferma all'utente prima di procedere
    if (window.confirm('Are you sure to delete?')) {
      try {
        // Invio un'azione di tipo 'DELETE_REQUEST' alla funzione riduttrice
        dispatch({ type: 'DELETE_REQUEST' });
        // Uso axios per cancellare un ordine usando il metodo delete con l'id dell'ordine e il token dell'utente come header di autorizzazione
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Mostro un messaggio di successo usando la libreria toast
        toast.success('order deleted successfully');
        // Invio un'azione di tipo 'DELETE_SUCCESS' alla funzione riduttrice
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        // Mostro un messaggio di errore usando la libreria toast
        toast.error(getError(error));
        // Invio un'azione di tipo 'DELETE_FAIL' alla funzione riduttrice
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };
  return (
    <div>
      <Helmet>
        <title>Ordini</title>
      </Helmet>
      <h1>Ordini</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>UTENTE</th>
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
                <td>{order.user ? order.user.name : 'DELETED USER'}</td>
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
                    Dettagli
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(order)}
                  >
                    Elimina
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
