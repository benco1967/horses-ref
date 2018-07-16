'use strict';

const mongoose = require('mongoose');
const Role = require('./role');
/**
 * Retourne un validateur asynchrone (qui retourne une promesse).
 * Le type de rôle est testé en fonction du paramètre.
 * @param forAdm
 * <li>si true teste les rôles parmi : adm, mng, snd, usr
 * <li>si false teste les rôles parmi : mng, snd, usr
 */
const validator = forAdm => groupRoleMapping =>
  new Promise((resolve, reject) => {
    let errMsg = null;
    for (let group in groupRoleMapping) {
      const roles = groupRoleMapping[group];
      if (Array.isArray(roles)) {
        roles.forEach((role, i) => {
          if (errMsg === null && !(forAdm ? /adm|mng|snd|usr/g :  /mng|snd|usr/g).test(role)) {
            errMsg = `for groupRoleMapping/${group}/${i}, the role '${role}' is not valid`;
          }
        });
      }
      else {
        errMsg = `groupRoleMapping/${group}=${roles} should be an array`;
      }
    }
    if (errMsg) {
      reject(errMsg);
    }
    else {
      resolve(true);
    }
  });

/**
 * Liste des rôles du service avec leurs  descriptions
 */
const ROLES = [
  new Role("adm", "admin")
    .addTitle("fr", "Super administrateur du service")
    .addSummary("fr", "Ce rôle donne accès à la gestion globale du service"),
  new Role("mng", "manager")
    .addTitle("fr", "Administrateur de tenant")
    .addSummary("fr", "Ce rôle donne accès à la gestion d'un tenant de service"),
  new Role("ins", "instructor")
    .addTitle("fr", "Moniteur")
    .addSummary("fr", "Ce rôle donne accès au service"),
  new Role("usr", "user")
    .addTitle("fr", "Utilisateur enregistré")
    .addSummary("fr", "Ce rôle donne accès à l'utilisation au service à l'exception de l'envoi de sms"),
];

module.exports = {
  schema: forAdm => ({
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: validator(forAdm),
      message: "{REASON}",
    },
  }),
  validator,
  ROLES,
};
