// Copyright 2021, University of Colorado Boulder

/**
 * Creates image views for base numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import { Circle } from '../../../../scenery/js/imports.js';
import { Image } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import imageDigit0 from '../../../mipmaps/digit-0_png.js';
import imageDigit1 from '../../../mipmaps/digit-1_png.js';
import imageDigit2 from '../../../mipmaps/digit-2_png.js';
import imageDigit3 from '../../../mipmaps/digit-3_png.js';
import imageDigit4 from '../../../mipmaps/digit-4_png.js';
import imageDigit5 from '../../../mipmaps/digit-5_png.js';
import imageDigit6 from '../../../mipmaps/digit-6_png.js';
import imageDigit7 from '../../../mipmaps/digit-7_png.js';
import imageDigit8 from '../../../mipmaps/digit-8_png.js';
import imageDigit9 from '../../../mipmaps/digit-9_png.js';
import imagePaperBackground1000 from '../../../mipmaps/paper-background-1000_png.js';
import imagePaperBackground100 from '../../../mipmaps/paper-background-100_png.js';
import imagePaperBackground10 from '../../../mipmaps/paper-background-10_png.js';
import imagePaperBackground1 from '../../../mipmaps/paper-background-1_png.js';
import countingCommon from '../../countingCommon.js';

// place => mipmap info
const BACKGROUND_IMAGE_MAP = {
  0: imagePaperBackground1,
  1: imagePaperBackground10,
  2: imagePaperBackground100,
  3: imagePaperBackground1000
};

// digit => mipmap info
const DIGIT_IMAGE_MAP = {
  1: imageDigit1,
  2: imageDigit2,
  3: imageDigit3,
  4: imageDigit4,
  5: imageDigit5,
  6: imageDigit6,
  7: imageDigit7,
  8: imageDigit8,
  9: imageDigit9
};

// place => x/y offsets for the first digit in each place
const PLACE_X_OFFSET = { 0: 64, 1: 62, 2: 70, 3: 94 };
const PLACE_Y_OFFSET = { 0: 38, 1: 61, 2: 82, 3: 104 };

// place => x/y offsets for the handle in each place
const PLACE_HANDLE_X_OFFSET = { 0: 130, 1: 142, 2: 151, 3: 171 };
const PLACE_HANDLE_Y_OFFSET = { 0: 97, 1: 74, 2: 53, 3: 31 };

// digit => horizontal offset for that digit (applied to all places, includes digit-specific information)
const DIGIT_X_OFFSET = { 1: 93, 2: -7, 3: -7, 4: -9, 5: -18, 6: -5, 7: -24, 8: -2, 9: -10 };

// digit => horizontal offset, customized for each single digit base number
const FIRST_PLACE_DIGIT_X_OFFSET = { 1: -61, 2: 0, 3: 0, 4: 0, 5: 5, 6: 0, 7: 15, 8: 10, 9: 15 };

// place => horizontal positions of the zeros in the base number
const ZERO_OFFSET = {
  0: [],
  1: [ 272 ],
  2: [ 530, 284 ],
  3: [ 825, 580, 335 ]
};

// Scale was increased from 72dpi (pixels) to 300dpi, so that we can have crisper graphics.
const SCALE = 72 / 300;

class BaseNumberNode extends Node {
  /**
   * @param {BaseNumber} baseNumber
   * @param {number} opacity
   * TODO: refactor as options? https://github.com/phetsims/counting-common/issues/1
   * @param {boolean} includeHandles
   * @param {boolean} isLargestBaseNumber
   * @param {boolean} hasDescendant
   * @param {boolean} isPartOfStack
   */
  constructor( baseNumber, opacity, includeHandles, isLargestBaseNumber, hasDescendant, isPartOfStack ) {
    super( { scale: SCALE } );

    // Position of the initial digit
    let x = PLACE_X_OFFSET[ baseNumber.place ] + DIGIT_X_OFFSET[ baseNumber.digit ];
    const y = PLACE_Y_OFFSET[ baseNumber.place ];

    // We need to slightly offset some
    if ( baseNumber.place === 0 ) {
      x += FIRST_PLACE_DIGIT_X_OFFSET[ baseNumber.digit ];
    }

    // Translate everything by our offset
    this.translation = baseNumber.offset;

    // The paper behind the numbers
    const paperBackgroundNode = new Image( BACKGROUND_IMAGE_MAP[ baseNumber.place ], {
      imageOpacity: opacity
    } );

    // TODO: needs better logic and or docs in this section, see https://github.com/phetsims/counting-common/issues/1
    // aside from checking the option includeHandles, don't include a handle if this base number is a standalone 1, or
    // if removing the largest base number in this paper number would separate itself from its descendants (as opposed
    // to just removing one part of the largest base number). for example, with the paper number 1200, the 1 should not
    // get a handle because grabbing it would pull 1000 away from 200, and this can be accomplished by pulling the 200
    // off instead. in the case of 2200, the first 2 should get a handle because grabbing it would pull off one 1000.
    if ( includeHandles && !( baseNumber.numberValue === 1 && !isPartOfStack )
    && !( isLargestBaseNumber && baseNumber.digit === 1 && hasDescendant ) ) {

      const lineWidth = 6;

      // The handle that attaches to the paper
      const handleStemShape = new Shape().moveTo( 0, 0 ).lineTo( 0, PLACE_HANDLE_Y_OFFSET[ baseNumber.place ] );

      // @public (read-only)
      this.handleStemNode = new Path( handleStemShape, {
        stroke: 'black',
        lineWidth: lineWidth
      } );
      this.handleStemNode.centerX = hasDescendant ? PLACE_HANDLE_X_OFFSET[ baseNumber.place ] : paperBackgroundNode.centerX;
      this.handleStemNode.bottom = paperBackgroundNode.top + 10;
      this.addChild( this.handleStemNode );

      let handleCircle;
      const outerCircleRadius = 22;

      if ( isLargestBaseNumber ) {
        handleCircle = new Circle( outerCircleRadius, {
          fill: 'white',
          stroke: 'black',
          lineWidth: lineWidth
        } );
        handleCircle.addChild( new Circle( 10, {
          fill: 'black'
        } ) );
      }
      else {
        handleCircle = new Circle( outerCircleRadius, {
          fill: 'black'
        } );
      }
      handleCircle.centerX = this.handleStemNode.centerX;
      handleCircle.bottom = this.handleStemNode.top;
      this.addChild( handleCircle );
    }

    // add the background paper on top of the handle
    this.addChild( paperBackgroundNode );

    // The initial (non-zero) digit
    this.addChild( new Image( DIGIT_IMAGE_MAP[ baseNumber.digit ], {
      x: x,
      y: y
    } ) );

    // Add the zeros
    const digitZeroOffsets = ZERO_OFFSET[ baseNumber.place ];
    for ( let i = 0; i < digitZeroOffsets.length; i++ ) {
      this.addChild( new Image( imageDigit0, {
        x: digitZeroOffsets[ i ],
        y: y
      } ) );
    }
  }
}

