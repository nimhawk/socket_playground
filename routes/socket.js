module.exports.index = function (req, res) {
  res.render('socket', {
    title: 'Socket IO'
  });
};