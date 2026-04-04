const express = require("express");
const multer = require("multer");
const path = require("path");
const supabase = require("./supabaseClient");
const bcrypt = require("bcrypt");

const app = express();

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// ======================
// MULTER CONFIG
// ======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ======================
// ROUTES
// ======================

// HOME
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from("users")
    .insert([{ name, email, password: hashedPassword }]);

  if (error) {
    return res.status(400).json({ message: "Signup failed ❌" });
  }

  res.json({ message: "Signup successful ✅" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) {
    return res.status(400).json({ message: "User not found ❌" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Wrong password ❌" });
  }

  res.json({
    message: "Login successful ✅",
    user
  });
});

// UPLOAD
app.post("/upload", upload.single("file"), (req, res) => {
  console.log("FILE RECEIVED:", req.file);
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded ❌"
    });
  }

  res.json({
    message: "File uploaded successfully ✅",
    file: req.file
  });
});

// GET ORDERS (FIXED 🔥)
app.get("/admin/orders", async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*");

  if (error) {
    return res.status(400).json({ message: "Error fetching orders ❌" });
  }

  res.json(data);
});

//update status

app.put("/admin/order/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    return res.status(400).json({ message: "Update failed ❌" });
  }

  res.json({ message: "Status updated ✅" });
});

// ORDER

app.post("/order", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { fileName, copies, totalPrice, user_id, pickup_time } = req.body;

    // Validation
   // Validation
if (
  user_id === undefined ||
  !fileName ||
  copies === undefined ||
  totalPrice === undefined ||
  !pickup_time
) {
  console.log("❌ VALIDATION FAILED");
  return res.status(400).json({ message: "Missing fields ❌" });
}

console.log("✅ VALIDATION PASSED");

const { data, error } = await supabase
  .from("orders")
  .insert([
    {
      file_name: fileName,
      copies,
      total_price: totalPrice,
      user_id,
      pickup_time,
      status: "pending"
    }
  ]);

if (error) {
  console.log("🔥 SUPABASE ERROR FULL:", error);
  return res.status(400).json({ message: error.message });
}

console.log("✅ INSERT SUCCESS:", data);

res.json({ message: "Order placed successfully ✅" });

  } catch (err) {
    console.log("💥 SERVER ERROR:", err);
    res.status(500).json({ message: "Server error ❌" });
  }
});
// START
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});