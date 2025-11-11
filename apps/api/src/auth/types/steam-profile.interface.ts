// Steam profile data from passport-steam
export interface SteamProfile {
  id: string;
  displayName: string;
  photos?: Array<{ value: string }>;
  _json?: {
    profileurl?: string;
    [key: string]: any;
  };
}


