/* eslint-disable */
/* @formatter:off */

import MipmapElement from '../../chipper/js/browser/MipmapElement.js';

// The levels in the mipmap. Specify explicit types rather than inferring to assist the type checker, for this boilerplate case.
const mipmaps = [
  new MipmapElement( 72, 313, 'data:image/png;base64,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' ),
  new MipmapElement( 36, 157, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAACdCAYAAADcxdolAAAAAklEQVR4AewaftIAAAPhSURBVM3BYYjfdR0H8Ne9999xcsMcm6M1WHW5B1fQslyEBGUUEfnIGiHUk4JAIrAnRgg+iXq0pAgNjOiJj8R8EAQ98JH0KIIsQsXwlBWaQpvmHelc/xrcg1Nuu/0+3/a9+75eC/4/K7gTt2EZh7GI43gYX1M00+YoHsatWHJ5X8Y9eElBtPklPoMlV7aELyqKutP4vGk+rSjq7jXduxVFzV04abp9iqLmO2oOKIrp7sMJNVEU0yzh6+oOK4ppfoD32gVxdQfxVbskru5HOGKXxM4+iDu0O64odnYG77KL4spux+fssriy72Nml8Xl/RAfsQdiu6P4hj0S2z2EI/ZIvNPduN0eii0r+J5r60VFseVRHLGzJ3CP6S4qik2/ws129hg+hZ/iDZ0ED+AOO/s5vmTTG3hBJzN83M4exLe80zmdzPCWy9vA/bjPdm/qZIZHcDOWbHkW9+JRl3dRJzP8GH/B3VjEb/ATe2Rm0+N43LX3iqIYTAwmBhODicFEX68risHEYGIw0WafTqLNgmnmiqKvuaIYTLSJTqLNsk5iMNHXc4qizX7TrCuKNgd1EoOJwUSbZZ1Em0OmWVMUfa0risFE3YqOou6AjmIw0ddriqJu1XQvKIq6RR3FYGIwUfdh0/1bUfT1V0UxmBhM1J3UUfRzVoMYTAwm6mamuaBB9POqBjGYGEzUXWeaDQ2ibmaauQYxmOjnogZRt19HUXfQNBc0iH6e1iAGE/2saRB1h0yzrkHULZtmTYPo53UNop8/axB9vKxR1KyY5h8aRc0B0/xLo+jjgkbRx1yj6GNdo6hZNM1zGkXNqs6ij2c0ij4uaBSDiT7+qVHUHDLN3zWKmmM6i8HEYKKPdY2ijzWNYjBRs6qzqFnUWQwmBhODicHEYKImOoua6CwGE4OJwcRgYjAxmBhM9HFCo6hZMM11GkXNAZ3FYKJmwzQ3ahQ1c9O8R6MYTPRxXKPo4waNoo8PaBR9XK9R1MxNc4NGUTM3zYc0ij6WsKpB1Jw33a0aRM1Z092iQdS8arqbNIias6Zb1iBqnjbdjRpEzTnTvU+DqFnDa6aZ4RZFUfeS6U4pmtnuY/gmbsIC/ov/4A/4Hc6Z7hR+pmDBlqN4BJ907TyJ+/Einseaq1iw5fc4pa8NPI9X8CR+gae8zYJNd+FBu+8insC38ZRL9tn0AI7ZfcH78RX8EWvBCj5qbx3GGZcEpzGz907izuCzxnE62Gcc18dYfjvDs7hNzct4E+fxFjYwxxxz2+3HCRxzZY/hzIJNJ/AJV/Ynm/6G89os4SF8AYdteQa/xnddsmBvrGI/1rHmbf4Hjk2MkuewKfIAAAAASUVORK5CYII=' ),
  new MipmapElement( 18, 79, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAABPCAYAAADm3pV+AAAAAklEQVR4AewaftIAAAIxSURBVK3BvYtcdRQA0PNu3o75WLMEjeBCNK1YpNC4kFR2gmhtI4giChYGC7GzFawEq5QhnWAvpPQfEETBYg2oAT+Lxd2Q2XXGYoRxub/7mJedczq1R/E5nsfjOI9beEdDr3YTrznuqkJo28ErsscUQtvHOCebKITsZbyo7YxCyD7EaSOF497ENbUthXDcB+g9hLD0KZ71kMLCdbzlBMLCZ7hgaQ/3ZHsKgS/xnKXf8R6+ls0VAjuWfsHbuI2fjdDjC7yK7/ARvrUwNUKPG7hhNQcKYU3CmoRxDhXCmoTaKdlcIYwzVwi1iRFCrZdNFULtrGxfIdQmRgi1LdmRQqg9InugEGqdEUKtk80UQm0iO1QItc4IoXZONlMIaxJqF2T7CmGcfYVQC9mBQhhnqhBqvey+Qqh1splCqE1kRwqh1svuKoTahuwnhVA7K9tVCKub4geF0HZJ9ocBoa2XHRoQ2kK2b0Bouyz724CwuqkBoe20bGpAaNuWzQ0Iq5sbEFY3NyC0XTZSaAsjhTUJbZ2RQlsYKaxJWJOwJqGtk3UGhLYzss6A0HZf1hsQ2uayiQFhdVsGhLa57LwBoW0m28ZFhdD2myzwkkJo29V2RSG0faPtaYXQdhd7sicUegvv4g08iTnuoZM9hev4Hn/5nw47uINNq/sHv+JH3MLNHu9j0zinsI1tvIDNwBUns4HXA5tObqPHV3jG0hGOcIA/sYcHmFkI7OAaNrCLT5zARVzyn38BQDNWTSH0YowAAAAASUVORK5CYII=' ),
  new MipmapElement( 9, 40, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAoCAYAAAAsYdCDAAAAAklEQVR4AewaftIAAAEoSURBVIXBPWqUURQA0PPufPkBxyKiAUW0CpZuwMLG0sLCOo2VrsA9uAPdg4sQLFyCnRDQQptAzMDM5FN4wr0PMnhOM/qIp/iJE/9M0is8xwKhCOkNFrp9Reje4rF0qAg8xGs0OwQ+4D6+4rtupQg8wGe8wA/XmPBImnVrRbjerAijppsVYdR0syKMJt1aEUYHuq0ijPZ0G0UYhe5KEUaTblaE0b5uqwijPd1KEUZNt1aE0UK3VYTRpLtQhNGB7rcipGPplyKkI+lcEdJSulCEdCxtFCHdlGZFSEs7hNTsEFKzQ0hNaoqQFlIoQtpIS0VIs3RXEdKZdE8R0hdsdHcUDe9wihlHmLDCJ3zD+wkvcdvoEM90Tyac4wxbrHCJK9zACS79xy1//QE8pjG0vBuscgAAAABJRU5ErkJggg==' ),
  new MipmapElement( 5, 20, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAUCAYAAABF5ffbAAAAAklEQVR4AewaftIAAACGSURBVE3Bu00DURQFwNnzbHmFCE0Z9EAFVEADLsSlIBqhAlL3QMbH0rJLcG/gGe0Vn9oOT3jGnRacsbgRfOANixacsGHVogysWpQZf1qUPVYtyoxFizKwaFEO+NWiDHxpUQauWpQ9Ni1K3IgyYdKibJi1KD84agMXPOIeLzjs8I4J33jA9R+2VhgMpuQaNwAAAABJRU5ErkJggg==' )
];

export default mipmaps;