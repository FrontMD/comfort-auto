let application = {
    // Инициализация
    init: function(params) {
        this.params = params;

        $('form[data-justwe-form]').tortikFormSender();

		//Удаляем куки, если в шапке выбрали Вся Россия
		$('.popup-region__item').click(function(){
			if($(this).data('name') == 'Ростов') {
                $.cookie('region-slug', '0', '/');
			}else{
                $.cookie('region-slug', $(this).data('subdomain'), '/');
            }
		});

        this.popupsInit();
        this.timersInit();
    },

    pages: {

        pageIndex: function() {
            application.filterInit();
            this.init = function() {
            }
            this.init();
        },

        pageMark: function() {
            application.filterInit();
            application.filterInit();
            this.init = function() {
            }
            this.init();
        },

        pageModels: function() {
            application.filterInit();
            this.init = function() {
            }
            this.init();
        },

        pageSpecials: function() {
            // Инициализация
            this.init = function() {
                this.specialFilter();
            }

            // Фильтр на спецах
            this.specialFilter = function() {
                let filter = {},
                    filterData = {},
                    form = $('.js-special-form'),
                    changeMark = $(form).find('.js-special-change-mark'),
                    changeModel = $(form).find('.js-special-change-model'),
                    changeGearbox = $(form).find('.js-special-gearbox-change'),
                    changePriceTo = $(form).find('.js-special-price-to'),
                    сhangeType = $(form).find(".js-filter-change-type"),
                    changeDrive = $(form).find(".js-filter-change-drive"),

                    btn = $(form).find('.js-special-btn')
                    
                    queryString = {};

                // Получаем данные из запроса
                location.search.substr(1).split("&").forEach(function(item) {queryString[item.split("=")[0]] = item.split("=")[1]});

                // Закодировать строку запроса
                function encodeQueryData(data) {
                    let ret = [];

                    for (var d in data) { ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d])); }
                        
                    return ret.join('&');
                }

                // Подсчет кол-ва спецпредложений
                function countSpecial() {
                    $(btn).attr('disabled', true);

                    $.ajax({
                        url: '/car/countAssortment?' + encodeQueryData(filter),
                        method: 'GET',

                        success: function(data) {
                            let count = parseInt(data.trim());

                            if(count === 0) {
                                $(btn).text('Автомобили не найдены').attr('disabled', true);
                            } else {
                                $(btn).text('Найдено ' + count + ' авто').attr('disabled', false);
                            }
                        }
                    });
                }

                // Отправка формы (чистим пустые поля)
                form.submit(function() {
                    $(':input', this).each(function() { this.disabled = !($(this).val()); });
                    $('select', this).each(function() { if($(this).val() == '0') { this.disabled = true; } });
                });

                // Изменение марки
                changeMark.change(function() {
                    delete filter['mark_id'];

                    changeModel.html('<option value="0" selected>Модель</option>');

                    filter['mark_id'] = $(this).val();
            
                    $.ajax({
                        url: '/car/assortment/model/' + filter['mark_id'],
                        method: 'POST',

                        beforeSend: function() {
                            countSpecial();
                        },
            
                        success: function(data) {
                            filterData = {};

                            for(let key in data) {
                                changeModel.append(
                                    $('<option>', { value : data[key].id }).text(data[key].name)
                                );
            
                                filterData[ data[key].id ] = data[key];
                            }        

                            // Если есть ID модели, то подставим
                            if(queryString['body_id'] !== undefined) { changeModel.val(queryString['body_id']).change(); delete queryString['body_id']; }
                        }
                    })
                });

                // Изменение модели
                changeModel.change(function() {
                    delete filter['body_id'];
                    let value = $(this).val();
                    if(value !== '' && value !== '0' && value !== 0) { 
                        filter['body_id'] = value; 
                    }
                    countSpecial();
                });

                changeDrive.change(function() {
                    delete filter['drive'];
                    let value = $(this).val();
                    if(value !== '' && value !== '0' && value !== 0) { 
                        filter['drive'] = value; 
                    }
                    countSpecial();
                });

                сhangeType.change(function() {
                    delete filter['type'];
                    let value = $(this).val();
                    if(value !== '' && value !== '0' && value !== 0) { 
                        filter['type'] = value; 
                    }
                    countSpecial();
                });

                // Изменение коробки передач
                changeGearbox.change(function() {
                    delete filter['gearbox'];
                    let value = $(this).val();
                    if(value !== '' && value !== '0' && value !== 0) { 
                        filter['gearbox'] = value; 
                    }
                    countSpecial();
                });

                // Изменение "Цены до"
                changePriceTo.keyup(function() {
                    delete filter['price_to'];
                    let value = $(this).val();
                    if(value !== '' && value !== '0' && value !== 0) { 
                        filter['price_to'] = value; 
                    }
                    countSpecial();
                });

                // Инициализация
                (function() {
                    if(queryString['mark_id'] !== undefined) { changeMark.val(queryString['mark_id']).change(); }
                    if(queryString['gearbox'] !== undefined) { changeGearbox.val(decodeURI(queryString['gearbox'])).change(); }
                    if(queryString['price_to'] !== undefined) { changePriceTo.val(queryString['price_to']).change(); }
                })();
            }

            this.init();
        },
        
        pageModel: function () {
            let self = this;
        
            // Процентная ставка
            this.percentRate = application.params.percentRate;
        
            // Инициализация
            this.init = function () {
                this.complectationCompare();
                this.calculatePriceForComplectation();
                this.colorSelect();
            };

            this.colorSelect = function(){
                $('.js-color-select').click(function(){
                    $('.js-color-select').removeClass('current');
                    $(this).addClass('current');
                    $('.js-color-picture').attr('src', $(this).data('image'));
                    $('.js-color-name').text($(this).data('name'));
                })
            }
        
            // Расчет цены в комплектациях по чекбоксам
            this.calculatePriceForComplectation = function () {
                $(".js-check-credit, .js-check-tradein, .js-check-util").click(
                    function () {
                        parent = $(this).closest(".js-checked-table");
                        var total = $(parent).data("price");
                        parent.find(".checkbox").each(function (index) {
                            if ($(this).is(":checked") === true) {
                                total = total - parseInt($(this).val());
                            }
                        });
                        $(parent).find(".js-inner-price").text(tortik.pf(total + ""));
                    }
                );
            };
        
            this.complectationCompare = function () {
                let btnCompareComplectation = $(".js-btn-compare-complectation"),
                    compareCheckbox = $(".compare-checkbox");
        
                btnCompareComplectation.click(function (event) {
                    let isOnceChecked = false,
                        form = "";
        
                    form +=
                        '<form id="compare-form" action="/auto/compare" method="post" style="display:none;">';
                    form +=
                        '<input type="hidden" name="_token" value="' +
                        $('meta[name="csrf-token"]').attr("content") +
                        '" />';
        
                    compareCheckbox.each(function () {
                        if (this.checked) {
                            form +=
                                '<input checked type="checkbox" value="' +
                                $(this).val() +
                                '" name="complectation_id[]" />';
        
                            isOnceChecked = true;
                        }
                    });
        
                    if (!isOnceChecked) {
                        alert("Выберите комплектацию");
        
                        event.preventDefault();
                        return;
                    }
        
                    form += "</form>";
        
                    $(document.body).append(form);
                    $("#compare-form").submit();
                });
            };



        
            this.init();
        },

        pageCredit: function () {
            let form = $(".js-form-credit-page");
      
            this.percentRate = application.params.percentRate;
      
            this.init = function () {
              this.initCreditPage();
            };
      
            this.initCreditPage = function () {
              form.tortikForm({
                changeModel: ".js-change-model",
                changeComplectation: ".js-change-price",
                changeMark: ".js-change-mark",
      
                changeInitialPayment: ".js-change-intial-payment",
                changeCreditTerm: ".js-change-credit-term",
                textCarComplectationName: ".js-car-complectation",
                textCarMark: ".js-car-mark",
                textCarName: ".js-car-name",
                textCarPrice: ".js-car-price",
                textCarPriceOld: ".js-car-price-old",
                textCarBenefit: ".js-car-benefit",
                textMountPayment: ".js-mount-payment",
                textCreditTerm: ".js-credit-term",
      
                imgCarPreview: ".js-car-preview",
      
                emptyPreview: "/assets/img/car-placeholder.png",
      
                autoSelectFirstComplectation: true,
      
                credit: {
                  percentRate: application.params.percentRate,
                  creditTerm: 84,
                  initialPayment: 0,
                },
              });
            };
      
            this.init();
          },
    },

    filterInit: function () {
        let filter = $(".js-main-filter");
    
        filter.tortikFilter({
          сhangeType: ".js-filter-change-type",
          changeGearbox: ".js-filter-change-gearbox",
          changeDrive: ".js-filter-change-drive",
          changeMark: ".js-filter-change-mark",
          changeBody: ".js-filter-change-model",
          changePriceFrom: ".js-filter-change-price-from",
          changePriceTo: ".js-filter-change-price-to",
          btn: ".js-filter-btn",
        });
    },

    popupsInit: function() {
        
        this.init = function() {
            this.popupCredit();
            this.popupTradein();
        }

        this.popupCredit = function() {
            let popup = $('#popup-credit'),
                btn = $('[href="#popup-credit"]');

            btn.click(function() {
                popup.find('.js-car-name').text($(this).data('car'));
                popup.find('.js-car-preview').attr('src', $(this).data('preview'));
                
                popup.find('[name="car"]').text($(this).data('name'));
                popup.find('[name="mark"]').text($(this).data('mark'));

                popup.find('[name="brand_id"]').text($(this).data('mark-id'));
                popup.find('[name="model_id"]').text($(this).data('model-id'));

                popup.find('[name="model"]').text($(this).data('model'));
                popup.find('[name="price"]').text($(this).data('price'));
                popup.find('[name="body"]').text($(this).data('body'));
                popup.find('[name="complectation"]').text($(this).data('complectation'));                   
            });
        }

        this.popupTradein = function() {
            let popup = $('#popup-tradein'),
                btn = $('[href="#popup-tradein"]');

            btn.click(function() {
                popup.find('.js-car-name').text($(this).data('car'));
                popup.find('.js-car-preview').attr('src', $(this).data('preview'));
                
                popup.find('[name="car"]').text($(this).data('name'));
                popup.find('[name="brand_id"]').text($(this).data('mark-id'));
                popup.find('[name="model_id"]').text($(this).data('model-id'));

                popup.find('[name="mark"]').text($(this).data('mark'));
                popup.find('[name="model"]').text($(this).data('model'));
                popup.find('[name="price"]').text($(this).data('price'));
                popup.find('[name="body"]').text($(this).data('body'));
                popup.find('[name="complectation"]').text($(this).data('complectation'));   
            });
        }

        this.init();
 
    },

    timersInit: function () {
        let self = this;
    
        // Таймеры
        this.timers = {
            main: tortik.createTimer({
                name: 'main'
            }),
    
            model: tortik.createTimer({
                name: 'model',
                defer: true
            }),
        };
    
        // Всплывашки
        this.popups = {};
    
        /*
        // Обратный звонок
        this.popups.callback = tortik.createPopup({
            name: 'popup-feedback',
            target: '#popup-feedback',
            timer: this.timers.main,
            event: 'timer',
            delay: 80
        });
        */
    
        // Догоняющая с модели
        this.popups.creditCar = tortik.createPopup({
            name: 'popup-benefit',
            target: '#popup-benefit',
            timer: this.timers.model,
            event: 'timer',
            delay: 20,
    
            onShow: function (payload) {
                let modal = $("#popup-benefit");
    
                modal.find('input[name="mark"]').val(payload.mark);
                modal.find('input[name="model"]').val(payload.model);
                modal.find('input[name="complectation"]').val(payload.complectation);
                modal.find('input[name="price"]').val(payload.price);
                modal.find('input[name="car"]').val(payload.name);
                modal.find('input[name="brand_id"]').val(payload.mark_id);
                modal.find('input[name="model_id"]').val(payload.model_id);

                modal.find(".js-complectation-name").text(payload.complectation);
                modal.find(".js-car-name").text(payload.name);
                modal.find(".js-car-mark").text(payload.mark);
                modal.find(".js-car-model").text(payload.model);
                modal.find(".js-car-price").text(payload.price);
                modal.find(".js-car-payment").text(payload.payment);
                modal.find(".js-car-preview").attr("src", payload.preview);
            }
        });
    }
}