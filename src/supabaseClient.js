import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vbfddkboyexmoxwkoygd.supabase.co";
const supabaseKey = "sb_publishable_7SF_FyPlBO4pmWRNV4G_KQ_jk__-g7o";

export const supabase = createClient(supabaseUrl, supabaseKey);
