import lazy from './lazy';

export default (text=HELLO) => {
  const element = document.createElement("div");
  element.className = "pure-button";
  element.innerHTML = text;
  element.onclick = () => {
    import('./lazy')
    .then(lazy => {
      element.innerHTML = lazy.default;
    }).catch(err => {
      console.log(err);
    });
  };
  return element;
};