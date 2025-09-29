(function($) {
    $.fn.tortikForm = function(options) {
        const defaultOptions = {
            changeMark: null, // select2 для изменения марки
            changeModel: null, // select2 для изменения модели
            changeComplectation: null, // select2 для изменения комплектации

            changeInitialPayment: null, // select2 для изменения первоначального взноса
            changeCreditTerm: null, // select2 для изменения срока кредита

            textCarMark: null, // Марка автомобиля
            textCarName: null, // полное название тачки
            textCarComplectationName: null, // название комлектации
            textCarModificationName: null, // название модификации
            textCarPrice: null, // цена на тачку со скидкой
            textCarPriceOld: null, // цена на тачку без скидки
            textCarBenefit: null, // выгода на тачку
            textMountPayment: null, // ежемесячный платеж
            textInitialPaymen: null, // первоначальный взнос
            textCreditTerm: null, // срок кредита

            imgCarPreview: null, // картинка тачки

            autoMarkId: null, // id марки (для монобрендов)
            autoMarkName: null, // название марки (для монобрендов)

            priceMointPaymentFactor: 1, // коэффициент увеличиения ежемесячного платежа

            autoSelectFirstComplectation: false, // выбирать ли по-умолчанию первую комплектацию

            emptyPreview: "/assets/img/not-found.png", // пустой автомобиль
            emptyString: "...", // строка для пустых значений

            credit: {
                percentRate: null, // пример: 0.01
                creditTerm: null, // пример: 84 - в месяцах
                initialPayment: null, // пример: 20 - в процентах
                cost: null // пример: 235351 - в рублях
            }
        };

        // Данные по расчету кредита
        this.credit = $.extend(defaultOptions.credit, options.credit);

        // Наследуем параметры плагина
        options = $.extend(defaultOptions, options);

        // Основные элменты DOM дерева
        let changeMark = $(this).find(options.changeMark),
            changeModel = $(this).find(options.changeModel),
            changeComplectation = $(this).find(options.changeComplectation),
            
            changeInitialPayment = $(this).find(options.changeInitialPayment),
            changeCreditTerm = $(this).find(options.changeCreditTerm),
            
            textCarMark = $(this).find(options.textCarMark),
            textCarName = $(this).find(options.textCarName),
            textCarComplectationName = $(this).find(options.textCarComplectationName),
            textCarModificationName = $(this).find(options.textCarModificationName),
            textCarPrice = $(this).find(options.textCarPrice),
            textCarPriceOld = $(this).find(options.textCarPriceOld),
            textCarBenefit = $(this).find(options.textCarBenefit),
            textMountPayment = $(this).find(options.textMountPayment),
            textInitialPayment = $(this).find(options.textInitialPayment),
            textCreditTerm = $(this).find(options.textCreditTerm),
            
            imgCarPreview = $(this).find(options.imgCarPreview)
            
            inputMark = $(this).find('input[name="mark"]'),
            inputModel = $(this).find('input[name="model"]'),
            inputCar = $(this).find('input[name="car"]'),
            inputComplectation = $(this).find('input[name="complectation"]'),
            inputPrice = $(this).find('input[name="price"]'),
            inputBrandId = $(this).find('input[name="brand_id"]'),
            inputModelId = $(this).find('input[name="model_id"]'),

            inputNeedCarMark = $(this).find('input[name="need_car_mark"]'),
            inputNeedCarModel = $(this).find('input[name="need_car_model"]'),
            inputNeedCarName = $(this).find('input[name="need_car_name"]'),
            inputNeedCarPrice = $(this).find('input[name="need_car_price"]');
            
        // Данные по ценам и ссылка на плагин
        let priceData = {}, bodyData = {}, plugin = this;

        // Инициализация плагина
        this.initialization = function() {
            // Если задан ежемесячный платеж, то изменим его в DOM
            if(this.credit.initialPayment !== null) {
                changeInitialPayment.val(plugin.credit.initialPayment).change();
            }

            // Если задан срок кредита, то изменим его в DOM
            if(this.credit.creditTerm !== null) {
                changeCreditTerm.val(plugin.credit.creditTerm).change();
            }

            // Если задан id марки и название марки (для монобрендов)
            if(options.autoMarkId !== null && options.autoMarkName !== null) {
                this.loadModeles();
            }
        }

        // Загрузка данных по моделям
        this.loadModeles = function() {
            plugin.reset('mark');

            let markId = markName = null;

            // Если задан id марки и название марки (для монобрендов)
            if(options.autoMarkId !== null && options.autoMarkName !== null) {
                markId = options.autoMarkId;
                markName = options.autoMarkName;
            } else {
                markId = $(this).val();
                markName = $(this).find(":selected").text();
            }

            inputBrandId.val(markId);
            inputModelId.val("");


            textCarMark.text(markName);

            // Установим значения для input
            inputMark.val(markName);
            inputNeedCarMark.val(markName);
            
            $.ajax({
                url: '/car/model/' + markId,
                method: 'POST',
    
                success: function(data) {
                    for(var key in data) {
                        changeModel.append(new Option(data[key].name, data[key].id));
                        bodyData[data[key].id] = data[key];
                    }          
                }
            })
        }

        // Событие при изменении марки
        changeMark.change(this.loadModeles);

        // Событие при изменении модели
        changeModel.change(function() {
            plugin.reset('model');

            var bodyId = $(this).val();
            inputModelId.val(bodyId);

            let markName = changeMark.find(":selected").text(),
                modelName = bodyData[bodyId].name;

            $.ajax({
                url: '/car/price/' + bodyId,
                method: 'POST',
    
                success: function(data) {
                    // Зададим картинки для тачки
                    imgCarPreview.attr('src', bodyData[bodyId].preview);

                    // Установим полное название автомобиля
                    textCarName.text(markName + " " + modelName);

                    // Установим значения для input
                    inputModel.val(modelName);
                    inputCar.val(markName + " " + modelName);
                    inputNeedCarModel.val(modelName);
                    inputNeedCarName.val(markName + " " + modelName);
  
                    for(var key in data) {
                        var option = $('<option value="' + data[key].id + '" data-price="' + data[key].price + '">', { value : data[key].id }).text(data[key].name + " - " + tortik.pf(data[key].price + "") + ' руб.');
                        changeComplectation.append(option);
                        priceData[data[key].id] = data[key];
                    }

                    // Выбираем первую комплектацию
                    if(options.autoSelectFirstComplectation === true) {
                        changeComplectation.val( changeComplectation.find('option:eq(1)').val() ).trigger('change');
                    }
                }
            });
        });

        // Смена комплектации (цены)
        changeComplectation.change(function() {
            let priceId = $(this).val(),
                price = priceData[priceId].price,
                priceOld = priceData[priceId].price_old,
                modificationName = priceData[priceId].modification_name,
                complectationName = priceData[priceId].complectation_name
                fullPriceName = $(this).find(":selected").text();

            // Установим название модификации
            textCarModificationName.text(modificationName);

            // Установим название комплектации
            textCarComplectationName.text(complectationName);

            // Установим цену на автомобиль
            textCarPrice.text(tortik.pf(price));

            // Установим старую цену на автомобиль
            textCarPriceOld.text(tortik.pf(priceOld));

            // Установим выгоду
            textCarBenefit.text(tortik.pf(priceOld - price));

            // Установим значения для input
            inputComplectation.val(fullPriceName);
            inputPrice.val(tortik.pf(price));
            inputNeedCarPrice.val(tortik.pf(price));
            inputNeedCarName.val(modificationName +  ' '  + complectationName);

            plugin.credit.cost = price;

            // Установим первоначальный взнос
            if(plugin.credit.cost !== null && plugin.credit.initialPayment !== null) {
                textInitialPayment.text(tortik.pf(Math.round(plugin.credit.cost / 100 * plugin.credit.initialPayment)));
            }

            plugin.renderMountPayment();
        });

        // Смена первоначальный взнос
        changeInitialPayment.change(function() {
            plugin.credit.initialPayment = parseInt($(this).val());

            // Установим первоначальный взнос
            if(plugin.credit.cost !== null && plugin.credit.initialPayment !== null) {
                textInitialPayment.text(tortik.pf(Math.round(plugin.credit.cost / 100 * plugin.credit.initialPayment)));
            }

            plugin.renderMountPayment();
        });

        // Смена срока кредита
        changeCreditTerm.change(function() {
            plugin.credit.creditTerm = parseInt($(this).val());

            // Установим срок кредита
            textCreditTerm.text(plugin.credit.creditTerm);

            plugin.renderMountPayment();
        });

        // Расчет платежа на основе входных параметров
        this.renderMountPayment = function() {
            if(this.credit.percentRate !== null && this.credit.creditTerm !== null && this.credit.initialPayment !== null && this.credit.cost !== null) {
                let mountPayment = tortik.getMountPayment(this.credit.cost, this.credit.percentRate, this.credit.creditTerm, this.credit.initialPayment / 100) * options.priceMointPaymentFactor;

                textMountPayment.text(tortik.pf(mountPayment));
            }
        }

        // Сброс значений полей
        this.reset = function(step) {
            if(step === 'mark') {
                plugin.credit.cost = null;

                changeModel.html('<option disabled selected>Выберите модель</option>');
                changeComplectation.html('<option disabled selected>Выберите комплектацию</option>');

                textCarName.text(options.emptyString);
                textCarComplectationName.text(options.emptyString);
                textCarModificationName.text(options.emptyString);
                textCarPrice.text(options.emptyString);
                textCarPriceOld.text(options.emptyString);
                textMountPayment.text(options.emptyString);
                textCarBenefit.text(options.emptyString);
                textInitialPayment.text(options.emptyString);

                imgCarPreview.attr('src', options.emptyPreview);
                
                inputMark.val('');
                inputModel.val('');
                inputCar.val('');
                inputComplectation.val('');
                inputPrice.val('');
                inputNeedCarMark.val('');
                inputNeedCarModel.val('');
                inputNeedCarName.val('');
                inputNeedCarPrice.val('');
            }

            if(step === 'model') {
                plugin.credit.cost = null;

                changeComplectation.html('<option disabled selected>Выберите комплектацию</option>');

                textCarComplectationName.text(options.emptyString);
                textCarModificationName.text(options.emptyString);
                textCarPrice.text(options.emptyString);
                textCarPriceOld.text(options.emptyString);
                textMountPayment.text(options.emptyString);
                textCarBenefit.text(options.emptyString);
                textInitialPayment.text(options.emptyString);

                inputComplectation.val('');
                inputPrice.val('');
                inputNeedCarPrice.val('');
            }
        }

        this.initialization();
    };

    $.fn.tortikFilter = function(options) {
        const defaultOptions = {
            baseUrl: '/auto',
            ajaxCountResultUrl: '/car/countCar',

            changeMark: null, // Измение марки
            changeBody: null, // Изменение кузова
            сhangeType: null, // Изменения типа кузова
            changeGearbox: null, // Изменение коробки передач
            changeDrive: null, // Изменение привода
            changePriceFrom: null, // Цена от
            changePriceTo: null, // Цена до

            autoMarkId: null, // Автоматически задавать ID марки
            autoBodyId: null, // Автоматически задавать ID кузова

            btn: null, // кнопка отправки фильтра
            btnReset: null // кнопка сброса фильтра
        };

        // Наследуем параметры плагина
        options = $.extend(defaultOptions, options);

        // Основные элменты DOM дерева
        let filter = {},
            changeMark = $(this).find(options.changeMark),
            changeBody = $(this).find(options.changeBody),
            сhangeType = $(this).find(options.сhangeType),
            changeGearbox = $(this).find(options.changeGearbox),
            changeDrive = $(this).find(options.changeDrive),
            changePriceFrom = $(this).find(options.changePriceFrom),
            changePriceTo = $(this).find(options.changePriceTo),

            btn = $(this).find(options.btn),
            btnReset = $(this).find(options.btnReset),

            filterLink = options.baseUrl;
                
        // Инициализация плагина
        this.initialization = function() {
            $([changeMark, changeBody, сhangeType, changeGearbox, changeDrive, changePriceFrom, changePriceTo]).each(function() {
                if(this.prop("tagName") === 'INPUT') {
                    $(this).keyup(onChangeFilterValue);
                } else if(this.prop("tagName") === 'SELECT') {
                    $(this).change(onChangeFilterValue);
                } else {
                    return;
                }

                let name = $(this).attr('name'),
                    value = $(this).val();
        
                if(!isFilterParamEmpty(value)) {
                    setFilterParam(name, value);
                }
            });

            // Если задан ID марки, то подгрузим модели
            if(options.autoMarkId !== null) {
                changeMark.val(options.autoMarkId).trigger('change'); options.autoMarkId = null;
            }

            // Если есть данные в фильтре, подгрузим кол-во тачек
            if(Object.keys(filter).length > 0) {
                filterCountRecords();
            }else{
                filterCountRecords();
            }
        }

        // Изменение марки
        changeMark.change(function() {
            let markId = $(this).val();

            setFilterParam('mark_id', markId);

            $.ajax({
                url: '/car/model/' + markId,
                method: 'POST',

                beforeSend: function() {
                    changeBody.html('<option value="0" selected>Модель</option>');
                },

                success: function(data) {
                    for(var key in data) {
                        changeBody.append(new Option(data[key].name, data[key].id));
                    }

                    // Если задан ID кузова, то поставим активный
                    if(options.autoBodyId !== null) {
                        changeBody.val(options.autoBodyId).trigger('change'); options.autoBodyId = null;
                    } else {
                        changeBody.val(0).trigger('change');
                    }
                    
                    filterCountRecords();
                }
            })
        });

        // Клик по кнопке с результатами
        btn.click(function(event) {
            event.preventDefault();

            document.location.href = filterLink;
        });

        // Клик по кнопке сброса
        btnReset.click(function(event) {
            event.preventDefault();

            changeMark.val(0).change();
            changeBody.html('<option value="0" selected>Модель</option>').change();
            сhangeType.val(0).change();
            changeGearbox.val(0).change();
            changeDrive.val(0).change();
            changePriceFrom.val('').change();
            changePriceTo.val('').change();

            filterCountRecords();
        });

        // Изменение (выбор) фильтра
        function onChangeFilterValue() {
            let name = $(this).attr('name'),
                value = $(this).val();

            setFilterParam(name, value);

            filterCountRecords();
        };   

        // Установить значение фильтра
        function setFilterParam(key, value) {
            if(isFilterParamEmpty(value)) {
                delete filter[key];
            } else {
                filter[key] = value;
            }
        }

        // Проверка параметра фильтра на пустоту
        function isFilterParamEmpty(value) {
            return (value == '' || value == 0 || value == undefined || value == null);
        }

        // Закодировать query
        function encodeQueryData(data) {
            var ret = [];

            for (var d in data) {
                ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
            }
                
            return ret.join('&');
        }

        // Получить кол-во фильтрованных авто
        function filterCountRecords() {
            var query = encodeQueryData(filter);

            $.ajax({
                url: options.ajaxCountResultUrl + '?' + query,
                method: 'GET',
                success: function(count) {
                    var count = parseInt(count.trim());

                    if(count == 0) {
                        $(options.btn).addClass('disabled').attr('disabled', true).text('Автомобили не найдены');
                    } else {
                        $(options.btn).removeClass('disabled').attr('disabled', false).text('Найдено ' + count + ' авто');

                        filterLink = options.baseUrl + '?' + query;
                    }
                }
            });       
        }

        this.initialization();
    }; 
      
    $.fn.tortikFormSender = function(options) {
        var defaultOptions = {
            // Отправлять ли форму на сервер
            send: true,
            // Callback на успешную валидацию
            isSuccessValidation: function() {}
        };

        options = $.extend(defaultOptions, options);

        this.submit(function() {
            $(this).find('*').removeClass('has-error');

            if(window.call_value != undefined) {
                // id сессии для Calltouch
                $(this).find('input[name="call_value"]').val(window.call_value);
            }

            var validate = true;
            var targetErrors = new Array();

            // Проверяем обязательные поля для заполнения
            $(this).find('input[data-justwe-form-required]').each(function() {
                var value = $(this).val().trim();

                if(value === undefined || value === null || value === '') {
                    $(this).addClass('has-error');

                    targetErrors.push(this);

                    validate = false;
                }
            });

            // чекбоксы
            $(this).find('input[type="checkbox"][data-justwe-form-required]').each(function() {
                var value = $(this).val().trim();

                if( !$(this).is(':checked') ) {
                	$(this).closest('label').addClass('has-error');

                    targetErrors.push(this);

                    validate = false;
                }
            });

            // выпадающие списки
            $(this).find('select[data-justwe-form-requiredd]').each(function() {
                var value = $(this).val();

                if(typeof value === 'string' || value instanceof String) {
                    value = value.trim();
                }

                if(value === undefined || value === null || value === '' || value === '0') {
                    if( $(this).hasClass('select2') ) {
                        $(this).find('+ span .select2-selection').addClass('has-error');    
                    } else {
                        $(this).addClass('has-error');
                    }
                    
                    targetErrors.push(this);

                    validate = false;
                }
            });


            if( $(this).has('input[name="mail"]').length > 0 ) {
                var regExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                var email = $(this).find('input[name="mail"]');
                if( !regExp.test( $(email).val() ) ) {
                    $(email).addClass('has-error');
                    $('.error').addClass('has-error');

                    targetErrors.push(this);

                    validate = false;
                } else {
                    $('.error').removeClass('has-error');
                }
            }

            // Если есть ошибки, то не отправляем форму
            if(validate === false) {
                if( targetErrors.length > 0 ) {
                    // Делаем фокус на элементе с ошибкой
                    $(targetErrors[targetErrors.length - 1]).focus();
                }

                return false;
            } else {
                if( $(this).is('[data-justwe-metrica]') ) {
                    eval( $(this).attr('data-justwe-metrica') );
                }

                // Получение все данных с форм
                var formData = $(this).serializeArray();
                var data = {};
                $(formData).each(function(index, obj) {
                    data[obj.name] = obj.value;
                });

                options.isSuccessValidation(data);
            }   

            // Отправлять ли форму на сервер
            if( options.send === false ) {
                event.preventDefault();
            }
        });
           

        // Если в форме есть телефон, то делаем его "умным" и добавляем маску        
        if( $(this).has('input[name="telephone"]').length > 0 ) {
            var telephone = $(this).find("input[name='telephone']");

            $(telephone).mask("+7 (999) 999-99-99");
            $(telephone).keydown(function(event) {
                if(event.keyCode === 37 || event.keyCode === 39) {
                    return false;
                }

                var value = ($(this).val().replace(/[^\d;]/g, '')) + event.key;

                if (value == '70' || value == '71' || value == '72' || value == '75' || value == '76' || value == '77') {
                    return false;
                }

                if (value === '789') {
                    $(this).val('9').trigger('paste');

                    return false;
                } 
                if (value === '73') {
                    $(this).val('').trigger('paste');

                    return false;
                }      
                if (value === '78') {
                    $(this).val('').trigger('paste');

                    return false;
                }               
            });   

            // Перемещаем курсор в начало экрана
            $(telephone).mouseup(function(event) {
                // Оставляем только цифры и удаляем первый символ
                var value = $(this).val().replace(/[^\d;]/g, '').slice(1);

                $(this).val(value).trigger('input');
            });     
        }

        //Запрет ввода, кроме букв
        $("input[justwe-form-only-letter]").keypress(function( b ){
            var C = /[ a-zA-Zа-яА-Я]/;
            var a = b.which;
            var c = String.fromCharCode(a);
            return !!(a==0||a==8||a==9||a==3||c.match(C));
        });

        //Удаляем символы кроме букв при вставке
        $("input[justwe-form-only-letter]").bind('keyup blur',function() { 
            $(this).val($(this).val().replace(/[^ a-zA-Zа-яА-Я]/g,'') ); 
        });
    };
})(jQuery);

