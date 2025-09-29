// === Маска телефона
const phoneMaskSelector = '#phone';
const phoneMaskInputs = document.querySelectorAll(phoneMaskSelector);
const masksOptions = { phone: { mask: '+{7} (000) 000-00-00' } };
for (const item of phoneMaskInputs) {
  new IMask(item, masksOptions.phone);
}

// === Тоастеры
toastr.options = {
  closeButton: true,
  positionClass: "toast-top-right",
  timeOut: 3000,
  hideMethod: "fadeOut"
};

// === Обработка формы
document.addEventListener("DOMContentLoaded", function () {
  let lastRequestTime = 0;
  const cooldownTime = 1000;

  document.querySelectorAll("form[id='callback']").forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let currentTime = new Date().getTime();
      if (currentTime - lastRequestTime < cooldownTime) {
        toastr["warning"]("Пожалуйста, подождите перед повторной отправкой.");
        return;
      }
      lastRequestTime = currentTime;

      let telephoneInput = form.querySelector("input[name='telephone']");
      let checkbox = form.querySelector("input[type='checkbox']");
      let submitButton = form.querySelector("button[type='submit']");
      let nameInput = form.querySelector("input[name='name']");
      let telephone = telephoneInput.value.trim();
      let isChecked = checkbox.checked;
      let name = nameInput ? nameInput.value.trim() : "";
      let comment = form.querySelector('input[name="comment"]').value.trim();
      let form_name = form.querySelector('input[name="form_name"]').value.trim();

      if (telephone === "" || telephone.length < 18 || !isChecked) {
        if (!isChecked) toastr["warning"]("Подтвердите согласие на обработку персональных данных.");
        if (telephone === "" || telephone.length < 18) {
          telephoneInput.focus();
          toastr["warning"]("Пожалуйста, введите свой номер правильно");
        }
        return;
      }

      //let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      let formData = {
        //_token: csrfToken,
        telephone: telephone,
        name: name,
        url: window.location.href
      };

      form.querySelectorAll("input[type='hidden']").forEach((hiddenInput) => {
        formData[hiddenInput.name] = hiddenInput.value;
      });

      let originalButtonText = submitButton.innerHTML;
      submitButton.innerHTML = `Отправка...`;
      submitButton.disabled = true;

      fetch("/call_me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": formData._token
        },
        body: JSON.stringify(formData)
      })
        .then(response => {
          if (!response.ok) throw response;
          return response.json();
        })
        .then(() => {
         /*
          var ct_site_id = 73847;
          var ct_data = {
            fio: name,
            phoneNumber: telephone,
            subject: 'Заявка с сайта',
            tags: form_name,
            comment: comment,
            requestUrl: window.location.href,
            sessionId: window.ct('calltracking_params','jkrpieeo').sessionId
          };
          $.ajax({
            url: 'https://api.calltouch.ru/calls-service/RestAPI/requests/' + ct_site_id + '/register/',
            dataType: 'json',
            type: 'POST',
            data: ct_data
          });
           */
          
          mgo.postForm({
            name: name, 
            number: telephone,
            customParam: form_name,
            comment: comment
          });

          let currentUrl = window.location.href;
          let newUrl = currentUrl.includes('?') ? currentUrl + '&success=form' : currentUrl + '?success=form';
          window.location.href = newUrl;
        })
        .catch((error) => {
          if (error.status === 429) {
            toastr["error"]("Превышен лимит запросов. Пожалуйста, повторите попытку завтра.");
          } else {
            toastr["error"]("Возникла ошибка. Попробуйте отправить запрос позже.");
          }
        })
        .finally(() => {
          setTimeout(() => {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
          }, cooldownTime);
        });
    });
  });
});

// === Fancybox: показать окно успеха по параметру ?success=form
document.addEventListener('DOMContentLoaded', function () {
  if (typeof jQuery === 'undefined' || !$.fn.fancybox) return;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'form') {
    $.fancybox.open({
      src: "#popup-thanks",
      type: "inline",
      opts: {
        transitionDuration: 366,
        animationEffect: "zoom-in-out",
        backFocus: false,
        hash: false
      }
    });
  }
});

