import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SteamAuthGuard } from './guards/steam-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('auth')
export class AuthController {
  @Get('steam')
  @UseGuards(SteamAuthGuard)
  steamLogin() {
    // Guard redirects to Steam
  }

  @Get('steam/callback')
  @UseGuards(SteamAuthGuard)
  steamCallback(@Req() req: Request, @Res() res: Response) {
    // After successful authentication, redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not set in environment variables');
    }
    res.redirect(`${frontendUrl}/auth/success`);
  }

  @Get('user')
  @UseGuards(AuthenticatedGuard)
  getUser(@Req() req: Request) {
    return req.user;
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Session destruction failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  }

  @Get('status')
  getStatus(@Req() req: Request) {
    return {
      authenticated: req.isAuthenticated(),
      user: req.user || null,
    };
  }
}

