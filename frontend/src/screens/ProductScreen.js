import axios from 'axios';
import { useContext, useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';
// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // Se l'azione è di tipo 'FETCH_REQUEST', imposto la proprietà loading a true e mantengo le altre proprietà invariate
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      // Se l'azione è di tipo 'FETCH_SUCCESS', imposto la proprietà product al payload dell'azione, la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      // Se l'azione è di tipo 'FETCH_FAIL', imposto la proprietà error al payload dell'azione, la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, loading: false, error: action.payload };
    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
};

function ProductScreen() {
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();
  // Uso l'hook useParams per ottenere i parametri dinamici dall'URL corrente
  const params = useParams();
  // Estraggo lo slug del prodotto dai parametri
  const { slug } = params;

  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con tre proprietà: product, loading e error
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    product: [],
    loading: true,
    error: '',
  });
  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Definisco una funzione asincrona che richiede i dati del prodotto tramite axios e aggiorna lo stato in base al risultato
    const fetchData = async () => {
      // Invio un'azione di tipo 'FETCH_REQUEST' alla funzione riduttrice
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        // Richiedo i dati del prodotto all'API del server usando lo slug come parametro
        const result = await axios.get(`/api/products/slug/${slug}`);
        // Invio un'azione di tipo 'FETCH_SUCCESS' alla funzione riduttrice con i dati del prodotto come payload
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        // Se la richiesta fallisce, catturo l'errore e invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice con l'errore come payload
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    // Invoco la funzione asincrona
    fetchData();
  }, [slug]); // Eseguo l'effetto solo quando lo slug cambia
  const { state, dispatch: ctxDispatch } = useContext(Store); // Uso l'hook useContext per accedere allo stato e alla funzione dispatch del contesto Store
  const { cart } = state; // Estraggo la proprietà cart dallo stato
  const addToCartHandler = async () => {
    // Definisco una funzione asincrona che aggiunge il prodotto al carrello
    const existItem = cart.cartItems.find((x) => x._id === product._id); // Cerco se il prodotto esiste già nel carrello
    const quantity = existItem ? existItem.quantity + 1 : 1; // Calcolo la quantità da aggiungere in base all'esistenza del prodotto nel carrello
    const { data } = await axios.get(`/api/products/${product._id}`); // Richiedo i dati del prodotto all'API del server
    if (data.countInStock < quantity) {
      // Se il prodotto non è disponibile in magazzino, mostro un messaggio di avviso e interrompo la funzione
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      // Altrimenti, invio un'azione di tipo 'CART_ADD_ITEM' al contesto Store con il prodotto e la quantità come payload
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    navigate('/cart'); // Navigo alla pagina del carrello
  };
  return loading ? ( // Restituisco il componente LoadingBox se il caricamento è in corso
    <LoadingBox />
  ) : error ? ( // Restituisco il componente MessageBox con il messaggio di errore se c'è un errore
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    // Altrimenti, restituisco il componente con i dettagli del prodotto

    <div>
      <Row>
        <Col md={6}>
          <img
            className="img-large"
            src={product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>
            <ListGroup.Item>Prezzo : {product.price}€</ListGroup.Item>
            <ListGroup.Item>
              Descrizione:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Prezzo:</Col>
                    <Col>{product.price}€</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Stato:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Non disponibile</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button onClick={addToCartHandler} variant="primary">
                        Aggiungi al carrello
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
export default ProductScreen;
