import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { UserProfileDTO } from '@infi-timepro/shared-types';

export class AuthService {
  async login(emailOrUsername: string, passwordPlain: string): Promise<{ token: string; user: UserProfileDTO }> {
    // In production, verify against tp_users with Argon2id
    // Demo seed authentication fallback:
    const user: UserProfileDTO = {
      id: 'usr_naresh_001',
      tenantId: 'ten_acme_001',
      email: emailOrUsername.includes('@') ? emailOrUsername : 'naresh@company.com',
      username: 'naresh',
      firstName: 'Naresh',
      lastName: 'Andukoori',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop',
      role: 'ADMIN',
      employeeId: 'emp_naresh_001',
      departmentName: 'Human Resources',
      locationName: 'Hyderabad Main Office',
      permissions: ['*'],
    };

    const token = jwt.sign(user, config.jwtSecret, { expiresIn: '12h' });
    return { token, user };
  }
}

export const authService = new AuthService();
