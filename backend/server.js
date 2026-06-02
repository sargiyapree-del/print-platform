const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const supabase = require("./supabaseClient");

const app = express();


const Razorpay = require("razorpay");



// ======================
// CORS
// ======================

app.use((req, res, next) => {

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {

    return res.sendStatus(200);

  }

  next();

});

app.use(express.json());
app.use("/uploads", express.static("uploads"));


// ======================
// MULTER CONFIG
// ======================

const storage =
  multer.diskStorage({

    destination: function (
      req,
      file,
      cb
    ) {

      cb(null, "uploads/");

    },

    filename: function (
      req,
      file,
      cb
    ) {

      cb(
        null,
        Date.now() +
          "-" +
          file.originalname
      );

    },

  });

const upload =
  multer({ storage });


// ======================
// HOME
// ======================

app.get("/", (req, res) => {

  res.send(
    "Backend running 🚀"
  );

});


// ======================
// SIGNUP
// ======================

app.post(
  "/signup",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
      } = req.body;

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const { error } =
        await supabase
          .from("users")
          .insert([
            {
              name,
              email,
              password:
                hashedPassword,
            },
          ]);

      if (error) {

        return res
          .status(400)
          .json({
            message:
              error.message,
          });

      }

      res.json({
        message:
          "Signup successful ✅",
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          "Server Error ❌",
      });

    }

  }
);


// ======================
// LOGIN
// ======================

app.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      const {
        data: user,
      } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (!user) {

        return res
          .status(400)
          .json({
            message:
              "User not found ❌",
          });

      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {

        return res
          .status(400)
          .json({
            message:
              "Wrong password ❌",
          });

      }

      res.json({

        message:
          "Login successful ✅",

        user,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Server Error ❌",

      });

    }

  }
);


// ======================
// CALCULATE PRICE
// ======================

app.post(
  "/upload",
  upload.array("files", 10),
  async (req, res) => {

    try {

      if (!req.files) {

        return res
          .status(400)
          .json({
            message:
              "No files uploaded ❌",
          });

      }

      let filesData = [];

      for (const file of req.files) {

        const dataBuffer =
          fs.readFileSync(
            file.path
          );

        const pdfData =
          await pdfParse(
            dataBuffer
          );

        const pages =
          pdfData.numpages;

        filesData.push({

          file_name:
            file.originalname,

          pages,

        });

      }

      res.json({

        success: true,

        files: filesData,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message:
          "Error calculating pages ❌",

      });

    }

  }
);

// ======================
// CREATE PAYMENT ORDER
// ======================

app.post("/create-order", async (req, res) => {

  const { amount } = req.body;

  console.log("AMOUNT RECEIVED:", amount);

  const options = {
    amount: amount * 100, // 🔥 MUST
    currency: "INR",
    receipt: "order_" + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);

    console.log("ORDER CREATED:", order);

    res.json(order);
  } catch (err) {
    console.log("RAZORPAY ERROR:", err);
    res.status(500).send("Error");
  }
});


/// ======================
// VERIFY PAYMENT 
// ======================

app.post("/verify-payment", (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const crypto = require("crypto");

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", "xmRUfNWyK1ghD1Iu7ru0cLX2")
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});


/// ======================
// PLACE ORDER
// ======================

app.post(
  "/order",
  upload.single("file"),
  async (req, res) => {

    try {

      console.log("BODY:", req.body);

      const {
  copies,
  pickup_time,
  user_id,
  order_group_id,
  payment_id,
  razorpay_order_id
} = req.body;
      // CHECK FILE

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: "No file uploaded ❌",
        });

      }

      // FILE PATH

      const filePath =
        req.file.path;

      // READ FILE

      const dataBuffer =
        fs.readFileSync(filePath);

      // PDF PARSE

      const pdfData =
        await pdfParse(dataBuffer);

      // PAGE COUNT

      const pageCount =
        pdfData.numpages;

      // PRICE

      const totalPrice =

        Number(pageCount) *

        Number(copies) *

        2;

      // SAVE TO DATABASE

      const { data, error } = await supabase
  .from("orders")
  .insert([
    {
      file_name: req.file.originalname,
      file_url: req.file.path,

      copies: Number(copies),
      page_count: Number(pageCount),
      total_price: Number(totalPrice),

      pickup_time: pickup_time,

      user_id: Number(user_id),

      // ✅ PAYMENT DATA (ADDED)
      payment_id: payment_id,
      razorpay_order_id: razorpay_order_id,

      status: "pending",

      order_group_id: order_group_id,
    }
  ]);

if (error) {
  console.error("SUPABASE ERROR:", error);
  return res.status(500).json({ error: "Order failed" });
}

res.json({ success: true, data });
      // SUCCESS

      res.json({

        success: true,

        message:
          "Order placed successfully ✅",

        total_pages:
          pageCount,

        total_price:
          totalPrice,

      });

    } catch (err) {

      console.log(
        "SERVER ERROR:",
        err
      );

      res.status(500).json({

        success: false,

        error:
          "Something went wrong ❌",

      });

    }

  }
);


// ======================
// GET ALL ORDERS
// ======================

app.get(
  "/admin/orders",
  async (req, res) => {

    try {

      const { data, error } = await supabase
  .from("orders")
  .select(`
    *,
    users (
      name,
      email
    )
  `)
  .order("created_at", {
    ascending: false,
  });

      if (error) {

        return res
          .status(400)
          .json({
            message:
              "Error fetching orders ❌",
          });

      }

      res.json(data);

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Server Error ❌",

      });

    }

  }
);


// ======================
// UPDATE ORDER STATUS
// ======================

app.put(
  "/admin/order/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const { status } =
        req.body;

      const { error } =
        await supabase
          .from("orders")
          .update({
            status,
          })
          .eq("id", id);

      if (error) {

        return res
          .status(400)
          .json({
            message:
              "Update failed ❌",
          });

      }

      res.json({

        message:
          "Status updated ✅",

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
          "Server Error ❌",

      });

    }

  }
);


// ======================
// START SERVER
// ======================

app.listen(5000, () => {

  console.log(
    "Server running on port 5000 🚀"
  );

});