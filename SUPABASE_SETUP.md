# Supabase Cloud Storage Setup Guide

Your fitness app has been successfully migrated to use Supabase for cloud-based storage! 

## What Changed

✅ **Authentication**: Now uses Supabase Auth with email/password
✅ **User Profiles**: Stored in PostgreSQL database (syncs across devices)
✅ **Workouts**: Stored in database (accessible from any device)
✅ **Nutrition Data**: Stored in database (meals, water, sleep tracked in cloud)
✅ **Custom Exercises**: Stored in database (syncs across devices)

## Setup Steps

### 1. Create a Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub, Google, or email (no age requirement!)
4. Once logged in, click **"New Project"**
5. Fill in the project details:
   - **Name**: `Fit4Fitness` (or any name you like)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Select **"Free"** tier
6. Click **"Create new project"**
7. Wait 1-2 minutes for your database to be provisioned

### 2. Get Your Project Credentials

1. In your Supabase project dashboard, click **"Settings"** (gear icon in sidebar)
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
4. Keep this page open - you'll need these values in the next step

### 3. Update Your App Configuration

1. Open `app/lib/supabaseConfig.ts` in your project
2. Replace the placeholder values with your actual credentials:

```typescript
const supabaseUrl = 'https://your-project-id.supabase.co'; // Your Project URL
const supabaseAnonKey = 'eyJhbGc...'; // Your anon/public API key
```

3. Save the file

### 4. Create Database Tables

You need to create tables to store your app's data. In your Supabase dashboard:

1. Click **"SQL Editor"** in the sidebar
2. Click **"New query"**
3. Copy and paste the following SQL code:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT,
  profile JSONB DEFAULT '{}'::jsonb,
  onboarding_complete BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE workouts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_workouts JSONB DEFAULT '[]'::jsonb,
  saved_workouts JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create nutrition table
CREATE TABLE nutrition (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nutrition_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE exercises (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_exercises JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only access their own data
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own nutrition"
  ON nutrition FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition"
  ON nutrition FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition"
  ON nutrition FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition"
  ON nutrition FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);
```

4. Click **"Run"** to execute the SQL
5. You should see "Success. No rows returned" - that's perfect!

### 5. Enable Email Authentication

1. In your Supabase dashboard, click **"Authentication"** in the sidebar
2. Click **"Providers"**
3. **Email** should already be enabled by default
4. (Optional) You can customize the email templates under **"Email Templates"**

### 6. Test Your App!

1. Run your app: `npm start`
2. Click 'w' to open in web browser
3. Create a new account with your email and password
4. Complete the onboarding process
5. Add some data (workouts, meals, etc.)
6. Sign out and sign in again - your data should persist!
7. Try signing in from a different browser or device - your data will be there!

## Benefits of Supabase

✅ **No Age Restriction**: Anyone can create an account and build apps
✅ **Cross-Device Sync**: Access your data from any device
✅ **Cloud Backup**: Your data is automatically backed up
✅ **Real-time Updates**: Changes can sync in real-time
✅ **Secure Authentication**: Industry-standard security with Supabase Auth
✅ **PostgreSQL Database**: Powerful relational database
✅ **Free Tier**: Very generous free quota
✅ **Easy to Use**: Built-in dashboard for managing data
✅ **Open Source**: Fully open source alternative to Firebase

## Supabase Free Tier Limits

- **Database**: 500 MB storage
- **Auth**: Unlimited users
- **API Requests**: 50,000 monthly active users
- **Bandwidth**: 2 GB per month
- **File Storage**: 1 GB

This is more than enough for personal use or small-scale deployment!

## Viewing Your Data

You can view and manage your data directly in Supabase:

1. Go to **"Table Editor"** in your Supabase dashboard
2. Select a table (e.g., `user_profiles`, `workouts`, `nutrition`, `exercises`)
3. You'll see all your data in a spreadsheet-like view
4. You can manually edit, add, or delete records if needed

## Troubleshooting

### "Invalid API key" or connection errors
- Double-check that you copied the correct `supabaseUrl` and `supabaseAnonKey`
- Make sure there are no extra spaces or quotes
- Verify the values match exactly what's shown in Supabase Settings > API

### "Could not find the table" errors
- Make sure you ran all the SQL commands in Step 4
- Check the **Table Editor** to verify the tables exist
- If tables are missing, go back to SQL Editor and run the CREATE TABLE commands again

### "Row Level Security" or "Permission denied" errors
- Make sure you're signed in to the app
- Verify the RLS policies were created (they allow users to access only their own data)
- In Supabase dashboard, go to **Authentication > Policies** to check

### Data not syncing
- Check your internet connection
- Open browser console (F12) to see any error messages
- Make sure you're using the same email to sign in on different devices

### Email confirmation required
- By default, Supabase sends a confirmation email when you sign up
- Check your inbox (and spam folder) for the confirmation email
- To disable email confirmation (for testing), go to **Authentication > Settings** and turn off "Enable email confirmations"

## Next Steps (Optional)

- **Enable other auth providers**: Google, GitHub, etc.
- **Add real-time subscriptions**: Listen for data changes in real-time
- **Set up database backups**: Configure automatic backups
- **Add file storage**: Store profile pictures or workout images
- **Use Supabase Edge Functions**: Add serverless backend logic
- **Deploy your app**: Host it for free on Vercel, Netlify, or Supabase itself

## Removing Firebase

Since you're now using Supabase, you can remove Firebase:

```bash
npm uninstall firebase
```

Then delete these files:
- `app/lib/firebaseConfig.ts`
- `FIREBASE_SETUP.md`

Enjoy your cloud-powered fitness app with Supabase! 🎉
