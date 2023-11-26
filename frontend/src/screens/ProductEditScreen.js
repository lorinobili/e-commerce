import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';

// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      // Se l'azione è di tipo 'FETCH_REQUEST', imposto la proprietà loading a true e mantengo le altre proprietà invariate
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      // Se l'azione è di tipo 'FETCH_SUCCESS', imposto la proprietà loading a false e mantengo le altre proprietà invariate
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      // Se l'azione è di tipo 'FETCH_FAIL', imposto la proprietà loading a false, la proprietà error al payload dell'azione e mantengo le altre proprietà invariate
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      // Se l'azione è di tipo 'UPDATE_REQUEST', imposto la proprietà loadingUpdate a true e mantengo le altre proprietà invariate
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      // Se l'azione è di tipo 'UPDATE_SUCCESS', imposto la proprietà loadingUpdate a false e mantengo le altre proprietà invariate
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      // Se l'azione è di tipo 'UPDATE_FAIL', imposto la proprietà loadingUpdate a false e mantengo le altre proprietà invariate
      return { ...state, loadingUpdate: false };
    default:
      // Se l'azione non è di nessuno dei tipi precedenti, restituisco lo stato invariato
      return state;
  }
};
// Definisco un componente React chiamato ProductEditScreen che non accetta props
export default function ProductEditScreen() {
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();
  // Uso l'hook useParams per ottenere i parametri dinamici dall'URL corrente
  const params = useParams(); // /product/:id
  // Estraggo la proprietà id dai parametri, che corrisponde all'id del prodotto
  const { id: productId } = params;

  // Uso l'hook useContext per accedere allo stato del contesto Store
  const { state } = useContext(Store);
  // Estraggo la proprietà userInfo dallo stato, che contiene le informazioni dell'utente
  const { userInfo } = state;
  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con due proprietà: loading e error
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Uso l'hook useState per gestire lo stato locale delle proprietà del prodotto
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Definisco una funzione asincrona che richiede i dati del prodotto tramite axios e aggiorna lo stato in base al risultato
    const fetchData = async () => {
      try {
        // Invio un'azione di tipo 'FETCH_REQUEST' alla funzione riduttrice
        dispatch({ type: 'FETCH_REQUEST' });
        // Richiedo i dati del prodotto all'API del server usando l'id del prodotto
        const { data } = await axios.get(`/api/products/${productId}`);
        // Imposto lo stato locale delle proprietà del prodotto con i dati ricevuti
        setName(data.name);
        setSlug(data.slug);
        setPrice(data.price);
        setImage(data.image);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setBrand(data.brand);
        setDescription(data.description);
        // Invio un'azione di tipo 'FETCH_SUCCESS' alla funzione riduttrice
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        // Se la richiesta fallisce, catturo l'errore e invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice con l'errore come payload
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    // Invoco la funzione asincrona per richiedere i dati del prodotto
    fetchData();
  }, [productId]); // Eseguo l'effetto solo quando productId cambia

  // Definisco una funzione asincrona che gestisce il submit del form per modificare il prodotto
  const submitHandler = async (e) => {
    // Preveno il comportamento di default del form
    e.preventDefault();
    try {
      // Invio un'azione di tipo 'UPDATE_REQUEST' alla funzione riduttrice
      dispatch({ type: 'UPDATE_REQUEST' });
      // Uso axios per aggiornare il prodotto usando il metodo put con le proprietà del prodotto e il token dell'utente come header di autorizzazione
      await axios.put(
        `/api/products/${productId}`,
        {
          _id: productId,
          name,
          slug,
          price,
          image,
          category,
          brand,
          countInStock,
          description,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      // Invio un'azione di tipo 'UPDATE_SUCCESS' alla funzione riduttrice
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      // Uso il componente toast per mostrare un messaggio di successo
      toast.success('Product updated successfully');
      // Navigo alla pagina dei prodotti dell'admin
      navigate('/admin/products');
    } catch (err) {
      // Se c'è un errore, uso il componente toast per mostrare un messaggio di errore
      toast.error(getError(err));
      // Invio un'azione di tipo 'UPDATE_FAIL' alla funzione riduttrice
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Modifica Prodotto ${productId}</title>
      </Helmet>
      <h1>Modifica Prodotto {productId}</h1>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="slug">
            <Form.Label>Slug</Form.Label>
            <Form.Control
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Prezzo</Form.Label>
            <Form.Control
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>File Immagine</Form.Label>
            <Form.Control
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Categoria</Form.Label>
            <Form.Control
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="brand">
            <Form.Label>Brand</Form.Label>
            <Form.Control
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="countInStock">
            <Form.Label>Numero In Stock</Form.Label>
            <Form.Control
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Aggiorna
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  );
}
