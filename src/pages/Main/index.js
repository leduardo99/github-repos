import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

const Main = () => {
  const [repositories, setRepositories] = useState([]);
  const [newRepo, setNewRepo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const repos = JSON.parse(localStorage.getItem('repositories'));

    if (repos) return setRepositories(repos);

    return () => setRepositories([]);
  }, []);

  useEffect(() => {
    const repos = JSON.stringify(repositories);

    return localStorage.setItem('repositories', repos);
  }, [repositories]);

  const handleSubmit = async e => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await api.get(`/repos/${newRepo}`);

      const repository = {
        id: data.id,
        url: data.html_url,
        name: data.full_name,
      };

      setRepositories([...repositories, repository]);

      setNewRepo('');

      setLoading(false);
    } catch (err) {
      setError(true);

      setTimeout(() => {
        setError(false);
        setLoading(false);
      }, 500);
    }
  };

  return (
    <Container>
      <h1>
        <FaGithubAlt />
        Repositórios
      </h1>

      <Form onSubmit={handleSubmit} error={error}>
        <input
          type="text"
          placeholder="Adicionar repositório"
          value={newRepo}
          disabled={loading}
          onChange={e => setNewRepo(e.target.value)}
        />

        <SubmitButton loading={loading}>
          {loading ? (
            <FaSpinner color="#FFF" size={14} />
          ) : (
            <FaPlus color="#FFF" size={14} />
          )}
        </SubmitButton>
      </Form>

      <List>
        {repositories.map(repository => (
          <li key={repository.id}>
            <span>{repository.name}</span>
            <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
              Detalhes
            </Link>
          </li>
        ))}
      </List>
    </Container>
  );
};

export default Main;
