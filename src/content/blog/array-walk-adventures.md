---
title:  "array_walk adventures"
img: "https://jamesdallen.s3.us-east-1.amazonaws.com/array-walk.webp"
alt: "Person walking on balance beam in woods"
published_at:   "2024-11-09 12:00:00"
category: "tech"
keywords: "shadcn, laravel, form, validation, client"
description: "This is less a blog post and more a, 'huh, why did that happen' post."
photo_attribution: 'Photo by <a href="https://unsplash.com/@jonflobrant?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jon Flobrant</a> on <a href="https://unsplash.com/photos/man-walking-on-forest-_r19nfvS3wY?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>'
---

I noticed something weird today that I thought I'd share. Before you get too excited know that I only am supplying the questions this time. I don't have a great answer to why this thing is happening.

So I've been on a quest to learn more php functions lately and I came across <a href="https://www.php.net/manual/en/function.array-walk.php">array_walk</a>. When I read the description I immediately thought, "Oh it allows you to keep the original keys? This must be what laravel's map function uses. I was wrong though. Here is Laravel's map function.

```php
    /**
     * Run a map over each of the items in the array.
     *
     * @param  array  $array
     * @param  callable  $callback
     * @return array
     */
    public static function map(array $array, callable $callback)
    {
        $keys = array_keys($array);

        try {
            $items = array_map($callback, $array, $keys);
        } catch (ArgumentCountError) {
            $items = array_map($callback, $array);
        }

        return array_combine($keys, $items);
    }
```

So you see it runs array_keys to get the keys, does array_map with the callback and then does an array_combine at the end. Immediately I thought, well array_walk would be way more efficient here! I did a quick refactor and got this-

```php
    /**
     * Run a map over each of the items in the array.
     *
     * @param  array  $array
     * @param  callable  $callback
     * @return array
     */
    public static function map(array $array, callable $callback)
    {
        try {
            array_walk(
              $array,
              function (&$val, $key) use ($callback) {
                $val = $callback($val, $key);
              },
            );
        } catch (ArgumentCountError) {
            array_walk(
              $array,
              function (&$val) use ($callback) {
                $val = $callback($val);
              },
            );
        }

        return $array;
    }
```

Believe it or not this works! `array_walk` works a little differently in that you pass the value of each element through as a pointer to the original value and then you modify the original array as you go. So instead of returning values that update the value in a new array, you just set the value that is pointing at the value in the array to update the original array. In my mind this should be faster. There is one less iteration through the loop (no combine step) but in my experience it was slightly slower.

I ran the laravel test suite 2 or 3 times and consistently got 1min 22 sec and ~200 milliseconds. When I ran with `array_walk` I got 1min 22sec and ~900 milliseconds. I know we are splitting hairs here but I'm really curious why array_walk is slower when its only iterating through the array once. And then the follow up question is would there ever be a threshold where array_walk would start to be faster?
