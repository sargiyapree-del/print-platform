const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://avaorbvjphzvgtubutwn.supabase.co",
  "sb_publishable_WUGhLuFZGkHDvNSt5wmA3A_KY3ENaKq"
);

module.exports = supabase;