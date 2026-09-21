document.addEventListener('click', event => {
   if (event.target.closest('[data-clear-search]')) document.querySelector('#search').value = '';

   const row = event.target.closest('[data-href]');
   if (!row || event.target.closest('a, button') || window.getSelection().toString() || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
   window.location.assign(row.dataset.href);
});

document.addEventListener('htmx:beforeRequest', () => {
   const error = document.querySelector('#request-error');
   if (error) error.hidden = true;
});

for (const eventName of ['htmx:responseError', 'htmx:sendError']) {
   document.addEventListener(eventName, () => {
      const error = document.querySelector('#request-error');
      if (error) error.hidden = false;
   });
}
