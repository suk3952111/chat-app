import { supabase } from "@/main";

export const fetchUserProfile = async (userId) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("nickname, profile_url")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return profile;
};

export const updateUserProfile = async (userId, nickname, profileUrl) => {
  const { error } = await supabase
    .from("profiles")
    .update({ nickname, profile_url: profileUrl })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
};
