//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/js/common/functions.js
function getHash() {
	if (location.hash) return location.hash.replace("#", "");
}
function setHash(hash) {
	hash = hash ? `#${hash}` : window.location.href.split("#")[0];
	history.pushState("", "", hash);
}
var slideUp = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains("--slide")) {
		target.classList.add("--slide");
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + "ms";
		target.style.height = `${target.offsetHeight}px`;
		target.offsetHeight;
		target.style.overflow = "hidden";
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.hidden = !showmore ? true : false;
			!showmore && target.style.removeProperty("height");
			target.style.removeProperty("padding-top");
			target.style.removeProperty("padding-bottom");
			target.style.removeProperty("margin-top");
			target.style.removeProperty("margin-bottom");
			!showmore && target.style.removeProperty("overflow");
			target.style.removeProperty("transition-duration");
			target.style.removeProperty("transition-property");
			target.classList.remove("--slide");
			document.dispatchEvent(new CustomEvent("slideUpDone", { detail: { target } }));
		}, duration);
	}
};
var slideDown = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains("--slide")) {
		target.classList.add("--slide");
		target.hidden = target.hidden ? false : null;
		showmore && target.style.removeProperty("height");
		let height = target.offsetHeight;
		target.style.overflow = "hidden";
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.transitionProperty = "height, margin, padding";
		target.style.transitionDuration = duration + "ms";
		target.style.height = height + "px";
		target.style.removeProperty("padding-top");
		target.style.removeProperty("padding-bottom");
		target.style.removeProperty("margin-top");
		target.style.removeProperty("margin-bottom");
		window.setTimeout(() => {
			target.style.removeProperty("height");
			target.style.removeProperty("overflow");
			target.style.removeProperty("transition-duration");
			target.style.removeProperty("transition-property");
			target.classList.remove("--slide");
			document.dispatchEvent(new CustomEvent("slideDownDone", { detail: { target } }));
		}, duration);
	}
};
var slideToggle = (target, duration = 500) => {
	if (target.hidden) return slideDown(target, duration);
	else return slideUp(target, duration);
};
var bodyLockStatus = true;
var bodyUnlock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
		setTimeout(() => {
			lockPaddingElements.forEach((lockPaddingElement) => {
				lockPaddingElement.style.paddingRight = "";
			});
			document.body.style.paddingRight = "";
			document.documentElement.removeAttribute("data-fls-scrolllock");
		}, delay);
		bodyLockStatus = false;
		setTimeout(function() {
			bodyLockStatus = true;
		}, delay);
	}
};
var bodyLock = (delay = 500) => {
	if (bodyLockStatus) {
		const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
		const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
		lockPaddingElements.forEach((lockPaddingElement) => {
			lockPaddingElement.style.paddingRight = lockPaddingValue;
		});
		document.body.style.paddingRight = lockPaddingValue;
		document.documentElement.setAttribute("data-fls-scrolllock", "");
		bodyLockStatus = false;
		setTimeout(function() {
			bodyLockStatus = true;
		}, delay);
	}
};
function getDigFormat(item, sepp = " ") {
	return item.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, `$1${sepp}`);
}
function uniqArray(array) {
	return array.filter((item, index, self) => self.indexOf(item) === index);
}
function dataMediaQueries(array, dataSetValue) {
	const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
		const [value, type = "max"] = item.dataset[dataSetValue].split(",");
		return {
			value,
			type,
			item
		};
	});
	if (media.length === 0) return [];
	const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
	return [...new Set(breakpointsArray)].map((query) => {
		const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
		const matchMedia = window.matchMedia(mediaQuery);
		return {
			itemsArray: media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType),
			matchMedia
		};
	});
}
//#endregion
//#region src/components/layout/tabs/tabs.js
function tabs() {
	const tabs = document.querySelectorAll("[data-fls-tabs]");
	let tabsActiveHash = [];
	if (tabs.length > 0) {
		const hash = getHash();
		if (hash && hash.startsWith("tab-")) tabsActiveHash = hash.replace("tab-", "").split("-");
		tabs.forEach((tabsBlock, index) => {
			tabsBlock.classList.add("--tab-init");
			tabsBlock.setAttribute("data-fls-tabs-index", index);
			tabsBlock.addEventListener("click", setTabsAction);
			initTabs(tabsBlock);
		});
		let mdQueriesArray = dataMediaQueries(tabs, "flsTabs");
		if (mdQueriesArray && mdQueriesArray.length) mdQueriesArray.forEach((mdQueriesItem) => {
			mdQueriesItem.matchMedia.addEventListener("change", function() {
				setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
			});
			setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
		});
	}
	function setTitlePosition(tabsMediaArray, matchMedia) {
		tabsMediaArray.forEach((tabsMediaItem) => {
			tabsMediaItem = tabsMediaItem.item;
			let tabsTitles = tabsMediaItem.querySelector("[data-fls-tabs-titles]");
			let tabsTitleItems = tabsMediaItem.querySelectorAll("[data-fls-tabs-title]");
			let tabsContent = tabsMediaItem.querySelector("[data-fls-tabs-body]");
			let tabsContentItems = tabsMediaItem.querySelectorAll("[data-fls-tabs-item]");
			tabsTitleItems = Array.from(tabsTitleItems).filter((item) => item.closest("[data-fls-tabs]") === tabsMediaItem);
			tabsContentItems = Array.from(tabsContentItems).filter((item) => item.closest("[data-fls-tabs]") === tabsMediaItem);
			tabsContentItems.forEach((tabsContentItem, index) => {
				if (matchMedia.matches) {
					tabsContent.append(tabsTitleItems[index]);
					tabsContent.append(tabsContentItem);
					tabsMediaItem.classList.add("--tab-spoller");
				} else {
					tabsTitles.append(tabsTitleItems[index]);
					tabsMediaItem.classList.remove("--tab-spoller");
				}
			});
		});
	}
	function initTabs(tabsBlock) {
		let tabsTitles = tabsBlock.querySelectorAll("[data-fls-tabs-titles]>*");
		let tabsContent = tabsBlock.querySelectorAll("[data-fls-tabs-body]>*");
		const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
		const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;
		if (tabsActiveHashBlock) {
			const tabsActiveTitle = tabsBlock.querySelector("[data-fls-tabs-titles]>.--tab-active");
			tabsActiveTitle && tabsActiveTitle.classList.remove("--tab-active");
		}
		if (tabsContent.length) tabsContent.forEach((tabsContentItem, index) => {
			tabsTitles[index].setAttribute("data-fls-tabs-title", "");
			tabsContentItem.setAttribute("data-fls-tabs-item", "");
			if (tabsActiveHashBlock && index == tabsActiveHash[1]) tabsTitles[index].classList.add("--tab-active");
			tabsContentItem.hidden = !tabsTitles[index].classList.contains("--tab-active");
		});
	}
	function setTabsStatus(tabsBlock) {
		let tabsTitles = tabsBlock.querySelectorAll("[data-fls-tabs-title]");
		let tabsContent = tabsBlock.querySelectorAll("[data-fls-tabs-item]");
		const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
		function isTabsAnamate(tabsBlock) {
			if (tabsBlock.hasAttribute("data-fls-tabs-animate")) return tabsBlock.dataset.flsTabsAnimate > 0 ? Number(tabsBlock.dataset.flsTabsAnimate) : 500;
		}
		const tabsBlockAnimate = isTabsAnamate(tabsBlock);
		if (tabsContent.length > 0) {
			const isHash = tabsBlock.hasAttribute("data-fls-tabs-hash");
			tabsContent = Array.from(tabsContent).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock);
			tabsTitles = Array.from(tabsTitles).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock);
			tabsContent.forEach((tabsContentItem, index) => {
				if (tabsTitles[index].classList.contains("--tab-active")) {
					tabsContentItem.hidden = false;
					tabsContentItem.style.removeProperty("display");
					if (tabsBlockAnimate) slideDown(tabsContentItem, tabsBlockAnimate);
					tabsContentItem.style.opacity = "0";
					tabsContentItem.style.transform = "translateY(25px) scale(0.985)";
					tabsContentItem.style.transition = "opacity 650ms ease, transform 650ms cubic-bezier(0.22, 1, 0.36, 1)";
					requestAnimationFrame(() => {
						tabsContentItem.style.opacity = "1";
						tabsContentItem.style.transform = "translateY(0) scale(1)";
					});
					if (isHash && !tabsContentItem.closest(".popup")) setHash(`tab-${tabsBlockIndex}-${index}`);
				} else {
					if (tabsBlockAnimate) slideUp(tabsContentItem, tabsBlockAnimate);
					else tabsContentItem.hidden = true;
					tabsContentItem.style.opacity = "";
					tabsContentItem.style.transform = "";
					tabsContentItem.style.removeProperty("transition");
				}
			});
		}
	}
	function setTabsAction(e) {
		const el = e.target;
		if (el.closest("[data-fls-tabs-title]")) {
			const tabTitle = el.closest("[data-fls-tabs-title]");
			const tabsBlock = tabTitle.closest("[data-fls-tabs]");
			if (!tabTitle.classList.contains("--tab-active") && !tabsBlock.querySelector(".--slide")) {
				let tabActiveTitle = tabsBlock.querySelectorAll("[data-fls-tabs-title].--tab-active");
				tabActiveTitle.length && (tabActiveTitle = Array.from(tabActiveTitle).filter((item) => item.closest("[data-fls-tabs]") === tabsBlock));
				tabActiveTitle.length && tabActiveTitle[0].classList.remove("--tab-active");
				tabTitle.classList.add("--tab-active");
				setTabsStatus(tabsBlock);
			}
			e.preventDefault();
		}
	}
}
window.addEventListener("load", tabs);
//#endregion
//#region src/components/layout/popup/popup.js
var Popup = class {
	constructor(options) {
		let config = {
			logging: true,
			init: true,
			attributeOpenButton: "data-fls-popup-link",
			attributeCloseButton: "data-fls-popup-close",
			fixElementSelector: "[data-fls-lp]",
			attributeMain: "data-fls-popup",
			youtubeAttribute: "data-fls-popup-youtube",
			youtubePlaceAttribute: "data-fls-popup-youtube-place",
			setAutoplayYoutube: true,
			classes: {
				popup: "popup",
				popupContent: "data-fls-popup-body",
				popupActive: "data-fls-popup-active",
				bodyActive: "data-fls-popup-open"
			},
			focusCatch: true,
			closeEsc: true,
			bodyLock: true,
			hashSettings: {
				location: true,
				goHash: true
			},
			on: {
				beforeOpen: function() {},
				afterOpen: function() {},
				beforeClose: function() {},
				afterClose: function() {}
			}
		};
		this.youTubeCode;
		this.isOpen = false;
		this.targetOpen = {
			selector: false,
			element: false
		};
		this.previousOpen = {
			selector: false,
			element: false
		};
		this.lastClosed = {
			selector: false,
			element: false
		};
		this._dataValue = false;
		this.hash = false;
		this._reopen = false;
		this._selectorOpen = false;
		this.lastFocusEl = false;
		this._focusEl = [
			"a[href]",
			"input:not([disabled]):not([type=\"hidden\"]):not([aria-hidden])",
			"button:not([disabled]):not([aria-hidden])",
			"select:not([disabled]):not([aria-hidden])",
			"textarea:not([disabled]):not([aria-hidden])",
			"area[href]",
			"iframe",
			"object",
			"embed",
			"[contenteditable]",
			"[tabindex]:not([tabindex^=\"-\"])"
		];
		this.options = {
			...config,
			...options,
			classes: {
				...config.classes,
				...options?.classes
			},
			hashSettings: {
				...config.hashSettings,
				...options?.hashSettings
			},
			on: {
				...config.on,
				...options?.on
			}
		};
		this.bodyLock = false;
		this.options.init && this.initPopups();
	}
	initPopups() {
		this.buildPopup();
		this.eventsPopup();
	}
	buildPopup() {}
	eventsPopup() {
		document.addEventListener("click", function(e) {
			const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
			if (buttonOpen) {
				e.preventDefault();
				this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
				this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
				if (this._dataValue !== "error") {
					if (!this.isOpen) this.lastFocusEl = buttonOpen;
					this.targetOpen.selector = `${this._dataValue}`;
					this._selectorOpen = true;
					this.open();
					return;
				}
				return;
			}
			if (e.target.closest(`[${this.options.attributeCloseButton}]`) || !e.target.closest(`[${this.options.classes.popupContent}]`) && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
		}.bind(this));
		document.addEventListener("keydown", function(e) {
			if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
			if (this.options.focusCatch && e.which == 9 && this.isOpen) {
				this._focusCatch(e);
				return;
			}
		}.bind(this));
		if (this.options.hashSettings.goHash) {
			window.addEventListener("hashchange", function() {
				if (window.location.hash) this._openToHash();
				else this.close(this.targetOpen.selector);
			}.bind(this));
			window.addEventListener("load", function() {
				if (window.location.hash) this._openToHash();
			}.bind(this));
		}
	}
	open(selectorValue) {
		if (bodyLockStatus) {
			this.bodyLock = document.documentElement.hasAttribute("data-fls-scrolllock") && !this.isOpen ? true : false;
			if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
				this.targetOpen.selector = selectorValue;
				this._selectorOpen = true;
			}
			if (this.isOpen) {
				this._reopen = true;
				this.close();
			}
			if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
			if (!this._reopen) this.previousActiveElement = document.activeElement;
			this.targetOpen.element = document.querySelector(`[${this.options.attributeMain}=${this.targetOpen.selector}]`);
			if (this.targetOpen.element) {
				const codeVideo = this.youTubeCode || this.targetOpen.element.getAttribute(`${this.options.youtubeAttribute}`);
				if (codeVideo) {
					const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
					const iframe = document.createElement("iframe");
					const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
					iframe.setAttribute("allowfullscreen", "");
					iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
					iframe.setAttribute("src", urlVideo);
					if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) this.targetOpen.element.querySelector("[data-fls-popup-content]").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
					this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
				}
				if (this.options.hashSettings.location) {
					this._getHash();
					this._setHash();
				}
				this.options.on.beforeOpen(this);
				document.dispatchEvent(new CustomEvent("beforePopupOpen", { detail: { popup: this } }));
				this.targetOpen.element.setAttribute(this.options.classes.popupActive, "");
				document.documentElement.setAttribute(this.options.classes.bodyActive, "");
				if (!this._reopen) !this.bodyLock && bodyLock();
				else this._reopen = false;
				this.targetOpen.element.setAttribute("aria-hidden", "false");
				this.previousOpen.selector = this.targetOpen.selector;
				this.previousOpen.element = this.targetOpen.element;
				this._selectorOpen = false;
				this.isOpen = true;
				setTimeout(() => {
					this._focusTrap();
				}, 50);
				this.options.on.afterOpen(this);
				document.dispatchEvent(new CustomEvent("afterPopupOpen", { detail: { popup: this } }));
			}
		}
	}
	close(selectorValue) {
		if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") this.previousOpen.selector = selectorValue;
		if (!this.isOpen || !bodyLockStatus) return;
		this.options.on.beforeClose(this);
		document.dispatchEvent(new CustomEvent("beforePopupClose", { detail: { popup: this } }));
		if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) setTimeout(() => {
			this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
		}, 900);
		this.previousOpen.element.removeAttribute(this.options.classes.popupActive);
		this.previousOpen.element.setAttribute("aria-hidden", "true");
		if (!this._reopen) {
			document.documentElement.removeAttribute(this.options.classes.bodyActive);
			!this.bodyLock && bodyUnlock();
			this.isOpen = false;
		}
		this._removeHash();
		if (this._selectorOpen) {
			this.lastClosed.selector = this.previousOpen.selector;
			this.lastClosed.element = this.previousOpen.element;
		}
		this.options.on.afterClose(this);
		document.dispatchEvent(new CustomEvent("afterPopupClose", { detail: { popup: this } }));
		setTimeout(() => {
			this._focusTrap();
		}, 50);
	}
	_getHash() {
		if (this.options.hashSettings.location) this.hash = `#${this.targetOpen.selector}`;
	}
	_openToHash() {
		let classInHash = window.location.hash.replace("#", "");
		const openButton = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`);
		if (openButton) this.youTubeCode = openButton.getAttribute(this.options.youtubeAttribute) ? openButton.getAttribute(this.options.youtubeAttribute) : null;
		if (classInHash) this.open(classInHash);
	}
	_setHash() {
		history.pushState("", "", this.hash);
	}
	_removeHash() {
		history.pushState("", "", window.location.href.split("#")[0]);
	}
	_focusCatch(e) {
		const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
		const focusArray = Array.prototype.slice.call(focusable);
		const focusedIndex = focusArray.indexOf(document.activeElement);
		if (e.shiftKey && focusedIndex === 0) {
			focusArray[focusArray.length - 1].focus();
			e.preventDefault();
		}
		if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
			focusArray[0].focus();
			e.preventDefault();
		}
	}
	_focusTrap() {
		const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
		if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus();
		else focusable[0].focus();
	}
};
document.querySelector("[data-fls-popup]") && window.addEventListener("load", () => window.flsPopup = new Popup({}));
//#endregion
//#region src/components/layout/header/header.js
var menuBtn = document.querySelector(".menu__icon");
var mobMenu = document.querySelector(".menu");
var wrapper$1 = document.querySelector(".wrapper");
if (menuBtn && mobMenu && wrapper$1) {
	menuBtn.addEventListener("click", () => {
		menuBtn.classList.toggle("menu__icon--active");
		mobMenu.classList.toggle("menu--active");
		wrapper$1.classList.toggle("wrapper--active");
	});
	document.addEventListener("click", (event) => {
		const isMenuOpen = mobMenu.classList.contains("menu--active");
		const clickedOutsideMenu = !mobMenu.contains(event.target);
		const clickedOutsideBtn = !menuBtn.contains(event.target);
		if (isMenuOpen && clickedOutsideMenu && clickedOutsideBtn) {
			menuBtn.classList.remove("menu__icon--active");
			mobMenu.classList.remove("menu--active");
			wrapper$1.classList.remove("wrapper--active");
		}
	});
}
document.querySelectorAll(".menu__link").forEach((item) => {
	item.addEventListener("click", (event) => {
		const href = item.getAttribute("href");
		if (!href) return;
		if (href.startsWith("#")) {
			event.preventDefault();
			if (menuBtn && mobMenu && wrapper$1) {
				menuBtn.classList.remove("menu__icon--active");
				mobMenu.classList.remove("menu--active");
				wrapper$1.classList.remove("wrapper--active");
			}
			const blockId = href.substring(1);
			const targetBlock = document.getElementById(blockId);
			if (targetBlock) targetBlock.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		}
	});
});
var links = document.querySelectorAll(".menu__link");
var currentPath = window.location.pathname.split("/").pop() || "index.html";
var currentHash = window.location.hash;
links.forEach((link) => {
	const href = link.getAttribute("href");
	if (!href) return;
	link.classList.remove("link-visit");
	if (href.startsWith("#")) {
		if (currentPath === "index.html" && href === currentHash) link.classList.add("link-visit");
		return;
	}
	const linkUrl = new URL(href, window.location.href);
	const linkPath = linkUrl.pathname.split("/").pop() || "index.html";
	const linkHash = linkUrl.hash;
	if (linkHash) {
		if (linkPath === currentPath && linkHash === currentHash) link.classList.add("link-visit");
	} else if (linkPath === currentPath && !currentHash) link.classList.add("link-visit");
});
//#endregion
//#region src/components/layout/header/plugins/scroll/scroll.js
function headerScroll() {
	const header = document.querySelector("[data-fls-header-scroll]");
	const headerShow = header.hasAttribute("data-fls-header-scroll-show");
	const headerShowTimer = header.dataset.flsHeaderScrollShow ? header.dataset.flsHeaderScrollShow : 500;
	const startPoint = header.dataset.flsHeaderScroll ? header.dataset.flsHeaderScroll : 1;
	let scrollDirection = 0;
	let timer;
	document.addEventListener("scroll", function(e) {
		const scrollTop = window.scrollY;
		clearTimeout(timer);
		if (scrollTop >= startPoint) {
			!header.classList.contains("--header-scroll") && header.classList.add("--header-scroll");
			if (headerShow) {
				if (scrollTop > scrollDirection) header.classList.contains("--header-show") && header.classList.remove("--header-show");
				else !header.classList.contains("--header-show") && header.classList.add("--header-show");
				timer = setTimeout(() => {
					!header.classList.contains("--header-show") && header.classList.add("--header-show");
				}, headerShowTimer);
			}
		} else {
			header.classList.contains("--header-scroll") && header.classList.remove("--header-scroll");
			if (headerShow) header.classList.contains("--header-show") && header.classList.remove("--header-show");
		}
		scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
	});
}
document.querySelector("[data-fls-header-scroll]") && window.addEventListener("load", headerScroll);
//#endregion
//#region src/components/layout/dynamic/dynamic.js
var DynamicAdapt = class {
	constructor() {
		this.type = "max";
		this.init();
	}
	init() {
		this.objects = [];
		this.daClassname = "--dynamic";
		this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
		this.nodes.forEach((node) => {
			const dataArray = node.dataset.flsDynamic.trim().split(`,`);
			const object = {};
			object.element = node;
			object.parent = node.parentNode;
			object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
			const parentObjectSelector = dataArray[3] ? dataArray[3].trim() : null;
			const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
			if (objectSelector) {
				if (parentObjectSelector) `${parentObjectSelector}${objectSelector}`;
				const foundDestination = object.destinationParent.querySelector(objectSelector);
				if (foundDestination) object.destination = foundDestination;
			}
			object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
			object.place = dataArray[2] ? dataArray[2].trim() : `last`;
			object.index = this.indexInParent(object.parent, object.element);
			this.objects.push(object);
		});
		this.arraySort(this.objects);
		this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
		this.mediaQueries.forEach((media) => {
			const mediaSplit = media.split(",");
			const matchMedia = window.matchMedia(mediaSplit[0]);
			const mediaBreakpoint = mediaSplit[1];
			const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
			matchMedia.addEventListener("change", () => {
				this.mediaHandler(matchMedia, objectsFilter);
			});
			this.mediaHandler(matchMedia, objectsFilter);
		});
	}
	mediaHandler(matchMedia, objects) {
		if (matchMedia.matches) objects.forEach((object) => {
			if (object.destination) this.moveTo(object.place, object.element, object.destination);
		});
		else objects.forEach(({ parent, element, index }) => {
			if (element.classList.contains(this.daClassname)) this.moveBack(parent, element, index);
		});
	}
	moveTo(place, element, destination) {
		element.classList.add(this.daClassname);
		const index = place === "last" || place === "first" ? place : parseInt(place, 10);
		if (index === "last" || index >= destination.children.length) destination.append(element);
		else if (index === "first") destination.prepend(element);
		else destination.children[index].before(element);
	}
	moveBack(parent, element, index) {
		element.classList.remove(this.daClassname);
		if (parent.children[index] !== void 0) parent.children[index].before(element);
		else parent.append(element);
	}
	indexInParent(parent, element) {
		return [...parent.children].indexOf(element);
	}
	arraySort(arr) {
		if (this.type === "min") arr.sort((a, b) => {
			if (a.breakpoint === b.breakpoint) {
				if (a.place === b.place) return 0;
				if (a.place === "first" || b.place === "last") return -1;
				if (a.place === "last" || b.place === "first") return 1;
				return 0;
			}
			return a.breakpoint - b.breakpoint;
		});
		else {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) return 0;
					if (a.place === "first" || b.place === "last") return 1;
					if (a.place === "last" || b.place === "first") return -1;
					return 0;
				}
				return b.breakpoint - a.breakpoint;
			});
			return;
		}
	}
};
if (document.querySelector("[data-fls-dynamic]")) window.addEventListener("load", () => new DynamicAdapt());
//#endregion
//#region src/components/layout/cart/cart.js
var cart = document.querySelector(".cart");
var cartIcon = document.querySelector(".header__btn-cart");
var wrapper = document.querySelector(".wrapper");
var cartActive = (e) => {
	if (!e.target.closest(".cart-action") || !cart) return;
	if (!cart.classList.contains("--active")) {
		openCart();
		wrapper.classList.add("wrapper--active");
		return;
	}
	cart.classList.add("--closing");
	wrapper.classList.remove("wrapper--active");
};
document.addEventListener("click", cartActive);
function openCart() {
	const iconRect = cartIcon.getBoundingClientRect();
	const x = iconRect.left + iconRect.width / 2 - window.innerWidth / 2;
	const y = iconRect.top + iconRect.height / 2 - window.innerHeight / 2;
	cart.style.setProperty("--cart-x", `${x}px`);
	cart.style.setProperty("--cart-y", `${y}px`);
	cart.classList.remove("--closing");
	cart.classList.add("--active");
}
cart.addEventListener("animationend", (e) => {
	if (e.animationName === "cart-close") cart.classList.remove("--active", "--closing");
});
var cartItems = document.querySelector(".cart__items");
var cartTemplate = document.querySelector("#cart-item-template");
var cartCounter = document.querySelector(".cart-counter");
var cartTotal = document.querySelector("[data-fls-cart-total]");
document.addEventListener("click", (e) => {
	const addButton = e.target.closest("[data-addtocart-button]");
	if (addButton) {
		const productImage = addButton.closest("[data-fls-addtocart-product]")?.querySelector(".card-img img");
		const product = {
			id: addButton.dataset.id,
			title: addButton.dataset.title,
			price: addButton.dataset.price,
			image: productImage?.src || ""
		};
		const existingItem = cartItems.querySelector(`.cart__item[data-id="${product.id}"]`);
		if (existingItem) {
			const quantityInput = existingItem.querySelector("[data-fls-addtocart-quantity]");
			quantityInput.value = +quantityInput.value + 1;
			const priceElement = existingItem.querySelector("[data-fls-cart-price]");
			priceElement.textContent = Number(priceElement.dataset.price) * Number(quantityInput.value);
			updateCart();
		} else addProductCart(product);
		addToCart(addButton);
		return;
	}
	const removeButton = e.target.closest(".cart__remove");
	if (removeButton) {
		const item = removeButton.closest(".cart__item");
		if (!item) return;
		item.remove();
		updateCart();
		return;
	}
	const quantityButton = e.target.closest("[data-fls-quantity-plus], [data-fls-quantity-minus]");
	if (quantityButton) {
		const item = quantityButton.closest(".cart__item");
		if (!item) return;
		setTimeout(() => {
			const quantityInput = item.querySelector("[data-fls-addtocart-quantity]");
			const priceElement = item.querySelector("[data-fls-cart-price]");
			const quantity = Number(quantityInput.value);
			priceElement.textContent = Number(priceElement.dataset.price) * quantity;
			updateCart();
		}, 0);
		return;
	}
});
function addProductCart(product) {
	const emptyMessage = cartItems.querySelector(".cart__void");
	if (emptyMessage) emptyMessage.remove();
	const item = cartTemplate.content.cloneNode(true);
	const cartItem = item.querySelector(".cart__item");
	cartItem.dataset.id = product.id;
	const image = cartItem.querySelector(".cart__item-img img");
	image.src = product.image;
	image.alt = product.title;
	cartItem.querySelector(".cart__item-title").textContent = product.title;
	const priceElement = cartItem.querySelector("[data-fls-cart-price]");
	priceElement.textContent = product.price;
	priceElement.dataset.price = product.price;
	cartItem.querySelector("[data-fls-addtocart-quantity]").value = 1;
	cartItems.append(item);
	updateCart();
}
function updateCart() {
	const items = cartItems.querySelectorAll(".cart__item");
	const count = items.length;
	if (count === 0) {
		cartCounter.classList.remove("cart--has-products");
		cartCounter.textContent = "";
		cartTotal.textContent = "0";
		if (!cartItems.querySelector(".cart__void")) cartItems.insertAdjacentHTML("beforeend", "<span class=\"cart__void\">Корзина порожня</span>");
		return;
	}
	cartCounter.textContent = count;
	cartCounter.classList.add("cart--has-products");
	const emptyMessage = cartItems.querySelector(".cart__void");
	if (emptyMessage) emptyMessage.remove();
	let total = 0;
	items.forEach((item) => {
		const priceElement = item.querySelector("[data-fls-cart-price]");
		total += Number(priceElement.textContent);
	});
	cartTotal.textContent = total;
}
function addToCart(addToCartButton) {
	if (addToCartButton.disabled) return;
	addToCartButton.disabled = true;
	const addToCart = document.querySelector("[data-fls-addtocart]");
	const addToCartProduct = addToCartButton.closest("[data-fls-addtocart-product]");
	if (!addToCart || !addToCartProduct) {
		addToCartButton.disabled = false;
		return;
	}
	const addToCartImage = addToCartProduct.querySelector(".card-img img");
	if (!addToCartImage) {
		addToCartButton.disabled = false;
		return;
	}
	const flyImgSpeed = +addToCartImage.dataset.flsAddtocartImage || 1500;
	const imageRect = addToCartImage.getBoundingClientRect();
	const cartRect = addToCart.getBoundingClientRect();
	const flyImg = document.createElement("img");
	flyImg.src = addToCartImage.src;
	console.log("FLY IMG:", flyImg.src);
	flyImg.style.cssText = `
        position: fixed;
        left: ${imageRect.left}px;
        top: ${imageRect.top}px;
        width: ${imageRect.width}px;
        transition: all ${flyImgSpeed}ms;
        z-index: 100;
    `;
	document.body.append(flyImg);
	requestAnimationFrame(() => {
		flyImg.style.left = `${cartRect.left}px`;
		flyImg.style.top = `${cartRect.top}px`;
		flyImg.style.width = `0px`;
		flyImg.style.opacity = `0`;
	});
	setTimeout(() => {
		flyImg.remove();
		addToCartButton.disabled = false;
	}, flyImgSpeed);
}
//#endregion
//#region src/components/forms/quantity/quantity.js
function formQuantity() {
	document.addEventListener("click", quantityActions);
	document.addEventListener("keyup", quantityActions);
	function quantityActions(e) {
		const type = e.type;
		const targetElement = e.target;
		if (type === "click") {
			if (targetElement.closest("[data-fls-quantity-plus]") || targetElement.closest("[data-fls-quantity-minus]")) {
				const valueElement = targetElement.closest("[data-fls-quantity]").querySelector("[data-fls-quantity-value]");
				let value = parseInt(valueElement.value);
				if (targetElement.hasAttribute("data-fls-quantity-plus")) {
					value++;
					if (+valueElement.dataset.flsQuantityMax && +valueElement.dataset.flsQuantityMax < value) value = valueElement.dataset.flsQuantityMax;
				} else {
					--value;
					if (+valueElement.dataset.flsQuantityMin) {
						if (+valueElement.dataset.flsQuantityMin > value) value = valueElement.dataset.flsQuantityMin;
					} else if (value < 1) value = 1;
				}
				targetElement.closest("[data-fls-quantity]").querySelector("[data-fls-quantity-value]").value = value;
			}
		} else if (type === "keyup") {
			if (targetElement.closest("[data-fls-quantity-value]")) {
				const valueElement = targetElement.closest("[data-fls-quantity-value]");
				console.log(valueElement.value);
				(valueElement.value == 0 || /[^0-9]/gi.test(valueElement.value)) && (valueElement.value = 1);
			}
		}
	}
}
window.addEventListener("load", formQuantity);
//#endregion
//#region src/components/effects/preloader/preloader.js
function preloader() {
	const preloaderImages = document.querySelectorAll("img");
	const htmlDocument = document.documentElement;
	const isPreloaded = localStorage.getItem(location.href) && document.querySelector("[data-fls-preloader=\"true\"]");
	if (preloaderImages.length && !isPreloaded) {
		document.body.insertAdjacentHTML("beforeend", `
		  <div class="fls-preloader">
        <div class="fls-preloader__body">
            <img
                class="fls-preloader__logo"
                src="assets/img/decor.webp"
                alt="Logo"
            >
        </div>
    </div>
		`);
		document.querySelector(".fls-preloader");
		const showPecentLoad = document.querySelector(".fls-preloader__counter"), showLineLoad = document.querySelector(".fls-preloader__line span");
		let imagesLoadedCount = 0;
		let counter = 0;
		let progress = 0;
		htmlDocument.setAttribute("data-fls-preloader-loading", "");
		htmlDocument.setAttribute("data-fls-scrolllock", "");
		preloaderImages.forEach((preloaderImage) => {
			const imgClone = document.createElement("img");
			if (imgClone) {
				imgClone.onload = imageLoaded;
				imgClone.onerror = imageLoaded;
				preloaderImage.dataset.src ? imgClone.src = preloaderImage.dataset.src : imgClone.src = preloaderImage.src;
			}
		});
		function setValueProgress(progress) {
			showPecentLoad && (showPecentLoad.innerText = `${progress}%`);
			showLineLoad && (showLineLoad.style.width = `${progress}%`);
		}
		setValueProgress(progress);
		function imageLoaded() {
			imagesLoadedCount++;
			progress = Math.round(100 / preloaderImages.length * imagesLoadedCount);
			const intervalId = setInterval(() => {
				counter >= progress ? clearInterval(intervalId) : setValueProgress(++counter);
				counter >= 100 && addLoadedClass();
			}, 10);
		}
		const preloaderOnce = () => localStorage.setItem(location.href, "preloaded");
		document.querySelector("[data-fls-preloader=\"true\"]") && preloaderOnce();
	} else addLoadedClass();
	function addLoadedClass() {
		htmlDocument.setAttribute("data-fls-preloader-loaded", "");
		htmlDocument.removeAttribute("data-fls-preloader-loading");
		htmlDocument.removeAttribute("data-fls-scrolllock");
	}
}
document.addEventListener("DOMContentLoaded", preloader);
//#endregion
//#region src/components/pages/home/home.js
var show = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) entry.target.classList.add("visible");
		if (!entry.isIntersecting) entry.target.classList.remove("visible");
	});
});
document.querySelectorAll(".show").forEach((item) => {
	show.observe(item);
});
document.querySelectorAll("[data-scroll-text]").forEach((text) => {
	text.innerHTML = text.textContent.trim().split(/\s+/).map((word) => `<span>${word}</span>`).join(" ");
	const spans = [...text.querySelectorAll("span")];
	let targetWords = 0;
	let activeWords = 0;
	let animationTimer = null;
	function updateText() {
		const rect = text.getBoundingClientRect();
		const distance = window.innerHeight * .65 - rect.top;
		const distancePerWord = text.offsetHeight / spans.length;
		targetWords = Math.min(Math.max(Math.floor(Math.max(distance, 0) / distancePerWord), 0), spans.length);
		animateWords();
	}
	function animateWords() {
		if (activeWords === targetWords) return;
		clearTimeout(animationTimer);
		animationTimer = setTimeout(() => {
			if (activeWords < targetWords) activeWords++;
			else activeWords--;
			spans.forEach((span, index) => {
				span.classList.toggle("is-active", index < activeWords);
			});
			animateWords();
		}, 30);
	}
	updateText();
	window.addEventListener("scroll", updateText, { passive: true });
	window.addEventListener("resize", updateText);
});
//#endregion
export { slideUp as a, slideToggle as i, getDigFormat as n, uniqArray as o, slideDown as r, dataMediaQueries as t };
