'use strict';

const fs = require('fs');
const upath = require('upath');

const removeExtension = fileName => fileName.replace(/\..*$/, '');

const expose = repositories => {
  const exposeRepository = repository => {
    const normalisedRepository = upath.normalize(repository);
    const repositoryName = normalisedRepository.split('/').pop();

    return fs
      .readdirSync(normalisedRepository)
      .map(file => upath.join(normalisedRepository, file))
      .reduce((acc, path) => {
        if (fs.statSync(path).isFile()) {
          const fileName = removeExtension(path.split('/').pop());
          acc[repositoryName] = {
            ...acc[repositoryName],
            ...{ [fileName]: require(path) }
          };
        }
        if (fs.statSync(path).isDirectory()) {
          acc[repositoryName] = { ...acc[repositoryName], ...exposeRepository(path) };
        }
        return acc;
      }, {});
  };

  return repositories.reduce((virtualIndex, repository) => {
    virtualIndex = { ...virtualIndex, ...exposeRepository(repository) };
    return virtualIndex;
  }, {});
};

module.exports = expose;
