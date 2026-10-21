import { a as slideUp, r as slideDown, t as dataMediaQueries } from "./app.min.js";
//#region src/components/layout/showmore/showmore.js
function showMore() {
	const showMoreBlocks = document.querySelectorAll("[data-fls-showmore]");
	let showMoreBlocksRegular;
	let mdQueriesArray;
	if (showMoreBlocks.length) {
		showMoreBlocksRegular = Array.from(showMoreBlocks).filter(function(item, index, self) {
			return !item.dataset.flsShowmoreMedia;
		});
		showMoreBlocksRegular.length && initItems(showMoreBlocksRegular);
		document.addEventListener("click", showMoreActions);
		window.addEventListener("resize", showMoreActions);
		mdQueriesArray = dataMediaQueries(showMoreBlocks, "flsShowmoreMedia");
		if (mdQueriesArray && mdQueriesArray.length) {
			mdQueriesArray.forEach((mdQueriesItem) => {
				mdQueriesItem.matchMedia.addEventListener("change", function() {
					initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
				});
			});
			initItemsMedia(mdQueriesArray);
		}
	}
	function initItemsMedia(mdQueriesArray) {
		mdQueriesArray.forEach((mdQueriesItem) => {
			initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
		});
	}
	function initItems(showMoreBlocks, matchMedia) {
		showMoreBlocks.forEach((showMoreBlock) => {
			initItem(showMoreBlock, matchMedia);
		});
	}
	function initItem(showMoreBlock, matchMedia = false) {
		showMoreBlock = matchMedia ? showMoreBlock.item : showMoreBlock;
		let showMoreContent = showMoreBlock.querySelectorAll("[data-fls-showmore-content]");
		let showMoreButton = showMoreBlock.querySelectorAll("[data-fls-showmore-button]");
		showMoreContent = Array.from(showMoreContent).filter((item) => item.closest("[data-fls-showmore]") === showMoreBlock)[0];
		showMoreButton = Array.from(showMoreButton).filter((item) => item.closest("[data-fls-showmore]") === showMoreBlock)[0];
		const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
		if (matchMedia.matches || !matchMedia) {
			if (hiddenHeight < getOriginalHeight(showMoreContent)) {
				slideUp(showMoreContent, 0, showMoreBlock.classList.contains("--showmore-active") ? getOriginalHeight(showMoreContent) : hiddenHeight);
				showMoreButton.hidden = false;
			} else {
				slideDown(showMoreContent, 0, hiddenHeight);
				showMoreButton.hidden = true;
			}
		} else {
			slideDown(showMoreContent, 0, hiddenHeight);
			showMoreButton.hidden = true;
		}
	}
	function getHeight(showMoreBlock, showMoreContent) {
		let hiddenHeight = 0;
		const showMoreType = showMoreBlock.dataset.flsShowmore ? showMoreBlock.dataset.flsShowmore : "size";
		const rowGap = parseFloat(getComputedStyle(showMoreContent).rowGap) ? parseFloat(getComputedStyle(showMoreContent).rowGap) : 0;
		if (showMoreType === "items") {
			const showMoreTypeValue = showMoreContent.dataset.flsShowmoreContent ? showMoreContent.dataset.flsShowmoreContent : 3;
			const showMoreItems = showMoreContent.children;
			for (let index = 1; index < showMoreItems.length; index++) {
				const showMoreItem = showMoreItems[index - 1];
				const marginTop = parseFloat(getComputedStyle(showMoreItem).marginTop) ? parseFloat(getComputedStyle(showMoreItem).marginTop) : 0;
				const marginBottom = parseFloat(getComputedStyle(showMoreItem).marginBottom) ? parseFloat(getComputedStyle(showMoreItem).marginBottom) : 0;
				hiddenHeight += showMoreItem.offsetHeight + marginTop;
				if (index == showMoreTypeValue) break;
				hiddenHeight += marginBottom;
			}
			rowGap && (hiddenHeight += (showMoreTypeValue - 1) * rowGap);
		} else hiddenHeight = showMoreContent.dataset.flsShowmoreContent ? showMoreContent.dataset.flsShowmoreContent : 150;
		return hiddenHeight;
	}
	function getOriginalHeight(showMoreContent) {
		let parentHidden;
		let hiddenHeight = showMoreContent.offsetHeight;
		showMoreContent.style.removeProperty("height");
		if (showMoreContent.closest(`[hidden]`)) {
			parentHidden = showMoreContent.closest(`[hidden]`);
			parentHidden.hidden = false;
		}
		let originalHeight = showMoreContent.offsetHeight;
		parentHidden && (parentHidden.hidden = true);
		showMoreContent.style.height = `${hiddenHeight}px`;
		return originalHeight;
	}
	function showMoreActions(e) {
		const targetEvent = e.target;
		const targetType = e.type;
		if (targetType === "click") {
			if (targetEvent.closest("[data-fls-showmore-button]")) {
				const showMoreBlock = targetEvent.closest("[data-fls-showmore-button]").closest("[data-fls-showmore]");
				const showMoreContent = showMoreBlock.querySelector("[data-fls-showmore-content]");
				const showMoreSpeed = showMoreBlock.dataset.flsShowmoreButton ? showMoreBlock.dataset.flsShowmoreButton : "500";
				const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
				if (!showMoreContent.classList.contains("--slide")) {
					showMoreBlock.classList.contains("--showmore-active") ? slideUp(showMoreContent, showMoreSpeed, hiddenHeight) : slideDown(showMoreContent, showMoreSpeed, hiddenHeight);
					showMoreBlock.classList.toggle("--showmore-active");
				}
			}
		} else if (targetType === "resize") {
			showMoreBlocksRegular && showMoreBlocksRegular.length && initItems(showMoreBlocksRegular);
			mdQueriesArray && mdQueriesArray.length && initItemsMedia(mdQueriesArray);
		}
	}
}
window.addEventListener("load", showMore);
//#endregion
//#region src/components/effects/marquee/marquee.js
var marquee = () => {
	const $marqueeArray = document.querySelectorAll("[data-fls-marquee]");
	const CLASS_NAMES = {
		wrapper: "marquee-wrapper",
		inner: "marquee-inner",
		item: "marquee-item"
	};
	if (!$marqueeArray.length) return;
	const { head } = document;
	function debounce(delay, fn) {
		let timerId;
		return (...args) => {
			if (timerId) clearTimeout(timerId);
			timerId = setTimeout(() => {
				fn(...args);
				timerId = null;
			}, delay);
		};
	}
	const onWindowWidthResize = (cb) => {
		if (!cb && !isFunction(cb)) return;
		let prevWidth = 0;
		const handleResize = () => {
			const currentWidth = window.innerWidth;
			if (prevWidth !== currentWidth) {
				prevWidth = currentWidth;
				cb();
			}
		};
		window.addEventListener("resize", debounce(50, handleResize));
		handleResize();
	};
	const buildMarquee = (marqueeNode) => {
		if (!marqueeNode) return;
		const $marquee = marqueeNode;
		const $childElements = $marquee.children;
		if (!$childElements.length) return;
		$marquee.classList.add(CLASS_NAMES.wrapper);
		Array.from($childElements).forEach(($childItem) => $childItem.classList.add(CLASS_NAMES.item));
		$marquee.innerHTML = `<div class="${CLASS_NAMES.inner}">${$marquee.innerHTML}</div>`;
	};
	const getElSize = ($el, isVertical) => {
		if (isVertical) return $el.offsetHeight;
		return $el.offsetWidth;
	};
	$marqueeArray.forEach(($wrapper) => {
		if (!$wrapper) return;
		buildMarquee($wrapper);
		const $marqueeInner = $wrapper.firstElementChild;
		let cacheArray = [];
		if (!$marqueeInner) return;
		const dataMarqueeSpace = parseFloat($wrapper.getAttribute("data-fls-marquee-space"));
		const $items = $wrapper.querySelectorAll(`.${CLASS_NAMES.item}`);
		const speed = parseFloat($wrapper.getAttribute("data-fls-marquee-speed")) / 10 || 100;
		const isMousePaused = $wrapper.hasAttribute("data-fls-marquee-pause");
		const direction = $wrapper.getAttribute("data-fls-marquee-direction");
		const isVertical = direction === "bottom" || direction === "top";
		const animName = `marqueeAnimation-${Math.floor(Math.random() * 1e7)}`;
		let spaceBetweenItem = parseFloat(window.getComputedStyle($items[0])?.getPropertyValue("margin-right"));
		let spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
		let startPosition = parseFloat($wrapper.getAttribute("data-fls-marquee-start")) || 0;
		let sumSize = 0;
		let firstScreenVisibleSize = 0;
		let initialSizeElements = 0;
		let initialElementsLength = $marqueeInner.children.length;
		let index = 0;
		let counterDuplicateElements = 0;
		const initEvents = () => {
			if (startPosition) $marqueeInner.addEventListener("animationiteration", onChangeStartPosition);
			if (!isMousePaused) return;
			$marqueeInner.removeEventListener("mouseenter", onChangePaused);
			$marqueeInner.removeEventListener("mouseleave", onChangePaused);
			$marqueeInner.addEventListener("mouseenter", onChangePaused);
			$marqueeInner.addEventListener("mouseleave", onChangePaused);
		};
		const onChangeStartPosition = () => {
			startPosition = 0;
			$marqueeInner.removeEventListener("animationiteration", onChangeStartPosition);
			onResize();
		};
		const setBaseStyles = (firstScreenVisibleSize) => {
			let baseStyle = "display: flex; flex-wrap: nowrap;";
			if (isVertical) {
				baseStyle += `
				flex-direction: column;
			 position: relative;
			 will-change: transform;`;
				if (direction === "bottom") baseStyle += `top: -${firstScreenVisibleSize}px;`;
			} else {
				baseStyle += `
				position: relative;
			 will-change: transform;`;
				if (direction === "right") baseStyle += `left: -${firstScreenVisibleSize}px;;`;
			}
			$marqueeInner.style.cssText = baseStyle;
		};
		const setdirectionAnim = (totalWidth) => {
			switch (direction) {
				case "right":
				case "bottom": return totalWidth;
				default: return -totalWidth;
			}
		};
		const animation = () => {
			const keyFrameCss = `@keyframes ${animName} {
					 0% {
						 transform: translate${isVertical ? "Y" : "X"}(${startPosition}%);
					 }
					 100% {
						 transform: translate${isVertical ? "Y" : "X"}(${setdirectionAnim(firstScreenVisibleSize)}px);
					 }
				 }`;
			const $style = document.createElement("style");
			$style.classList.add(animName);
			$style.innerHTML = keyFrameCss;
			head.append($style);
			$marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + startPosition * firstScreenVisibleSize / 100) / speed}s infinite linear`;
		};
		const addDublicateElements = () => {
			sumSize = firstScreenVisibleSize = initialSizeElements = counterDuplicateElements = index = 0;
			const $parentNodeWidth = getElSize($wrapper, isVertical);
			let $childrenEl = Array.from($marqueeInner.children);
			if (!$childrenEl.length) return;
			if (!cacheArray.length) cacheArray = $childrenEl.map(($item) => $item);
			else $childrenEl = [...cacheArray];
			$marqueeInner.style.display = "flex";
			if (isVertical) $marqueeInner.style.flexDirection = "column";
			$marqueeInner.innerHTML = "";
			$childrenEl.forEach(($item) => {
				$marqueeInner.append($item);
			});
			$childrenEl.forEach(($item) => {
				if (isVertical) $item.style.marginBottom = `${spaceBetween}px`;
				else {
					$item.style.marginRight = `${spaceBetween}px`;
					$item.style.flexShrink = 0;
				}
				const sizeEl = getElSize($item, isVertical);
				sumSize += sizeEl + spaceBetween;
				firstScreenVisibleSize += sizeEl + spaceBetween;
				initialSizeElements += sizeEl + spaceBetween;
				counterDuplicateElements += 1;
				return sizeEl;
			});
			const $multiplyWidth = $parentNodeWidth * 2 + initialSizeElements;
			for (; sumSize < $multiplyWidth; index += 1) {
				if (!$childrenEl[index]) index = 0;
				const $cloneNone = $childrenEl[index].cloneNode(true);
				const $lastElement = $marqueeInner.children[index];
				$marqueeInner.append($cloneNone);
				sumSize += getElSize($lastElement, isVertical) + spaceBetween;
				if (firstScreenVisibleSize < $parentNodeWidth || counterDuplicateElements % initialElementsLength !== 0) {
					counterDuplicateElements += 1;
					firstScreenVisibleSize += getElSize($lastElement, isVertical) + spaceBetween;
				}
			}
			setBaseStyles(firstScreenVisibleSize);
		};
		const correctSpaceBetween = () => {
			if (spaceBetweenItem) {
				$items.forEach(($item) => $item.style.removeProperty("margin-right"));
				spaceBetweenItem = parseFloat(window.getComputedStyle($items[0]).getPropertyValue("margin-right"));
				spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
			}
		};
		const init = () => {
			correctSpaceBetween();
			addDublicateElements();
			animation();
			initEvents();
		};
		const onResize = () => {
			head.querySelector(`.${animName}`)?.remove();
			init();
		};
		const onChangePaused = (e) => {
			const { type, target } = e;
			target.style.animationPlayState = type === "mouseenter" ? "paused" : "running";
		};
		onWindowWidthResize(onResize);
	});
};
marquee();
//#endregion
