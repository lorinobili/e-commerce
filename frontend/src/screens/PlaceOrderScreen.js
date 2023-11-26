import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import LoadingBox from '../components/LoadingBox';

// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      // Se l'azione è di tipo 'CREATE_REQUEST', imposto la proprietà loading a true e mantengo le altre proprietà invariate
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      // Se l'azione è di tipo 'CREATE_SUCCESS', imposto la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      // Se l'azione è di tipo 'CREATE_FAIL', imposto la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, loading: false };
    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
};

// Definisco un componente React chiamato PlaceOrderScreen che non accetta props
export default function PlaceOrderScreen() {
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();

  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con una proprietà: loading
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  // Uso l'hook useContext per accedere allo stato e alla funzione dispatch del contesto Store
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Estraggo la proprietà cart e userInfo dallo stato, che contengono il carrello e le informazioni dell'utente
  const { cart, userInfo } = state;

  // Definisco una funzione che arrotonda un numero a due cifre decimali
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  // Calcolo il prezzo totale degli articoli nel carrello usando il metodo reduce
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  // Calcolo il prezzo della spedizione in base al prezzo totale degli articoli
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  // Calcolo il prezzo delle tasse applicando una percentuale al prezzo totale degli articoli
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  // Calcolo il prezzo finale sommando il prezzo degli articoli, della spedizione e delle tasse
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  // Definisco una funzione asincrona che gestisce il piazzamento dell'ordine
  const placeOrderHandler = async () => {
    try {
      // Invio un'azione di tipo 'CREATE_REQUEST' alla funzione riduttrice
      dispatch({ type: 'CREATE_REQUEST' });

      // Uso axios per creare un ordine usando il metodo post con i dati del carrello e il token dell'utente come header di autorizzazione
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      // Invio un'azione di tipo 'CART_CLEAR' al contesto Store per svuotare il carrello
      ctxDispatch({ type: 'CART_CLEAR' });
      // Invio un'azione di tipo 'CREATE_SUCCESS' alla funzione riduttrice
      dispatch({ type: 'CREATE_SUCCESS' });
      // Rimuovo gli articoli del carrello dal localStorage
      localStorage.removeItem('cartItems');
      // Navigo alla pagina dell'ordine creato usando l'id dell'ordine restituito dall'API
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      // Se c'è un errore, invio un'azione di tipo 'CREATE_FAIL' alla funzione riduttrice
      dispatch({ type: 'CREATE_FAIL' });
      // Uso il componente toast per mostrare un messaggio di errore
      toast.error(getError(err));
    }
  };

  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Se il metodo di pagamento non è stato scelto, navigo alla pagina di payment
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]); // Eseguo l'effetto solo quando una di queste dipendenze cambia
  // Restituisco il componente React che mostra il riepilogo dell'ordine e il pulsante per piazzarlo
  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Ordine</title>
      </Helmet>
      <h1 className="my-3">Preview Ordine</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Spedizione</Card.Title>
              <Card.Text>
                <strong>Nome:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Indirizzo: </strong> {cart.shippingAddress.address},
                {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Pagamento</Card.Title>
              <Card.Text>
                <strong>Metodo:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Modifica</Link>
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Oggetti</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
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
              <Link to="/cart">Modifica</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Riepilogo Ordine</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Oggetti</Col>
                    <Col>{cart.itemsPrice.toFixed(2)}€</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Spedizione</Col>
                    <Col>{cart.shippingPrice.toFixed(2)}€</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tassa</Col>
                    <Col>{cart.taxPrice.toFixed(2)}€</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Totale Ordine</strong>
                    </Col>
                    <Col>
                      <strong>{cart.totalPrice.toFixed(2)}€</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Effettua Ordine
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
