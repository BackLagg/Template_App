export interface UserProfileData {
  userId?: string;
  name?: string;
  username?: string;
  isNew?: boolean;
  avatarPath?: string;
}

export interface UserFullProfile extends UserProfileData {
  editorProfile?: {
    profession?: string;
    bio?: string;
    categories?: Array<{
      id: string;
      name: string;
    }>;
  };
}
