import { useContext } from 'react';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MessageBox from '../components/MessageBox';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CartScreen() {
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();
  // Uso l'hook useContext per accedere allo stato e alla funzione dispatch del contesto Store
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Estraggo la proprietà cartItems dallo stato, che contiene gli elementi nel carrello
  const {
    cart: { cartItems },
  } = state;

  // Definisco una funzione asincrona che aggiorna la quantità di un elemento nel carrello
  const updateCartHandler = async (item, quantity) => {
    // Richiedo i dati dell'elemento all'API del server
    const { data } = await axios.get(`/api/products/${item._id}`);
    // Se l'elemento non è disponibile in magazzino, mostro un messaggio di avviso e interrompo la funzione
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    // Altrimenti, invio un'azione di tipo 'CART_ADD_ITEM' al contesto Store con l'elemento e la quantità come payload
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  // Definisco una funzione che rimuove un elemento dal carrello
  const removeItemHandler = (item) => {
    // Invio un'azione di tipo 'CART_REMOVE_ITEM' al contesto Store con l'elemento come payload
    ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  // Definisco una funzione che gestisce il checkout
  const checkoutHandler = () => {
    // Navigo alla pagina di signin con un parametro redirect che indica la pagina di shipping
    navigate('/signin?redirect=/shipping');
  };
  // Restituisco il componente React che mostra il carrello e le opzioni di aggiornamento, rimozione e checkout

  return (
    <div>
      <Helmet>
        <title>Carrello </title>
      </Helmet>
      <h1>Carrello</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <MessageBox>
              Il carrello è vuoto. <Link to="/">Compra subito</Link>
            </MessageBox>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{' '}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </Col>
                    <Col md={3}>
                      <Button
                        onClick={() =>
                          updateCartHandler(item, item.quantity - 1)
                        }
                        variant="light"
                        disabled={item.quantity === 1}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{' '}
                      <span>{item.quantity}</span>{' '}
                      <Button
                        variant="light"
                        onClick={() =>
                          updateCartHandler(item, item.quantity + 1)
                        }
                        disabled={item.quantity === item.countInStock}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>
                    </Col>
                    <Col md={3}>${item.price}</Col>
                    <Col md={2}>
                      <Button
                        onClick={() => removeItemHandler(item)}
                        variant="light"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    Subtotale ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    oggetti) :
                    {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}€
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={checkoutHandler}
                      disabled={cartItems.length === 0}
                    >
                      Procedi al Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
