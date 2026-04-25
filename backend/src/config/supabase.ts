import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error(
    "❌ SUPABASE_URL and SUPABASE_SECRET_KEY must be set.\n" +
      "Copy .env.example → .env and fill in your Supabase credentials.",
  );
}

export const supabase = createClient(url, key);
