/*  */
/* para convertir las fechas a una mas clasica  */
const timeago = require("timeago.js");

const timeMod = {};

timeMod.timeago = (timestamp) => {
  return timeago.format(timestamp);
};

timeMod.select = (selected, options) => {
  return options
    .fn(this)
    .replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"')
    .replace(
      new RegExp(">" + selected + "</option>"),
      ' selected="selected"$&'
    );
};

timeMod.selectPro = (selected, options) => {
  return options
    .fn(this)
    .replace(new RegExp(' value="' + selected + '"'), '$& selected="selected"')
    .replace(
      new RegExp(">" + selected + "</option>"),
      ' selected="selected"$&'
    );
};

module.exports = timeMod;