var tortik = {};

// Заблокировать попапы
tortik.blockPopups = function() {
    sessionStorage.setItem('popup-block', 1);
}

// Разбликровать показ попапов
tortik.unblockPopup = function() {
    sessionStorage.setItem('popup-block', 0);
}

// Открыт ли попап
tortik.isPopupBusy = function() {
    return (sessionStorage.getItem('popup-block', 1) === 1);
}

// Создать попап
tortik.createPopup = function(options) {
    return new tortik.popupsManager(options);
}

// Создать таймер
tortik.createTimer = function(options) {
    return new tortik.timerManager(options);
}

// Управление попапом
tortik.popupsManager = function(options) {
    const defaultOptions = {
        name: '', // Название попапа
        target: '', // Селектор в DOM
        timer: null, // Таймер
        event: 'timer', // События (timer/unfocus)
        delay: 0, // Задержка
        isShow: 0, // Показан ли попап
        payload: {} // Данные для показа
    };   

    let intervalID = null;
    let self = this;

    this.options = $.extend(defaultOptions, options);

    // Иницилизация
    this.init = function() {
        if(sessionStorage.getItem(this.getSessionStoragePopupName()) !== null) {
            this.unserialize();
        }

        this.serialize();

        if(this.options.isShow === 0) {
            // Показать по таймеру
            if(this.options.event === 'timer') {
                intervalID = setInterval(this.watcher.bind(this), 1000);
            }
            
            // Показать при выходе пользователя
            if(this.options.event === 'unfocus') {}
        }
    }

    // Следим за таймером
    this.watcher = function() {
        this.unserialize();

        if(options.timer.getSeconds() >= this.options.delay) {
            this.show();

            clearInterval(intervalID);
        }

        this.serialize();
    }

    // Показать попап
    this.show = function() {
        if(self.options.onShow !== undefined) {
            self.options.onShow.call(self, this.options.payload);
        }

        $.fancybox.open({
            src: this.options.target,

            afterClose: function() {
                // Событие при закрытии попапа
                if(self.options.onClose !== undefined) {
                    self.options.onClose.call(self);
                }
            }
        });

        this.options.isShow = 1;
    }

    // Название таймера для sessionStorage
    this.getSessionStoragePopupName = function() {
        return 'popup-' + this.options.name;
    }

    // Показать попап заново
    this.reinit = function() {
        // Показать по таймеру
        if(this.options.event === 'timer') {
            intervalID = setInterval(this.watcher.bind(this), 1000);
        }
        
        // Показать при выходе пользователя
        if(this.options.event === 'unfocus') {}

        this.options.isShow = 0;

        this.serialize();
    }

    // Установить данные
    this.setPayload = function(data) {
        this.options.payload = data;

        this.serialize();
    }

    // Получить данные
    this.getPayload = function() {
        return this.options.payload;
    }
    
    // Показывалась ли всплывашка
    this.isShow = function() {
        return (parseInt(this.options.isShow) === 1)
    }

    // Подготовить данные для сохранения в сессии
    this.serialize = function() {
        sessionStorage.setItem(this.getSessionStoragePopupName(), JSON.stringify({
            isShow: this.options.isShow,
            payload: this.options.payload
        }));
    }

    // Получить данные из сессии
    this.unserialize = function() {
        let data = JSON.parse(sessionStorage.getItem(this.getSessionStoragePopupName()));

        this.options.isShow = data.isShow;
        this.options.payload = data.payload;
    }

    this.init();
}

