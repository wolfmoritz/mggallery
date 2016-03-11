# MG Gallery jQuery Plugin

The MG Gallery jQuery Plugin is a full featured image gallery that includes:

* Navigable thumbnails.
* A nice crossfade image transition, or a sequential swap transition.
* Optional slideshow with controls as well as autoplay.
* Built in thumbnail opacity mouse over animation.
* Thumbnail pagination if you have a lot of images.
* Deep linking to a specific image within the gallery.
* Back Button and Forward Button enabled for images.
* Minimal CSS or HTML required.
* Flexible thumbnail and image page arrangement.
* All images gracefully fade in on page load.
* The thumbnails degrade nicely if the client browser has JavaScript disabled.
* Image preloader for more responsive animation.
* An optional image title that does not cover or obscure the current image (a pet peeve of mine).
* And unlimited optional text/HTML below the current image for more verbose captions.

## View Demo
* [Default Crossfade Installation](http://wolfmoritz.github.io/mggallery/crossfade.html)
* [Swap Transition Installation With Thumbnail Strip at Top](http://wolfmoritz.github.io/mggallery/swap.html)

## Get The Plugin!
On GitHub: <https://github.com/wolfmoritz/mggallery>

## How to Use MG Gallery

### Load The Files
In your page header link to the MG Gallery CSS file. In your page footer reference jQuery 1.7.0+ (supplied with the download) or link to Google's jQuery API (a better option). Also reference the MG Gallery plugin file in the footer, either the regular jquery.mggallery.js or the minfied jquery.mggallery.min.js.
```html
<head>
    <link type="text/css" rel="stylesheet" href="css/mggallery.css">
</head>

<!-- In your footer -->
    <script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
    <script type="text/javascript" src="js/jquery.mggallery.js"></script>
```

### Define Page Elements
For the thumbnail gallery, the plugin expects:

* A div with an unordered list of thumbnail images, each wrapped in an anchor that links to the larger primary image.
* An empty div where the main (large) image, title and caption will appear.

```html
<div id="galleryThumbnails">
    <ul>
        <li>
            <a href="path_to_full_sized_image.ext" title="Your Image Title"><img src="path_to_thumbnail_image.ext"></a>
            <div class="thumbnailMeta">Optional div: Any text or HTML you want to appear under the image.</div>
        </li>
    </ul>
</div><!-- End #galleryThumbnails -->

<div id="galleryMainContainer"></div><!-- End #galleryMainContainer -->
```

Notes:

* The unordered list, list items, anchor, and image HTML tags do not need any special classes. But the plugin expects this structure for the thumbnail list.
* The thumbnail anchor should link to the larger image.
* The thumbnail anchor title will be used as the title below the current image. This is optional, and if not supplied, the current image title div is hidden.
* You can optionally include a div with the class 'thumbnailMeta' as part of the thumbnail list item containing any text or HTML for the caption.
* The empty div with the ID 'galleryMainContainer' is required somewhere on the page, presumably after the thumbnail list. When the plugin is initialized, this div is filled with the current image, title and meta. You can use a different ID name and supply that as a option: `{mainImageDivContainerId: '#myid'}` (include the '#' in the parameter).
* You are welcome to use the supplied button images for the slideshow and thumbnail pagination controls.


### Initialize the Gallery
In your footer below the jQuery and MG Gallery scipts, reference the MG Gallery plugin.
```javascript
<script type="text/javascript">
    $('#galleryThumbnails').mggallery();
</script>
```
That's it!

Much of the supplied CSS is editable, and the few critical elements have been commented as such. My focus was not on ultra-chic styling, you can do that, but to provide a functional JS gallery.

### Options
Of course there has to be options, and there are enough to customize the MG Gallery. You supply the options you wish to change as a standard JSON Object (see below for an example of what that means). First, here are the available options. If you supply your own classes or ID's, include the dot . or pound # in the name.


*Option Name* | *Default Value* | *Description*
--- | :---: | ---
thumbnailMetaDivClass | `.thumbnailMeta` | This div class wraps the optional thumbnail caption text/HTML. (The caption title comes from the anchor.)
thumbnailCurrentItemClass | `.currentthumb` | When a thumbnail becomes the current image, the thumbnail list item has this class set for your styling needs.
mainImageDivContainerId | `#galleryMainContainer` | This is the empty div that will contain the current image, title, and caption. If you change this option, be sure to update the CSS file.
currentImageDivClass | `.currentImage` | This wraps the currently displayed image. If you change this option, be sure to update the CSS file.
currentTitleDivClass | `.currentTitle` | This wraps the currently displayed title. If you change this option, be sure to update the CSS file.
currentMetaDivClass | `.currentMeta` | This wraps the currently displayed caption. If you change this option, be sure to update the CSS file.
animationSpeed | `1000` | The animation speed for the main image transition and the thumbnail hover over opacity change. Accepts 'slow', 'fast', or an integer for milliseconds.
exchangeType | `crossfade` | Options include 'crossfade' or 'swap'.
thumbDefaultOpacity | `.5` | Sets the thumbnail opacity on page load. Accepts between 0 (can't see it) to 1 (normal display).
thumbPageLimit | `8` | Number of thumbnails to display at a time before adding thumbnail pagination.
thumbNavFirst | `&#171;` | («) Go to "First" thumbnail pagination set label. You can also pass in an image tag as `'<img src="path/image.ext">'`, or enter `'&nbsp;'` and use CSS for the image.
thumbNavFirstTitle | `First` | Use for alternate title text for thumbPage navigation controls.
thumbNavPrev | `&lt;` | (<) Go to "Previous" thumbnail pagination set label. You can also pass in an image tag as `'<img src="path/image.ext">'`, or enter `'&nbsp;'` and use CSS for the image.
thumbNavPrevTitle | `Previous` | Use for alternate title text for thumbPage navigation controls.
thumbNavNext | `&gt;` | (>) Go to "Next" thumbnail pagination set label. You can also pass in an image tag as `'<img src="path/image.ext">'`, or enter `'&nbsp;'` and use CSS for the image.
thumbNavNextTitle | `Next` | Use for alternate title text for thumbPage navigation controls.
thumbNavLast | `&#187` | (») Go to "Last" thumbnail pagination set label. You can also pass in an image tag as `'<img src="path/image.ext">'`, or enter `'&nbsp;'` and use CSS for the image.
thumbNavLastTitle| `Last` | Use for alternate title text for thumbPage navigation controls.
slideShowInterval| `3000` | Slide show interval in milliseconds. Set to 0 to disable the slide show and controls.
slideShowPlay| `Play` | "Play" slide show label.You can also pass in an image tag as `'<img src="path/image.ext">'`, or enter `'&nbsp;'` and use CSS for the image.
slideShowPlayTitle| `Play` | Slideshow Use for alternate title text for slideshow navigation controls.
slideShowPause | `Pause` | "Pause" slide show label.You can also pass in an image tag as `'<img src="path/image.ext">'`, or enter `'&nbsp;'` and use CSS for the image.
slideShowPauseTitle| `Pause` |Slideshow Use for alternate title text for slideshow navigation controls.
slideShowAutoStart | `false` | Whether to start the slide show on page load, or let the user choose to activate.
enableDeepLinks | `true` | Appends hash to URL for the current image to allow direct links.
enableBackButton | `true` | Allows users to browse prior images using the back button. Only works if enableDeepLinks is true.

Of the two transition types, the default crossfade superimposes the next image over the prior and simultaneously fades one in and the other out. The transition type swap sequentially first fades out the current image before loading and fading in the next image.

### Define an Option Example
If you want to change one or more options, you don't need to specify all options, just the ones you want to change. Supply options as a JavaScript object.

```javascript
{animationSpeed: 500, exchangeType: 'swap', thumbDefaultOpacity: .25}
```

And a complete example JavaScript with custom options.

```javascript
// Here, we pass in a few options. Only pass in the options you wish to change.
$('#galleryThumbnails').mggallery({
    animationSpeed: 500,
    exchangeType: 'swap',
    thumbDefaultOpacity: .25
});
```

Remember, the last custom option does not have an ending comma!

Good luck!
