import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserRole } from '../enums/user/user.enum';
import { PrivilegeRepository } from '../repositories/privilege/privilege.repository';

import { User } from '../models/user/user.model';
import { ACCOUNT_STATUS } from '../enums/auth/auth.enum';
import { connectDB } from '../configs/db.config';
import { ALL_PRIVILEGES } from '../utils/privileges';

dotenv.config();

const seedPrivileges = async () => {
  try {
    connectDB()
    console.log('Connected to MongoDB');

    const adminPrivileges = ALL_PRIVILEGES.map((privilege) => ({
      module: privilege.module,
      required: true,
      actions: privilege.actions,
    }));

    // Delete existing privileges for both roles
    await PrivilegeRepository.deletePrivilegeByRole(UserRole.SUPER_ADMIN);
    await PrivilegeRepository.deletePrivilegeByRole(UserRole.ADMIN);
    console.log('Existing privileges deleted for Super Admin and Admin');

    await PrivilegeRepository.createOrUpdatePrivilege(UserRole.SUPER_ADMIN, adminPrivileges as any);
    await PrivilegeRepository.createOrUpdatePrivilege(UserRole.ADMIN, adminPrivileges as any);
    console.log('Admin and Super Admin privileges seeded successfully');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    // Delete existing users if they exist
    if (adminEmail) {
      await User.deleteOne({ email: adminEmail });
      console.log(`Deleted existing Super Admin with email: ${adminEmail}`);
    }
    if (superadminEmail) {
      await User.deleteOne({ email: superadminEmail });
      console.log(`Deleted existing Admin with email: ${superadminEmail}`);
    }

    // Seed Super Admin
    if (!superadminEmail || !superadminPassword) {
      console.warn('SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env file to seed super admin user');
    } else {
      await User.create({
        fullName: 'Super Admin',
        email: superadminEmail,
        password: superadminPassword,
        role: UserRole.SUPER_ADMIN,
        contact: process.env.ADMIN_CONTACT,
        isVerifed: true,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
      });
      console.log(`Super Admin user created: ${superadminEmail}`);
    }

    // Seed Admin
    if (!adminEmail || !adminPassword) {
      console.warn('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file to seed admin user');
    } else {
      await User.create({
        fullName: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: UserRole.ADMIN,
        contact: '9811111111',
        isVerifed: true,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
      });
      console.log(`Admin user created: ${adminEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding privileges:', error);
    process.exit(1);
  }
};

seedPrivileges();