// Управление таймеров
tortik.timerManager = function(options) {
    const defaultOptions = {
        name: 'main',
        seconds: 0,
        defer: false,
        exceptPages: []
    };

    this.options = $.extend(defaultOptions, options);

    this.paused = false;

    // Иницилизация
    this.init = function() {
        if(sessionStorage.getItem(this.getSessionStorageTimerName()) === null) {
            this.options.seconds = 0;
        } else {
            this.unserialize();
        }

        this.serialize();

        setInterval(this.tick.bind(this), 1000);
    }

    // Включен ли таймер
    this.isRunning = function() {
        return !this.options.defer;
    }

    // Запустить таймер (нужно для defer)
    this.start = function() {
        this.options.defer = false;

        this.serialize();
    }

    // Остановить таймер (нужно для defer)
    this.stop = function() {
        this.options.defer = true;

        this.serialize();
    }

    // Поставить таймер на паузу
    this.pause = function() {
        this.paused = true;
    }

    // Сбросить таймер
    this.reset = function() {
        this.options.seconds = 0;

        this.serialize();
    }

    // Вычитаем время
    this.minus = function(seconds) {
        this.options.seconds = this.options.seconds - seconds;

        this.serialize();
    }

    // Тик в 1 секунду
    this.tick = function() {
        // Пробежимся по страницам исклюсениям
        for(let key in this.options.exceptPages) {
            let pattern = this.options.exceptPages[key];

            // Если страница попадает под исключение, не включаем таймер
            if(document.location.href.match(pattern)) { return false; }
        }

        this.unserialize();

        // Если таймер не на паузе
        if(!this.paused) {
            // Если таймер отложен
            if(!this.options.defer) {
                // Если документ активный и fancybox открыт
                if(document.hasFocus() && !$('.fancybox-container').hasClass('fancybox-is-open') && !$('input').is(":focus") ) {
                    if(this.options.beforeIncrease !== undefined) { this.options.beforeIncrease.call(this); }

                    sessionStorage.setItem(this.getSessionStorageTimerName(), ++this.options.seconds);

                    if(this.options.afterIncrease !== undefined) { this.options.afterIncrease.call(this); }
                }
            }
        }
        
        this.serialize();
    }

    // Получить кол-во секунд
    this.getSeconds = function() {
        return this.options.seconds;
    }

    // Название таймера для sessionStorage
    this.getSessionStorageTimerName = function() {
        return 'timer-' + this.options.name;
    }

    // Подготовить данные для сохранения в сессии
    this.serialize = function() {
        sessionStorage.setItem(this.getSessionStorageTimerName(), JSON.stringify(this.options));
    }

    // Получить данные из сессии
    this.unserialize = function() {
        this.options = JSON.parse(sessionStorage.getItem(this.getSessionStorageTimerName()));
    }

    this.init();
}

// Выравнивание цены
tortik.pf = function(str) {
    return (str + "").replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
}

// Расчет ежемесячного платежа
tortik.getMountPayment = function(price, percent, term, initialPaymentRate = 0) {
    price = price - price * initialPaymentRate;

    if(percent === 0) {
        return Math.round(price / term);
    }
    
    percent = percent / 12 / 100;

    return parseInt(Math.round(price * (percent * (Math.pow(1 + percent, term))) / (Math.pow(1 + percent, term) - 1)));
}

tortik.getParameterByName = function(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

tortik.encodeQueryData = function(data) {
    var ret = [];
    for (var d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}