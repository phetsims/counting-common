// Copyright 2021-2022, University of Colorado Boulder

/**
 * Creates image views for base numbers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import { Circle, Image, Node, Path } from '../../../../scenery/js/imports.js';
import digit0_png from '../../../mipmaps/digit0_png.js';
import digit1_png from '../../../mipmaps/digit1_png.js';
import digit2_png from '../../../mipmaps/digit2_png.js';
import digit3_png from '../../../mipmaps/digit3_png.js';
import digit4_png from '../../../mipmaps/digit4_png.js';
import digit5_png from '../../../mipmaps/digit5_png.js';
import digit6_png from '../../../mipmaps/digit6_png.js';
import digit7_png from '../../../mipmaps/digit7_png.js';
import digit8_png from '../../../mipmaps/digit8_png.js';
import digit9_png from '../../../mipmaps/digit9_png.js';
import paperBackground1000_png from '../../../mipmaps/paperBackground1000_png.js';
import paperBackground100_png from '../../../mipmaps/paperBackground100_png.js';
import paperBackground10_png from '../../../mipmaps/paperBackground10_png.js';
import paperBackground1_png from '../../../mipmaps/paperBackground1_png.js';
import countingCommon from '../../countingCommon.js';
import BaseNumber from '../model/BaseNumber.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import PlayObjectType from '../model/PlayObjectType.js';
import groupBackground1_png from '../../../mipmaps/groupBackground1_png.js';
import CountingObjectType from '../model/CountingObjectType.js';
import groupBackground10_png from '../../../mipmaps/groupBackground10_png.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import CountingCommonConstants from '../CountingCommonConstants.js';

// types
type ImageMap = {
  [ key: number ]: any // TODO-TS: Figure out the type for mipmaps
};
type NumberMap = {
  [ key: number ]: number
};
type ZeroOffset = {
  [ key: number ]: number[]
}
type PaperNumberDimensions = {
  [ key: number ]: Dimension2
};
export type BaseNumberNodeOptions = {
  playObjectTypeProperty: IReadOnlyProperty<CountingObjectType>,
  isGroupable: boolean,
  includeHandles: boolean
  handleOffsetY: number,
  isLargestBaseNumber: boolean,
  hasDescendant: boolean,
  isPartOfStack: boolean
};

// place => mipmap info
const BACKGROUND_IMAGE_MAP = new Map();
BACKGROUND_IMAGE_MAP.set( CountingObjectType.PAPER_NUMBER.name, {
  0: paperBackground1_png,
  1: paperBackground10_png,
  2: paperBackground100_png,
  3: paperBackground1000_png
} );
PlayObjectType.enumeration.values.forEach( playObjectType => {
  BACKGROUND_IMAGE_MAP.set( playObjectType.name, {
    0: groupBackground1_png,
    1: groupBackground10_png
  } );
} );

// digit => mipmap info
const DIGIT_IMAGE_MAP: ImageMap = {
  1: digit1_png,
  2: digit2_png,
  3: digit3_png,
  4: digit4_png,
  5: digit5_png,
  6: digit6_png,
  7: digit7_png,
  8: digit8_png,
  9: digit9_png
};

// place => x/y offsets for the first digit in each place
const PLACE_OFFSET_X: NumberMap = { 0: 64, 1: 62, 2: 70, 3: 94 };
const PLACE_OFFSET_Y: NumberMap = { 0: 38, 1: 61, 2: 82, 3: 104 };

// place => x/y offsets for the handle in each place
const PLACE_HANDLE_OFFSET_X: NumberMap = { 0: 130, 1: 142, 2: 151, 3: 171 };
const PLACE_HANDLE_OFFSET_Y: NumberMap = { 0: 97, 1: 74, 2: 53, 3: 31 };

// digit => horizontal offset for that digit (applied to all places, includes digit-specific information)
const DIGIT_OFFSET_X: NumberMap = { 1: 93, 2: -7, 3: -7, 4: -9, 5: -18, 6: -5, 7: -24, 8: -2, 9: -10 };

// digit => horizontal offset, customized for each single digit base number
const FIRST_PLACE_DIGIT_OFFSET_X: NumberMap = { 1: -61, 2: 0, 3: 0, 4: 0, 5: 5, 6: 0, 7: 15, 8: 10, 9: 15 };

// place => horizontal positions of the zeros in the base number
const ZERO_OFFSET: ZeroOffset = {
  0: [],
  1: [ 272 ],
  2: [ 530, 284 ],
  3: [ 825, 580, 335 ]
};

// Scale was increased from 72dpi (pixels) to 300dpi, so that we can have crisper graphics.
const SCALE = 72 / 300;

class BaseNumberNode extends Node {

  public static PAPER_NUMBER_DIMENSIONS: PaperNumberDimensions;
  public static IMAGE_OFFSETS: Vector2[];
  public readonly handleStemNode: Path | undefined;
  public readonly backgroundNode: Image | null = null;

  constructor( baseNumber: BaseNumber, opacity: number, providedOptions?: Partial<BaseNumberNodeOptions> ) {
    super( { scale: SCALE } );

    const options = merge<BaseNumberNodeOptions, Partial<BaseNumberNodeOptions> | undefined>( {
      playObjectTypeProperty: new EnumerationProperty( CountingObjectType.PAPER_NUMBER ),
      includeHandles: false,
      handleOffsetY: 0,
      isGroupable: true,

      // TODO: docs?
      isLargestBaseNumber: true,
      hasDescendant: false,
      isPartOfStack: false
    }, providedOptions );

    let isGroupable = options.isGroupable;
    if ( providedOptions === undefined || providedOptions?.isGroupable === undefined ) {
      isGroupable = options.playObjectTypeProperty.value.name === CountingObjectType.PAPER_NUMBER.name;
    }

    assert && !isGroupable && assert( options.playObjectTypeProperty.value.name !== CountingObjectType.PAPER_NUMBER.name,
      'Paper numbers are not allowed to turn off grouping.' );

    // Translate everything by our offset
    this.translation = baseNumber.offset;

    // The paper behind the numbers
    const backgroundNode = new Image( BACKGROUND_IMAGE_MAP.get( options.playObjectTypeProperty.value.name )[ baseNumber.place ], {
      imageOpacity: opacity
    } );

    // TODO: needs better logic and or docs in this section, see https://github.com/phetsims/counting-common/issues/1
    // aside from checking the option includeHandles, don't include a handle if this base number is a standalone 1, or
    // if removing the largest base number in this paper number would separate itself from its descendants (as opposed
    // to just removing one part of the largest base number). for example, with the paper number 1200, the 1 should not
    // get a handle because grabbing it would pull 1000 away from 200, and this can be accomplished by pulling the 200
    // off instead. in the case of 2200, the first 2 should get a handle because grabbing it would pull off one 1000.
    if ( options.includeHandles && !( baseNumber.numberValue === 1 && !options.isPartOfStack )
         && !( options.isLargestBaseNumber && baseNumber.digit === 1 && options.hasDescendant ) ) {

      const lineWidth = 6;
      const handleOffsetY = PLACE_HANDLE_OFFSET_Y[ baseNumber.place ] + options.handleOffsetY;

      // The handle that attaches to the paper
      const handleStemShape = new Shape().moveTo( 0, 0 ).lineTo( 0, handleOffsetY );

      this.handleStemNode = new Path( handleStemShape, {
        stroke: 'black',
        lineWidth: lineWidth
      } );
      this.handleStemNode.centerX = options.hasDescendant ? PLACE_HANDLE_OFFSET_X[ baseNumber.place ] : backgroundNode.centerX;
      this.handleStemNode.bottom = backgroundNode.top + 10;
      this.addChild( this.handleStemNode );

      let handleCircle;
      const outerCircleRadius = 22;

      if ( options.isLargestBaseNumber ) {
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
    if ( isGroupable ) {
      this.addChild( backgroundNode );
      this.backgroundNode = backgroundNode;
    }

    // add a number to the background if our type is paper number
    if ( options.playObjectTypeProperty.value.name === CountingObjectType.PAPER_NUMBER.name ) {

      // Position of the initial digit
      let x = PLACE_OFFSET_X[ baseNumber.place ] + DIGIT_OFFSET_X[ baseNumber.digit ];
      const y = PLACE_OFFSET_Y[ baseNumber.place ];

      // We need to slightly offset some
      if ( baseNumber.place === 0 ) {
        x += FIRST_PLACE_DIGIT_OFFSET_X[ baseNumber.digit ];
      }

      // The initial (non-zero) digit
      this.addChild( new Image( DIGIT_IMAGE_MAP[ baseNumber.digit ], {
        x: x,
        y: y
      } ) );

      // Add the zeros
      const digitZeroOffsets = ZERO_OFFSET[ baseNumber.place ];
      for ( let i = 0; i < digitZeroOffsets.length; i++ ) {
        this.addChild( new Image( digit0_png, {
          x: digitZeroOffsets[ i ],
          y: y
        } ) );
      }
    }
    else {

      const ONE = 1;
      const value = baseNumber.numberValue;

      const fullObjectWidth = CountingCommonConstants.PLAY_OBJECT_SIZE.width / SCALE;
      const fullObjectHeight = CountingCommonConstants.PLAY_OBJECT_SIZE.width / SCALE;
      const singleCardSize = new Dimension2( 62 / SCALE, 100 / SCALE );
      const sideMargin = ( singleCardSize.width - fullObjectWidth ) / 2;

      // TODO: temporary way to organize objects, needs work
      const numberOfRows = value === ONE ? 1 : 5;
      const numberOfColumns = value === ONE ? 1 : 2;
      const scale = value === ONE ? 1 : 0.3;

      // add and position the object images
      const objectImages: Image[] = [];
      for ( let i = 0; i < numberOfRows; i++ ) {
        for ( let j = 0; j < numberOfColumns; j++ ) {

          const width = singleCardSize.width;
          const height = singleCardSize.height;

          const columnWidth = ( width - ( ( numberOfColumns + 1 ) * sideMargin ) ) / numberOfColumns;
          const centerX = ( ( j + 1 ) * sideMargin ) + ( j * columnWidth ) + ( columnWidth / 2 );

          const rowHeight = ( height - ( ( numberOfRows + 1 ) * sideMargin ) ) / numberOfRows;
          const centerY = ( ( i + 1 ) * sideMargin ) + ( i * rowHeight ) + ( rowHeight / 2 );

          if ( objectImages.length < value ) {
            const objectImage = new Image( CountingCommonConstants.PLAY_OBJECT_TYPE_TO_IMAGE.get( options.playObjectTypeProperty.value.name ), {
              maxWidth: fullObjectWidth * scale,
              maxHeight: fullObjectHeight * scale,
              centerX: centerX,
              centerY: centerY
            } );
            this.addChild( objectImage );
            objectImages.push( objectImage );
          }
        }
      }
    }

  }
}

/**
 * Maps place (0-3) to a {Dimension2} with the width/height
 */
