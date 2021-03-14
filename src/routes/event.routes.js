const express = require("express");
const router = express.Router();
const moment = require("moment");
const Event = require("../models/Event");
const Note = require("../models/Note");
const { isAuthenticated } = require("../helpers/auth");


router.get("/event/add", isAuthenticated, async (req, res) => {
  const note = await Note.find({ user: req.user.id })
    .sort({ date_init: 1 })
    .lean();

  /* res.render("event/list", { eventList }); */
  res.render("event/add", { note });
});

router.post("/event/add", isAuthenticated, async (req, res) => {
  const { title, description, date_init, date_end } = req.body;
  const noteid = req.body.noteid;

  /* res.send("okkkk"); */
  const errors = [];
  if (!title) {
    errors.push({ text: "Please write a title" });
  }
  if (!description) {
    errors.push({ text: "Please write a description" });
  }
  if (errors.length > 0) {
    res.render("event/add", { errors, title, description });
  } else {
    /* crear nota */
    const newEvent = new Event({
      title,
      description,
      date_init,
      date_end,
      noteid,
    });
    newEvent.user = req.user.id;
    await newEvent.save();
    req.flash("successMessage", "Event added successfully");
    res.redirect("/event");
  }
});

router.get("/event", isAuthenticated, async (req, res) => {
  /* try { */

  const notas = await Note.find({ user: req.user.id });
  let notasPro = notas.map((nota) => nota._id);
  /* console.log(notasPro); */
  /* console.log(notas); */
  const eventList = await Event.find({ noteid: { $in: notasPro } })
    .sort({ date_init: 1 })
    .populate("noteid")
    .lean();
  /* console.log(eventList); */
  res.render("event/list", { eventList });
  /* } catch (error) {
      console.log(error);
    } */
});

/* EDITAR NOTA ******************************** */
router.get("/event/edit/:id", isAuthenticated, async (req, res) => {
  const note = await Note.find({ user: req.user.id }).lean();

  const { noteid } = await Event.findById(req.params.id);
  /* const e = await Event.findById(req.params.id).lean(); */

  const event = await Event.find({
    noteid: { $in: noteid },
  })
    .sort({ date_init: 1 })
    .populate("noteid")
    .lean();

  const eve = [...event];
  const l = eve[0];

  const eventEdit = {
    ...l,
    date_init: moment(l.date_init).format("YYYY-MM-DD[T]HH:mm:ss"),
    date_end: moment(l.date_end).format("YYYY-MM-DD[T]HH:mm:ss"),
  };
  console.log(eventEdit);
  console.log("************");
  console.log(note);
  res.render("event/edit", { eventEdit, note });
});

/* ACTUALIZAR NOTA ******************************** */
router.put("/event/edit/:id", isAuthenticated, async (req, res) => {
  const { title, description, date_init, date_end } = req.body;
  await Event.findByIdAndUpdate(req.params.id, {
    title,
    description,
    date_init,
    date_end,
  }).lean();
  req.flash("successMessage", "Event edited successfully");
  res.redirect("/event");
});

router.delete("/event/delete/:id", isAuthenticated, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id).lean();
  req.flash("successMessage", "Event deleted successfully");
  res.redirect("/event");
});

router.get("/event/editpro/:id", isAuthenticated, async (req, res) => {
  const event = await Event.findById(req.params.id).populate("noteid");
  console.log(event);
});

module.exports = router;
