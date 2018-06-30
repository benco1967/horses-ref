
module.exports = () => (context, next) => {
  const user = req.getCustomParam("user");
  if (user) {
    context.response.set('Authorization', user.authorization);
  }
  next();
};
