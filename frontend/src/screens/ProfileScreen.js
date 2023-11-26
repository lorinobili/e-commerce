import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
// Definisco una funzione riduttrice che aggiorna lo stato in base all'azione ricevuta
const reducer = (state, action) => {
  switch (action.type) {
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

// Definisco un componente React chiamato ProfileScreen che non accetta props
export default function ProfileScreen() {
  // Uso l'hook useContext per accedere allo stato e alla funzione dispatch del contesto Store
  const { state, dispatch: ctxDispatch } = useContext(Store);
  // Estraggo la proprietà userInfo dallo stato, che contiene le informazioni dell'utente
  const { userInfo } = state;
  // Uso l'hook useState per gestire lo stato locale del nome, dell'email, della password e della conferma della password dell'utente
  // Inizializzo lo stato con i valori di userInfo
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Uso l'hook useReducer per gestire lo stato del componente con la funzione riduttrice definita sopra
  // Lo stato iniziale è un oggetto con una proprietà: loadingUpdate
  // L'hook useReducer restituisce lo stato corrente e la funzione dispatch
  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  // Definisco una funzione asincrona che gestisce il submit del form per aggiornare il profilo dell'utente
  const submitHandler = async (e) => {
    // Preveno il comportamento di default del form
    e.preventDefault();
    try {
      // Invio un'azione di tipo 'UPDATE_REQUEST' alla funzione riduttrice
      dispatch({ type: 'UPDATE_REQUEST' });
      // Uso axios per aggiornare il profilo dell'utente usando il metodo put con il nome, l'email e la password dell'utente e il token dell'utente come header di autorizzazione
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      // Invio un'azione di tipo 'UPDATE_SUCCESS' alla funzione riduttrice
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      // Invio un'azione di tipo 'USER_SIGNIN' al contesto Store con i dati dell'utente come payload
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      // Salvo i dati dell'utente nel localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      // Uso il componente toast per mostrare un messaggio di successo
      toast.success('User updated successfully');
    } catch (err) {
      // Se c'è un errore, invio un'azione di tipo 'FETCH_FAIL' alla funzione riduttrice
      dispatch({
        type: 'FETCH_FAIL',
      });
      // Uso il componente toast per mostrare un messaggio di errore
      toast.error(getError(err));
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>Profilo</title>
      </Helmet>
      <h1 className="my-3">Profilo</h1>
      <form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Conferma Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Aggiorna</Button>
        </div>
      </form>
    </div>
  );
}
