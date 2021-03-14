/*  */
/*  */
const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
const { isNotAuthenticated } = require("../helpers/auth");

const crypto = require("crypto");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SEND_GRID_KEY);

/* ********************************  VIEW SIGNUP ******************************** */
router.get("/user/signup", isNotAuthenticated, (req, res) => {
  res.render("users/signup");
});

/* ********************************  POST SIGNUP ******************************** */
router.post("/user/signup", async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  let errors = [];
  if (!name || !email || !password || !passwordConfirm) {
    errors.push({ text: "Please enter all fields" });
  }
  if (password != passwordConfirm) {
    errors.push({ text: "Passwords do not match" });
  }
  if (password < 6) {
    errors.push({ text: "Password must be at least 6 characters" });
  }
  if (errors.length > 0) {
    res.render("users/signup", {
      errors,
      name,
      email,
      password,
      passwordConfirm,
    });
  } else {
    const searchEmail = await User.findOne({ email: email });
    if (searchEmail) {
      errors.push({ text: "Email already exists" });
      res.render("users/signup", {
        errors,
        name,
        email,
        password,
        passwordConfirm,
      });
    } else {
      const newUser = new User({ name, email, password });
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash("successMessage", "You are registered successfully");
      res.redirect("/user/signin");

      /* enviar EMAIL  */
      const msg = {
        to: email,
        from: "carlosgevara100@gmail.com",
        subject: "Signup succeeded!",
        html: `<h1>You successfully signed up!</h1>`,
      };
      return sgMail.send(msg);
    }
  }
});

/* ********************************  VISTA SIGNIN ******************************** */

router.get("/user/signin", isNotAuthenticated, (req, res) => {
  res.render("users/signin");
});

/* ********************************  POST SIGNIN ******************************** */
router.post(
  "/user/signin",
  passport.authenticate("local", {
    successRedirect: "/event",
    failureRedirect: "/user/signin",
    failureFlash: true,
  })
);

/* ********************************  GET LOGOUT ******************************** */
router.get("/user/logout", (req, res) => {
  req.logout();
  req.flash("successMessage", "You are logged out now.");
  res.redirect("/");
});

/* ********************************  VIEW RESET ******************************** */
router.get("/user/reset", (req, res) => {
  res.render("users/reset");
});

/* ********************************  POST RESET ******************************** */
router.post("/user/reset", async (req, res) => {
  const { email } = req.body;

  const searchEmail = await User.findOne({ email: email });

  if (!searchEmail) {
    console.log("Este email no existe");
    return res.redirect("/user/reset");
  }

  let token = crypto.randomBytes(64).toString("hex");

  searchEmail.resetToken = token;
  searchEmail.resetTokenExpiration = Date.now() + 3600000;
  await searchEmail.save();

  const resetMsg = {
    to: email,
    from: "carlosgevara100@gmail.com",
    subject: "Password Reset",
    html: `
      <p>Your reseted password </p>
      <p>Click this <a href="http://${req.headers.host}/user/reset/${token}">Link</a>
        a <strong>other password</strong>
      </p>
    `,
  };
  res.redirect("/");
  return sgMail.send(resetMsg);
});

/* ********************************  VIEW RESET TOKEN ******************************** */
router.get("/user/reset/:token", async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    console.log("TOKEN no valido");
    req.flash("successMessage", "This token no exist");
    return res.redirect("/");
  }

  res.render("users/new-password", {
    userId: user._id.toString(),
    passwordToken: token,
  });
});

/* ********************************  POST NEW PASSWORD ******************************** */
router.post("/user/new-password", async (req, res) => {
  const { password, passwordConfirm, userId, passwordToken } = req.body;

  if (password !== passwordConfirm) {
    req.flash("successMessage", "The email are  different");
    return res.redirect("/");
  }

  try {
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (!user) {
      req.flash("successMessage", "The user not exist");
      return res.redirect("/");
    }

    user.password = await user.encryptPassword(password);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.redirect("/user/signin");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
