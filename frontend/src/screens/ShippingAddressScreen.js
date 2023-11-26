import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';

export default function ShippingAddressScreen() {
  // Usa la funzione useNavigate per ottenere una funzione per navigare tra le pagine
  const navigate = useNavigate();
  // Usa la funzione useContext per accedere allo stato e al dispatch del contesto Store
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Destruttura lo stato per ottenere le proprietà userInfo e shippingAddress
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  // Dichiara quattro variabili di stato per memorizzare i dati dell'indirizzo di spedizione e le funzioni per aggiornarle
  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  // Usa l'hook useEffect per eseguire una funzione quando il componente si monta o si aggiorna
  useEffect(() => {
    // Se l'utente non è autenticato, lo reindirizza alla pagina di accesso con un parametro redirect
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate]); // Aggiunge userInfo e navigate come dipendenze dell'hook useEffect
  // Dichiara una variabile di stato per memorizzare il paese e la funzione per aggiornarla
  const [country, setCountry] = useState(shippingAddress.country || '');
  // Definisce una funzione per gestire il submit del form
  const submitHandler = (e) => {
    // Previene il comportamento di default del form
    e.preventDefault();
    // Usa il dispatch del contesto Store per salvare i dati dell'indirizzo di spedizione nello stato
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
      },
    });
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
      })
    );
    // Naviga alla pagina di pagamento
    navigate('/payment');
  };
  return (
    <div>
      <Helmet>
        <title>Indirizzo di spedizione</title>
      </Helmet>

      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h1 className="my-3"> Indirizzo di spedizione</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Indirizzo</Form.Label>
            <Form.Control
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>Città</Form.Label>
            <Form.Control
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="postalCode">
            <Form.Label>Codice Postale</Form.Label>
            <Form.Control
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Paese</Form.Label>
            <Form.Control
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button variant="primary" type="submit">
              Continua
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
