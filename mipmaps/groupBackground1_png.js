/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const mipmaps = [
  {
    "width": 259,
    "height": 417,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 130,
    "height": 209,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAADRCAYAAAAAGWqkAAAAAklEQVR4AewaftIAAAQ8SURBVO3By4qcCQGG4ff/ppKuVExI03EMOTOICD8KuhF0rRcwS1ezz/3kArwFd4riRt0pI/wbUcFoJkNOTZNDp7u6q/wgJYYwxq3d/T7PwP8wTdMc+CZwC7iKTopj4Cnwd+Cv4zge8QED/8U0TeN6vf7BMAzXgRk6yfbX6/UXwzD8dhzHv/EVBt4zTdMc+BT4FhtbW1vM53POnz/PMAzo/99qtWK5XPL69WuWyyUbR8Dn4zj+nPcMvGOapq8BnwFXqStXrrCzs8PW1hY6ufb393n69CkvXrxg4wHws3Ecj9gIG9M0zYDPgKuz2Yy7d+9y/fp1tra20Ml24cIFbt26xc2bN0lC3QZ+yjvCf3wKXJ3NZty5c4fFYoFOl8uXL3P79m02Ppmm6cdshJqm6RPg29SNGzfY2tpCp9NiseDatWtsfG+apjkVar1e/wjIpUuXuHjxIjrdtre3mc/n1AL4CRXeukbt7Oyg028YBra3t9m4RmWaphvDMFxMwmKxQGfDpUuX2PiYCvAxNZ/P0dkxm82YzWbUbJqmbwT4OnXu3Dl0tgzDwL+FjWEY0NkVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgVpApSBamCVEGqIFWQKkgV4JA6Pj5GZ1eAJ9RyuURny/HxMRuHAb6g3rx5w2q1QmfD/v4+q9WKejWO427GcdwFvqT29vbQ2bC3t8fGYyq89YB69uwZq9UKnW7L5ZLd3V02/kSFt34N7B0eHvL48WN0eq3Xax49esR6vWa9Xn85juMfqVDjOL4Bfg+snj9/zrNnz9Dps16vefjwIS9fvqQOh2H4BRsfsXH//v1/3rt3bwHcfPXqFQcHBywWC5Kgk+/w8JCHDx/y8uVLagX8ZhzHz9n4iHfcv3//L/fu3ZsD1w8ODobd3V2Ojo4YhoHZbMYwDOjkODo64vXr1zx58oRHjx6xXC6pN8CvxnH8He8Y+ArTNH0X+CFwDZ0a6/X6wTAMvxzH8R+8Z+ADpmn6DvB94DKwDQSdJEfAc+A58IdxHP+M9CH/An+o78k8/CRVAAAAAElFTkSuQmCC"
  },
  {
    "width": 65,
    "height": 105,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABpCAYAAABlCE4eAAAAAklEQVR4AewaftIAAAHDSURBVO3BMWujBQAG4Od7k0pKS2lvcqhwQ/GQdHNw9A84C94vvMFZBDc3B7cGBKlLurQU04q0hbT5DNwN/obmfZ7B/1xcXHwzDMM7HGHq9VnjbhzHP87Pz3/3yWBrsVh8hvfT6fTtycmJ/f19Sbw2m83Gw8OD1Wo1vry8/IkP8/l8M/XRDwcHB29PT09NJhOv2eHhoTdv3gzL5fLLx8fH7/FhuLi4+Ho6nX53dnY2TCYTu2K9Xru8vHzZbDY/Bu+Oj4+HyWRil+zt7Tk6OprgqwzDcDCbzeyi2Wxm6zDIll0WJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqUKFGiRIkSJUqU2BrH0S4LntbrtV30/Pxsax0s7+/vjeNol2w2G3d3d7b+Cn59enr6+/b21q4Yx9H19bX1en09n89/y3w+f8bPNzc3/15dXXl8fDSOo9doHEcPDw+Wy6XVanU3DMNPtgafLBaLz/EtvsABBq/PiH/GcVwOw/DLfD6/Vx/9B0AVhW4mAO9rAAAAAElFTkSuQmCC"
  },
  {
    "width": 33,
    "height": 53,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAA1CAYAAADPo4LiAAAAAklEQVR4AewaftIAAADuSURBVM3BoU7DYABG0du7IoroMksg8/RBcAh4Wd4AgUJUoRYyBK5jSbNm2U+fovvOqfq+X6mvbds+qDcso4zjOIzj+N513WddVdXLdrt9bJqGJZVSmv1+/9T3/Y9t2943TcPSqqpis9ncAp2rGVeiMqslgASQABJAAkgACSABJIAEkAASQAJIAAkgASSABJAAEkACSAAJIAEkgASQABJAAkgACSABJIAEkAASQAJIAAkgASSABJAAEkACeJlxJaUUZhePx+PvNE0srZTCMAwT8FWfz+e33W73vF6v79SaBZTZ6XT6OxwOH13XfZPgH3htQr+EC62YAAAAAElFTkSuQmCC"
  },
  {
    "width": 17,
    "height": 27,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAbCAYAAACa9mScAAAAAklEQVR4AewaftIAAAB7SURBVK3BsQ0CMRREwefVyYldACEXUBT1URgRkn+AiCw7M7Rw3M6k1tq91roD4pg153xHxGOrtV5LKZk/5JwvEXETkDgnCQNhIAyEgTAQBsJAGAgDYSAMhIEwEAbCQBgIA2EgDISBMBCwOGdtvfcXsKcfjlljjA/wxOELVQ0a0lhsRecAAAAASUVORK5CYII="
  }
];
mipmaps.forEach( mipmap => {
  mipmap.img = new Image();
  const unlock = asyncLoader.createLock( mipmap.img );
  mipmap.img.onload = unlock;
  mipmap.img.src = mipmap.url; // trigger the loading of the image for its level
  mipmap.canvas = document.createElement( 'canvas' );
  mipmap.canvas.width = mipmap.width;
  mipmap.canvas.height = mipmap.height;
  const context = mipmap.canvas.getContext( '2d' );
  mipmap.updateCanvas = () => {
    if ( mipmap.img.complete && ( typeof mipmap.img.naturalWidth === 'undefined' || mipmap.img.naturalWidth > 0 ) ) {
      context.drawImage( mipmap.img, 0, 0 );
      delete mipmap.updateCanvas;
    }
  };
} );
export default mipmaps;