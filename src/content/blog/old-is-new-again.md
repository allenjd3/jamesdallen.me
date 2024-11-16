---
title:  "Old is New Again"
img: "https://jamesdallen.s3.us-east-1.amazonaws.com/old-stuff.webp"
published_at:   "2021-01-12 20:02:00"
category: "tech"
photo_attribution: 'Photo by <a href="https://unsplash.com/@irvinzheng?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Irvin Zheng</a> on <a href="https://unsplash.com/photos/black-sewing-machine-on-table-EsoI7v-tHDA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
      '
---

You may have heard about the latest and greatest new piece of front-end tech : Hotwire. Hotwire literally stands for HTML over the wire. If you don't have a clue about what I'm talking about, check out this site and then make your way back here. [hotwire.dev](https://hotwire.dev)

So now that you understand the basics I want to provide you with a couple of the small things that weren't obvious to me from the docks and they all relate to turbo-streams.

1. Hotwire is not restricted to rails but rails has a couple of neat adaptors for it.
   You can install hotwire-rails, turbo-rails and or stimulus-rails. Hotwire-rails is just turbo-rails and stimulus rails bundled together.

2. You need the redis adaptor installed in order to install turbo-rails.
   This is used if you use turbo-streams and connect it to a websocket. If you need the redis gem enabled that means one other thing- you need redis installed as well. I had a lot of luck using just plain docker for this. If you aren't super familiar with using redis in rails (which I wasn't) the config file that has your redis connection information is in **cable.yml**

3. Turbo Streams need some Model magic
   Make sure you put the following for an example model called Post if you want to broadcast your changes.
```ruby
class Post < ApplicationRecord
    after_create_commit { broadcast_append_to "posts"}
    after_update_commit { broadcast_replace_to "posts"}
    after_destroy_commit { broadcast_remove_to "posts"}
end
```

4. You need to wrap your data that will be appended.
   Its important to wrap it in something like this-
```ruby
<%= turbo_stream_from "posts" %>
  <%= turbo_frame_tag "posts" %>
    #important stuff in here
  <% end %>
<% end %>
```
Then within that frame tag each individual posts need to be wrapped in another frame tag with the dom_id helper function like below-
```ruby
<%= turbo_frame_tag dom_id(post) %>
  #individual post
<% end %>
```
Doing all of the above will allow you to add stuff to your list, remove things and updated things.

5. Streams need even more help if you want to broadcast errors.
   The above will have you creating updating and destroying as long as you don't have any validation. Of course, you will always need some sort of validation so that really isn't feasible. In order to get your errors sent back and your turbo frame updated, you need something like the following in your controller-
```ruby
    respond_to do |format|
      if @post.save
        format.html { redirect_to posts_path, notice: 'Post was successfully created.' }
        format.json { render :show, status: :created, location: @post }
      else
        format.turbo_stream {render turbo_stream: turbo_stream.replace(@post, partial: "posts/form", locals: {post: @post})}
        format.html { render :new }
        format.json { render json: @post.errors, status: :unprocessable_entity }
      end
    end
```
The important bit here is the new format- turbo_stream. This allows you to pass back something from your controller that will replace your original frame.

Anyway, I hope that is all helpful information. Hotwire seems like its really going to help speed up development!

Coding can be an art form. Many folks get all wrapped up in the elegance of well designed code. It doesn't take long when diving into a new piece of code to see whether it was well designed and well thought out, or if I coded it. (Only kidding- kind of...) Laravel's tagline is "The PHP Framework for Web Artisans." It's aptly named, if a little pretentious. You can create really beautiful code with laravel. You can create beautiful code with Ruby on Rails, or nodejs. And then there is wordpress.

Don't get me wrong. Wordpress is the engine behind the web. It drives a large portion of blogs, businesses and ecommerce solutions. It does it quite well also and is fairly user-friendly in the admin panel. The code is ugly though...

Case in point-

```php
    <?php 
    if ( have_posts() ) : 
    while ( have_posts() ) : the_post(); 
        // Display post content
    endwhile; 
    endif; 
    ?>
```

The dreaded "loop". You have to put this bad boy everywhere. And what is with all of these functions? I guess PHP didn't have classes when wordpress was built? No wait, I know there were classes because of the "walkers." No we aren't talking about the AMC TV show `The Walking Dead`. These are classes that you have to extend in order to make changes to the html output of navigation or comments. Then there are the inline image styles... Makes me shudder to think about it.

This is the reason I started looking for another solution. That's when I found [roots/sage](https://roots.io/sage/). This is a theme that uses a lot of the things I love about Laravel and incorporates them into Wordpress development. It lets you do things like this-

```php
    @extends('layouts.base')

    @section('content')
      @while(have_posts())
      {!! the_post() !!}
      @include('partials/content-single')
    @endwhile
    @endsection
```

Ahhh, that's better... I happily installed it and typed `yarn start` and wah wah waaahhh. It failed! It tried to build out node-sass but was unable to complete the task. (I'm using version 9 of sage btw, this is fixed in version 10) So I messed around for a long time trying to figure out the issue. I looked at my version of Node. (It was a little old so I updated). Still no-go. I upgraded my version of windows build tools. Nada. I was about to give up until I dug into the node-sass github readme and noticed this little gem-

Supported Nodejs Versions-

    Node 14 	4.14+ 	83
    Node 13 	4.13+ 	79
    Node 12 	4.12+ 	72
    Node 11 	4.10+ 	67
    Node 10 	4.9+ 	64
    Node 8 	4.5.3+ 	57

In the package.json- version 9 is set to ~4.9 and I had node version 14... Tah Dah! I changed the version from ~4.9 to ^4.9 and boom- sweet roots/sage magic commenced. From then on, I danced around in beautiful blade templates and went to sleep dreaming of partials and layout files.

;TLDR
If you are trying roots/sage and come across an error about node-sass, you likely aren't using a supported version of node.
