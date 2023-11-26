import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';

// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // Se l'azione è di tipo 'FETCH_REQUEST', imposto la proprietà loading a true, la proprietà error a '' e mantengo le altre proprietà invariate
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      // Se l'azione è di tipo 'FETCH_SUCCESS', imposto la proprietà loading a false, la proprietà order al payload dell'azione, la proprietà error a '' e mantengo le altre proprietà invariate
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      // Se l'azione è di tipo 'FETCH_FAIL', imposto la proprietà loading a false, la proprietà error al payload dell'azione e mantengo le altre proprietà invariate
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      // Se l'azione è di tipo 'PAY_REQUEST', imposto la proprietà loadingPay a true e mantengo le altre proprietà invariate
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      // Se l'azione è di tipo 'PAY_SUCCESS', imposto la proprietà loadingPay a false, la proprietà successPay a true e mantengo le altre proprietà invariate
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      // Se l'azione è di tipo 'PAY_FAIL', imposto la proprietà loadingPay a false e mantengo le altre proprietà invariate
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      // Se l'azione è di tipo 'PAY_RESET', imposto la proprietà loadingPay a false, la proprietà successPay a false e mantengo le altre proprietà invariate
      return { ...state, loadingPay: false, successPay: false };
    case 'DELIVER_REQUEST':
      // Se l'azione è di tipo 'DELIVER_REQUEST', imposto la proprietà loadingDeliver a true e mantengo le altre proprietà invariate
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      // Se l'azione è di tipo 'DELIVER_SUCCESS', imposto la proprietà loadingDeliver a false, la proprietà successDeliver a true e mantengo le altre proprietà invariate
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      // Se l'azione è di tipo 'DELIVER_FAIL', imposto la proprietà loadingDeliver a false e mantengo le altre proprietà invariate
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      // Se l'azione è di tipo 'DELIVER_RESET', imposto la proprietà loadingDeliver a false, la proprietà successDeliver a false e mantengo le altre proprietà invariate
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };

    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
}

