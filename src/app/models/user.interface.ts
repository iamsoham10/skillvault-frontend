export interface userData {
  success: boolean;
  data: {
    _id: string;
    username: string;
    email: string;
    password: string;
    user_id: string;
    collections: Array<string>;
    profilePicture: string;
  };
}
export interface userLogInResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      password: string;
      user_id: string;
      collections: Array<string>;
      profilePicture: string;
      lastLogin: string;
      refreshToken: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
