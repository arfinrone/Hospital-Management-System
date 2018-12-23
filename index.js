const express = require("express");
const app = express();
const port = 3000 || process.env.PORT;
const fs = require("fs");
const bodyParser = require("body-parser");
let fileUpload = require("express-fileupload");
const hbs = require("hbs");
const admin = require("./controllers/admin");
const subadmin = require("./controllers/subadmin");
const patientController = require("./controllers/patient");
const pharmacistController = require("./controllers/pharmacist");
const nurseController = require("./controllers/nurse");
const doctorController = require("./controllers/doctor");
const account = require("./controllers/account");
const staff = require("./controllers/staff");
const expressSession = require("express-session");
const connection = require("./models/connection");
const user = connection.user;
const appointment = connection.appointment;
const doctor = connection.doctor;
const patient = connection.patient;
const nurse = connection.nurse;
const seat = connection.seat;
const test = connection.test;
const pharmacist = connection.pharmacist;
const blood = connection.blood;
const department = connection.department;
const medicine = connection.medicine;
const moment = require("moment");
const request = require("request");
const types = {
  admin: user,
  subadmin: user,
  account: user,
  staff: user,
  doctor: doctor,
  patient: patient,
  nurse: nurse,
  pharmacist: pharmacist,
  user: user
};
app.use(fileUpload());
hbs.registerPartials(__dirname + "/views/partials");
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "hbs");

app.post("/newappointment", (req, res) => {
  doctor.findById(req.body.doctor, (err, Doctor) => {
    appointment.find(
      { doctor: Doctor, date: req.body.date },
      (err, appointments) => {
        if (appointments.length > 5) {
          res.send(`Failed daily limit exeed`);
        } else {
          Appointment = new appointment({
            doctor: Doctor,
            date: req.body.date,
            name: req.body.name,
            phone: req.body.phone,
            serial: appointments.length + 1
          });
          Appointment.save()
            .then(apt => {
              txt = `Dear ${req.body.name} your appointment to doctor ${
                apt.doctor.fullname
              } will at ${req.body.date}.And your serial is ${apt.serial}`;
              link = `http://128.199.239.219/sms/api/sms?user_name=Test&password=test123&phone_no=${
                req.body.phone
              }&msg=${txt}`;
              request(link, (err, resp, body) => {
                res.send(`Success serial is ${apt.serial}`);
              });
            })
            .catch(e => {
              console.log(e);
            });
        }
      }
    );
  });
});

hbs.registerHelper("ifCond", function(v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
app.use(express.static("public"));
app.use(
  expressSession({ secret: "secret", resave: false, saveUninitialized: true })
);

app.get("/", (req, res) => {
  res.render("public/home");
});
app.get("/filterDoctor", (req, res) => {
  dept = req.query.d;
  doctor.find({ department: dept }, (err, drs) => {
    res.json(drs);
  });
});

app.get("/aboutus", (req, res) => {
  res.render("public/aboutUs");
});
app.get("/services", (req, res) => {
  res.render("public/service");
});

app.get("/news", (req, res) => {
  res.render("public/neWs");
});
app.get("/contact", (req, res) => {
  res.render("public/contactUs");
});
app.get("/logout", (req, res) => {
  req.session.user = undefined;
  res.redirect("/login");
});
app.post("/login", (req, res) => {
  email = req.body.email;
  password = req.body.password;
  type = req.body.type;
  types[type].findOne({ email, password }).then(data => {
    if (data) {
      req.session[type] = data;
      req.session.obj = data;
      switch (type) {
        case "user": {
          res.redirect("/admin");
        }
        case "doctor": {
          res.redirect("/doctor");
        }
        case "account": {
          res.redirect("/account");
        }
        case "subadmin": {
          res.redirect("/subadmin");
        }
        case "patient": {
          res.redirect("/patient");
        }
        case "nurse": {
          res.redirect("/nurse");
        }
        case "pharmacist": {
          res.redirect("/pharmacist");
        }
        case "staff": {
          res.redirect("/staff");
        }
      }
    } else {
      res.render("public/login", { err: "Invalid email or password" });
    }
  });
});
app.get("/dclist", (req, res) => {
  doctor.find().then(dlist => {
    res.json(dlist);
  });
});
app.get("/login", (req, res) => {
  res.render("public/login");
});
app.get("/signup", (req, res) => {
  res.render("public/signup");
});

app.listen(port, () => {
  console.log("The app is running at port " + port);
});
app.use(admin);
app.use(subadmin);
app.use(account);
app.use(staff);
app.use(doctorController);
app.use(pharmacistController);
app.use(patientController);
app.use(nurseController);
