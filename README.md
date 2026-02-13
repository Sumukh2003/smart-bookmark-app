# Smart Bookmark - Real-time Bookmark Manager

A modern, real-time bookmark management application built with Next.js, Supabase, and Tailwind CSS. Save, organize, and access your bookmarks instantly across all your devices.

## 🚀 Live Demo

https://bookmark-app-hazel.vercel.app/

## ✨ Features

- **Google OAuth Authentication** - Secure sign-in using Google accounts only
- **Real-time Synchronization** - Bookmarks update instantly across all tabs and devices
- **Private Bookmarks** - Each user's bookmarks are completely private and isolated
- **Add Bookmarks** - Save URLs with custom titles
- **Delete Bookmarks** - Remove bookmarks you no longer need
- **Search Functionality** - Quickly find bookmarks by title
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ installed
- A Google Cloud Platform account (for OAuth credentials)
- A Supabase account
- A Vercel account (for deployment)

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-bookmark.git
cd smart-bookmark
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the following migration:

```sql
-- Create bookmarks table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.bookmarks enable row level security;

-- Create policy: Users can only see their own bookmarks
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
create policy "Users can insert their own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookmarks;
```

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
7. Copy the Client ID and Client Secret

### 5. Configure Supabase Authentication

1. In Supabase Dashboard, go to Authentication → Providers
2. Enable Google provider
3. Paste your Google OAuth Client ID and Client Secret
4. Save changes

### 6. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings under API.

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### 3. Update Google OAuth Redirect URI

After deployment, add your Vercel URL to Google Cloud Console authorized redirect URIs:

- `https://your-app.vercel.app/auth/callback`

## 🐛 Problems Encountered & Solutions

### Problem 1: Google OAuth Redirect Issues

**Issue**: After clicking "Sign in with Google", users were redirected but authentication failed.

**Solution**:

- Ensured the redirect URI in Google Cloud Console exactly matched the Supabase callback URL
- Added both production and development URLs to authorized redirect URIs
- Verified that the OAuth consent screen was properly configured with all required fields
- Made sure to use the correct Supabase project reference URL format

### Problem 2: Real-time Updates Not Working

**Issue**: Bookmarks weren't updating in real-time across tabs. When adding a bookmark in one tab, it wouldn't appear in other open tabs without manual refresh.

**Solution**:

- Enabled Realtime replication for the bookmarks table using `alter publication supabase_realtime add table bookmarks;`
- Set up Supabase channel subscriptions for both INSERT and DELETE events
- Added proper cleanup in useEffect to prevent memory leaks with `supabase.removeChannel(channel)`
- Ensured the channel was scoped to the current user with filter: `user_id=eq.${user.id}`

### Problem 3: User Not Persisting After Page Refresh

**Issue**: Users were logged out after refreshing the page, requiring them to sign in again every time.

**Solution**:

- Used `supabase.auth.getUser()` instead of `getSession()` for better reliability
- Implemented proper session handling in the auth callback route
- Added loading states to prevent flash of unauthenticated content
- Ensured cookies were properly set by Supabase client for session persistence

### Problem 4: Delete Confirmation UX

**Issue**: Users accidentally deleted bookmarks with no way to recover them.

**Solution**:

- Implemented a confirmation dialog before deletion
- Displayed the bookmark title in the confirmation dialog so users know exactly what they're deleting
- Used a two-button approach (Cancel/Delete) with clear visual distinction
- Added proper backdrop click handling to close the dialog

### Problem 5: Mobile Responsiveness Issues

**Issue**: Some elements didn't display properly on mobile devices, especially the date column and user email.

**Solution**:

- Used Tailwind's responsive classes (`hidden sm:block`) to hide non-critical elements on small screens
- Made the delete confirmation dialog responsive with proper padding
- Ensured touch targets were large enough (minimum 44x44px) for mobile users
- Tested on various screen sizes using browser dev tools

### Problem 6: URL Validation

**Issue**: Users could enter invalid URLs that would break when clicked.

**Solution**:

- Used JavaScript's URL constructor in `getDomain()` function with try-catch
- Returned the original URL string if parsing fails
- Could be enhanced further with regex validation on form submission
- Considered adding automatic "https://" prefix for URLs without protocol

## 📁 Project Structure

```
smart-bookmark/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard page
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts       # OAuth callback handler
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/
│   └── LoginButton.tsx        # Google sign-in button
├── lib/
│   └── supabaseClient.ts      # Supabase client setup
├── public/                    # Static assets
├── .env.local                 # Environment variables (gitignored)
├── package.json
├── tailwind.config.ts
└── README.md
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Each user can only access their own bookmarks
- **Google OAuth**: Secure authentication without password management
- **Server-side Session Validation**: Auth state verified on server
- **HTTPS Only**: All production traffic encrypted
- **UUID Primary Keys**: Prevents enumeration attacks
- **Cascade Delete**: User deletion automatically removes their bookmarks

## 🧪 Testing the Application

1. Visit the live URL
2. Click "Sign in with Google"
3. Authorize with your Google account
4. Add a bookmark with a title and URL
5. Open the app in another tab/browser
6. Verify the bookmark appears in real-time
7. Delete a bookmark and verify it disappears in both tabs
8. Test search functionality
9. Log out and verify you can't access bookmarks
10. Log in again and verify bookmarks persist

## 📝 Database Schema

### bookmarks table

| Column     | Type      | Description               |
| ---------- | --------- | ------------------------- |
| id         | uuid      | Primary key               |
| user_id    | uuid      | Foreign key to auth.users |
| title      | text      | Bookmark title            |
| url        | text      | Bookmark URL              |
| created_at | timestamp | Creation timestamp        |

## 🎨 Design Decisions

- **Emerald/Teal Color Scheme**: Modern, professional appearance that's easy on the eyes
- **Card-based Layout**: Clear visual hierarchy and separation of concerns
- **Hover States**: Subtle feedback for interactive elements
- **Real-time Badge**: Initially planned but removed to reduce AI-generated feel
- **Date Format**: DD-MM-YYYY format for international users
- **Icon-first Design**: Visual indicators for all major actions

## 🚀 Future Enhancements

- Implement bookmark tags
- Add bulk delete functionality
- Export bookmarks to JSON/CSV
- Import bookmarks from browser
- Add bookmark preview/thumbnails
- Implement bookmark sharing
- Add dark mode support

## 👤 Author

**Sumukh P Marathe**

- GitHub: [@Suukh2003](https://github.com/Sumukh2003)
- Email: sumukhmarathesonda@gmail.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure and excellent documentation
- Vercel for seamless deployment
- Tailwind CSS for styling utilities
- Lucide React for beautiful icons
- Google for OAuth infrastructure

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub or contact me directly.

---

**Note**: This project was built as part of a technical assessment. The focus was on implementing core functionality with proper authentication, real-time capabilities, and clean code architecture.
