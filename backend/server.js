const supabase = require("./supabaseClient");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// home route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// signup API
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email, password }]);

  if (error) {
    console.log("Error:", error);
    return res.json({ message: "Error saving user" });
  }

  res.json({ message: "Signup successful" });
});

// login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Login Data:", email, password);

  res.json({
    message: "Login successful"
  });
});

// server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});