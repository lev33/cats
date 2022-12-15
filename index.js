const app = async () => {
  const state = {
    cats: await (
      await fetch('https://cats.petiteweb.dev/api/single/lev33/show/')
    ).json(),
  };

  const $wr = document.querySelector('[data-wr]');

  const ACTIONS = {
    DETAILS: 'details',
    DELETE: 'delete',
  };

  const deleteCat = async ($catWr) => {
    const { catId } = $catWr.dataset;
    const url = `https://cats.petiteweb.dev/api/single/lev33/delete/${catId}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (response.status === 200) {
        $catWr.remove();
      } else {
        throw new Error('Кот не удалился');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const renderCats = () => {
    const getCatHTML = (cat) => `
              <div data-cat-id="${cat.id}" class="card mb-4 mx-2" style="width: 18rem;">
                   <img src="${cat.image}" class="card-img-top" alt="${cat.name}">
                   <div class="card-body">
                      <h5 class="card-title">${cat.name}</h5>
                      <p class="card-text">${cat.description}.</p>
                       <button data-actions="${ACTIONS.DETAILS}" type="button" class="btn btn-primary">Details</button>
                       <button data-actions="${ACTIONS.DELETE}" type="button" class="btn btn-danger">Delete</button>
                  </div>
              </div>
              `;

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
};

app();
