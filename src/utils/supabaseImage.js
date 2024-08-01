import { supabase } from "@/main";

export const uploadProfileImage = async (userId, profileImage) => {
  const fileExt = profileImage.name.split(".").pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `public/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(filePath, profileImage);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicData, error: urlError } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);

  if (urlError) {
    throw new Error(urlError.message);
  }

  return publicData.publicUrl;
};