// Definisco un componente React chiamato OrderScreen che non accetta props
export default function OrderScreen() {
  // Uso l'hook useContext per accedere allo stato del contesto Store
  const { state } = useContext(Store);
  // Estraggo la proprietà userInfo dallo stato, che contiene le informazioni dell'utente
  const { userInfo } = state;
  // Uso l'hook useParams per ottenere i parametri dinamici dall'URL corrente
  const params = useParams();
  // Estraggo la proprietà id dai parametri, che corrisponde all'id dell'ordine
  const { id: orderId } = params;
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();

  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con sette proprietà: loading, error, order, successPay, loadingPay, loadingDeliver e successDeliver
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  // Uso l'hook usePayPalScriptReducer per gestire lo script di PayPal
  // L'hook usePayPalScriptReducer restituisce un oggetto con la proprietà isPending e la funzione paypalDispatch
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // Definisco una funzione che crea un ordine con PayPal usando i dati e le azioni passati come parametri
  function createOrder(data, actions) {
    // Uso il metodo create dell'oggetto order delle azioni per creare un ordine con il valore dell'ordine come parametro
    return (
      actions.order
        .create({
          purchase_units: [
            {
              amount: { value: order.totalPrice },
            },
          ],
        })
        // Uso il metodo then per restituire l'id dell'ordine creato
        .then((orderID) => {
          return orderID;
        })
    );
  }

  // Definisco una funzione che approva un ordine con PayPal usando i dati e le azioni passati come parametri
  function onApprove(data, actions) {
    // Uso il metodo capture dell'oggetto order delle azioni per catturare il pagamento dell'ordine
    return actions.order.capture().then(async function (details) {
      try {
        // Invio un'azione di tipo 'PAY_REQUEST' alla funzione riduttrice
        dispatch({ type: 'PAY_REQUEST' });
        // Uso axios per aggiornare lo stato dell'ordine a pagato usando il metodo put con i dettagli del pagamento e il token dell'utente come header di autorizzazione
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        // Invio un'azione di tipo 'PAY_SUCCESS' alla funzione riduttrice con i dati dell'ordine come payload
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        // Uso il componente toast per mostrare un messaggio di successo
        toast.success('Order is paid');
      } catch (err) {
        // Se c'è un errore, invio un'azione di tipo 'PAY_FAIL' alla funzione riduttrice con l'errore come payload
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        // Uso il componente toast per mostrare un messaggio di errore
        toast.error(getError(err));
      }
    });
  }
  // Definisco una funzione che gestisce gli errori di PayPal usando l'errore passato come parametro
  function onError(err) {
    // Uso il componente toast per mostrare un messaggio di errore
    toast.error(getError(err));
  }

  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Definisco una funzione asincrona che richiede i dati dell'ordine tramite axios e aggiorna lo stato in base al risultato
    const fetchOrder = async () => {
      try {
        // Invio un'azione di tipo 'FETCH_REQUEST' alla funzione riduttrice
        dispatch({ type: 'FETCH_REQUEST' });
        // Richiedo i dati dell'ordine all'API del server usando l'id dell'ordine e il token dell'utente come header di autorizzazione
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        // Invio un'azione di tipo 'FETCH_SUCCESS' alla funzione riduttrice con i dati dell'ordine come payload
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        // Se la richiesta fallisce, catturo l'errore e invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice con l'errore come payload
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    // Se l'utente non è autenticato, navigo alla pagina di login
    if (!userInfo) {
      return navigate('/login');
    }
    // Se l'ordine non ha un id, o se il pagamento o la consegna sono avvenuti con successo, o se l'id dell'ordine è diverso dall'id dell'ordine passato come parametro, invoco la funzione asincrona per richiedere i dati dell'ordine
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      // Se il pagamento è avvenuto con successo, invio un'azione di tipo 'PAY_RESET' alla funzione riduttrice per resettare lo stato del pagamento
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      // Se la consegna è avvenuta con successo, invio un'azione di tipo 'DELIVER_RESET' alla funzione riduttrice per resettare lo stato della consegna
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      // Altrimenti, definisco una funzione asincrona che carica lo script di PayPal
      const loadPaypalScript = async () => {
        // Richiedo il clientId di PayPal all'API del server usando il token dell'utente come header di autorizzazione
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        // Uso la funzione paypalDispatch per resettare le opzioni dello script di PayPal con il clientId e la valuta
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        // Uso la funzione paypalDispatch per impostare lo stato di caricamento dello script a 'pending'
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      // Invoco la funzione asincrona per caricare lo script di PayPal
      loadPaypalScript();
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ]); // Eseguo l'effetto solo quando una di queste dipendenze cambia

  // Definisco una funzione asincrona che gestisce la consegna dell'ordine
  async function deliverOrderHandler() {
    try {
      // Invio un'azione di tipo 'DELIVER_REQUEST' alla funzione riduttrice
      dispatch({ type: 'DELIVER_REQUEST' });
      // Uso axios per aggiornare lo stato dell'ordine a consegnato usando il metodo put con un oggetto vuoto e il token dell'utente come header di autorizzazione
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      // Invio un'azione di tipo 'DELIVER_SUCCESS' alla funzione riduttrice con i dati dell'ordine come payload
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      // Uso il componente toast per mostrare un messaggio di successo
      toast.success('Order is delivered');
    } catch (err) {
      // Se c'è un errore, uso il componente toast per mostrare un messaggio di errore
      toast.error(getError(err));
      // Invio un'azione di tipo 'DELIVER_FAIL' alla funzione riduttrice
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Ordine {orderId}</title>
      </Helmet>
      <h1 className="my-3">Ordine {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Spedizione</Card.Title>
              <Card.Text>
                <strong>Nome:</strong> {order.shippingAddress.fullName} <br />
                <strong>Indirizzo: </strong> {order.shippingAddress.address},
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                ,{order.shippingAddress.country}
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Consegnato a {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Non consegnato</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Pagamento</Card.Title>
              <Card.Text>
                <strong>Metodo:</strong> {order.paymentMethod}
              </Card.Text>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Pagato a {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Non pagato</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Oggetti</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>{item.price}€</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Riepilogo Ordine</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Oggetti</Col>
                    <Col>{order.itemsPrice.toFixed(2)}€</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Spedizione</Col>
                    <Col>{order.shippingPrice.toFixed(2)}€</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tassa</Col>
                    <Col>{order.taxPrice.toFixed(2)}€</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Totale Ordine</strong>
                    </Col>
                    <Col>
                      <strong>{order.totalPrice.toFixed(2)}€</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )}
                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className="d-grid">
                      <Button type="button" onClick={deliverOrderHandler}>
                        Consegna Ordine
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
