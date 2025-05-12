---
title:  "iFrame Problems"
img: "https://jamesdallen.s3.us-east-1.amazonaws.com/frame.webp"
alt: "Person holding frame in front of ocean cliff"
published_at: "2025-05-12 12:00:00"
category: "tech"
keywords: "laravel, forge, iframe, advertisement, nginx, configuration"
description: "Learn how to safely embed content in iframes by customizing Laravel Forge's Nginx config and managing X-Frame-Options for secure embedding."
photo_attribution: 'Photo by <a href="https://unsplash.com/@pinewatt?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">pine  watt</a> on <a href="https://unsplash.com/photos/person-hand-holding-photo-frame-3_Xwxya43hE?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>'
---

Iframes are a great solution for embedding content from another site on your own. You'll see iframes in everything from embedded youtube videos to advertisements. Using iframes on the frontend can be a really convenient way to get small chunks of another site onto your own. On the other hand, setting up a page that can be consumed as an iframe can be a bit tricky.  

I recently was tasked with adding a feature at work that allows us to embed advertisements on other web pages. I initially had a couple ideas for how to accomplish this. One would be using web components. Web components are an interesting solution for problems like this because you can fully isolate their styling. I would probably use a framework like [lit.dev](https://lit.dev/docs/) to simplify it. 

In our case, we already had advertisements built so iframes were a good solution. I built a new route that would house my advertisement and started building the iframe itself. That's when I found myself framed in. (Too much?)

We host our site on Forge and digital ocean which is a popular hosting solution for Laravel applications. By default, forge sets a particular header in the nginx configuration.

```
X-Frame-Options: SAMEORIGIN
```

According to [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options)- 

> The HTTP X-Frame-Options response header can be used to indicate whether a browser should be allowed to render a page in a `<frame>`, `<iframe>`, `<embed>` or `<object>`. Sites can use this to avoid clickjacking attacks, by ensuring that their content is not embedded into other sites.

What is clickjacking you might ask? Well its when someone puts your site on their own webpage in an iframe. They then hide a button on top of your iframe that does something the user wasn't intending like clicking on a link or downloading some malware. 

So we know its important. How does laravel Forge define it? In nginx config files! Here's an example-

```
# FORGE CONFIG (DO NOT REMOVE!)
include forge-conf/your-domain.com/before/*;

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    server_tokens off;
    root /home/forge/your-domain.com;

    # FORGE SSL (DO NOT REMOVE!)
    # ssl_certificate
    # ssl_certificate_key

    ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers XXXXXXX
    ssl_prefer_server_ciphers off;
    ssl_dhparam /etc/nginx/dhparams.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    index index index.htm index.php;

    charset utf-8;

    # FORGE CONFIG (DO NOT REMOVE!)
    include forge-conf/your-domain.com/server/*;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/your-domain.com-error.log error;

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# FORGE CONFIG (DO NOT REMOVE!)
include forge-conf/your-domain.com/after/*;
```

If you aren't familiar with nginx configs that can be a bit overwhelming but the interesting bits are here-

```
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
```

In that section, forge sets some global headers one of which is the X-Frame-Options header we mentioned above. I wanted to keep the header for most of the pages of the site for the safety it provides but I wanted to specifically remove it on the `/embed/advertisement` route. I first tried something like this (don't use this, its wrong!)

```
location /embed/advertisement {
    add_header Content-Security-Policy "frame-ancestors https://example.com" always;
    add_header X-Frame-Options "";
}
```

This didn't work but it taught me a bit about how nginx works with php files. In this case `/embed/advertisment` is an endpoint that I defined in my laravel application. It has a controller and returns a php blade view. This code in the nginx file will never be reached because the only way you can route to that url is by laravel capturing the request, figuring out which route to show and then showing that route. Because of that, all requests go through this block-

```
    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }
```

Here is what I ended up doing instead- (this one works!)

```
    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;

        if ($request_uri ~ ^/embed/advertisement) {
            add_header Content-Security-Policy "frame-ancestors https://example.com/" always;
            add_header X-Frame-Options "" always;
        }
    }
```

$request_uri is a special variable that pulls the current uri for the route. In this case, we are doing a regex check by using `~` and basically saying, if $request_uri starts with `/embed/advertisement` then add these headers. 

We haven't talked about it yet, but Content-Security-Policy allows you to set which urls can add iframes to their page. This makes it so you can limit who has the ability to add your endpoint to their site. We also had to explicitly set X-Frame-Options to an empty string. Surprisingly, there is no explicit option to disable this header. You have to just reassign it to something that doesn't exist to get rid of it.

So to recap, we explored Laravel Forge's nginx configuration. Looked as some of the defaults and how it protects your site. Then went into a reason you might want to override that default and how to do it safely.
