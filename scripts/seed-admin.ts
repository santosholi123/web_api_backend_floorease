import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDatabase } from '../src/database/mongodb';
import { User } from '../src/models/user.model';

const saltRounds = 10;

const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345678';

const seedAdmin = async (): Promise<void> => {
  await connectDatabase();

  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = 'admin';
    await existing.save();
    console.log(`✅ Admin user updated: ${adminEmail}`);
  } else {
    await User.create({
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  }

  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error('❌ Failed to seed admin user:', error);
  process.exit(1);
});
