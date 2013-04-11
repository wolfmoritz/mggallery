/**
 *	jQuery MG Gallery Plugin
 *
 *	Version 1.3.1
 *
 * Copyright (c) 2011 - 2013 Wolfgang Moritz (http://www.wolfmoritz.com)
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 */
;(function($) {

	var config = {};
	var $thumbs;

	// MG Gallery Main Function
	$.fn.mggallery = function (options) {

		// Merge defaults with parameters (options) and assign to config
		$.extend(config, $.fn.mggallery.defaults, options);

		// Add local properties to config object
		config.gallery = {
			priorIndex: 0,
			currentIndex: 0,
			currentHash: '1',
			thumbnailCount: 0,
			thumbnailPagePriorIndex: 0,
			thumbnailPageIndex: 0,
			thumbnailTotalPages: 0,
			slideShowIntervalId: 0
		};

		// Cache thumbnail list items and initialize the gallery if thumbs are found.
		$thumbs = this.children('ul').children('li');
		config.gallery.thumbnailCount = $thumbs.size();
		if (config.gallery.thumbnailCount > 0) {

			// We have thumbs, fire up the engine!
			$.fn.mggallery.methods.init(this);

			// After everything is up and running, preload main images in the background.
			$.fn.mggallery.methods.preloadImages();
		};

		return this;
	}; // End $.fn.mggallery

	// Public Methods
	$.fn.mggallery.methods = {
		// Append main image, title, meta containers to mainImageDivContainerId after page load, and prepend slideShowControls div.
		initGalleryContainer: function() {
			var currentHtml = '<div class="next" style="opacity: 0;">';
			currentHtml += '<div class="' + config.currentImageDivClass.replace('.','') + '"><img src="" /></div>';
			currentHtml += '<div class="' + config.currentTitleDivClass.replace('.','') + '"></div>';
			currentHtml += '<div class="' + config.currentMetaDivClass.replace('.','') + '"></div></div>';
			$('div' + config.mainImageDivContainerId).html(currentHtml).prepend('<div class="slideShowControls" />');

			// If the slide show has been enabled, then append slide show controls
			if(config.slideShowInterval > 0) {
				$('div.slideShowControls').html('<span class="pause" title="' + config.slideShowPauseTitle + '">' + config.slideShowPause + '</span><span class="play" title="' + config.slideShowPlayTitle + '">' + config.slideShowPlay + '</span>');
			};
		},

		// Load current image and text/html to container
		loadImage: function (newImage) {
			// Get the attributes of the new item
			var $newImg = $(newImage);
			var newSrc = $newImg.children('a').attr('href');
			var newTitle = $newImg.children('a').attr('title');
			var newMeta = $newImg.children('div' + config.thumbnailMetaDivClass).html();

			// Set prior and current indexes
			config.gallery.priorIndex = config.gallery.currentIndex;
			config.gallery.currentIndex = $newImg.data('img_id');
			config.gallery.thumbnailPagePriorIndex = config.gallery.thumbnailPageIndex;
			config.gallery.thumbnailPageIndex = $newImg.data('thumbpage');

			// Set URL hash with image path and name for deep linking
			if(config.enableDeepLinks && newSrc !== undefined) {
				config.gallery.currentHash = $newImg.data('img_hash');
				window.location.hash = $.fn.mggallery.methods.imagePath(newSrc);
			};

			// Cache the div element to load
			$next = $('div' + config.mainImageDivContainerId + '>div.next');

			// New image source
			$next.children('div' + config.currentImageDivClass).children('img').load(function() {
				// Don't display Current Image Title if empty.
				if( ! $.trim(newTitle)) {
					$next.children('div' + config.currentTitleDivClass).hide();
				} else {
					$next.children('div' + config.currentTitleDivClass).html(newTitle).show();
				};

				// Don't display Current Image Meta if empty.
				if( ! $.trim(newMeta)) {
					$next.children('div' + config.currentMetaDivClass).hide();
				} else {
					$next.children('div' + config.currentMetaDivClass).html(newMeta).show();
				};
			}).attr('src',newSrc);

			// Swap ".currentThumb" class on thumbnails
			$('li' + config.thumbnailCurrentItemClass).removeClass(config.thumbnailCurrentItemClass.replace('.',''));
			$newImg.addClass(config.thumbnailCurrentItemClass.replace('.',''));
		},

		// Load the next image in sequence
		getNextImage: function() {
			var nextImageSelector;
			if(config.gallery.currentIndex + 1 < config.gallery.thumbnailCount) {
				nextImageSelector = 'li[data-img_id="' + (config.gallery.currentIndex + 1) + '"]';
			} else {
				nextImageSelector = 'li[data-img_id="0"]';
			};

			$.fn.mggallery.methods.exchangeImage(nextImageSelector);
		},

		// Animate thumbnail opacity changes
		// Pass in list item element
		fadeThumb: function (thumbItem, newOpacity) {
			if($(thumbItem).hasClass(config.thumbnailCurrentItemClass.replace('.',''))) {
				newOpacity = 1;
			};
			$(thumbItem).children('a').children('img').stop().animate({opacity: newOpacity}, config.animationSpeed);
		},

		// Assign prefered image exchange type function to this variable in init()
		exchangeImage: '',

		// Swap images sequentially
		swapImage: function (newImage) {
			$('div' + config.mainImageDivContainerId).find(':animated').stop(true,true);
			$current = $('div' + config.mainImageDivContainerId + '>div.current').toggleClass('current next');
			$current.animate({opacity: 0}, config.animationSpeed, function(){
				$.fn.mggallery.methods.loadImage(newImage);
				$.fn.mggallery.methods.fadeThumb('li[data-img_id="' + config.gallery.priorIndex + '"]', config.thumbDefaultOpacity);
				if(config.gallery.thumbnailPagePriorIndex !== config.gallery.thumbnailPageIndex) {
					$.fn.mggallery.methods.swapThumbPage();
				};
				$(this).toggleClass('next current');
				$.fn.mggallery.methods.fadeThumb(newImage, 1);
			});
			$current.animate({opacity: 1}, config.animationSpeed);
		},

		// Crossfade images
		crossfadeImage: function (newImage) {
			$('div' + config.mainImageDivContainerId).find(':animated').stop(true,true);
			$current = $('div' + config.mainImageDivContainerId + '>div.current');
			$current.clone().css('opacity',0).toggleClass('current next').appendTo('div' + config.mainImageDivContainerId);
			$.fn.mggallery.methods.loadImage(newImage);
			$.fn.mggallery.methods.fadeThumb('li[data-img_id="' + config.gallery.priorIndex + '"]', config.thumbDefaultOpacity);
			if(config.gallery.thumbnailPagePriorIndex !== config.gallery.thumbnailPageIndex) {
				$.fn.mggallery.methods.swapThumbPage();
			};
			$.fn.mggallery.methods.fadeThumb(newImage, 1);
			$current.animate({opacity: 0}, config.animationSpeed, function() {
				$(this).remove();
			});
			$('div' + config.mainImageDivContainerId + '>div.next').animate({opacity: 1}, config.animationSpeed, function() {
				$(this).toggleClass('next current');
			});
		},

		// Clean image path
		imagePath: function(dirtyPath) {
			return dirtyPath.replace(window.location.hostname,'').replace(window.location.protocol,'').replace('//','');
		},

		// Clean image path and make CSS selector ready
		hashImagePath: function(dirtyPath) {
			return $.fn.mggallery.methods.imagePath(dirtyPath).replace(/[^a-zA-Z0-9]/g, '');
		},

		// Preload large (main) images in background once the page is up.
		preloadImages: function () {
			$thumbs.each(function () {
				$('<img/>')[0].src = $(this).children('a').attr('href');
			});
		},

		// Initialize thumbnail pagination controls
		initThumbPageControls: function() {
			var first = '<span class="first" title="' + config.thumbNavFirstTitle + '">' + config.thumbNavFirst + '</span>';
			var prev = '<span class="prev" title="' + config.thumbNavPrevTitle + '">' + config.thumbNavPrev + '</span>';
			var next = '<span class="next" title="' + config.thumbNavNextTitle + '">' + config.thumbNavNext + '</span>';
			var last = '<span class="last" title="' + config.thumbNavLastTitle + '">' + config.thumbNavLast + '</span>';
			var controls = '';

			// If on first page, then only include next and last
			if(config.gallery.thumbnailPageIndex === 1) {
				controls = next + last;
			// If on the last page, then only include previous and first
			} else if (config.gallery.thumbnailPageIndex === config.gallery.thumbnailTotalPages) {
				controls = first + prev;
			// Otherwise, show all controls
			} else {
				controls = first + prev + next + last;
			};

			$('div.thumbPageControls').html(controls);
		},

		// Swap out thumbnail page
		swapThumbPage: function() {
			// Fade out the current thumbnail page
			$('div#thumbPage_' + config.gallery.thumbnailPagePriorIndex).add('div.thumbPageControls').fadeOut(config.animationSpeed, function() {
				// Update the page controls
				$.fn.mggallery.methods.initThumbPageControls();

				// Now fade in the new thumnail page
				$('div#thumbPage_' + config.gallery.thumbnailPageIndex).add('div.thumbPageControls').fadeIn(config.animationSpeed);
			});
		},

		// Start the slide show
		startSlideShow: function () {
			if(config.gallery.slideShowIntervalId === 0) {
				config.gallery.slideShowIntervalId = window.setInterval(function() {
					$.fn.mggallery.methods.getNextImage();
				},config.slideShowInterval);
			};
		},

		// Stop the running slide show
		stopSlideShow: function () {
			if(config.gallery.slideShowIntervalId !== 0) {
				window.clearInterval(config.gallery.slideShowIntervalId);
				config.gallery.slideShowIntervalId = 0;
			};
		},

		// Main initialization function
		init: function($galleryThumbnails) {
			//Assign each thumbnail list item a data- imgage ID and a path hash selector.
			$thumbs.each(function(i) {
				$(this).addClass('thumbItem').attr('data-img_id',i).attr('data-img_hash',$.fn.mggallery.methods.hashImagePath($(this).children('a').attr('href')));
			});

			// Add the thumbnail page controls div if we need it or not (for consistent layout), and create the main image container
			$galleryThumbnails.prepend('<div class="thumbPageControls" />');
			$galleryThumbnails.children('ul').append('<div class="clear" />');
			$.fn.mggallery.methods.initGalleryContainer();

			// Loop through all thumbnails, slicing into sets based on thumbPageLimit.
			var i = 0;
			while(i < config.gallery.thumbnailCount) {
				config.gallery.thumbnailTotalPages += 1;

				// "data-" HTML5 attributes must be all lower case per W3C
				$thumbs.slice(i, i + config.thumbPageLimit).wrapAll('<div id="thumbPage_' + config.gallery.thumbnailTotalPages + '" class="centerThumbs" style="display:none;"/>').attr('data-thumbpage',config.gallery.thumbnailTotalPages);
				i += config.thumbPageLimit;
			};

			// Load image specified in the URL, else the first one
			if($.fn.mggallery.methods.hashImagePath(window.location.hash).length > 0 && $.fn.mggallery.methods.hashImagePath(window.location.hash) !== undefined) {
				$.fn.mggallery.methods.loadImage('li[data-img_hash="' + $.fn.mggallery.methods.hashImagePath(window.location.hash) + '"]');
			} else {
				$.fn.mggallery.methods.loadImage($thumbs[0]);
			};

			// Set image exchange type
			if(config.exchangeType === 'swap') {
				$.fn.mggallery.methods.exchangeImage = $.fn.mggallery.methods.swapImage;
			} else if (config.exchangeType === 'crossfade') {
				$.fn.mggallery.methods.exchangeImage = $.fn.mggallery.methods.crossfadeImage;
			};

			// Initialize thumbnail pagination if there are more thumbnails than the display limit
			if(config.gallery.thumbnailCount > config.thumbPageLimit) {
				$.fn.mggallery.methods.initThumbPageControls();
			};

			// Event: Load next image if current main image clicked
			$(config.mainImageDivContainerId).on('click', 'img', function(e) {
				e.preventDefault();
				$.fn.mggallery.methods.getNextImage();
			});

			// Event: Load clicked thumbnail
			$galleryThumbnails.delegate('li.thumbItem','click',function(e) {
				e.preventDefault();

				// No sense to change anything if this is the current image
				if($(this).data('img_id') !== config.gallery.currentIndex) {
					$(this).addClass(config.thumbnailCurrentItemClass.replace('.',''));
					$.fn.mggallery.methods.exchangeImage(this);
				};
			});

			// Event: Set hoverover opacity on thumbs
			$thumbs.each(function() {
				$(this).on({
					mouseenter: function() {
						$.fn.mggallery.methods.fadeThumb(this, 1);
					},
					mouseleave: function() {
						$.fn.mggallery.methods.fadeThumb(this, config.thumbDefaultOpacity);
					}
				});
			});

			// Event: Thumbnail page controls
			$('.thumbPageControls').on('click', 'span', function(e) {
				e.preventDefault();
				config.gallery.thumbnailPagePriorIndex = config.gallery.thumbnailPageIndex;
				var go = $(this).attr('class');

				if(go === 'first') {
					config.gallery.thumbnailPageIndex = 1;
				} else if (go === 'prev') {
					config.gallery.thumbnailPageIndex--;
				} else if (go === 'next') {
					config.gallery.thumbnailPageIndex++;
				} else if (go === 'last') {
					config.gallery.thumbnailPageIndex = config.gallery.thumbnailTotalPages;
				};
				$.fn.mggallery.methods.swapThumbPage();

				$.fn.mggallery.methods.exchangeImage('div#thumbPage_' + config.gallery.thumbnailPageIndex + '>li.thumbItem:first');
			});

			// Hide all thumbnail image meta divs, we don't want to see them with the thumbs.
			$thumbs.find('div' + config.thumbnailMetaDivClass).hide();

			// We're now ready to raise the curtain. Show #galleryThumbnails if hidden, set the initial opacity and fade in the thumbnail list.
			$thumbs.children('a').children('img').css('opacity', 0);
			$galleryThumbnails.show().find('div#thumbPage_' + config.gallery.thumbnailPageIndex).show();
			$('div' + config.mainImageDivContainerId + '>div.next').animate({opacity: 1}, config.animationSpeed).toggleClass('next current');
			$thumbs.each(function(i) {
				$.fn.mggallery.methods.fadeThumb(this, config.thumbDefaultOpacity)
			});

			// If the config.slideShowInterval is set to an interval, enable the slide show
			if(config.slideShowInterval > 0) {
				if(config.slideShowAutoStart) {
					$.fn.mggallery.methods.startSlideShow();
					$('div.slideShowControls span.play').hide().siblings('span.pause').show();
				} else {
					$('div.slideShowControls span.pause').hide().siblings('span.play').show();
				};

				// Handle slide show controls
				$('div.slideShowControls').delegate('span','click',function(e) {
					var request = $(this).attr('class');
					if(request === 'play' && config.gallery.slideShowIntervalId === 0) {
						$.fn.mggallery.methods.startSlideShow();
						$(this).hide().siblings('span.pause').show();
					} else if (request === 'pause' && config.gallery.slideShowIntervalId !== 0) {
						$.fn.mggallery.methods.stopSlideShow();
						$(this).hide().siblings('span.play').show();
					};
				});
			};

			// If backbutton functionality has been requested
			if(config.enableBackButton && config.enableDeepLinks) {
				$(window).bind('hashchange', function () {
					if(config.gallery.currentHash !== $.fn.mggallery.methods.hashImagePath(window.location.hash)) {
						$.fn.mggallery.methods.exchangeImage('li[data-img_hash="' + $.fn.mggallery.methods.hashImagePath(window.location.hash) + '"]');

						// Check if the new image is in the current thumbnail set
						if(config.gallery.thumbnailPagePriorIndex !== config.gallery.thumbnailPageIndex) {
							$.fn.mggallery.methods.swapThumbPage();
						};
					};
				});
			};
		}
	};

	// Default Options
	$.fn.mggallery.defaults = {		// You can specify your own class or ID for gallery element selectors. Include the # or . in the selector name.
		thumbnailMetaDivClass:		'.thumbnailMeta',
		thumbnailCurrentItemClass:	'.currentThumb',
		mainImageDivContainerId:	'#galleryMainContainer',
		currentImageDivClass:		'.currentImage',
		currentTitleDivClass:		'.currentTitle',
		currentMetaDivClass:		'.currentMeta',
		animationSpeed:				1000, 				// Options include, 'slow', 'fast' or any number of milliseconds.
		exchangeType:				'crossfade', 		// Option includes 'crossfade' or 'swap'.
		thumbDefaultOpacity:		0.5, 				// Any number between 0 (invisible) and 1 (visible).
		thumbPageLimit:				8,					// Number of thumbnails to display at a time.
		thumbNavFirst:				' &#171; ',			// "First" thumbnail pagination set label. You can also pass in an image tag as '<img src="path/image.ext" />', or enter '&nbsp;' and use CSS for the image.
		thumbNavFirstTitle:			'First',			// Use for alternate title text for thumbPage navigation controls.
		thumbNavPrev:				' &lt; ',			// "Previous" thumbnail pagination set label. You can also pass in an image tag as '<img src="path/image.ext" />', or enter '&nbsp;' and use CSS for the image.
		thumbNavPrevTitle:			'Previous',			// Use for alternate title text for thumbPage navigation controls.
		thumbNavNext:				' &gt; ',			// "Next" thumbnail pagination set label. You can also pass in an image tag as '<img src="path/image.ext" />', or enter '&nbsp;' and use CSS for the image.
		thumbNavNextTitle:			'Next',				// Use for alternate title text for thumbPage navigation controls.
		thumbNavLast:				' &#187; ',			// "Last" thumbnail pagination set label. You can also pass in an image tag as '<img src="path/image.ext" />', or enter '&nbsp;' and use CSS for the image.
		thumbNavLastTitle:			'Last',				// Use for alternate title text for thumbPage navigation controls.
		slideShowInterval:			3000,				// Slide show interval in milliseconds. Set to 0 to disable the slide show and controls.
		slideShowPlay:				' Play ',			// "Play" slide show label.You can also pass in an image tag as '<img src="path/image.ext" />', or enter '&nbsp;' and use CSS for the image.
		slideShowPlayTitle:			'Play Slideshow',	// Use for alternate title text for slideshow navigation controls.
		slideShowPause:				' Pause ',			// "Pause" slide show label.You can also pass in an image tag as '<img src="path/image.ext" />', or enter '&nbsp;' and use CSS for the image.
		slideShowPauseTitle:		'Pause Slideshow',	// Use for alternate title text for slideshow navigation controls.
		slideShowAutoStart:			false,				// Whether to start the slide show on page load, or let the user choose to activate.
		enableDeepLinks:			true,				// Appends hash to URL for the current image to allow direct links.
		enableBackButton:			true				// Allows users to browse prior images using the back button. Only works if enableDeepLinks is true.
	};
})(jQuery);
