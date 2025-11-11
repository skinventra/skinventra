import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { AuthService } from './auth.service';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private authService: AuthService) {
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
    // Use AuthService to find or create user in database
    const user = await this.authService.validateUser(profile.id, profile);
    return user;
  }
}
