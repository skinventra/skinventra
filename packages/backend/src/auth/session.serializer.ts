import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, id: string) => void): void {
    // Store only user ID in session
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user: any) => void,
  ): Promise<void> {
    try {
      // Fetch user from database by ID
      const user = await this.authService.getUserById(id);
      
      if (!user) {
        // User was deleted from database, invalidate session
        done(new Error('User not found'), null);
        return;
      }
      
      done(null, user);
    } catch (error) {
      done(error as Error, null);
    }
  }
}
