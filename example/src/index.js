import _ from 'lodash';

import chain from '@eyalsh/chain/lib/index';

function component() {
  return chain('webpack')
    .then(x => ['Hello', x])
    .then(x => _.join(x, ' '))
    .then(x => (
      chain(document.createElement('div'))
        .with(el => el.innerHTML = x)
    ))
    .eject();
}

document.body.appendChild(component());
