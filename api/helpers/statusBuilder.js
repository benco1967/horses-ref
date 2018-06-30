'use strict';
const Status = require('../../common/models/status');

/*
fonction d'ajout de l'état d'une dépendance au status courant
 */
const _addOptionalDependencieStatus = (status, dependencie) => {
  status._status.dependencies.push(dependencie);
  switch(dependencie.status) {
    case 'ok':
      status.status = 'ok';
      break;
    default:
      status.status = 'warning';
      break;
  }
};
const _addMandatoryDependencieStatus = (status, dependencie) => {
  status._status.dependencies.push(dependencie);
  switch(dependencie.status) {
    case 'ok':
      status.status = 'ok';
      break;
    case 'warning':
      status.status = 'warning';
      break;
    default:
      status.status = 'error';
      break;
  }
};
/*
fonction récursive qui parcourt les dépendances et concatène les états
 */
const _checkStatus = (i, dependenciesFn, addDependencieStatus, status) => {
  // fonction appelée en cas d'erreur sur la dépendance
  const failed = () => {
    status.status = 'warning';
    return _checkStatus(i + 1, dependenciesFn, addDependencieStatus, status);
  };

  if (i < dependenciesFn.length) {
    // Il y a encore des dépendances à tester
    try {
      // appel de la dépendance
      const result = dependenciesFn[i]();
      if(!result) {
        // Si aucun résultat
        failed();
      }
      else {
        return result
          .then(dependencieStatus => {
            // àla résolution de la promesse on ajoute l'état de la dépendance et on passe à la suivante
            addDependencieStatus(status, dependencieStatus);
            return _checkStatus(i + 1, dependenciesFn, addDependencieStatus, status);
          })
          .catch(failed); // si la promesse n'est pas résolue
      }
    }
    catch (err) {
      // si une erreur est levée
      return failed();
    }
  }
  else {
    // il n'y a plus de dépendences à tester => on retourne le status
    if (dependenciesFn.length === 0) {
      // cas particulier s'il n'y a aucune dépendance c'est que c'est ok
      status.status = 'ok';
    }
    return Promise.resolve(status._status);
  }
};

/**
 * Classe de builder d'état d'un service avec une gestion de ses dépendances. Le status est obtenu par l'accesseur à
 * status
 *
 * Exemple d'utilisation
 * <pre>
    function status(req, res) {
      new StatusBuilder()
        .addDependencie(() => Promise.resolve({
            id: 'mongodb',
            description: 'Database of the service',
            status: "ok",
            details: {}
        }))
        .getStatus()
        .then(status => res.json(status));
    }
 * </pre>
 */
class StatusBuilder {
  /**
   * construit un nouveau builder sans dépendances
   */
  constructor(description) {
    this._status = new Status(description);
    this._mandatoryDependenciesFn = [];
    this._optionalDependenciesFn = [];
  }

  /**
   * Ajoute une fonction de test de l'état d'une dépendance
   * @param dependencieFn fonction testant la dépendance, elle retourne une promesse contenant le status de la
   * dépendance sous la forme :
   * <pre>
        {
            id: 'mongodb',
            description: 'Database of the service',
            status: "ok",
            details: {}
        }
   * </pre>
   * Le champ details est optionnel, les autres sont obligatoires
   * @param mandatory si la dépendance est optionelle un état d'erreur n'entraînera qu'un warning pour le service, si
   * elle est obligatoire un état d'erreur entraînera une erreur pour le service
   * @returns {StatusBuilder} ce qui permet d'enchainer
   */
  addDependencie(dependencieFn, mandatory) {
    this[mandatory ? '_mandatoryDependenciesFn' : '_optionalDependenciesFn'].push(dependencieFn);
    return this;
  }

  /**
   * Mutateur de l'état du service
   * L'état est une valeur parmi :
   * <li>ok : le service est pleinement opérationnel
   * <li>warning : certaines fonctions du service ne sont pas opérationnelles, une des dépendences n'est pas ok
   * <li>error : le service n'est pas opérationnel
   * <li>unknow : l'état du service n'a pas pu être déterminé
   * <li>undefined : l'état du service est indéfini
   * @param status le nouvelle état souhaité, si l'état est
   */
  set status(status) {
    switch(status) {
      case 'ok':
        if(this._status.status === "undefined") this._status.status = 'ok';
        break;
      case 'warning':
        if(this._status.status !== "error") this._status.status = 'warning';
        break;
      case 'error':
        this._status.status = 'error';
        break;
      case 'unknow':
        this._status.status = 'unknow';
        break;
      default:
        this._status.status = 'error';
        break;
    }
  }

  /**
   * @returns une promesse de status dont le format est
   * <pre>
   {
     "status": "warning",
     "dependencies": [
       {
         "id": "mongodb",
         "description": "Database of the service",
         "status": "error",
         "details": {
           ...
         }
       },
       ...
     ]
   }
   * </pre>
   */
  getStatus() {
    return _checkStatus(0, this._mandatoryDependenciesFn,_addMandatoryDependencieStatus, this)
      .then(() => _checkStatus(0, this._optionalDependenciesFn,_addOptionalDependencieStatus, this));
  }
}

module.exports = StatusBuilder;
