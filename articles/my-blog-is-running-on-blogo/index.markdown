##tl;dr
WordPress with [mochahost](http://www.mochahost.com/) combination sucks big time so I decided to build my own blog using as a base a very small node.js project for generating static content [Blogo](https://github.com/jfromaniello/blogo). My blog is in github [here](https://github.com/machadogj/blogo) and I am running it in [Heroku](http://www.heroku.com/) for free. In this post I share what it takes to build your own Blog, and how I did it.

##What is a blog?
Basically most developer's blogs consist of the following:

- static content: posts, about, contact info.
- navigation: archive, tags, categories, etc.
- search for keywords inside your blog.
- comments on your posts.
- analytics
- SEO: friendly urls, sitemap.xml, etc.

As you can see from this list, it's a pretty simple site. My friend [Jose Romaniello](http://joseoncode.com) has been advocating this for a while and introduced me to Jekyll in this [post](http://joseoncode.com/2011/11/22/goodbye-wordpress-hello-jekyll/) almost a year ago. He explains it very well, but the idea is that instead of saving the content in a database like WordPress does, you can generate all the content once, and serve static files instead, which is much better for performance.

##So how did I do this with only static content?

- For the static HTML content, I used three different formats: html (for old wordpress posts), markdown for articles, and [Jade](http://jade-lang.com/) for other pages like about or search. For images, I uploaded them to amazon S3 and serve them directly from there.
- Search: [Google Custom Search Engine](http://www.google.com/cse), I followed Jose's advice, and now google is doing search for me.
- Comments: [Disqus](http://disqus.com/).
- Analytics: [Google Analytics](www.google.com/intl/es/analytics/)
- Generating sitemap: it's pending, but I'll do it with a simple Jade template.

You can look at the code from the github repo [here](https://github.com/machadogj/blogo). The idea of this repository, is not to make a make-once-fit-all solution, but rather provide the very basics for doing whatever customizations you might want, without having to worry how others will use it.

Apart from this, I had to import my older posts from a WordPress export file, so I created a simple project in node.js [blogo-wp](https://github.com/machadogj/blogo-wp).

Another tool that I did that came in handy to test the output of the blogo generation, I called it [freeze](https://github.com/machadogj/node-freeze). Install it globally with npm, and you can run "freeze" command in any folder, and view the content in http://localhost:3000. I didn't have time to update the readme file, and it's not working on linux for some reason.

##Why did I do this?
Thanks to [pingdom](http://www.pingdom.com/), I noticed that my site was going down every single day, and once even 61 times the same day! Yeah, yeah, I know, install a WP cache plugin, I did that, and while not ideal, it got me to once or twice every three or four days.
The 23rd of August Leandro Boffi told me that my blog was showing the installation of WordPress. My WordPress database had been completely wiped out, and that's when I realized I couldn't take it anymore. That very same day I forked blogo.

Ever since that day, I haven't had a single downtime report :)

The other reason, is that I love [node.js](http://nodejs.org/) and it only made sense to have my blog with node!