const app = async () => {
  const state = {
    cats: await (
      await fetch('https://cats.petiteweb.dev/api/single/lev33/show/')
    ).json(),
  };

  const $wr = document.querySelector('[data-wr]');

  const renderCats = () => {
    const getCatHTML = (cat) => `
              <div class="card mb-4 mx-2" style="width: 18rem;">
                   <img src="${cat.image}" class="card-img-top" alt="${cat.name}">
                   <div class="card-body">
                      <h5 class="card-title">${cat.name}</h5>
                      <p class="card-text">${cat.description}.</p>
                       <a href="#" class="btn btn-primary">Edit</a>
                       <button id="${cat.id}" type="button" class="btn btn-danger">Delete</button>
                  </div>
              </div>
              `;

    state.cats.forEach((cat) => {
      $wr.insertAdjacentHTML('afterbegin', getCatHTML(cat));
    });
  };

  renderCats();
};

app();
