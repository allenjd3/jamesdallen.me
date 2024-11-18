---
title:  "Background Images"
img: "https://jamesdallen.s3.us-east-1.amazonaws.com/background-1.webp"
published_at:   "2024-07-06 15:00:00"
category: "tech"
keywords: "hero, Image, nextjs"
description: "For some reason, I feel like I always have to rediscover the best way to place that background image and overlay so I decided I'm just going to write it down."
photo_attribution: 'Photo by <a href="https://unsplash.com/@sharonmccutcheon?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Alexander Grey</a> on <a href="https://unsplash.com/photos/bokeh-photography-62vi3TG5EDg?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>'
---

Its pretty common to see a hero section on a landing page. These usually have an image in the background, some kind of overlay and then some title text and a button of some kind.
For some reason, I feel like I always have to rediscover the best way to place that background image and overlay so I decided I'm just going to write it down.

Nextjs has an Image component that allows you to take images and basically convert them on the fly. Its really handy but mostly only works for standard images and not background images.
You can use the Image component as a background image though if you do something like this-

```tsx
<div className="relative w-full overflow-hidden h-[100svh] md:h-[70svh]">
    <Image
        src='https://example.com/images/myimage.webp'
        alt="Amazing Image"
        layout="fill"
        objectFit="cover"
        className="w-full h-full object-top"
    />
    <div className="absolute inset-0 bg-gray-800 opacity-60"></div>
    <div className="absolute inset-0 flex flex-col w-4/5 sm:w-3/5 justify-center mx-auto text-white space-y-8">
        <h1 className="text-5xl lg:text-7xl font-bold uppercase">
            Join my amazing ball point pen club
        </h1>
        <h3 className="text-2xl uppercase font-roboto font-thin">
            Never commit another sub optimal pen stroke
        </h3>
        <div className="flex items-center justify-center">
            <button className="bg-black rounded-full px-8 py-4 text-xl uppercase font-roboto">Join Now
            </button>
        </div>
    </div>
</div>
```

So the image tag there will create the background image. The absolutely positioned div below it will provide the overlay and last div has the content. Why not just use a background image?
Background images can't take advantage of the next/image component and so won't be automatically optimized for you.

What if I'm not using nextjs? You can still use this technique although a background image might work just as well. Here is the html that component generates for you. You could apply this same technique to any image tag

```tsx
<img
  alt="tbh"
  loading="lazy"
  decoding="async"
  data-nimg="fill"
  class="w-full h-full object-top"
  style="position: absolute; height: 100%; width: 100%; inset: 0px; color: transparent; object-fit: cover;"
  sizes="100vw"
  ...
>
```
