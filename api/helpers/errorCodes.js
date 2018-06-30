'use strict';

const error = require('debug')("notifSender:error");

class Code {
  constructor(name, status, message) {
    this.name = name;
    this.status = status;
    this.message = message;
  }
  setRes(res, err) {
    res.status(this.status).json({ name: err && err.name || this.name, message: err && err.message || err || this.message })
  }
}
class C401 extends Code {
  setRes(res, err) {
    res.header("WWW-Authenticate", `Basic realm="Authentication requise", charset="UTF-8"`);
    super.setRes(res, err);
  }
}
const CODES = {
  BAD_REQUEST      : new Code('BAD_REQUEST'      , 400, "Bad request"),
  UNAUTHORIZED     : new C401('UNAUTHORIZED'     , 401, "Access denied, invalid token"),
  FORBIDDEN        : new Code('FORBIDDEN'        , 403, "Access not allowed for this accreditation"),
  NOT_FOUND        : new Code('NOT_FOUND'        , 404, "No such tenant"),
  ALREADY_EXISTS   : new Code('ALREADY_EXISTS'   , 409, ""),
  FORBIDDEN_ID     : new Code('FORBIDDEN_ID'     , 409, ""),
  GONE             : new Code('GONE'             , 410, "This tenant is no more available"),
  UNKNOW           : new Code('UNKNOW'           , 500, ""),
  UNABLE_TO_CONNECT: new Code('UNABLE_TO_CONNECT', 503, "Service unavailable, DB unreachable"),
};

module.exports = {
  BAD_REQUEST      : Symbol.for('BAD_REQUEST'      ),
  UNAUTHORIZED     : Symbol.for('UNAUTHORIZED'     ),
  FORBIDDEN        : Symbol.for('FORBIDDEN'        ),
  NOT_FOUND        : Symbol.for('NOT_FOUND'        ),
  ALREADY_EXISTS   : Symbol.for('ALREADY_EXISTS'   ),
  FORBIDDEN_ID     : Symbol.for('FORBIDDEN_ID'     ),
  GONE             : Symbol.for('GONE'             ),
  UNKNOW           : Symbol.for('UNKNOW'           ),
  UNABLE_TO_CONNECT: Symbol.for('UNABLE_TO_CONNECT'),
  /**
   * Fonction convertisant une erreur interne en une erreur http
   * @param res la réponse contenant le json de l'erreur
   * @param err l'erreur de type { code : Symbol, message: "xxx" }
   */
  codeToResponse: (res, err) => {
    const code = CODES[err && err.code && typeof err.code === "symbol" && Symbol.keyFor(err.code)] || CODES.UNKNOW;
    error(`Internal error : (${code.name}) ${err && err.message && JSON.stringify(err) || err}`);
    code.setRes(res, err);
  },
  error: (status, msg) => {
    const code = CODES[Symbol.keyFor(status)];
    const error = Error(msg || code.message);
    error.statusCode = code.status;
    error.code = status;
    return error;
  }
};
