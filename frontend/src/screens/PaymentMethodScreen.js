import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';

// Definisco un componente React chiamato PaymentMethodScreen che non accetta props
export default function PaymentMethodScreen() {
  // Uso l'hook useNavigate per ottenere una funzione che permette di navigare tra le rotte
  const navigate = useNavigate();
  // Uso l'hook useContext per accedere allo stato e alla funzione dispatch del contesto Store
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Estraggo la proprietà shippingAddress e paymentMethod dallo stato, che contengono l'indirizzo di spedizione e il metodo di pagamento scelti dall'utente
  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  // Uso l'hook useState per gestire lo stato locale del metodo di pagamento, inizializzato con il valore di paymentMethod o 'PayPal' se non esiste
  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'PayPal'
  );

  // Uso l'hook useEffect per eseguire un effetto collaterale dopo il rendering del componente
  useEffect(() => {
    // Se l'indirizzo di spedizione non è stato inserito, navigo alla pagina di shipping
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]); // Eseguo l'effetto solo quando una di queste dipendenze cambia

  // Definisco una funzione che gestisce il submit del form
  const submitHandler = (e) => {
    // Preveno il comportamento di default del form
    e.preventDefault();
    // Invio un'azione di tipo 'SAVE_PAYMENT_METHOD' al contesto Store con il metodo di pagamento scelto come payload
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
    // Salvo il metodo di pagamento nel localStorage
    localStorage.setItem('paymentMethod', paymentMethodName);
    // Navigo alla pagina di placeorder
    navigate('/placeorder');
  };
  // Restituisco il componente React che mostra il form per scegliere il metodo di pagamento
  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        <Helmet>
          <title>Metodo di Pagamento</title>
        </Helmet>
        <h1 className="my-3">Metodo di Pagamento</h1>
        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="PayPal"
              label="PayPal"
              value="PayPal"
              checked={paymentMethodName === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="Stripe"
              label="Stripe"
              value="Stripe"
              checked={paymentMethodName === 'Stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Button type="submit">Continua</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