BaseNumberNode.PAPER_NUMBER_DIMENSIONS = _.mapValues( BACKGROUND_IMAGE_MAP.get( CountingObjectType.PAPER_NUMBER.name ),
  mipmap => new Dimension2( mipmap[ 0 ].width * SCALE, mipmap[ 0 ].height * SCALE ) );

/**
 * Maps place (0-3) to a {Vector2} that is the offset of the upper-left corner of the BaseNumberNode relative to a
 * 1-digit BaseNumberNode.
 */
BaseNumberNode.IMAGE_OFFSETS = [
  new Vector2( -14, 0 ),
  new Vector2( -70, -( PLACE_OFFSET_Y[ 1 ] - PLACE_OFFSET_Y[ 0 ] ) * SCALE ),
  new Vector2( -70 - ( ZERO_OFFSET[ 2 ][ 0 ] - ZERO_OFFSET[ 1 ][ 0 ] ) * SCALE, -( PLACE_OFFSET_Y[ 2 ] - PLACE_OFFSET_Y[ 0 ] ) * SCALE ),
  new Vector2( -70 - ( ZERO_OFFSET[ 3 ][ 0 ] - ZERO_OFFSET[ 1 ][ 0 ] ) * SCALE, -( PLACE_OFFSET_Y[ 3 ] - PLACE_OFFSET_Y[ 0 ] ) * SCALE )
];

countingCommon.register( 'BaseNumberNode', BaseNumberNode );

export default BaseNumberNode;
