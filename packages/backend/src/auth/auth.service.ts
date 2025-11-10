import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SteamProfile } from './types/steam-profile.interface';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(steamId: string, profile: SteamProfile) {
    // Find or create user in database
    let user = await this.prisma.user.findUnique({
      where: { steamId },
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await this.prisma.user.create({
        data: {
          steamId,
          username: profile.displayName,
          avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value || '',
          profileUrl: profile._json?.profileurl,
        },
      });
    } else {
      // Update user info on each login
      user = await this.prisma.user.update({
        where: { steamId },
        data: {
          username: profile.displayName,
          avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value || '',
          profileUrl: profile._json?.profileurl,
        },
      });
    }

    return user;
  }

  async getUserBySteamId(steamId: string) {
    return this.prisma.user.findUnique({
      where: { steamId },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
