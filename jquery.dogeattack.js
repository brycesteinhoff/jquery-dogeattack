(function($) {

	var defaults = {
		// Adverbs to be randomly paired with adjectives
		adverbsForAdjectives: [
			'so',
			'much',
			'such',
			'very',
			'quite'
		],

		// Pool of possible adjectives to use
		possibleAdjectives: [
			'hip',
			'concern',
			'scare',
			'friendship',
			'curious'
		],

		// Adjectives to always show (if maxPhrases is sufficient)
		requiredAdjectives: [],

		// Pool of possible phrases that do not get paired with adverbs
		possiblePhrases: [],

		// Phrases to always show (if maxPhrases is sufficient) that do not get paired with adverbs
		requiredPhrases: [
			'wow',
			'plz'
		],

		// Maximum number of phrases to show
		maxPhrases: 4,

		// Fade time in ms
		fadeTime: 50,

		// Length of time in ms
		totalTime: 10000,

		// Attributes to apply to wrapper (id, class, etc.)
		attrs: {},

		// Font size
		fontSize: 48,

		// Colors for phrases
		colors: [
			'red',
			'green',
			'orange',
			'violet',
			'aqua',
			'yellow',
			'slateblue',
			'purple',
			'pink',
			'lime',
			'fuchsia',
			'gold',
			'indigo'
		],

		// Image to use in the background
		background: 'doge.jpg',

		// Ratio of background (size in pixels)
		backgroundSize: {
			width: 675,
			height: 506
		},

		// 'preserve' background ratio or 'stretch' to fill parent
		ratio: 'preserve',

		// Callback when attack begins
		onAttack: function(wrapper) {},

		// Callback when attack ends
		onStop: function(wrapper) {}
	};

	$.fn.dogeattack = function(options) {

		if (this.length == 0) {
			return this;
		}

		var doge = {};

		var helpers = {};

		var el = this;

		/**
		 * =======================
		 * == PRIVATE FUNCTIONS ==
		 * =======================
		 */

		var init = function() {
			// Options
			doge.settings = $.extend({}, defaults, options);

			// Position parent
			if (el.css('position') == 'static') {
				el.css('position', 'relative');
			}

			// Setup wrapper
			doge.wrapper = setupWrapper();
		};

		var setupWrapper = function() {
			var css = {
				'position': 'absolute',
				'width': '100%',
				'height': '100%',
				'top': 0,
				'left': 0,
				'margin': 0,
				'padding': 0,
				'z-index': 5000,
				'display': 'none',
				'overflow': 'hidden',
				'background': '#000'
			};

			var wrapper = $('<div />')
				.attr(doge.settings.attrs)
				.css(css)
				.appendTo(el);

			return wrapper;
		};

		var attack = function() {
			// Setup container
			doge.container = setupContainer();

			// Compile phrases
			doge.phrases = compileAllPhrases();

			// Create phrase elements
			doge.phraseElements = createPhraseElements();

			// Show wrapper
			doge.wrapper.show();

			// Animate phrases
			animatePhrases();

			// End attack
			setTimeout(endAttack, doge.settings.totalTime);
		};

		var setupContainer = function() {
			var containerSpecs = {};

			// Determine container size
			if (doge.settings.ratio == 'preserve') {
				var backgroundRatio = doge.settings.backgroundSize.width / doge.settings.backgroundSize.height;
				var wrapperRatio = doge.wrapper.width() / doge.wrapper.height();
				
				if (backgroundRatio == wrapperRatio) {
					containerSpecs.width = '100%';
					containerSpecs.height = '100%';
				} else if (backgroundRatio > wrapperRatio) {
					containerSpecs.width = '100%';
					containerSpecs.height = doge.wrapper.width() / backgroundRatio;
				} else if (wrapperRatio > backgroundRatio) {
					containerSpecs.width = doge.wrapper.height() * backgroundRatio;
					containerSpecs.height = '100%';
				}
			} else {
				containerSpecs.width = '100%';
				containerSpecs.height = '100%';
			}

			// Determine container top margin
			if (doge.settings.ratio == 'preserve' && backgroundRatio > wrapperRatio) {
				containerSpecs.topMargin = (doge.wrapper.height() - containerSpecs.height)/2
			} else {
				containerSpecs.topMargin = 0;
			}

			var css = {
				'position': 'relative',
				'width': containerSpecs.width,
				'height': containerSpecs.height,
				'top': 0,
				'left': 0,
				'margin': containerSpecs.topMargin + 'px auto',
				'padding': 0,
				'background': 'url(' + doge.settings.background + ')',
				'background-size': '100% 100%'
			};

			var container = $('<div />')
				.css(css)
				.appendTo(doge.wrapper);

			return container;
		};

		var compileAllPhrases = function() {
			// Compile required adjectives and phrases
			var requiredPhrases = compileAdjectivesAndPhrases(doge.settings.requiredAdjectives, doge.settings.requiredPhrases);

			// If maxPhrases <= all required phrases, we're done
			if (doge.settings.maxPhrases <= requiredPhrases.length) {
				// Truncate and return
				return requiredPhrases.slice(0, doge.settings.maxPhrases);
			}

			// Compile possible adjectives and phrases
			var possiblePhrases = compileAdjectivesAndPhrases(doge.settings.possibleAdjectives, doge.settings.possiblePhrases);

			// Truncate if necessary
			if (doge.settings.maxPhrases < requiredPhrases.length + possiblePhrases.length) {
				possiblePhrases = possiblePhrases.slice(0, doge.settings.maxPhrases - requiredPhrases.length);
			}

			// Combine, shuffle, and return
			return helpers.shuffleArray(requiredPhrases.concat(possiblePhrases));
		};

		var compileAdjectivesAndPhrases = function(adjectives, phrases) {
			var allPhrases = [];

			// Compile adjectives
			$.each(adjectives, function(index, value) {
				allPhrases.push(compileSinglePhrase(value));
			});

			// Combine all phrases
			allPhrases = allPhrases.concat(phrases);

			// Shuffle
			allPhrases = helpers.shuffleArray(allPhrases);

			return allPhrases;
		};

		var compileSinglePhrase = function(adjective) {
			var randomAdverb = doge.settings.adverbsForAdjectives[helpers.randomInRange(doge.settings.adverbsForAdjectives.length)];
			return randomAdverb + ' ' + adjective;
		};

		var createPhraseElements = function() {
			var phraseElements = [];

			$.each(doge.phrases, function(index, phrase) {
				// Create element
				var phraseElement = $('<span>' + phrase + '</span>');

				// Style element
				phraseElement.css(generateStyle());

				// Append to container
				phraseElement.appendTo(doge.container);

				phraseElements.push(phraseElement);
			});

			return phraseElements;
		};

		var generateStyle = function() {
			var randomColor = function() {
				return doge.settings.colors[helpers.randomInRange(doge.settings.colors.length)];
			};

			var style = {
				'color': randomColor(),
				'font-size': doge.settings.fontSize + 'px',
				'font-family': '"Comic Sans MS", cursive, sans-serif',
				'line-height': doge.settings.fontSize + 'px',
				'text-shadow': '-1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000',
				'display': 'none'
			};

			return style;
		};

		var animatePhrases = function() {
			var holdTime = (doge.settings.totalTime - ((doge.phraseElements.length + 3) * doge.settings.fadeTime))/doge.phraseElements.length;

			var fadeElementIn = function(element) {
				element.fadeIn(function() { doge.settings.fadeTime }, fadeElementOut(element));
			};

			var fadeElementOut = function(element) {
				setTimeout(function() { element.fadeOut(doge.settings.fadeTime) }, holdTime);
			};

			$.each(doge.phraseElements, function(index, element) {
				// Position element
				positionPhraseElement(element);

				// Animate element
				var delay = (index * (holdTime + doge.settings.fadeTime)) + doge.settings.fadeTime;
				setTimeout(function() { fadeElementIn(element) }, delay);
			});
		};

		var positionPhraseElement = function(element) {
			var leftMax = doge.container.width() - element.width();
			var topMax = doge.container.height() - element.height();

			var style = {
				'position': 'absolute',
				'left': helpers.randomInRange(leftMax),
				'top': helpers.randomInRange(topMax)
			};

			element.css(style);
		};

		var endAttack = function() {
			// Fade out wrapper
			doge.wrapper.fadeOut(doge.settings.fadeTime * 5);

			// Clean up
			doge.container.remove();
			delete doge.container;
			delete doge.phrases;
			delete doge.phraseElements;

			// Callback
			doge.settings.onStop(doge.wrapper);
		};

		/**
		 * ======================
		 * == HELPER FUNCTIONS ==
		 * ======================
		 */

		helpers.randomInRange = function(max) {
			return Math.floor(Math.random() * max);
		};

		helpers.shuffleArray = function(o) {
			for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			return o;
		};

		/**
		 * ======================
		 * == PUBLIC FUNCTIONS ==
		 * ======================
		 */

		el.attack = function(e) {
			// Very attack. Wow.
			attack();

			// Callback
			doge.settings.onAttack(doge.wrapper);

			// Prevent default
			e.preventDefault();
		};

		init();

		return this;
	};

}(jQuery));