# Deployment Guide for Octenium cPanel

The project has been prepared for deployment. Follow these steps to get your website live:

## Option 1: Manual Upload (Easiest)
1.  **Build the project**: Run `npm run build` (Done).
2.  **Locate the `dist` folder**: This folder contains everything needed for the website.
3.  **Upload to cPanel**:
    *   Log in to your **Octenium cPanel**.
    *   Open **File Manager**.
    *   Navigate to **public_html**.
    *   Upload all contents of the `dist` folder directly into `public_html`.
    *   *Note: Ensure the `.htaccess` file is uploaded as well (it's hidden by default on some systems).*

## Option 2: Git Deployment (Recommended for updates)
1.  Push your code to a repository (GitHub/GitLab/Bitbucket).
2.  In **cPanel**, go to **Git™ Version Control**.
3.  Create a New Repository and link your URL.
4.  Once linked, go to **Manage** -> **Deploy**.
5.  The `.cpanel.yml` file I created will automatically copy the `dist` files to `public_html`.
    *   *Note: You may need to update the path in `.cpanel.yml` from `/home/$(whoami)/public_html` to your actual cPanel path (e.g., `/home/yourusername/public_html`).*

## Key Configurations Applied:
- **SPA Routing**: Added `public/.htaccess` to ensure that refreshing the page or visiting sub-routes (like `/admin` or `/employee`) works correctly on cPanel.
- **Auto-deployment**: Added `.cpanel.yml` to streamline the process if using Git.
- **Production Build**: Generated a fresh build in the `dist/` directory.

### Environment Variables
The Supabase configuration is bundled into the `dist/assets/*.js` files. No additional environment setup is required on the server for the client-side to function.
