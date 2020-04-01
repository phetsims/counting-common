/* eslint-disable */
const mipmaps = [
  {
    "width": 171,
    "height": 312,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 86,
    "height": 156,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 43,
    "height": 78,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAABOCAYAAAC5ZO8pAAAAAklEQVR4AewaftIAAASBSURBVNXBfYzWdQEA8M/zfZ6DYwTZSfIWMkTTJuuf2kyc6QChcokxnOnwJacze0GtnFJtwlADsnNjI4K5aeLU2qk3NTccLB1qjnA4NdCcGCovEzhgB0fAc1xu/EG33/f3u+f9gc8npzauxK2YhJFowVHsxna8hWXYqAo51WnDclyBVtn+i/VYiqdVIKdyN2ABxivPEbyEn2GrMuRVZiV+gxHKl8dXMQvb8S8lyivPeXgOM1FQnS9iOvZhgxLklW4WHscktdOKS/AR3jWAvNLciXaMVHuD8S08g/0y5AxsCeZisGx7sRFvYz0+w2hchItxvmzPYaYMOdkexRzkpduCp7EQ3dItxB34grhDmIp/SJGXrgPXIIjbgxWYidU4ItvfsRcXo1VSC1rxjBQFSW14Ft8W14dX8AtsVJ4/IYc/YIikC2XI6+8ydOAb4g6iHddhp8pswHBMRk5/X8LbeE9E3gn3YzHGiduO2/GQ6q3BNJwp6TA6ReQd9xRuwxBxm3A9/qZ2PsZstOivFytFBMzALOk2YDpeU1trsU7SWVIEXIkWceswBdvUxyPo099p+K6IgAniXsYUdKufv2CrpEtFBOyWtBaXoaj+3pd0hoiA1Sg6rg8dmIaixnhf0lgRBazChZiMTszXWJ9KCiIKjvuJ5nlHUouIoPmOKlFwcjoqImi+CZKOiQia7xxJ+0UEzTdS0g4RQfONl9QlImi+8ZJeERE011cwVn89WCciaK4bMEh/n6EoImiuyZI+liJorkmSPpAiaJ4f4ExJr0sRNM9sSfvwmBRB81wgaQuKUgTNcR0mStooQ9Ac10o6hr/KEDTeWEyW9BFekiFovPkYLumfBhA01hB8T1IvVhlA0FiLMUbSZrxoAEHjtGG2uNVKEDTOEoyW1IUHlCBojAtwlbi16FKCoDF+h+GSDqJdiYL6+xUuEbcGbyhRUF9n45cIkrqxSBmC+lqOUeKexRvKENTPfZgq7hPcqUxBfXwfP0dOUhEPokuZgto7Aw9huLgXsVQFgtp7AhPF/RtzVCiorZWYKu4g7ka3CgW1Mw83SvdndKpCUBvXYh5axH2An6pSUL1paMcw6Z5UA0F1xuOPGCndGtyrBoLKFdCBc6TbjKvVSFC5F/BN6XbgFnSpkaAyT2CGdPswF6+poaB8D+OH0vXg1+hQY0F5luFG5MQdxkIsVwdB6ZbhVuTF9eJBLFInBaV5DHOQk+5R/FYdFWQbhg5Ml+153KzOCtJ9B+34mmxvYpYGKIhrx80YJts2/AhFDVDQ3zW4B183sB7chXc0SMFxZ2MppmKQ0ryHcZiIDzVADldgOcaoTC+6cAiHsR89OII+dKEHPTiMXvRiJ7biQ2xG0QAKWIAxKpfHl1WniL04gO34D9Zhhf+TwwEMdXLaiU7c5nMBQ528RuHHWOtzecx38puAfEDRqeHygF1OEQVswmhxfdiFbuzCARzBbnTjEPrQK1seeQxGG0ZgEEZhBE6XbQ9+X8C9OA3n4hi6sAXrsQqb1N9c3IRz0eqEHdiAJXj1f/YY+zYRxKy3AAAAAElFTkSuQmCC"
  },
  {
    "width": 22,
    "height": 39,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAnCAYAAAALkrgzAAAAAklEQVR4AewaftIAAAJPSURBVK3BT2jVdQAA8M/7vh/GOziXOLMxL6IMRYh5yaAugglB/kkUdccExWKgSNEhR4kLjRDFCs0OjgQvwlProOBFCDxIMBFBGYosWeGfuUmulvo6fIXfb2/vzfenzydnegV8i/fQhgkM41fsxzVV5FT3AfrQqbKHOIQvVZBX2R4cQLvqCngHs3FembypjqMHBakHuIZBUasooAtDGJCRmKyI1ciJfsdP6MWE1PfYigSvYDtOyMiLFuIM3kUOz3AW61DEM5P9gvlYhhzmoIh7XshjM05iqegJvsY2PFbdOazB60gwioteCOhBh2gMn+JztTmOkqhLRsAc0Sh244jafYc/Re0yElxCCV/gpPrdxTzMkpHgQ80ZEwUZQfPyoucygua9KvpLRtC8uaJHMoLmrECb6K6MoDnrEUTXZQTNeVP0FD/LCBrXhSWiIVyRETTuIxREA8oEjUmwSlRCUZmgMfvRIbqNE8oE9ZuPLVIXVBDU7yDmie6jTwVBfbbifanTGFJBULvF6MUM0SB2qiKo3TF0iMaxF+OqCGrTj7el+tFvGsHL7cNmqVvY7iWC6X2MnUhET9CnBkF1m7AXBdFTfIMf1SCobA0OoVX0HD9gjxolptqIw5grdQo71CEx2Sf4DK1SF9GtTonoDXyFlUikbqBbA3LoRQ9mm+oGbmIEI/gbIxjDBIZwFX8ok2AXWlTWiU7TK+Ex7uMmjqKYoEVzcmhBCxbgLWwI+Mf/axbWJriM5XiEQdzBMEZxD/+iJJXDDLyGNizCcszEBH7D0f8Af8V8tN3WDIsAAAAASUVORK5CYII="
  },
  {
    "width": 11,
    "height": 20,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAUCAYAAABbLMdoAAAAAklEQVR4AewaftIAAAELSURBVIXBPSiEYQAA4Md7XwZSRIlTsiiTSRgsRpOfWK10ZzOwIxmklAwyoQyK2CxKsdikGMhwkgySn3STr+7q/JzzPGW+m0Ya9bjHNiblJRRsYAIVeEAdepDEvlgCtdhFP04xjhQu0It2rOMtgWN0Yw1DuJZziQh9eMRJQCWWMea3eTyhTSxCm9JeUS4W/K8Kz2JBacOoxpVYUNoAPrAjFvwtoAdXuBML/raAJhzKC4rrwCjuMCsvKG4ZNVjFs7zgty104ggzvgi+W8QIMpjyQ1AwhxSekMaZHyI0YAmDyGIae4ooww1a5Lwjg3d8IIsX3GIlQrOCCrQqrj3CJrI4RwavchJIoguNOPgEf4E5rRBqyboAAAAASUVORK5CYII="
  }
];
mipmaps.forEach( mipmap => {
  mipmap.img = new Image();
  window.phetImages.push( mipmap.img ); // make sure it's loaded before the sim launches
  mipmap.img.src = mipmap.url; // trigger the loading of the image for its level
  mipmap.canvas = document.createElement( 'canvas' );
  mipmap.canvas.width = mipmap.width;
  mipmap.canvas.height = mipmap.height;
  const context = mipmap.canvas.getContext( '2d' );
  mipmap.updateCanvas = function() {
    if ( mipmap.img.complete && ( typeof mipmap.img.naturalWidth === 'undefined' || mipmap.img.naturalWidth > 0 ) ) {
      context.drawImage( mipmap.img, 0, 0 );
      delete mipmap.updateCanvas;
    }
  };
} );
export default mipmaps;