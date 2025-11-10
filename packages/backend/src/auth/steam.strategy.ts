import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor() {
    const returnURL = process.env.STEAM_RETURN_URL;
    const realm = process.env.STEAM_REALM;
    const apiKey = process.env.STEAM_API_KEY;

    if (!returnURL || !realm || !apiKey) {
      throw new Error(
        'Missing required environment variables: STEAM_RETURN_URL, STEAM_REALM, or STEAM_API_KEY',
      );
    }

    super({
      returnURL,
      realm,
      apiKey,
    });
  }

  async validate(identifier: string, profile: any): Promise<any> {
    return {
      steamId: profile.id,
      username: profile.displayName,
      avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value,
      profileUrl: profile._json?.profileurl,
      identifier,
    };
  }
}