/**
 * @public {Object} - Maps place (0-3) to a {Dimension2} with the width/height
 */
BaseNumberNode.PAPER_NUMBER_DIMENSIONS = _.mapValues( BACKGROUND_IMAGE_MAP, mipmap => new Dimension2( mipmap[ 0 ].width * SCALE, mipmap[ 0 ].height * SCALE ) );

/**
 * @public {Array.<Vector2>} - Maps place (0-3) to a {Vector2} that is the offset of the upper-left corner of the
 *                             BaseNumberNode relative to a 1-digit BaseNumberNode.
 */
BaseNumberNode.IMAGE_OFFSETS = [
  new Vector2( -14, 0 ),
  new Vector2( -70, -( PLACE_Y_OFFSET[ 1 ] - PLACE_Y_OFFSET[ 0 ] ) * SCALE ),
  new Vector2( -70 - ( ZERO_OFFSET[ 2 ][ 0 ] - ZERO_OFFSET[ 1 ][ 0 ] ) * SCALE, -( PLACE_Y_OFFSET[ 2 ] - PLACE_Y_OFFSET[ 0 ] ) * SCALE ),
  new Vector2( -70 - ( ZERO_OFFSET[ 3 ][ 0 ] - ZERO_OFFSET[ 1 ][ 0 ] ) * SCALE, -( PLACE_Y_OFFSET[ 3 ] - PLACE_Y_OFFSET[ 0 ] ) * SCALE )
];

countingCommon.register( 'BaseNumberNode', BaseNumberNode );

export default BaseNumberNode;
