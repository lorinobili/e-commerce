import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';

// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // Se l'azione è di tipo 'FETCH_REQUEST', imposto la proprietà loading a true e mantengo le altre proprietà invariate
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      // Se l'azione è di tipo 'FETCH_SUCCESS', imposto la proprietà loading a false e le proprietà products, page e pages al payload dell'azione
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      // Se l'azione è di tipo 'FETCH_FAIL', imposto la proprietà loading a false, la proprietà error al payload dell'azione e mantengo le altre proprietà invariate
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      // Se l'azione è di tipo 'CREATE_REQUEST', imposto la proprietà loadingCreate a true e mantengo le altre proprietà invariate
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      // Se l'azione è di tipo 'CREATE_SUCCESS', imposto la proprietà loadingCreate a false e mantengo le altre proprietà invariate
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAIL':
      // Se l'azione è di tipo 'CREATE_FAIL', imposto la proprietà loadingCreate a false e mantengo le altre proprietà invariate
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      // Se l'azione è di tipo 'DELETE_REQUEST', imposto la proprietà loadingDelete a true, la proprietà successDelete a false e mantengo le altre proprietà invariate
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      // Se l'azione è di tipo 'DELETE_SUCCESS', imposto la proprietà loadingDelete a false, la proprietà successDelete a true e mantengo le altre proprietà invariate
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      // Se l'azione è di tipo 'DELETE_FAIL', imposto la proprietà loadingDelete a false, la proprietà successDelete a false e mantengo le altre proprietà invariate
      return { ...state, loadingDelete: false, successDelete: false };

    case 'DELETE_RESET':
      // Se l'azione è di tipo 'DELETE_RESET', imposto la proprietà loadingDelete a false, la proprietà successDelete a false e mantengo le altre proprietà invariate
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
};

// Definisco un componente React chiamato ProductListScreen che non accetta props
export default function ProductListScreen() {
  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con sette proprietà: loading, error, products, pages, loadingCreate, loadingDelete e successDelete
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();
  // Uso l'hook useLocation per ottenere l'URL corrente
  const { search } = useLocation();
  // Creo un oggetto URLSearchParams con la stringa di ricerca dell'URL
  const sp = new URLSearchParams(search);
  // Ottengo il valore del parametro 'page' dall'oggetto URLSearchParams o 1 se non esiste
  const page = sp.get('page') || 1;

  // Uso l'hook useContext per accedere allo stato del contesto Store
  const { state } = useContext(Store);
  // Estraggo la proprietà userInfo dallo stato, che contiene le informazioni dell'utente
  const { userInfo } = state;

  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Definisco una funzione asincrona che richiede i dati dei prodotti tramite axios e aggiorna lo stato in base al risultato
    const fetchData = async () => {
      try {
        // Invio un'azione di tipo 'FETCH_REQUEST' alla funzione riduttrice
        dispatch({ type: 'FETCH_REQUEST' });
        // Richiedo i dati dei prodotti all'API del server usando il numero di pagina e il token dell'utente come header di autorizzazione
        const { data } = await axios.get(`/api/products/admin?page=${page} `, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Invio un'azione di tipo 'FETCH_SUCCESS' alla funzione riduttrice con i dati dei prodotti, il numero di pagina e il numero di pagine come payload
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // Se la richiesta fallisce, catturo l'errore e invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice con l'errore come payload
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    // Se la cancellazione del prodotto è avvenuta con successo, invio un'azione di tipo 'DELETE_RESET' alla funzione riduttrice per resettare lo stato della cancellazione
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      // Altrimenti, invoco la funzione asincrona per richiedere i dati dei prodotti
      fetchData();
    }
  }, [page, userInfo, successDelete]); // Eseguo l'effetto solo quando una di queste dipendenze cambia

  // Definisco una funzione asincrona che gestisce la creazione di un prodotto
  const createHandler = async () => {
    // Se l'utente conferma la creazione, provo a creare un prodotto
    if (window.confirm('Are you sure to create?')) {
      try {
        // Invio un'azione di tipo 'CREATE_REQUEST' alla funzione riduttrice
        dispatch({ type: 'CREATE_REQUEST' });
        // Uso axios per creare un prodotto usando il metodo post con un oggetto vuoto e il token dell'utente come header di autorizzazione
        const { data } = await axios.post(
          '/api/products',
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        // Uso il componente toast per mostrare un messaggio di successo
        toast.success('product created successfully');
        // Invio un'azione di tipo 'CREATE_SUCCESS' alla funzione riduttrice
        dispatch({ type: 'CREATE_SUCCESS' });
        // Navigo alla pagina di modifica del prodotto creato usando l'id del prodotto restituito dall'API
        navigate(`/admin/product/${data.product._id}`);
      } catch (err) {
        // Se c'è un errore, uso il componente toast per mostrare un messaggio di errore
        toast.error(getError(error));
        // Invio un'azione di tipo 'CREATE_FAIL' alla funzione riduttrice
        dispatch({
          type: 'CREATE_FAIL',
        });
      }
    }
  };

  // Definisco una funzione asincrona che gestisce la cancellazione di un prodotto
  const deleteHandler = async (product) => {
    // Se l'utente conferma la cancellazione, provo a cancellare il prodotto
    if (window.confirm('Are you sure to delete?')) {
      try {
        // Uso axios per cancellare il prodotto usando il metodo delete con l'id del prodotto e il token dell'utente come header di autorizzazione
        await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        // Uso il componente toast per mostrare un messaggio di successo
        toast.success('product deleted successfully');
        // Invio un'azione di tipo 'DELETE_SUCCESS' alla funzione riduttrice
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        // Se c'è un errore, uso il componente toast per mostrare un messaggio di errore
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
      <Row>
        <Col>
          <h1>Prodotti</h1>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick={createHandler}>
              Crea Prodotto
            </Button>
          </div>
        </Col>
      </Row>

      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NOME</th>
                <th>PREZZO</th>
                <th>CATEGORIA</th>
                <th>BRAND</th>
                <th>AZIONI</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => navigate(`/admin/product/${product._id}`)}
                    >
                      Modifica
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(product)}
                    >
                      Elimina
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
