# Middlewares utilisé dans les routes
Ce dossier contient les middlewares utilisés dans les routes définies
pour *express*.

## Ajout de paramètres (*customParams*)
Ce middleware permet d'ajouter sans crainte de conflit de clé des
paramètres à la requête. Pour cela il crée une clé avec un *Symbol*
pour l'objet contenant les paramètres.

### Exemples d'utilisation

#### Ajout du middleware

```javascript
const express = require('express');
const app = express();

app.use(require(reqCustoms));
```

#### Ajout d'un paramètre

```javascript
function middleware(req, res, next) {
  req.setCustomParam('myParam', { a: 42, b: { c: 'string' } }); // => { a: 42, b: { c: 'string' } }
  req.setCustomParam('anotherOne', 42);                         // =>42
}
```

#### Récupération d'un paramètre

```javascript
function middleware(req, res, next) {
  const a = req.getCustomParam('myParam', "a");      // => 42
  const c = req.getCustomParam('myParam', "b", "c"); // => 'string'
  const d = req.getCustomParam('myParam', "d");      // => null
  const foo = req.getCustomParam('foo');             // => null
}
```

#### Suppression d'un paramètre

```javascript
function middleware(req, res, next) {
  req.deleteCustomParam('myParam'); // => { a: 42, b: { c: 'string' } }
  req.deleteCustomParam('foo');     // => null
}
```

#### Test d'un paramètre

```javascript
function middleware(req, res, next) {
  req.hasCustomParam('myParam');    // => false
  req.hasCustomParam('anotherOne'); // => true
}
```

## Préchargement du tenant (*tenantLoader*)
ce middleware permet de précharger le tenant dès lors que l'identifiant
du tenant est présent dans la route. Il utilise le middleware
*CustomParams* pour stocker le tenant dans la requête.

Si le tenant n'est pas valable, on passe à la suite. Ce n'est pas ce
middleware qui lèvera l'erreur mais le middleware de sécurité d'accès.
En effet, savoir qu'un tenant n'est pas présent est une information
utile pour un éventuel hacker, faut donc que ce soit traité comme une
erreur d'accès et non une erreur de tenant.

### Exemple d'utilisation

```javascript
app.use(require('./api/middlewares/customParams'));

// ici l'id du tenant est *tenant*
app.param('tenant', require('..../tenantLoader'));

// sécurisation de la route avec *:tenant*
// si le tenant est invalide c'est ici que le traitement s'arrête
const basic  = require('..../basicSecurityHandler').Basic(['usr']);
const bearer  = require('..../bearerSecurityHandler').Bearer(['usr']);
const securityMiddleware = new SecurityHandler(basic, bearer);
app.get('maroute/:tenant/xxx', securityHandler.middleware());

// contrôleur de la route avec *:tenant*
app.get('maroute/:tenant/xxx', function(req, res, next) {
  const tenant = req.getCustomParam('tenant', 'value');
  const err = req.getCustomParam('tenant', 'err');
});
```

Si l'extraction du tenant se passe bien le tenant est accessible dans
le champ `value`du paramètre personnalisé `tenant` de la requête.

Si une erreur est survenue lors de l'extraction (problème de base de
données, tenant inconnu,...) le champ `err` contient l'erreur et la
champ `value` est `null`.

## Désactivation du tenant (*tenantDisabler*)
le fitting *tenantDisabler* permet de désactiver automatiquement  le 
tenant dès lors que la date de désactivation a été atteinte.

Pour utiliser ce fitting il suffit de l'ajouter dans le bagpipe. Il doit 
se placer après le *tenantLoader*. Sinon son paramètre booléen n'aura 
aucun effet.

Le paramètre booléen *x-tenantDisabler* permet d'indiquer si le tenant
doit rester disponible pour la suite de la requête (`false`) ou s'il est 
supprimé (`true`). Cela revient à laisser ou supprimer l'entrée que le 
*tenantLoader* a ajouté dans les paramètres de la requête. Sa valeur 
par défaut est `false`.


### Exemple d'utilisation

#### Ajout du champ *x-tenantDisabler* dans le *swagger.yaml*

```yaml
...
paths:
  ...
  /admin/tenants/{tenant}/settings:
    x-swagger-router-controller: tenantsAdmin
    get:
      operationId: getAdminTenantSettings
      x-tenantLoader: tenant
      x-tenantDisabler: true
      ...
      parameters:
        - name: tenant
          in: path
          description: Le nom du tenant
          required: true
          type: string
        ...
      responses:
        ...
```

Dans la définition de l'opération on ajoute *x-tenantDisabler* en lui
donnant pour valeur `true` ou `false`.

#### Ajout du *tenantDisabler* dans le bagpipe (config/default.yaml)

```yaml
  bagpipes:
    ...
    # pipe for all swagger-node controllers
    swagger_controllers:
      - onError: json_error_handler
      - cors
      - tenantLoader
      - tenantDisabler
      - swagger_security
      - _swagger_validate
      - express_compatibility
      - _router
```

Elle dit se faire après le *tenantLoader*.

