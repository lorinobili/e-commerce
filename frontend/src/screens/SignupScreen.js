import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function SignupScreen() {
  // Usa la funzione useNavigate per ottenere una funzione per navigare tra le pagine
  const navigate = useNavigate();
  // Usa la funzione useLocation per ottenere l'oggetto location che contiene la stringa di query
  const { search } = useLocation();
  // Usa la classe URLSearchParams per creare un oggetto che contiene i parametri della stringa di query
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  // Assegna il valore del parametro redirect alla variabile redirect, o usa '/' come valore di default se il parametro è vuoto
  const redirect = redirectInUrl ? redirectInUrl : '/';

  // Dichiara quattro variabili di stato per memorizzare il nome, l'email, la password e la conferma della password dell'utente e le funzioni per aggiornarle
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Usa la funzione useContext per accedere allo stato e al dispatch del contesto Store
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Destruttura lo stato per ottenere la proprietà userInfo
  const { userInfo } = state;
  // Definisce una funzione asincrona per gestire il submit del form
  const submitHandler = async (e) => {
    // Previene il comportamento di default del form
    e.preventDefault();
    // Se la password e la conferma della password non corrispondono, mostra un messaggio di errore con la funzione toast.error
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      // Usa Axios per fare una richiesta POST all'endpoint /api/users/signup con i dati del nome, dell'email e della password
      const { data } = await Axios.post('/api/users/signup', {
        name,
        email,
        password,
      });
      // Usa il dispatch del contesto Store per salvare i dati dell'utente nello stato
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      // Usa la funzione localStorage.setItem per salvare i dati dell'utente nel browser
      localStorage.setItem('userInfo', JSON.stringify(data));
      // Naviga alla pagina di redirect o alla pagina principale
      navigate(redirect || '/');
    } catch (err) {
      // In caso di errore, mostra un messaggio con la funzione toast.error
      toast.error(getError(err));
    }
  };

  // Usa l'hook useEffect per eseguire una funzione quando il componente si monta o si aggiorna
  useEffect(() => {
    // Se l'utente è autenticato, lo reindirizza alla pagina di redirect
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]); // Aggiunge navigate, redirect e userInfo come dipendenze dell'hook useEffect

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Nome</Form.Label>
          <Form.Control onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Conferma Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Sign Up</Button>
        </div>
        <div className="mb-3">
          Hai già un account?{' '}
          <Link to={`/signin?redirect=${redirect}`}>Log-In</Link>
        </div>
      </Form>
    </Container>
  );
}
