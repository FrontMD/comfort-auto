new (class Frontend {
	constructor() {
		$(() => {

			this.setToggleMarks();
			this.setHeaderHeight();
			this.fixFancyGallery();

			this.setMobileMenu();

			this.setSpecialCardGallery();

			this.setLazyload();
			this.setPartnersSlider();
			this.setMarksSwiper();
			this.setBaseSwipers();
			this.setDrops();

			this.setComplectationAccordion();

			this.setTabs();

			this.setScrollTo();
			this.setClickTrigger();
		});
	}
    
	setToggleMarks() {
		let toggle = $(".js-toggle-marks");
		let target = $(".js-marks");

		$(window).on("scroll", () => {
			if (target.hasClass("active")) {
				target.removeClass("active");
			}
		});

		toggle.on("click", () => {
			target.toggleClass("active");
		});
	}

  
	setHeaderHeight() {
		let header = document.querySelector(".header");

		let observer = new ResizeObserver(() => {
			document.querySelector("html").style.setProperty("--header-height", header.getBoundingClientRect().height + "px");
		});

		observer.observe(header);
	}
	


	setMobileMenu() {
		let toggle = $(".js-toggle");
		let menu = $(".js-menu");

		toggle.on("click", () => {
			toggle.toggleClass("active");
			menu.toggleClass("active");

			if (menu.hasClass("active")) {
				$("html,body").css("overflow", "hidden");
			} else {
				$("html,body").css("overflow", "");
			}
		});
	}
	fixFancyGallery() {
		$(".page").on("scroll", (e) => {
			e.target.scrollLeft = 0;
		});
	}
	setLazyload() {
		new LazyLoad();
	}
	setMarksSwiper() {
		let grid = {
			rows: 3,
			fill: "row",
		};
		new Swiper(".marks-slider .swiper", {
			slidesPerView: 4,
			slidesPerGroup: 4,
			grid,
			spaceBetween: 10,
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev",
			},
			breakpoints: {
				425: {
					slidesPerView: 5,
					slidesPerGroup: 5,
					spaceBetween: 10,
					grid,
				},
				576: {
					slidesPerView: 3,
					slidesPerGroup: 3,
					spaceBetween: 10,
					grid,
				},
				768: {
					slidesPerView: 4,
					slidesPerGroup: 4,
					spaceBetween: 10,
					grid,
				},
				992: {
					slidesPerView: 6,
					slidesPerGroup: 6,
					spaceBetween: 10,
					grid,
				},
				1400: {
					slidesPerView: 8,
					slidesPerGroup: 8,
					spaceBetween: 30,
					grid,
				},
			},
		});
	}


	setPartnersSlider() {
		new Swiper(".credit-main-partners .swiper", {
			slidesPerView: "auto",
			pagination: {
				el: ".credit-main-partners .swiper-pagination",
				clickable: true,
			},
			navigation: {
				nextEl: ".credit-main-partners .swiper-button-next",
				prevEl: ".credit-main-partners .swiper-button-prev",
			},
		});
	}
	setBaseSwipers() {
		let elements = $(".swiper:not(.swiper-initialized)");

		elements.each((idx, el) => {
			let need_navigation = $(el).find(".swiper-navigation").length;
			let need_pagination = $(el).find(".swiper-pagination").length;
			let thumbs = $(el).attr("data-thumbs");

			let get_direction = () => (getComputedStyle(el).getPropertyValue("--swiper-direction") === "column" ? "vertical" : "horizontal");

			let swiper = new Swiper(el, {
				slidesPerView: "auto",
				pagination: need_pagination && {
					el: ".swiper-pagination",
					type: "bullets",
					clickable: true,
				},
				navigation: need_navigation && {
					nextEl: ".swiper-button-next",
					prevEl: ".swiper-button-prev",
				},
				direction: get_direction(),
				parallax: true,
				thumbs: thumbs && {
					swiper: thumbs,
				},
			});

			$(el).data("swiper", swiper);

			let observer = new ResizeObserver(() => {
				swiper.changeDirection(get_direction());
			});

			observer.observe(el);
		});
	}

	setDrops() {
		let drops = $(".dropdown");

		drops.each((idx, el) => {
			let toggle = $(el).find(".dropdown-toggle");
			let menu = $(el).find(".dropdown-menu");

			toggle.on("click", (e) => {
				e.preventDefault();

				$(el).toggleClass("active");
				toggle.toggleClass("active");
				menu.toggleClass("active");
			});

			menu.find("input[type='checkbox'],input[type='radio']").on("change", (e) => {
				$(el).removeClass("active");
				toggle.removeClass("active");
				menu.removeClass("active");
			});

			$(window).on("click scroll", (e) => {
				if (!$(e.target).closest(el).length) {
					$(el).removeClass("active");
					toggle.removeClass("active");
					menu.removeClass("active");
				}
			});
		});
	}

	setComplectationAccordion() {
		let block = $(".complectations");
		let item = block.find(".complectation-item");

		let toggles = block.find("[data-trigger]");
		let contents = block.find("[data-content]");

		item.each((idx, el) => {
			let tgl = $(el).find("[data-trigger]");
			let ctt = $(el).find("[data-content]");

			tgl.on("click", function () {
				let target_id = $(this).attr("data-trigger");
				let current_content = ctt.filter("[data-content='" + target_id + "']");

				toggles.not(this).removeClass("active");
				contents.not(current_content).slideUp(100);

				$(this).toggleClass("active");
				current_content.slideToggle(100);
			});
		});
	}

	setTabs() {
		let items = document.querySelectorAll(".js-tab-items");

		$(items).each((idx, el) => {
			let triggers = $(el).find("a[href^='#']");

			triggers.on("click", function (event) {
				event.preventDefault();
				triggers.not(this).removeClass("active").attr("tabindex", -1);
				$(this).addClass("active").attr("tabindex", null);
				$(this.hash).addClass("active").siblings().removeClass("active");
			});

			let active = triggers.filter(".active");
			if (!active.length) {
				active = triggers.first();
			}
			active.trigger("click");

			window.addEventListener("keydown", (event) => {
				if (!triggers.is(event.target)) return;
				if (!(event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowUp")) return;

				event.preventDefault();

				let dir = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;

				let idx = (triggers.index(event.target) + triggers.length + dir) % triggers.length;

				triggers.eq(idx).trigger("click").trigger("focus");
			});
		});
	}

	setScrollTo() {
		$("[data-scroll-to]").on("click", function (e) {
			e.preventDefault();
			let target = $(this).attr("data-scroll-to");
			$([document.documentElement, document.body]).animate(
				{
					scrollTop: $(target).offset().top - 150,
				},
				300
			);
		});
	}
	setClickTrigger() {
		$("[data-click-trigger]").on("click", function (e) {
			e.preventDefault();
			let target = $(this).attr("data-click-trigger");
			$(target).trigger("click");
		});
	}

	setSpecialCardGallery() {
		const catalogCardGallery = new Swiper('.catalog-item-carousel', {
			pagination: {
				el: '.swiper-pagination',
			},
			on: {
				afterInit: function (swiper) {
					if ($(window).width() > 992) {
						let $paginationItems = $(swiper.el).find('span.swiper-pagination-bullet')

						$paginationItems.on('mouseenter', (e) => {
							swiper.slideTo($paginationItems.index(e.currentTarget), 0)
						})
					}
				}
			}
		});
	}


})();

