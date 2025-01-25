---
title:  "Cloudways Github Deployment"
img: "https://jamesdallen.s3.us-east-1.amazonaws.com/cloud.webp"
alt: "a single cloud in a blue sky"
published_at:   "2025-01-25 07:00:00"
category: "tech"
keywords: "Cloudways, Github, Deployment, Actions"
description: "I recently had to deploy a laravel project to Cloudways. Cloudways is a good option for projects that might be transfered over to people with less experience working with servers. They handle the infrustructure so you don't have to."
photo_attribution: 'Photo by <a href="https://unsplash.com/@enginakyurt?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">engin akyurt</a> on <a href="https://unsplash.com/photos/white-clouds-and-blue-sky-during-daytime-A9_IsUtjHm4?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>'
---
I recently had to deploy a laravel project to Cloudways. [Cloudways](https://cloudways.com/en/) is a good option for projects that might be transfered over to people with less experience working with servers. They handle the infrustructure so you don't have to. One big downside for laravel projects though is that they don't have a native way to run things after deploy like `php artisan migrate` for instance.

There are several solutions to this. One possible solution is to provide a button in the admin that runs the console commands. The flow would work like this- 
1. You push something to main in git.
1. Cloudways pulls in the new version
1. You log into your admin on the server and push the button which will run your artisan commands.

This works (and probably will still make it into my app) but I wanted a solution that was less manual. I turned to github actions. You might be familiar with github actions for things like linting and running tests but it can also run deployment steps. Here is my example deployment github action.

```yml
name: Deploy to Cloudways

on:
  push:
    branches:
      - main  # Trigger this workflow only on pushes to the main branch

jobs:
  deploy:
    name: Deploy to Cloudways
    runs-on: ubuntu-latest
    environment: cloudways

    steps:
      # Step 1: Set up SSH agent and add private key
      - name: Set up SSH
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.CLOUDWAYS_SSH_PRIVATE_KEY }}

      # Step 2: Run deployment commands on the Cloudways server
      - name: Run Deployment Commands
        run: |
          ssh -o StrictHostKeyChecking=no \
              ${{ secrets.CLOUDWAYS_SSH_USER }}@${{ secrets.CLOUDWAYS_SSH_HOST }} << 'EOF'
          set -e

          echo "Starting deployment on Cloudways server..."

          # Navigate to the application directory
          cd ${{ secrets.CLOUDWAYS_APP_PATH }}

          # Step 1: Install PHP dependencies
          composer install --no-dev --optimize-autoloader
          echo "Composer dependencies installed."

          # Step 2: Run Laravel migrations
          php artisan migrate --force
          echo "Laravel migrations completed."

          # Step 3: Install Node.js dependencies
          npm install
          echo "Node.js dependencies installed."

          # Step 4: Build frontend assets
          npm run build
          echo "Frontend assets built."

          # Step 5: Clear and cache configurations
          php artisan cache:clear
          php artisan config:cache
          echo "Cache cleared and configurations cached."

          echo "Deployment completed successfully!"
          EOF
```

This will actually ssh into your cloudways application and run these commands. In order to do that you will need to put your public key on your cloudways server and your private key in github. 

Just run this command to generate new keys-
```
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

Then run something like `cat id_rsa.pub | pbcopy` to copy your public key to clipboard and add it to your ssh keys in cloudways. Then in your github repo, create a new environment called `cloudways` and add your private key to the `CLOUDWAYS_SSH_PRIVATE_KEY` environement variable. You can find the environments under the settings tab in your repository. The rest of the environement variables are pretty self explanatory.

```
CLOUDWAYS_SSH_USER
CLOUDWAYS_SSH_HOST
CLOUDWAYS_APP_PATH
```

App Path is going to be the absolute path to your laravel application. You can find it by sshing into your server, changing directories into your public directory and then running 

```
echo $PWD
```

I've run a couple deploys using this and its working great! One thing you might add is a command to restart workers. I don't have that in my example because I don't have any workers running in this application yet but you should be able to do it with a simple call to `php artisan queue:restart` or in the case of horizon `php artisan horizon:terminate`. Make sure you are using a process monitor to run your queues! Cloudways offers supervisord for this purpose.
