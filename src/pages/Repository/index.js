import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, InsueList, PagesOptions } from './styles';

export default class Repository extends Component {
  state = {
    repository: {},
    currentPage: 1,
    issues: [],
    loading: true,
    emptyIssues: false,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { currentPage } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
          page: currentPage,
        },
      }),
    ]);

    this.setState({
      loading: false,
      repository: repository.data,
      issues: issues.data,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { match } = this.props;
    const { currentPage } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    if (prevState.currentPage !== currentPage) {
      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
          page: currentPage,
        },
      });

      this.setState({
        issues: issues.data,
        emptyIssues: !(issues.data.length > 0),
      });
    }
  }

  nextPage = async () => {
    const { emptyIssues } = this.state;

    if (emptyIssues) return;

    this.setState(prevState => ({
      currentPage: prevState.currentPage + 1,
    }));
  };

  backPage = () => {
    const { currentPage } = this.state;

    if (currentPage === 1) return;

    this.setState(prevState => ({
      currentPage: prevState.currentPage - 1,
    }));
  };

  render() {
    const {
      repository,
      issues,
      loading,
      currentPage,
      emptyIssues,
    } = this.state;

    if (loading) {
      return <Loading>Carregando ...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar para página inicial</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <PagesOptions>
          <FaArrowAltCircleLeft
            style={{
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
            color="#7159c1"
            onClick={this.backPage}
          />
          <span>Página {currentPage}</span>
          <FaArrowAltCircleRight
            color="#7159c1"
            onClick={this.nextPage}
            style={{
              opacity: emptyIssues ? 0.5 : 1,
              cursor: emptyIssues ? 'not-allowed' : 'pointer',
            }}
          />
        </PagesOptions>

        <InsueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </InsueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
