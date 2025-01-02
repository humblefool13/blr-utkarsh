const express = require("express");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Directories
const mediaDir = path.join(__dirname, "media");
const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.csv");
const eventsFile = path.join(dataDir, "events.csv");
const registrationsFile = path.join(dataDir, "registrations.csv");

// Multer configuration
const storage = multer.diskStorage({
  destination: mediaDir,
  filename: (req, file, cb) => {
    const eventId = uuidv4();
    req.body.eventId = eventId;
    cb(null, `${eventId}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

const app = express();
const PORT = 6969;

// Middleware to parse form data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Ensure media and data directories exist
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

/* * User Login * */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }
  fs.readFile(usersFile, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error reading users file.");
    const users = data.split("\n").map((line) => line.split(","));
    const user = users.find((u) => u[1] === email && u[2] === password);
    if (user) {
      res.send("Login successful.");
    } else {
      res.status(401).send("User not found or invalid credentials.");
    }
  });
});

/* * User Sign Up * */
/* Bonus because without sign up its meh ;) thank utkarsh */
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }
  const newUser = `${username},${email},${password}`;
  fs.appendFile(usersFile, `\n${newUser}`, (err) => {
    if (err) return res.status(500).send("Error saving user.");
    res.send("User registered successfully.");
  });
});

/* * Event Upload * */
app.post("/event/upload", upload.single("image"), (req, res) => {
  const { eventId } = req.body;
  const { name, description, price } = req.body;
  if (!name || !description || !price || !req.file) {
    return res.status(400).send("All fields are required.");
  }
  const newEvent = `${eventId},${name},${description},${price}`;
  fs.appendFile(eventsFile, `\n${newEvent}`, (err) => {
    if (err) return res.status(500).send("Error saving event.");
    res.send("Event uploaded successfully.");
  });
});

/* * Event Data * */
app.post("/event/data", (req, res) => {
  const { eventId } = req.body;
  if (!eventId) return res.status(400).send("Event ID is required.");

  fs.readFile(eventsFile, "utf-8", (err, eventData) => {
    if (err) return res.status(500).send("Error reading events file.");
    const events = eventData.split("\n").map((line) => line.split(","));
    const event = events.find((e) => e[0] === eventId);

    if (!event) return res.status(404).send("Event not found.");

    fs.readFile(registrationsFile, "utf-8", (err, regData) => {
      if (err) return res.status(500).send("Error reading registrations file.");
      const registrations = regData
        .split("\n")
        .filter((line) => line.split(",")[0] === eventId)
        .map((line) => line.split(",")[1]);

      const mediaFile = path.join(
        mediaDir,
        `${eventId}${path.extname(event[1])}.png`
      );
      fs.readFile(mediaFile, (err, imageData) => {
        if (err) return res.status(500).send("Error reading media file.");

        res.send({
          eventId,
          name: event[1],
          description: event[2],
          price: event[3],
          registrations,
          media: imageData.toString("base64"),
        });
      });
    });
  });
});

/* * Student Registration * */
app.post("/event/register", (req, res) => {
  const { email, eventId } = req.body;
  if (!email || !eventId)
    return res.status(400).send("Email and Event ID are required.");

  const newRegistration = `${eventId},${email}`;
  fs.appendFile(registrationsFile, `\n${newRegistration}`, (err) => {
    if (err) return res.status(500).send("Error saving registration.");
    res.send("Registration successful.");
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
