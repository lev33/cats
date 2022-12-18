const app = async () => {
  const state = {
    cats: await (
      await fetch('https://cats.petiteweb.dev/api/single/lev33/show/')
    ).json(),
  };

  const $wr = document.querySelector('[data-wr]');
  const $modalWr = document.querySelector('[data-modalWr]');
  const $modalContent = document.querySelector('[data-modalContent]');
  const $catCreateFormTemplate = document.getElementById('createCatForm');
  const $catEditFormTemplate = document.getElementById('editCatForm');

  const ACTIONS = {
    DETAILS: 'details',
    DELETE: 'delete',
    CLOSE: 'close',
    EDIT: 'edit',
  };

  const CREATE_FORM_LS_KEY = 'CREATE_FORM_LS_KEY';

  const deleteCat = async ($catWr) => {
    const { catId } = $catWr.dataset;
    const url = `https://cats.petiteweb.dev/api/single/lev33/delete/${catId}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (response.status === 200) {
        $catWr.remove();
        state.cats = state.cats.filter((el) => el.id !== +catId);
      } else {
        throw Error('Кот не удалился');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const getCatHTML = (cat) => `
  <div data-cat-id="${cat.id}" class="card mb-4 mx-2" style="width: 18rem;">
       <img src="${cat.image}" class="card-img-top" alt="${cat.name}">
       <div class="card-body">
          <h5 class="card-title">${cat.name}</h5>
          <p class="card-text">${cat.description}.</p>
           <button data-actions="${ACTIONS.DETAILS}" data-openModal="showCat" type="button" class="btn btn-primary">Details</button>
           <button data-actions="${ACTIONS.EDIT}" data-openModal="editCat" type="button" class="btn btn-primary">Edit</button>
           <button data-actions="${ACTIONS.DELETE}" type="button" class="btn btn-danger">Delete</button>
      </div>
  </div>
  `;

  const getDetailsCatHTML = (cat) => `
  <div data-cat-id="${cat.id}" class="card mb-4 mx-2" style="width: 18rem;">
       <img src="${cat.image}" class="card-img-top" alt="${cat.name}">
       <div class="card-body">
          <h5 class="card-title">${cat.name}</h5>
          <h5 class="card-title">Id:  ${cat.id}. Favorite: ${cat.favorite}</h5>
          <p class="card-text">Age: ${cat.age}.</p>
          <p class="card-text">Rate: ${cat.rate}.</p>
          <p class="card-text">${cat.description}.</p>
          <button data-actions="close" type="button" class="btn btn-success">Close</button>
      </div>
  </div>
  `;

  const renderCats = () => {
    state.cats.forEach((cat) => {
      $wr.insertAdjacentHTML('afterbegin', getCatHTML(cat));
    });

    $wr.addEventListener('click', (e) => {
      if (e.target.dataset.actions === ACTIONS.DELETE) {
        const $catWr = e.target.closest('[data-cat-id]');
        deleteCat($catWr);
      }
    });
  };

  renderCats();

  const formatCreateFormData = (formDataObject) => ({
    ...formDataObject,
    id: +formDataObject.id,
    rate: +formDataObject.rate,
    age: +formDataObject.age,
    favorite: !!formDataObject.favorite,
  });

  const formatEditFormData = (formDataObject) => ({
    ...formDataObject,
    rate: +formDataObject.rate,
    age: +formDataObject.age,
    favorite: !!formDataObject.favorite,
  });

  const clickModalWrHandler = (e) => {
    if (e.target === $modalWr) {
      $modalWr.classList.add('hidden');
      $modalWr.removeEventListener('click', clickModalWrHandler);
      $modalContent.innerHTML = '';
    }
  };

  const openModalHandler = (e) => {
    const targetModalName = e.target.dataset.openmodal;

    if (targetModalName) {
      $modalWr.classList.remove('hidden');
      $modalWr.addEventListener('click', clickModalWrHandler);

      switch (targetModalName) {
        case 'createCat':
          const cloneCatCreateForm = $catCreateFormTemplate.content.cloneNode(true);
          $modalContent.appendChild(cloneCatCreateForm);

          const $createCatForm = document.forms.createCatForm;
          const dataFromLS = localStorage.getItem(CREATE_FORM_LS_KEY);
          const preparedDataFromLS = dataFromLS && JSON.parse(dataFromLS);
          if (preparedDataFromLS) {
            Object.keys(preparedDataFromLS).forEach((key) => {
              $createCatForm[key].value = preparedDataFromLS[key];
            });
          }

          $createCatForm.addEventListener('submit', (submitEvent) => {
            submitEvent.preventDefault();

            const formDataObject = formatCreateFormData(
              Object.fromEntries(new FormData(submitEvent.target).entries()),
            );

            fetch('https://cats.petiteweb.dev/api/single/lev33/add/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formDataObject),
            }).then((res) => {
              if (res.status === 200) {
                $modalWr.classList.add('hidden');
                $modalWr.removeEventListener('click', clickModalWrHandler);
                $modalContent.innerHTML = '';
                localStorage.removeItem(CREATE_FORM_LS_KEY);
                state.cats.push(formDataObject);
                $wr.insertAdjacentHTML(
                  'afterbegin',
                  getCatHTML(formDataObject),
                );
              } else {
                throw Error('Ошибка при создании кота');
              }
            }).catch(alert);
          });

          $createCatForm.addEventListener('change', () => {
            const formattedData = formatCreateFormData(
              Object.fromEntries(new FormData($createCatForm).entries()),
            );
            localStorage.setItem(CREATE_FORM_LS_KEY, JSON.stringify(formattedData));
          });

          break;

        case 'editCat':
          const cloneCatEditForm = $catEditFormTemplate.content.cloneNode(true);
          $modalContent.appendChild(cloneCatEditForm);
          const $catEditWr = e.target.closest('[data-cat-id]');
          const { catId: id } = $catEditWr.dataset;
          const catEdit = state.cats.find((el) => el.id === +id);

          const $editCatForm = document.forms.editCatForm;
          Object.keys(catEdit).forEach((key) => {
            $editCatForm[key].value = catEdit[key];
          });

          $editCatForm.addEventListener('submit', (submitEvent) => {
            submitEvent.preventDefault();

            const formDataObject = formatEditFormData(
              Object.fromEntries(new FormData(submitEvent.target).entries()),
            );

            fetch(`https://cats.petiteweb.dev/api/single/lev33/update/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...formDataObject, name: catEdit.name }),
            }).then((res) => {
              if (res.status === 200) {
                $modalWr.classList.add('hidden');
                $modalWr.removeEventListener('click', clickModalWrHandler);
                $modalContent.innerHTML = '';

                state.cats = state.cats.filter((el) => el.id !== +id);
                const editedCat = { ...catEdit, ...formDataObject };
                state.cats.push(editedCat);
                $catEditWr.remove();
                $wr.insertAdjacentHTML(
                  'afterbegin',
                  getCatHTML(editedCat),
                );
              } else {
                throw Error(`Ошибка при обновлении кота ${res.status}`);
              }
            }).catch(alert);
          });

          break;

        case 'showCat':
          const $catWr = e.target.closest('[data-cat-id]');
          const { catId } = $catWr.dataset;
          const cat = state.cats.find((el) => el.id === +catId);

          $modalContent.insertAdjacentHTML(
            'afterbegin',
            getDetailsCatHTML(cat),
          );
          break;

        default:
          break;
      }
    }
  };

  document.addEventListener('click', openModalHandler);

  document.addEventListener('click', (e) => {
    if (e.target.dataset.actions === ACTIONS.CLOSE) {
      $modalWr.classList.add('hidden');
      $modalWr.removeEventListener('click', clickModalWrHandler);
      $modalContent.innerHTML = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $modalWr.classList.add('hidden');
      $modalWr.removeEventListener('click', clickModalWrHandler);
      $modalContent.innerHTML = '';
    }
  });
};

app();
